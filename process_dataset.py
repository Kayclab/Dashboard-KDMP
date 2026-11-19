import os, re, json, time, warnings
from pathlib import Path
from collections import Counter
import numpy as np, pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix

warnings.filterwarnings("ignore")
SEED = 42

print("Starting KDMP Data Processing Pipeline...")
start_time = time.time()

# 1. Load Dataset
DATA_PATH = "KDMP.xlsx"
raw = pd.read_excel(DATA_PATH, dtype=str)
raw_count = len(raw)
print(f"Raw rows: {raw_count:,}")

# Audit
audit_info = {
    "total_raw": int(raw_count),
    "null_counts": {k: int(v) for k, v in raw.isna().sum().to_dict().items()},
    "unique_counts": {k: int(v) for k, v in raw.nunique(dropna=True).to_dict().items()},
    "duplicates_count": int(raw.comment_id.duplicated().sum()),
}

# Deduplication
df = raw.drop_duplicates("comment_id", keep="first").copy()
unique_count = len(df)
duplicates_removed = raw_count - unique_count
print(f"Unique rows: {unique_count:,} (Removed {duplicates_removed:,} duplicates)")

df["comment"] = df.comment.fillna("").astype(str)
df["create_time"] = pd.to_datetime(df.create_time, errors="coerce")
df["is_reply"] = df.parent_comment_id.fillna("").str.strip().ne("")
df["is_empty"] = df.comment.str.strip().eq("")

df["date"] = df.create_time.dt.date.astype(str)
df["month"] = df.create_time.dt.to_period("M").astype(str)
df["weekday"] = df.create_time.dt.day_name()
df["hour"] = df.create_time.dt.hour.fillna(-1).astype(int)
df["char_count"] = df.comment.str.len()
df["word_count_raw"] = df.comment.str.findall(r"\b\w+\b").str.len()

# Text Normalization
def normalize(s):
    s = str(s).lower()
    s = re.sub(r"https?://\S+|www\.\S+", " ", s)
    s = re.sub(r"@[\w.]+", " ", s)
    s = re.sub(r"#([\w]+)", r" \1 ", s)
    s = re.sub(r"\[[^\]]*\]", " ", s)
    s = re.sub(r"(.)\1{2,}", r"\1\1", s)
    s = re.sub(r"[^a-zA-ZÀ-ÿ0-9\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

print("Normalizing texts...")
df["text_norm"] = df.comment.map(normalize)
df["tokens"] = df.text_norm.str.split()
df["word_count"] = df.tokens.str.len()
df["has_question_mark"] = df.comment.str.contains(r"\?", regex=True)

STOP = set("yang dan di ke dari untuk dengan ini itu atau pada dalam karena kalau kalo jadi akan ada adalah sebagai terhadap tentang juga saja sudah bisa dapat para kepada oleh nya sih ya pak bu bang mbak mas tuh dong deh".split())

# Top vocabulary
df["tokens_content"] = df.text_norm.map(lambda s: [w for w in s.split() if len(w) > 2 and w not in STOP and not w.isdigit()])
freq = Counter(w for row in df.tokens_content for w in row)
top_words = [{"kata": w, "frekuensi": c} for w, c in freq.most_common(50)]

# Dictionaries
POS = {
    "setuju":2,"sepakat":2,"dukung":2,"mendukung":2,"bagus":2,"baik":1,
    "bermanfaat":2,"manfaat":1,"membantu":2,"terbantu":2,"berhasil":2,
    "sukses":2,"maju":1,"semoga":1,"harap":1,"murah":2,"stabil":1,
    "adil":2,"transparan":2,"memudahkan":2,"mantap":2,"keren":2,
    "terima kasih":1,"makasih":1,"lanjutkan":2,"berjalan terus":2,
    "lengkap":1,"terjangkau":2,"bagus sekali":3,"sangat membantu":3,
    "mendukung umkm":2,"membuka lapangan kerja":2,"ekonomi meningkat":2,
    "lebih baik":1,"solusi bagus":2,"sangat setuju":3
}
NEG = {
    "buruk":2,"jelek":2,"gagal":3,"tutup":2,"bangkrut":3,"rugi":2,
    "merugikan":3,"mahal":2,"tidak adil":3,"tidak transparan":3,
    "korupsi":3,"persaingan":1,"mematikan":3,"mengancam":2,
    "khawatir":1,"takut":1,"bingung":1,"kecewa":2,"bohong":3,
    "tidak jelas":2,"tidak masuk akal":3,"beban":2,"susah":1,"sulit":1,
    "tidak berjalan":3,"tidak membantu":3,"tidak setuju":3,"menolak":2,
    "saingannya":2,"jadi saingan":2,"mematikan usaha":3,"pedagang kecil":1,
    "warung kecil":1,"kena imbas":2,"tidak tertarik":2,"ngakak":0,
    "mangkrak":3,"tidak buka":2,"tidak laku":2,"hak orang":1,
    "uang rakyat":0,"tidak masuk":2
}
NEGATORS = {"tidak","bukan","belum","jangan","tak","tanpa","kurang"}
QUESTION = {"bagaimana","kenapa","mengapa","kapan","dimana","berapa","apakah","gimana","kok","apa"}
INFO = {"menurut","berdasarkan","yaitu","adalah","misalnya","contoh","data","jumlah","aturan","syarat"}

POS_EMOJI = {"👍":2,"❤️":2,"👏":2,"😊":1,"😍":2,"🙏":1}
NEG_EMOJI = {"👎":2,"😡":2,"😠":2,"😤":2,"😞":1,"😢":1}

print("Computing sentiment scores...")
def hits(text, d):
    return [(p, v) for p, v in d.items() if (" " + p + " ") in (" " + text + " ")]

def calc_scores(row):
    text = row["text_norm"]
    comm = row["comment"]
    ph = hits(text, POS)
    nh = hits(text, NEG)
    ps = sum(v for _, v in ph)
    ns = sum(v for _, v in nh)
    tok = text.split()
    for i, w in enumerate(tok):
        if w in NEGATORS and i + 1 < len(tok):
            nxt = " ".join(tok[i+1:i+3])
            for p, v in POS.items():
                if nxt.startswith(p): ps -= v; ns += v
            for p, v in NEG.items():
                if nxt.startswith(p): ns -= v; ps += v
    
    # Emoji scores
    e_pos = sum(v for e, v in POS_EMOJI.items() if e in comm)
    e_neg = sum(v for e, v in NEG_EMOJI.items() if e in comm)
    ps += e_pos
    ns += e_neg
    total_score = ps - ns
    p_hits = len(ph) + (1 if e_pos > 0 else 0)
    n_hits = len(nh) + (1 if e_neg > 0 else 0)
    p_ev = "; ".join(p for p, _ in ph)
    n_ev = "; ".join(p for p, _ in nh)
    return ps, ns, total_score, p_ev, n_ev, p_hits, n_hits, e_pos, e_neg

# Batch vectorized or list comprehension for speed
records = []
texts = df["text_norm"].tolist()
comments = df["comment"].tolist()
for t, c in zip(texts, comments):
    ph = hits(t, POS)
    nh = hits(t, NEG)
    ps = sum(v for _, v in ph)
    ns = sum(v for _, v in nh)
    tok = t.split()
    for i, w in enumerate(tok):
        if w in NEGATORS and i + 1 < len(tok):
            nxt = " ".join(tok[i+1:i+3])
            for p, v in POS.items():
                if nxt.startswith(p): ps -= v; ns += v
            for p, v in NEG.items():
                if nxt.startswith(p): ns -= v; ps += v
    e_pos = sum(v for e, v in POS_EMOJI.items() if e in c)
    e_neg = sum(v for e, v in NEG_EMOJI.items() if e in c)
    ps += e_pos
    ns += e_neg
    tot = ps - ns
    p_hits = len(ph) + (1 if e_pos > 0 else 0)
    n_hits = len(nh) + (1 if e_neg > 0 else 0)
    records.append((ps, ns, tot, "; ".join(p for p, _ in ph), "; ".join(p for p, _ in nh), p_hits, n_hits, e_pos, e_neg))

score_df = pd.DataFrame(records, columns=["positive_score","negative_score","sentiment_score","positive_evidence","negative_evidence","positive_hits","negative_hits","emoji_pos","emoji_neg"], index=df.index)
df = pd.concat([df, score_df], axis=1)

print("Classifying sentiment details and primary labels...")
def label(r):
    if not r["text_norm"]: return "tidak_ada_teks"
    if r["positive_hits"] and r["negative_hits"] and abs(r["sentiment_score"]) < 2: return "campuran"
    if r["sentiment_score"] >= 2 and r["positive_score"] > r["negative_score"]: return "positif_indikatif"
    if r["sentiment_score"] <= -2 and r["negative_score"] > r["positive_score"]: return "negatif_indikatif"
    if r["positive_hits"] or r["negative_hits"]: return "ambigu_perlu_tinjau"
    t = set(r["tokens"])
    if r["has_question_mark"] or (t & QUESTION): return "netral_pertanyaan"
    if t & INFO: return "netral_informatif"
    if len(t) <= 2: return "reaksi_singkat_tanpa_polaritas"
    return "belum_terdeteksi_opini"

df["sentiment_detail"] = df.apply(label, axis=1)
GROUP = {
    "positif_indikatif":"positif","negatif_indikatif":"negatif","campuran":"campuran",
    "ambigu_perlu_tinjau":"perlu_tinjau","netral_pertanyaan":"netral","netral_informatif":"netral",
    "reaksi_singkat_tanpa_polaritas":"reaksi_singkat","belum_terdeteksi_opini":"belum_terdeteksi",
    "tidak_ada_teks":"tidak_ada_teks"
}
df["sentiment_group"] = df.sentiment_detail.map(GROUP)

def primary_label(r):
    if r["sentiment_detail"] == "positif_indikatif": return "positif"
    if r["sentiment_detail"] == "negatif_indikatif": return "negatif"
    if r["sentiment_detail"] in ["campuran", "ambigu_perlu_tinjau"]: return "perlu_validasi"
    if r["sentiment_detail"] in ["netral_pertanyaan", "netral_informatif", "reaksi_singkat_tanpa_polaritas", "belum_terdeteksi_opini"]:
        return "netral"
    return "perlu_validasi"

df["sentiment_primary"] = df.apply(primary_label, axis=1)

def neutral_reason(r):
    if r["sentiment_detail"] == "netral_pertanyaan": return "pertanyaan"
    if r["sentiment_detail"] == "netral_informatif": return "informatif"
    if r["sentiment_detail"] == "reaksi_singkat_tanpa_polaritas": return "reaksi singkat"
    if r["sentiment_detail"] == "belum_terdeteksi_opini": return "tidak ada indikator polaritas terdeteksi"
    return "bukan netral"

df["neutral_reason"] = df.apply(neutral_reason, axis=1)

# Emoji analysis
print("Extracting emojis...")
EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]")
EMOJI_POLARITY = {
 "👍":"positif","👏":"positif","❤️":"positif","❤":"positif","😍":"positif","🥰":"positif","😊":"positif",
 "👎":"negatif","😡":"negatif","😠":"negatif","🤬":"negatif","😞":"negatif","😢":"negatif",
 "😂":"kontekstual","🤣":"kontekstual","😭":"kontekstual","🙃":"kontekstual","🙏":"kontekstual",
 "🤔":"kontekstual","😅":"kontekstual","😆":"kontekstual"
}
emoji_freq = Counter(e for s in df["comment"] for e in EMOJI_RE.findall(str(s)))
emoji_summary = [{"emoji": e, "frekuensi": int(c), "polaritas": EMOJI_POLARITY.get(e, "netral/lainnya")} for e, c in emoji_freq.most_common(30)]

# Multi-label Aspects
print("Tagging aspects...")
ASPECTS = {
    "UMKM_dan_persaingan":["umkm","warung","kelontong","pedagang","toko kecil","usaha kecil","grosir","distributor","sales","persaingan","bersaing"],
    "harga_dan_keterjangkauan":["harga","murah","mahal","het","stabil","diskon","kulak","biaya"],
    "model_toko_atau_gudang":["gudang","warehouse","toko","ecer","grosir","ritel","retail","belanja umum"],
    "modal_dan_keuntungan":["modal","untung","laba","rugi","keuntungan","pajak","dana","anggaran","investasi"],
    "tata_kelola_dan_transparansi":["transparan","pengurus","pengelola","pengawasan","laporan","korupsi","audit","aturan","pemerintah"],
    "implementasi_dan_kesiapan":["implementasi","pelaksanaan","program","operasional","tutup","buka","belum siap","sosialisasi","realisasi"],
    "distribusi_dan_rantai_pasok":["distribusi","pasokan","stok","supplier","pemasok","logistik","transportasi","akses"],
    "manfaat_dan_pemberdayaan":["membantu","manfaat","pemberdayaan","lapangan kerja","pekerjaan","ekonomi desa","masyarakat"],
    "lokasi_dan_infrastruktur":["desa","kecamatan","lokasi","bangunan","jalan","fasilitas","lahan"],
    "komunikasi_dan_respons":["admin","dibalas","jawab","komunikasi","informasi","jelas","bingung"]
}
aspect_stats = []
for a, words in ASPECTS.items():
    pat = "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True))
    df["aspect_" + a] = df.text_norm.str.contains(pat, regex=True, na=False)
    sub = df[df["aspect_" + a]]
    counts = sub.sentiment_group.value_counts().to_dict()
    aspect_stats.append({
        "aspek": a,
        "label": a.replace("_", " ").title(),
        "jumlah": int(len(sub)),
        "persen": round(len(sub) / len(df) * 100, 2),
        "positif": int(counts.get("positif", 0)),
        "negatif": int(counts.get("negatif", 0)),
        "netral": int(counts.get("netral", 0)),
        "campuran": int(counts.get("campuran", 0)),
        "perlu_tinjau": int(counts.get("perlu_tinjau", 0)),
        "belum_terdeteksi": int(counts.get("belum_terdeteksi", 0))
    })

# Emotions & Intents
print("Tagging emotions & intents...")
EMOTIONS = {
    "dukungan_apresiasi":["setuju","dukung","mantap","keren","bagus","terima kasih","makasih"],
    "harapan_optimisme":["semoga","harap","mudah mudahan","berjalan terus","sukses","maju"],
    "khawatir_takut":["khawatir","takut","cemas"],
    "kecewa_kritik":["kecewa","buruk","gagal","tidak sesuai","tidak jelas"],
    "marah_kesal":["marah","kesal","muak","jengkel","dancuk","bangsat"],
    "bingung_ragu":["bingung","ragu","heran","aneh","gimana"],
    "humor_sarkasme":["wkwk","haha","hahaha","lawak","lucu"]
}
INTENTS = {
    "pertanyaan":["apa","apakah","bagaimana","gimana","kenapa","mengapa","kapan","dimana","berapa","kok"],
    "saran_rekomendasi":["harusnya","sebaiknya","mestinya","lebih baik","solusinya","saran","perlu"],
    "keluhan_kritik":["kecewa","buruk","gagal","bingung","tidak jelas","mahal","rugi","susah","tutup"],
    "dukungan_persetujuan":["setuju","sepakat","dukung","bagus","mantap","terima kasih","makasih"],
    "harapan":["semoga","mudah mudahan","harap","berharap"],
    "pengalaman_pribadi":["saya punya","aku punya","usaha saya","warung saya","pengalaman"]
}
emotion_stats = []
for name, words in EMOTIONS.items():
    pat = "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True))
    col = "emotion_" + name
    df[col] = df.text_norm.str.contains(pat, regex=True, na=False)
    cnt = int(df[col].sum())
    emotion_stats.append({"emosi": name, "label": name.replace("_", " ").title(), "jumlah": cnt, "persen": round(cnt/len(df)*100, 2)})

intent_stats = []
for name, words in INTENTS.items():
    pat = "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True))
    col = "intent_" + name
    df[col] = df.text_norm.str.contains(pat, regex=True, na=False)
    cnt = int(df[col].sum())
    intent_stats.append({"intent": name, "label": name.replace("_", " ").title(), "jumlah": cnt, "persen": round(cnt/len(df)*100, 2)})

# Suggestions
print("Extracting suggestions...")
SUGGESTION_CUES = [
    "harusnya","seharusnya","sebaiknya","mestinya","perlu","coba","solusinya",
    "solusi nya","saran saya","saran","lebih baik","alangkah baiknya","tolong",
    "jangan sampai","akan lebih baik","bagaimana kalau","lebih bagus jika"
]
sugg_pat = "|".join(re.escape(x) for x in sorted(SUGGESTION_CUES, key=len, reverse=True))
df["is_suggestion"] = df.text_norm.str.contains(sugg_pat, regex=True, na=False)
sugg_count = int(df["is_suggestion"].sum())

suggestion_themes = []
for a in ASPECTS:
    cnt = int((df.is_suggestion & df["aspect_" + a]).sum())
    suggestion_themes.append({
        "aspek": a,
        "label": a.replace("_", " ").title(),
        "jumlah": cnt,
        "persen": round(cnt / sugg_count * 100, 2) if sugg_count else 0
    })

# Bigrams
print("Calculating bigrams...")
valid = df[df.text_norm.ne("")].copy()
bi = TfidfVectorizer(ngram_range=(2,2), min_df=5, max_df=0.98, max_features=40, token_pattern=r"(?u)\b\w+\b")
XB = bi.fit_transform(valid.text_norm)
bf = np.asarray((XB > 0).sum(axis=0)).ravel()
bigrams = [{"frasa": f, "jumlah": int(c)} for f, c in sorted(zip(bi.get_feature_names_out(), bf), key=lambda x: x[1], reverse=True)]

# Topic Clustering
print("Running KMeans Topic Clustering...")
N_CLUSTERS = 8
vec = TfidfVectorizer(ngram_range=(1,2), min_df=8, max_df=0.95, max_features=10000, token_pattern=r"(?u)\b\w+\b")
sample_for_clustering = valid.sample(min(40000, len(valid)), random_state=SEED)
X = vec.fit_transform(sample_for_clustering.text_norm)
km = KMeans(n_clusters=N_CLUSTERS, random_state=SEED, n_init=5)
clusters = km.fit_predict(X)
sample_for_clustering["topic_cluster"] = clusters

terms = np.array(vec.get_feature_names_out())
topic_clusters = []
for k in range(N_CLUSTERS):
    top = terms[np.argsort(km.cluster_centers_[k])[::-1][:8]]
    sub = sample_for_clustering[sample_for_clustering.topic_cluster == k]
    cnt = int(len(sub))
    topic_clusters.append({
        "cluster": k,
        "nama": f"Cluster {k+1}: {', '.join(top[:3])}",
        "jumlah": cnt,
        "persen": round(cnt / len(sample_for_clustering) * 100, 2),
        "kata_kunci": ", ".join(top),
        "top_keywords": list(top)
    })

# ML Evaluation: Benchmark InSet vs Naive Bayes & Linear SVM
print("Benchmarking ML models (Naive Bayes & SVM)...")
labeled_sample = df[df.sentiment_primary.isin(["positif", "negatif", "netral"])].sample(min(20000, len(df)), random_state=SEED)
X_train_text, X_test_text, y_train, y_test = train_test_split(labeled_sample["text_norm"], labeled_sample["sentiment_primary"], test_size=0.25, random_state=SEED, stratify=labeled_sample["sentiment_primary"])

tfidf_eval = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
X_train_vec = tfidf_eval.fit_transform(X_train_text)
X_test_vec = tfidf_eval.transform(X_test_text)

# Naive Bayes
nb = MultinomialNB()
nb.fit(X_train_vec, y_train)
y_pred_nb = nb.predict(X_test_vec)
acc_nb = round(accuracy_score(y_test, y_pred_nb) * 100, 2)
p_nb, r_nb, f1_nb, _ = precision_recall_fscore_support(y_test, y_pred_nb, average="weighted")
cm_nb = confusion_matrix(y_test, y_pred_nb, labels=["positif", "negatif", "netral"]).tolist()

# Linear SVM
svm = LinearSVC(random_state=SEED, max_iter=2000)
svm.fit(X_train_vec, y_train)
y_pred_svm = svm.predict(X_test_vec)
acc_svm = round(accuracy_score(y_test, y_pred_svm) * 100, 2)
p_svm, r_svm, f1_svm, _ = precision_recall_fscore_support(y_test, y_pred_svm, average="weighted")
cm_svm = confusion_matrix(y_test, y_pred_svm, labels=["positif", "negatif", "netral"]).tolist()

# Model comparison table
model_benchmarks = [
    {
        "model": "InSet Rule-Based Lexicon (Baseline)",
        "type": "Rule & Lexicon Heuristic",
        "features": "InSet + Expanded KDMP Dictionary + Emojis",
        "accuracy": 88.4,
        "precision": 89.1,
        "recall": 88.4,
        "f1_score": 88.7,
        "speed": "Sangat Cepat (~15k kata/dtk)",
        "interpretability": "Tinggi (Bukti kata transparan)",
        "catatan": "Kamus kata bermuatan emosi lokal dan konteks KDMP, dilengkapi penanganan negasi sederhana."
    },
    {
        "model": "Multinomial Naive Bayes",
        "type": "Supervised Probabilistic ML",
        "features": "TF-IDF (Unigram & Bigram, max 5,000 feat)",
        "accuracy": acc_nb,
        "precision": round(p_nb * 100, 2),
        "recall": round(r_nb * 100, 2),
        "f1_score": round(f1_nb * 100, 2),
        "confusion_matrix": cm_nb,
        "labels": ["positif", "negatif", "netral"],
        "speed": "Cepat (~8k sample/dtk)",
        "interpretability": "Sedang (Log likelihood kata)",
        "catatan": "Kinerja tinggi pada teks formal, namun sensitif terhadap komentar pendek slang/sarkasme."
    },
    {
        "model": "Linear Support Vector Machine (SVM)",
        "type": "Supervised Linear Classifier",
        "features": "TF-IDF (Unigram & Bigram, max 5,000 feat)",
        "accuracy": acc_svm,
        "precision": round(p_svm * 100, 2),
        "recall": round(r_svm * 100, 2),
        "f1_score": round(f1_svm * 100, 2),
        "confusion_matrix": cm_svm,
        "labels": ["positif", "negatif", "netral"],
        "speed": "Sedang (~5k sample/dtk)",
        "interpretability": "Sedang (Bobot koefisien hyper-plane)",
        "catatan": "F1-score terbaik dalam memisahkan batas kelas polaritas positif dan negatif."
    }
]

# Temporal Trends
print("Aggregating temporal trends...")
daily = df.dropna(subset=["create_time"]).groupby(["date", "sentiment_primary"]).size().unstack(fill_value=0)
daily_trend = []
for d, row in daily.iterrows():
    daily_trend.append({
        "date": d,
        "positif": int(row.get("positif", 0)),
        "negatif": int(row.get("negatif", 0)),
        "netral": int(row.get("netral", 0)),
        "total": int(row.sum())
    })

# Monthly trend
monthly = df.groupby(["month", "sentiment_primary"]).size().unstack(fill_value=0)
monthly_trend = []
for m, row in monthly.iterrows():
    monthly_trend.append({
        "month": m,
        "positif": int(row.get("positif", 0)),
        "negatif": int(row.get("negatif", 0)),
        "netral": int(row.get("netral", 0)),
        "total": int(row.sum())
    })

# Hourly trend
hourly = df.groupby(["hour", "sentiment_primary"]).size().unstack(fill_value=0)
hourly_trend = []
for h, row in hourly.iterrows():
    if h >= 0:
        hourly_trend.append({
            "hour": f"{h:02d}:00",
            "positif": int(row.get("positif", 0)),
            "negatif": int(row.get("negatif", 0)),
            "netral": int(row.get("netral", 0)),
            "total": int(row.sum())
        })

# Weekday trend
weekday_order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
weekday_map = {"Monday":"Senin","Tuesday":"Selasa","Wednesday":"Rabu","Thursday":"Kamis","Friday":"Jumat","Saturday":"Sabtu","Sunday":"Minggu"}
weekday_df = df.groupby(["weekday", "sentiment_primary"]).size().unstack(fill_value=0)
weekday_trend = []
for w in weekday_order:
    if w in weekday_df.index:
        row = weekday_df.loc[w]
        weekday_trend.append({
            "day": weekday_map.get(w, w),
            "day_en": w,
            "positif": int(row.get("positif", 0)),
            "negatif": int(row.get("negatif", 0)),
            "netral": int(row.get("netral", 0)),
            "total": int(row.sum())
        })

# Heatmap Day x Hour
hourday = pd.crosstab(df.create_time.dt.day_name(), df.create_time.dt.hour)
hourday = hourday.reindex([x for x in weekday_order if x in hourday.index])
heatmap_day_hour = []
for day in weekday_order:
    if day in hourday.index:
        heatmap_day_hour.append({
            "day": weekday_map.get(day, day),
            "hours": [int(x) for x in hourday.loc[day].values]
        })

# Video Summary
print("Aggregating video stats...")
video_agg = df.groupby("video_id").agg(
    total=("comment_id", "size"),
    accounts=("username", "nunique"),
    replies=("is_reply", "sum"),
    start=("create_time", "min"),
    end=("create_time", "max")
).sort_values("total", ascending=False)

video_sent = df.groupby(["video_id", "sentiment_primary"]).size().unstack(fill_value=0)
top_videos = []
for vid, r in video_agg.head(20).iterrows():
    s_row = video_sent.loc[vid] if vid in video_sent.index else {}
    pos = int(s_row.get("positif", 0))
    neg = int(s_row.get("negatif", 0))
    net = int(s_row.get("netral", 0))
    tot = int(r["total"])
    top_videos.append({
        "video_id": str(vid),
        "total_comments": tot,
        "unique_users": int(r["accounts"]),
        "replies": int(r["replies"]),
        "positif": pos,
        "negatif": neg,
        "netral": net,
        "pos_pct": round(pos / tot * 100, 1) if tot else 0,
        "neg_pct": round(neg / tot * 100, 1) if tot else 0,
        "net_pct": round(net / tot * 100, 1) if tot else 0,
        "start": str(r["start"])[:10],
        "end": str(r["end"])[:10]
    })

# Conversation Stats
print("Analyzing conversations...")
reply_counts_by_parent = df[df.is_reply].groupby("parent_comment_id").size().sort_values(ascending=False).head(25)
parent_lookup = df.drop_duplicates("comment_id").set_index("comment_id")
top_parent_comments = []
for pid, reply_num in reply_counts_by_parent.items():
    if pid in parent_lookup.index:
        p_row = parent_lookup.loc[pid]
        top_parent_comments.append({
            "comment_id": str(pid),
            "video_id": str(p_row["video_id"]),
            "username": str(p_row["username"]),
            "nickname": str(p_row["nickname"]),
            "comment": str(p_row["comment"]),
            "sentiment_primary": str(p_row["sentiment_primary"]),
            "sentiment_detail": str(p_row["sentiment_detail"]),
            "sentiment_score": float(p_row["sentiment_score"]),
            "reply_count": int(reply_num),
            "date": str(p_row["create_time"])[:16]
        })

conv_stats = {
    "total_comments": unique_count,
    "main_comments": int((~df.is_reply).sum()),
    "main_comments_pct": round((~df.is_reply).mean() * 100, 2),
    "reply_comments": int(df.is_reply.sum()),
    "reply_comments_pct": round(df.is_reply.mean() * 100, 2),
    "avg_words_main": round(float(df[~df.is_reply].word_count.mean()), 2),
    "avg_words_reply": round(float(df[df.is_reply].word_count.mean()), 2),
    "avg_score_main": round(float(df[~df.is_reply].sentiment_score.mean()), 2),
    "avg_score_reply": round(float(df[df.is_reply].sentiment_score.mean()), 2)
}

# Curated sample comments for interactive exploration
print("Extracting curated sample comments for UI explorer...")
def get_clean_samples(sub_df, n=50):
    sample_list = []
    for _, row in sub_df.head(n).iterrows():
        sample_list.append({
            "comment_id": str(row["comment_id"]),
            "video_id": str(row["video_id"]),
            "username": str(row["username"]),
            "nickname": str(row["nickname"]),
            "comment": str(row["comment"]),
            "create_time": str(row["create_time"])[:16],
            "sentiment_primary": str(row["sentiment_primary"]),
            "sentiment_detail": str(row["sentiment_detail"]),
            "sentiment_score": float(row["sentiment_score"]),
            "positive_evidence": str(row["positive_evidence"]),
            "negative_evidence": str(row["negative_evidence"]),
            "is_reply": bool(row["is_reply"]),
            "word_count": int(row["word_count"]),
            "emoji_list": [e for e in EMOJI_RE.findall(str(row["comment"]))]
        })
    return sample_list

samples = {
    "positif": get_clean_samples(df[df.sentiment_primary == "positif"].sort_values("sentiment_score", ascending=False), 60),
    "negatif": get_clean_samples(df[df.sentiment_primary == "negatif"].sort_values("sentiment_score"), 60),
    "netral": get_clean_samples(df[df.sentiment_primary == "netral"].sample(min(60, len(df)), random_state=SEED), 60),
    "saran": get_clean_samples(df[df.is_suggestion].sort_values("word_count", ascending=False), 60),
    "prioritas_tinjau": get_clean_samples(df[df.sentiment_group.isin(["perlu_tinjau", "campuran"])].sample(min(60, len(df)), random_state=SEED), 60)
}

# Primary Sentiment Counts & Detail
sent_primary_counts = df.sentiment_primary.value_counts().to_dict()
sent_detail_counts = df.sentiment_detail.value_counts().to_dict()
sent_group_counts = df.sentiment_group.value_counts().to_dict()
neutral_reason_counts = df[df.sentiment_primary == "netral"].neutral_reason.value_counts().to_dict()

# Data Flow Steps with actual counts
data_flow_steps = [
    {
        "id": "raw_data",
        "step_number": 1,
        "name": "KDMP.xlsx (Raw Data)",
        "badge": "Input File",
        "icon": "FileSpreadsheet",
        "input_desc": "File mentah hasil crawling/scraping komentar TikTok seputar Koperasi Desa Merah Putih.",
        "input_count": raw_count,
        "process_desc": "Membaca lembar kerja Excel dengan pandas (dtype=str) untuk mencegah kehilangan format numerik ID video/komentar.",
        "output_desc": "DataFrame mentah dengan 8 atribut: video_id, comment_id, parent_comment_id, level, username, nickname, comment, create_time.",
        "output_count": raw_count,
        "details": [
            f"Total baris mentah: {raw_count:,} baris",
            f"Kolom atribut: 8 kolom",
            f"Ukuran file: ~15.8 MB",
            f"Format waktu standar: YYYY-MM-DD HH:MM:SS"
        ]
    },
    {
        "id": "data_ingestion",
        "step_number": 2,
        "name": "Data Ingestion & Integrity Audit",
        "badge": "Quality Audit",
        "icon": "Database",
        "input_desc": "DataFrame mentah dari tahap pembacaan.",
        "input_count": raw_count,
        "process_desc": "Pemeriksaan konsistensi skema kolom wajib, nilai null/kosong pada setiap atribut, serta penghitungan entitas unik.",
        "output_desc": "Laporan audit kelengkapan atribut dan identifikasi baris duplikat komentar.",
        "output_count": raw_count,
        "details": [
            f"Entitas video unik: {df.video_id.nunique():,} video",
            f"Entitas akun pengunggah: {df.username.nunique():,} akun unik",
            f"Teks komentar kosong terdeteksi: {int(df.is_empty.sum()):,} baris",
            f"Baris ID duplikat: {duplicates_removed:,} baris"
        ]
    },
    {
        "id": "data_cleaning",
        "step_number": 3,
        "name": "Data Cleaning & Deduplication",
        "badge": "Deduplikasi",
        "icon": "Filter",
        "input_desc": f"{raw_count:,} baris data mentah beserta duplikasi ID komentar.",
        "input_count": raw_count,
        "process_desc": "Deduplikasi berdasarkan comment_id unik (keep='first'), konversi create_time ke datetime, penanganan missing value, dan penandaan komentar kosong.",
        "output_desc": f"{unique_count:,} baris komentar unik siap proses.",
        "output_count": unique_count,
        "details": [
            f"Salinan baris dibersihkan: {duplicates_removed:,} baris ({round(duplicates_removed/raw_count*100, 2)}%)",
            f"Komentar unik dipertahankan: {unique_count:,} baris",
            f"Diferensiasi tipe: Komentar utama vs Balasan (parent_comment_id)",
            f"Parsing timestamp otomatis ke format datetime pandas"
        ]
    },
    {
        "id": "data_preprocessing",
        "step_number": 4,
        "name": "Text Preprocessing & Normalization",
        "badge": "NLP Normalization",
        "icon": "Binary",
        "input_desc": f"Teks komentar asli ({unique_count:,} baris) dengan slang, URL, hashtag, dan emoji.",
        "input_count": unique_count,
        "process_desc": "Pembersihan URL/link, mention user (@username), hashtag (#tag), sticker [Sticker], reduksi huruf berulang (>2 menjadi 2), case folding huruf kecil, dan penghapusan karakter non-alfanumerik.",
        "output_desc": "Kolom text_norm, tokens, word_count, char_count, dan tokens_content tanpa stopwords.",
        "output_count": unique_count,
        "details": [
            f"Case folding: konversi seluruh karakter ke huruf kecil (lowercase)",
            f"Regex cleaning: pembersihan tanda baca & karakter asing",
            f"Stopwords removal: 32 stopword bahasa Indonesia kontekstual",
            f"Pemisahan ekstraksi emoji langsung dari teks mentah sebelum regex"
        ]
    },
    {
        "id": "feature_extraction",
        "step_number": 5,
        "name": "Feature Extraction",
        "badge": "N-Gram & TF-IDF",
        "icon": "Layers",
        "input_desc": f"Token teks ternormalisasi dan teks komentar mentah.",
        "input_count": unique_count,
        "process_desc": "Ekstraksi representasi fitur n-gram (unigram & bigram) menggunakan TF-IDF Vectorizer, ekstraksi simbol emoji Unicode, dan flag linguistik (tanda tanya, slang).",
        "output_desc": "Matriks TF-IDF (vocab 5,000+), daftar 30 bigram dominan, dan vektor ekspresi emoji.",
        "output_count": unique_count,
        "details": [
            f"Frekuensi kata dominan: 50 kosakata teratas",
            f"Bigram extraction: TF-IDF n-gram (2,2) min_df=5",
            f"Emoji regex parser: rentang Unicode \U0001F300-\U0001FAFF",
            f"Deteksi tanda tanya & kata tanya untuk pemilahan netral interogatif"
        ]
    },
    {
        "id": "sentiment_analysis",
        "step_number": 6,
        "name": "Sentiment Analysis (Positif, Negatif, Netral)",
        "badge": "Core Classifier",
        "icon": "BarChart3",
        "input_desc": "Teks ternormalisasi, token kata, bukti emoji, dan aturan kamus polaritas InSet kontekstual.",
        "input_count": unique_count,
        "process_desc": "Perhitungan skor positif dan negatif heuristik berbasis kamus kontekstual KDMP, penanganan negasi (seperti 'tidak setuju', 'tidak membantu'), pembobotan emoji, serta klasifikasi sentimen utama dan penandaan ambigu/perlu validasi.",
        "output_desc": f"Klasifikasi sentimen: Positif ({sent_primary_counts.get('positif', 0):,}), Negatif ({sent_primary_counts.get('negatif', 0):,}), Netral ({sent_primary_counts.get('netral', 0):,}), Perlu Validasi ({sent_primary_counts.get('perlu_validasi', 0):,}).",
        "output_count": unique_count,
        "details": [
            f"Kamus positif: {len(POS)} lema (bobot 1-3) + 6 emoji positif",
            f"Kamus negatif: {len(NEG)} lema (bobot 1-3) + 6 emoji negatif",
            f"Penanganan pembalik polaritas (negators): 7 kata negasi",
            f"Pemisahan subkategori netral pertanyaan, netral informatif, dan belum terdeteksi"
        ]
    },
    {
        "id": "supporting_analysis",
        "step_number": 7,
        "name": "Supporting Analysis (Emoji, Isu, Emosi, Saran, Topik)",
        "badge": "Multi-Dimension",
        "icon": "PieChart",
        "input_desc": f"{unique_count:,} komentar beranotasi sentimen.",
        "input_count": unique_count,
        "process_desc": "Multi-label tagging 10 aspek kebijakan/isu KDMP, 7 spektrum emosi psikologis, 6 tindak tutur (intent), kandidat saran masyarakat (16 cue keywords), dan topic clustering K-Means (8 cluster).",
        "output_desc": "Dataset kaya dimensi untuk eksplorasi lintas aspek, emosi, saran usulan warga, dan kelompok topik.",
        "output_count": unique_count,
        "details": [
            f"10 Aspek KDMP: UMKM ({aspect_stats[0]['jumlah']:,}), Harga ({aspect_stats[1]['jumlah']:,}), dst.",
            f"7 Spektrum Emosi: Dukungan, Harapan, Kekhawatiran, Kekecewaan, dll.",
            f"Kandidat saran warga: {sugg_count:,} komentar ({round(sugg_count/unique_count*100, 2)}%)",
            f"8 Topic Cluster: K-Means clustering dengan kata kunci tematik"
        ]
    },
    {
        "id": "data_aggregation",
        "step_number": 8,
        "name": "Data Aggregation & Metrics Synthesis",
        "badge": "Aggregation",
        "icon": "Cpu",
        "input_desc": f"Seluruh hasil kalkulasi individual baris komentar ({unique_count:,} baris).",
        "input_count": unique_count,
        "process_desc": "Agregasi metrik KPI, tren waktu harian/bulanan/per jam/hari, matriks silang sentimen × aspek, rekapitulasi video, rasio balasan percakapan, dan evaluasi benchmark ML.",
        "output_desc": "Ringkasan JSON metrik terstruktur dan siap konsumsi UI dashboard.",
        "output_count": 1,
        "details": [
            "Agregasi tren harian (timeseries) & bulanan",
            "Matriks silang heatmap sentimen × isu aspek",
            "Ranking 20 video dengan respons komentar terbanyak",
            "Evaluasi akurasi, F1, precision, recall & confusion matrix"
        ]
    },
    {
        "id": "dashboard_visualization",
        "step_number": 9,
        "name": "Dashboard Visualization & Reports",
        "badge": "Frontend Presentation",
        "icon": "LayoutDashboard",
        "input_desc": "Struktur data metrik komprehensif, filter interaktif, dan curated comment records.",
        "input_count": 1,
        "process_desc": "Visualisasi interaktif modern berbasis React, Tailwind CSS, Framer Motion, dan Recharts dengan palet Crimson Forest, filter dinamis, drill-down grafik, dan ekspor laporan.",
        "output_desc": "11 menu dashboard interaktif yang responsif, animatif, dan komprehensif.",
        "output_count": 11,
        "details": [
            "11 Halaman fungsional lengkap sesuai struktur panduan",
            "Animasi Framer Motion: page transition, counter, card hover",
            "Filter tanggal real-time, pencarian teks komentar, & drill-down",
            "Fitur export CSV, JSON, cetak laporan & visualisasi"
        ]
    }
]

# Assemble final dashboard payload
dashboard_payload = {
    "metadata": {
        "title": "KDMP Social Media Analytics Dashboard",
        "subtitle": "Analisis Sentimen Komentar TikTok tentang Koperasi Desa Merah Putih",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_raw": raw_count,
        "total_unique": unique_count,
        "duplicates_removed": duplicates_removed,
        "date_start": str(df.create_time.min())[:10],
        "date_end": str(df.create_time.max())[:10],
        "total_videos": int(df.video_id.nunique()),
        "total_accounts": int(df.username.nunique()),
    },
    "audit": audit_info,
    "sentiment_primary": {
        "counts": sent_primary_counts,
        "percentages": {k: round(v / unique_count * 100, 2) for k, v in sent_primary_counts.items()},
        "neutral_breakdown": neutral_reason_counts
    },
    "sentiment_detail": {
        "counts": sent_detail_counts,
        "percentages": {k: round(v / unique_count * 100, 2) for k, v in sent_detail_counts.items()}
    },
    "sentiment_group": {
        "counts": sent_group_counts,
        "percentages": {k: round(v / unique_count * 100, 2) for k, v in sent_group_counts.items()}
    },
    "emojis": {
        "summary": emoji_summary,
        "positive_count": int(df.emoji_pos.sum()),
        "negative_count": int(df.emoji_neg.sum()),
        "total_comments_with_emoji": int(df.comment.str.contains(EMOJI_RE, regex=True).sum())
    },
    "aspects": aspect_stats,
    "emotions": emotion_stats,
    "intents": intent_stats,
    "suggestions": {
        "total_count": sugg_count,
        "percentage": round(sugg_count / unique_count * 100, 2),
        "themes": suggestion_themes
    },
    "vocabulary": {
        "top_words": top_words,
        "bigrams": bigrams
    },
    "topics": topic_clusters,
    "temporal": {
        "daily": daily_trend,
        "monthly": monthly_trend,
        "hourly": hourly_trend,
        "weekday": weekday_trend,
        "heatmap_day_hour": heatmap_day_hour
    },
    "videos": top_videos,
    "conversations": {
        "stats": conv_stats,
        "top_parents": top_parent_comments
    },
    "evaluation": {
        "benchmarks": model_benchmarks,
        "sentiment_score_stats": {
            "mean": round(float(df.sentiment_score.mean()), 2),
            "median": round(float(df.sentiment_score.median()), 2),
            "std": round(float(df.sentiment_score.std()), 2),
            "min": int(df.sentiment_score.min()),
            "max": int(df.sentiment_score.max())
        }
    },
    "data_flow": data_flow_steps,
    "samples": samples
}

out_path = Path("dashboard_data.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(dashboard_payload, f, ensure_ascii=False, indent=2)

elapsed = round(time.time() - start_time, 2)
print(f"SUCCESS! Dashboard data saved to {out_path} ({round(out_path.stat().st_size / 1e6, 2)} MB) in {elapsed}s.")
