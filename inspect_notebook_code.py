# %% [markdown] Cell 0
# KDMP — Eksplorasi Lanjutan untuk Dashboard
Analisis batch komentar TikTok mengenai Koperasi Desa Merah Putih.

Notebook ini menghasilkan: audit data, profil batch, tren waktu, distribusi video dan akun, pola komentar-balasan, sentimen indikatif beserta bukti kata, kategori netral yang lebih jelas, aspek/isu, emosi, jenis tanggapan, frasa dominan, topic clustering, komentar prioritas untuk ditinjau, kesimpulan otomatis, dan file ekspor dashboard.

**Batas metodologis:** label berbasis kamus/aturan adalah indikator eksploratif, bukan ground truth. Komentar sarkastik, kutipan, negasi kompleks, dan konteks percakapan harus divalidasi manusia. Hasil hanya mewakili dataset yang dianalisis, bukan seluruh masyarakat Indonesia.

# %% [markdown] Cell 1
## 1. Persiapan dan membaca dataset

# %% Cell 2
import os, re, json, time, warnings
from pathlib import Path
from collections import Counter
import numpy as np, pandas as pd, matplotlib.pyplot as plt
from IPython.display import display
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
warnings.filterwarnings("ignore")
SEED=42
pd.set_option("display.max_colwidth",160)
try:
    from google.colab import files
    IN_COLAB=True
except Exception:
    IN_COLAB=False
DATA_PATH="KDMP.xlsx"
if IN_COLAB and not os.path.exists(DATA_PATH):
    up=files.upload(); DATA_PATH=next(iter(up))
assert os.path.exists(DATA_PATH), "Letakkan KDMP.xlsx di folder kerja atau unggah ke Colab."
OUT=Path("output_kdmp"); OUT.mkdir(exist_ok=True)
raw=pd.read_excel(DATA_PATH,dtype=str)
print("Ukuran:",raw.shape)
display(raw.head())

# %% [markdown] Cell 3
## 2. Audit kualitas data dan deduplikasi

# %% Cell 4
required=["video_id","comment_id","parent_comment_id","level","username","nickname","comment","create_time"]
assert all(c in raw.columns for c in required), "Periksa nama kolom Excel."
audit=pd.DataFrame({
 "kosong":raw.isna().sum(),
 "persen_kosong":(raw.isna().mean()*100).round(2),
 "nilai_unik":raw.nunique(dropna=True)
})
display(audit)
print("Baris mentah:",len(raw))
print("ID komentar unik:",raw.comment_id.nunique())
print("Baris ID duplikat:",raw.comment_id.duplicated().sum())
print("Video unik:",raw.video_id.nunique(),"Akun unik:",raw.username.nunique())
display(raw.level.fillna("(kosong)").value_counts().to_frame("jumlah"))
# Audit apakah baris dengan ID sama memiliki isi yang berbeda
dups=raw[raw.comment_id.duplicated(False)]
if len(dups):
    display(dups.groupby("comment_id").agg(jumlah=("comment_id","size"),
             variasi_teks=("comment","nunique"),variasi_video=("video_id","nunique")).describe())
# Satu comment_id diperlakukan sebagai satu komentar; salinan dicatat.
df=raw.drop_duplicates("comment_id",keep="first").copy()
df["comment"]=df.comment.fillna("").astype(str)
df["create_time"]=pd.to_datetime(df.create_time,errors="coerce")
df["is_reply"]=df.parent_comment_id.fillna("").str.strip().ne("")
df["is_empty"]=df.comment.str.strip().eq("")
print("Setelah deduplikasi:",len(df),"| salinan dikeluarkan:",len(raw)-len(df))

# %% [markdown] Cell 5
## 3. Profil batch: waktu, video, akun, dan percakapan

# %% Cell 6
df["date"]=df.create_time.dt.date
df["month"]=df.create_time.dt.to_period("M").astype(str)
df["weekday"]=df.create_time.dt.day_name()
df["hour"]=df.create_time.dt.hour
df["char_count"]=df.comment.str.len()
df["word_count_raw"]=df.comment.str.findall(r"\b\w+\b").str.len()
print("Periode:",df.create_time.min(),"s.d.",df.create_time.max())
print("Ringkasan panjang komentar:"); display(df[["char_count","word_count_raw"]].describe().round(2))
video_summary=df.groupby("video_id").agg(jumlah=("comment_id","size"),
 akun=("username","nunique"),balasan=("is_reply","sum"),
 mulai=("create_time","min"),akhir=("create_time","max")).sort_values("jumlah",ascending=False)
video_summary["persen"]=(video_summary.jumlah/len(df)*100).round(2)
display(video_summary.head(15))
display(df.groupby(["username","nickname"],dropna=False).size().sort_values(ascending=False).head(15).to_frame("jumlah_komentar"))
fig,ax=plt.subplots(2,2,figsize=(15,9))
df.groupby("month").size().plot(kind="bar",ax=ax[0,0],title="Komentar per bulan")
df.hour.dropna().astype(int).value_counts().sort_index().plot(kind="bar",ax=ax[0,1],title="Komentar per jam")
df.is_reply.map({True:"Balasan",False:"Komentar utama"}).value_counts().plot(kind="bar",ax=ax[1,0],title="Struktur percakapan")
df.word_count_raw.clip(upper=df.word_count_raw.quantile(.99)).plot(kind="hist",bins=30,ax=ax[1,1],title="Panjang komentar (kata)")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 7
## 4. Normalisasi teks dan kosakata dominan

# %% Cell 8
def normalize(s):
    s=str(s).lower()
    s=re.sub(r"https?://\S+|www\.\S+"," ",s)
    s=re.sub(r"@[\w.]+"," ",s)
    s=re.sub(r"#([\w]+)",r" \1 ",s)
    s=re.sub(r"\[[^\]]*\]"," ",s)
    s=re.sub(r"(.)\1{2,}",r"\1\1",s)
    s=re.sub(r"[^a-zA-ZÀ-ÿ0-9\s]"," ",s)
    return re.sub(r"\s+"," ",s).strip()
df["text_norm"]=df.comment.map(normalize)
df["tokens"]=df.text_norm.str.split()
df["word_count"]=df.tokens.str.len()
df["emoji_count"]=df.comment.str.count(r"[\U0001F300-\U0001FAFF]")
df["has_question_mark"]=df.comment.str.contains(r"\?",regex=True)
df["has_sticker"]=df.comment.str.contains(r"\[Sticker\]",case=False,regex=True)
STOP=set("yang dan di ke dari untuk dengan ini itu atau pada dalam karena kalau kalo jadi akan ada adalah sebagai terhadap tentang juga saja sudah bisa dapat para kepada oleh nya sih ya pak bu bang mbak mas tuh dong deh".split())
df["tokens_content"]=df.text_norm.map(lambda s:[w for w in s.split() if len(w)>2 and w not in STOP and not w.isdigit()])
freq=Counter(w for row in df.tokens_content for w in row)
top_words=pd.DataFrame(freq.most_common(50),columns=["kata","frekuensi"])
display(top_words.head(30))
top_words.to_csv(OUT/"kata_teratas.csv",index=False,encoding="utf-8-sig")
top_words.head(25).sort_values("frekuensi").plot.barh(x="kata",y="frekuensi",figsize=(9,7),legend=False)
plt.title("25 kata dominan"); plt.tight_layout(); plt.show()

# %% [markdown] Cell 9
## 5. Analisis sentimen utama: positif, negatif, dan netral

Sentimen utama dashboard tetap **positif, negatif, dan netral**. Selain tiga kelas utama, notebook menyediakan penanda **perlu_validasi** untuk komentar campuran atau ambigu agar tidak dipaksakan masuk ke kelas tertentu.

- **Positif:** ada indikator dukungan, apresiasi, manfaat, kepuasan, atau harapan positif yang cukup kuat.
- **Negatif:** ada indikator kritik, penolakan, kekhawatiran, kerugian, atau ketidakpuasan yang cukup kuat.
- **Netral indikatif:** tidak ditemukan kecenderungan evaluatif yang cukup kuat; dapat berupa pertanyaan, informasi, reaksi singkat, atau komentar tanpa indikator polaritas yang dikenali.
- **Perlu validasi:** sinyal positif-negatif bercampur, lemah, atau berpotensi sarkastik.

Penting: “netral indikatif” bukan jaminan bahwa penulis benar-benar netral. Itu adalah hasil aturan otomatis ketika tidak ditemukan bukti polaritas yang cukup. Karena itu, dashboard juga menampilkan subkategori netral, bukti kata, emoji, dan sampel validasi. Jangan mengklaim label ini sebagai kebenaran manusia sebelum diuji melalui anotasi.

# %% [markdown] Cell 10
## Catatan interpretasi label sentimen
`belum_terdeteksi_opini` bukan berarti netral dan bukan bukti bahwa komentar tidak memiliki opini. Kategori ini berarti kamus dan aturan yang digunakan belum menemukan petunjuk polaritas yang cukup. Contohnya slang, sarkasme, komentar berbasis konteks, kalimat panjang yang menyampaikan kritik secara tidak langsung, atau istilah baru. Kategori ini harus ditampilkan terpisah pada dashboard dan menjadi prioritas validasi manual. Jangan dipaksa masuk ke kelas netral.

# %% [markdown] Cell 11
Skema keluaran memisahkan **positif indikatif**, **negatif indikatif**, **campuran**, **ambigu/perlu tinjau**, **netral pertanyaan**, **netral informatif**, **tidak terdeteksi**, dan **tidak ada teks**. “Tidak terdeteksi” berarti kamus tidak menemukan bukti, bukan berarti komentar netral.

Kamus di bawah merupakan kamus awal yang transparan dan dapat diperbaiki setelah membaca sampel. Frasa seperti “tidak setuju” dan “tidak membantu” dimasukkan sebagai frasa negatif. Penanganan negasi masih sederhana.

# %% Cell 12
# Kamus diperluas berdasarkan variasi kata dan konteks komentar KDMP.
# Bobot adalah aturan heuristik, bukan hasil pelatihan model.
POS={
"setuju":2,"sepakat":2,"dukung":2,"mendukung":2,"bagus":2,"baik":1,
"bermanfaat":2,"manfaat":1,"membantu":2,"terbantu":2,"berhasil":2,
"sukses":2,"maju":1,"semoga":1,"harap":1,"murah":2,"stabil":1,
"adil":2,"transparan":2,"memudahkan":2,"mantap":2,"keren":2,
"terima kasih":1,"makasih":1,"lanjutkan":2,"berjalan terus":2,
"lengkap":1,"terjangkau":2,"bagus sekali":3,"sangat membantu":3,
"mendukung umkm":2,"membuka lapangan kerja":2,"ekonomi meningkat":2,
"lebih baik":1,"solusi bagus":2,"sangat setuju":3,"👍":2,"❤️":2,"👏":2
}
NEG={
"buruk":2,"jelek":2,"gagal":3,"tutup":2,"bangkrut":3,"rugi":2,
"merugikan":3,"mahal":2,"tidak adil":3,"tidak transparan":3,
"korupsi":3,"persaingan":1,"mematikan":3,"mengancam":2,
"khawatir":1,"takut":1,"bingung":1,"kecewa":2,"bohong":3,
"tidak jelas":2,"tidak masuk akal":3,"beban":2,"susah":1,"sulit":1,
"tidak berjalan":3,"tidak membantu":3,"tidak setuju":3,"menolak":2,
"saingannya":2,"jadi saingan":2,"mematikan usaha":3,"pedagang kecil":1,
"warung kecil":1,"kena imbas":2,"tidak tertarik":2,"ngakak":0,
"mangkrak":3,"tidak buka":2,"tidak laku":2,"hak orang":1,
"uang rakyat":0,"tidak masuk":2,"👎":2,"😡":2,"😠":2,"😭":1
}
NEGATORS={"tidak","bukan","belum","jangan","tak","tanpa","kurang"}
QUESTION={"bagaimana","kenapa","mengapa","kapan","dimana","berapa","apakah","gimana","kok","apa"}
INFO={"menurut","berdasarkan","yaitu","adalah","misalnya","contoh","data","jumlah","aturan","syarat"}
def hits(text,d):
    return [(p,v) for p,v in d.items() if (" "+p+" ") in (" "+text+" ")]
def sentiment_score(text):
    ph=hits(text,POS); nh=hits(text,NEG)
    ps=sum(v for _,v in ph); ns=sum(v for _,v in nh)
    tok=text.split()
    for i,w in enumerate(tok):
        if w in NEGATORS and i+1<len(tok):
            nxt=" ".join(tok[i+1:i+3])
            for p,v in POS.items():
                if nxt.startswith(p): ps-=v; ns+=v
            for p,v in NEG.items():
                if nxt.startswith(p): ns-=v; ps+=v
    return pd.Series([ps,ns,ps-ns,"; ".join(p for p,_ in ph),"; ".join(p for p,_ in nh),len(ph),len(nh)])
df[["positive_score","negative_score","sentiment_score","positive_evidence","negative_evidence","positive_hits","negative_hits"]]=df.text_norm.apply(sentiment_score)
# Emoji dihitung dari teks asli karena karakter emoji dihapus pada normalisasi teks.
POS_EMOJI={"👍":2,"❤️":2,"👏":2,"😊":1,"😍":2,"🙏":1}
NEG_EMOJI={"👎":2,"😡":2,"😠":2,"😤":2,"😞":1,"😢":1}
df["emoji_positive_score"]=df.comment.apply(lambda s:sum(v for e,v in POS_EMOJI.items() if e in str(s)))
df["emoji_negative_score"]=df.comment.apply(lambda s:sum(v for e,v in NEG_EMOJI.items() if e in str(s)))
df["positive_score"] += df["emoji_positive_score"]
df["negative_score"] += df["emoji_negative_score"]
df["sentiment_score"]=df["positive_score"]-df["negative_score"]
df["positive_hits"] += (df["emoji_positive_score"]>0).astype(int)
df["negative_hits"] += (df["emoji_negative_score"]>0).astype(int)
def label(r):
    if not r.text_norm: return "tidak_ada_teks"
    if r.positive_hits and r.negative_hits and abs(r.sentiment_score)<2: return "campuran"
    if r.sentiment_score>=2 and r.positive_score>r.negative_score: return "positif_indikatif"
    if r.sentiment_score<=-2 and r.negative_score>r.positive_score: return "negatif_indikatif"
    if r.positive_hits or r.negative_hits: return "ambigu_perlu_tinjau"
    t=set(r.text_norm.split())
    if r.has_question_mark or t&QUESTION: return "netral_pertanyaan"
    if t&INFO: return "netral_informatif"
    if len(t)<=2: return "reaksi_singkat_tanpa_polaritas"
    return "belum_terdeteksi_opini"
df["sentiment_detail"]=df.apply(label,axis=1)
GROUP={"positif_indikatif":"positif","negatif_indikatif":"negatif","campuran":"campuran",
"ambigu_perlu_tinjau":"perlu_tinjau","netral_pertanyaan":"netral","netral_informatif":"netral",
"reaksi_singkat_tanpa_polaritas":"reaksi_singkat","belum_terdeteksi_opini":"belum_terdeteksi",
"tidak_ada_teks":"tidak_ada_teks"}
df["sentiment_group"]=df.sentiment_detail.map(GROUP)
display(df.sentiment_detail.value_counts().to_frame("jumlah"))# Kelas utama untuk dashboard: positif / negatif / netral / perlu_validasi.
# Netral merupakan label indikatif berbasis ketiadaan sinyal polaritas yang kuat.
def primary_label(r):
    if r.sentiment_detail=="positif_indikatif": return "positif"
    if r.sentiment_detail=="negatif_indikatif": return "negatif"
    if r.sentiment_detail in ["campuran","ambigu_perlu_tinjau"]: return "perlu_validasi"
    if r.sentiment_detail in ["netral_pertanyaan","netral_informatif",
                              "reaksi_singkat_tanpa_polaritas","belum_terdeteksi_opini"]:
        return "netral"
    return "perlu_validasi"
df["sentiment_primary"]=df.apply(primary_label,axis=1)
def neutral_reason(r):
    if r.sentiment_detail=="netral_pertanyaan": return "pertanyaan"
    if r.sentiment_detail=="netral_informatif": return "informatif"
    if r.sentiment_detail=="reaksi_singkat_tanpa_polaritas": return "reaksi singkat"
    if r.sentiment_detail=="belum_terdeteksi_opini": return "tidak ada indikator polaritas terdeteksi"
    return "bukan netral"
df["neutral_reason"]=df.apply(neutral_reason,axis=1)
print("Distribusi sentimen utama:")
display(df["sentiment_primary"].value_counts().to_frame("jumlah"))

# %% [markdown] Cell 13
## 6. Audit label dan validasi manual

# %% [markdown] Cell 14
## 6. Analisis emoji dan ekspresi visual

Emoji dianalisis dari teks komentar asli sebelum tanda non-alfanumerik dibersihkan. Emoji tidak otomatis dianggap sentimen: 👍 umumnya indikator positif, 👎 indikator negatif, sedangkan 😂/😭 dapat berarti humor, ironi, sedih, atau ekspresi lain sesuai konteks. Hasilnya disimpan sebagai fitur terpisah dan dapat dibandingkan dengan sentimen teks.

# %% Cell 15
# Ekstraksi emoji sederhana berbasis rentang Unicode; tidak membutuhkan paket tambahan.
EMOJI_RE=re.compile(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]")
EMOJI_POLARITY={
 "👍":"positif","👏":"positif","❤️":"positif","❤":"positif","😍":"positif","🥰":"positif","😊":"positif",
 "👎":"negatif","😡":"negatif","😠":"negatif","🤬":"negatif","😞":"negatif","😢":"negatif",
 "😂":"kontekstual","🤣":"kontekstual","😭":"kontekstual","🙃":"kontekstual","🙏":"kontekstual",
 "🤔":"kontekstual","😅":"kontekstual","😆":"kontekstual"
}
df["emoji_list"]=df["comment"].apply(lambda s:" ".join(EMOJI_RE.findall(str(s))))
df["emoji_count"]=df["comment"].apply(lambda s:len(EMOJI_RE.findall(str(s))))
df["emoji_positive"]=df["comment"].apply(lambda s:sum(1 for e in EMOJI_RE.findall(str(s)) if EMOJI_POLARITY.get(e)=="positif"))
df["emoji_negative"]=df["comment"].apply(lambda s:sum(1 for e in EMOJI_RE.findall(str(s)) if EMOJI_POLARITY.get(e)=="negatif"))
df["emoji_contextual"]=df["comment"].apply(lambda s:sum(1 for e in EMOJI_RE.findall(str(s)) if EMOJI_POLARITY.get(e)=="kontekstual"))
emoji_freq=Counter(e for s in df["comment"].astype(str) for e in EMOJI_RE.findall(s))
emoji_summary=pd.DataFrame(emoji_freq.most_common(30),columns=["emoji","frekuensi"])
display(emoji_summary.head(30))
emoji_summary.to_csv(OUT/"ringkasan_emoji.csv",index=False,encoding="utf-8-sig")
fig,ax=plt.subplots(1,2,figsize=(14,5))
emoji_summary.head(15).sort_values("frekuensi").plot.barh(x="emoji",y="frekuensi",ax=ax[0],legend=False,title="15 emoji paling sering")
pd.Series({"Emoji positif":df.emoji_positive.sum(),"Emoji negatif":df.emoji_negative.sum(),"Emoji kontekstual":df.emoji_contextual.sum()}).plot(kind="bar",ax=ax[1],title="Kelompok indikator emoji")
plt.tight_layout(); plt.show()

# %% Cell 16
display(df[df.sentiment_detail=="positif_indikatif"][["comment","positive_evidence","sentiment_score"]].head(12))
display(df[df.sentiment_detail=="negatif_indikatif"][["comment","negative_evidence","sentiment_score"]].head(12))
display(df[df.sentiment_detail.isin(["campuran","ambigu_perlu_tinjau"])][["comment","sentiment_detail","positive_evidence","negative_evidence"]].head(25))
df["sarcasm_flag"]=df.comment.str.lower().str.contains(r"wkwk|hahaha|\blucu\b|\blawak\b|🤣|😂",regex=True)
df["review_priority"]=df.sentiment_detail.isin(["campuran","ambigu_perlu_tinjau"])|df.sarcasm_flag|df.has_question_mark
review=df[df.review_priority & df.text_norm.ne("")][["comment_id","video_id","comment","sentiment_detail","sentiment_score","positive_evidence","negative_evidence","sarcasm_flag"]].sample(min(500,int((df.review_priority & df.text_norm.ne("")).sum())),random_state=SEED)
review["label_manual_penilai_1"]=""; review["label_manual_penilai_2"]=""; review["catatan"]=""
review.to_csv(OUT/"sampel_validasi_manual.csv",index=False,encoding="utf-8-sig")
print("Sampel validasi manual:",len(review))

# %% [markdown] Cell 17
## 7. Isu/aspek yang dibahas (multi-label)

# %% Cell 18
ASPECTS={
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
for a,words in ASPECTS.items():
    pat="|".join(re.escape(w) for w in sorted(words,key=len,reverse=True))
    df["aspect_"+a]=df.text_norm.str.contains(pat,regex=True,na=False)
acols=["aspect_"+a for a in ASPECTS]
aspect_summary=pd.DataFrame({"aspek":list(ASPECTS),"jumlah":[int(df[c].sum()) for c in acols]})
aspect_summary["persen"]=(aspect_summary.jumlah/len(df)*100).round(2)
aspect_summary=aspect_summary.sort_values("jumlah",ascending=False)
display(aspect_summary)
aspect_summary.to_csv(OUT/"ringkasan_aspek.csv",index=False,encoding="utf-8-sig")
aspect_summary.sort_values("jumlah").plot.barh(x="aspek",y="jumlah",figsize=(10,6),legend=False,title="Aspek/isu yang disebut")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 19
## 8. Sentimen per aspek

# %% Cell 20
rows=[]
for a in ASPECTS:
    sub=df[df["aspect_"+a]]
    c=sub.sentiment_group.value_counts()
    row={"aspek":a,"jumlah":len(sub)}
    for lab in ["positif","negatif","netral","campuran","perlu_tinjau","belum_terdeteksi"]:
        row[lab]=int(c.get(lab,0))
        row[lab+"_persen"]=round(c.get(lab,0)/len(sub)*100,2) if len(sub) else 0
    rows.append(row)
aspect_sentiment=pd.DataFrame(rows).sort_values("jumlah",ascending=False)
display(aspect_sentiment)
aspect_sentiment.to_csv(OUT/"sentimen_per_aspek.csv",index=False,encoding="utf-8-sig")

# %% [markdown] Cell 21
## 9. Emosi dan jenis tanggapan

# %% Cell 22
EMOTIONS={
"dukungan_apresiasi":["setuju","dukung","mantap","keren","bagus","terima kasih","makasih"],
"harapan_optimisme":["semoga","harap","mudah mudahan","berjalan terus","sukses","maju"],
"khawatir_takut":["khawatir","takut","cemas"],
"kecewa_kritik":["kecewa","buruk","gagal","tidak sesuai","tidak jelas"],
"marah_kesal":["marah","kesal","muak","jengkel","dancuk","bangsat"],
"bingung_ragu":["bingung","ragu","heran","aneh","gimana"],
"humor_sarkasme":["wkwk","haha","hahaha","lawak","lucu"]
}
INTENTS={
"pertanyaan":["apa","apakah","bagaimana","gimana","kenapa","mengapa","kapan","dimana","berapa","kok"],
"saran_rekomendasi":["harusnya","sebaiknya","mestinya","lebih baik","solusinya","saran","perlu"],
"keluhan_kritik":["kecewa","buruk","gagal","bingung","tidak jelas","mahal","rugi","susah","tutup"],
"dukungan_persetujuan":["setuju","sepakat","dukung","bagus","mantap","terima kasih","makasih"],
"harapan":["semoga","mudah mudahan","harap","berharap"],
"pengalaman_pribadi":["saya punya","aku punya","usaha saya","warung saya","pengalaman"]
}
def apply_dict(d,prefix):
    for name,words in d.items():
        pat="|".join(re.escape(w) for w in sorted(words,key=len,reverse=True))
        df[prefix+name]=df.text_norm.str.contains(pat,regex=True,na=False)
apply_dict(EMOTIONS,"emotion_"); apply_dict(INTENTS,"intent_")
emotion_summary=pd.DataFrame({"emosi":list(EMOTIONS),"jumlah":[int(df["emotion_"+x].sum()) for x in EMOTIONS]})
intent_summary=pd.DataFrame({"jenis_tanggapan":list(INTENTS),"jumlah":[int(df["intent_"+x].sum()) for x in INTENTS]})
emotion_summary["persen"]=(emotion_summary.jumlah/len(df)*100).round(2)
intent_summary["persen"]=(intent_summary.jumlah/len(df)*100).round(2)
display(emotion_summary.sort_values("jumlah",ascending=False))
display(intent_summary.sort_values("jumlah",ascending=False))
emotion_summary.to_csv(OUT/"ringkasan_emosi.csv",index=False,encoding="utf-8-sig")
intent_summary.to_csv(OUT/"jenis_tanggapan.csv",index=False,encoding="utf-8-sig")

# %% [markdown] Cell 23
## 10. Ekstraksi saran, rekomendasi, dan usulan masyarakat

Bagian ini mengidentifikasi komentar yang berpotensi berisi saran. Kata seperti “harusnya”, “sebaiknya”, “perlu”, “coba”, dan “solusinya” dipakai sebagai pemicu pencarian. Hasilnya adalah kandidat saran, bukan seluruhnya rekomendasi yang valid; contoh komentar tetap perlu dibaca.

# %% Cell 24
SUGGESTION_CUES=[
 "harusnya","seharusnya","sebaiknya","mestinya","perlu","coba","solusinya",
 "solusi nya","saran saya","saran","lebih baik","alangkah baiknya","tolong",
 "jangan sampai","akan lebih baik","bagaimana kalau","lebih bagus jika"
]
suggestion_pat="|".join(re.escape(x) for x in sorted(SUGGESTION_CUES,key=len,reverse=True))
df["is_suggestion_candidate"]=df["text_norm"].str.contains(suggestion_pat,regex=True,na=False)
suggestions=df[df.is_suggestion_candidate][["comment_id","video_id","create_time","comment","sentiment_primary"]].copy()
display(suggestions.head(30))
print("Kandidat komentar berisi saran:",len(suggestions),"(",round(len(suggestions)/len(df)*100,2),"%)")
suggestions.to_csv(OUT/"kandidat_saran_masyarakat.csv",index=False,encoding="utf-8-sig")
# Kelompokkan tema saran dengan aspek yang sudah tersedia
suggestion_aspect=[]
for a in ASPECTS:
    col="aspect_"+a
    if col in df.columns:
        suggestion_aspect.append({"aspek":a,"jumlah_kandidat_saran":int((df.is_suggestion_candidate & df[col]).sum())})
suggestion_aspect=pd.DataFrame(suggestion_aspect).sort_values("jumlah_kandidat_saran",ascending=False)
display(suggestion_aspect)
suggestion_aspect.to_csv(OUT/"tema_saran_masyarakat.csv",index=False,encoding="utf-8-sig")
fig,ax=plt.subplots(figsize=(10,5))
suggestion_aspect.sort_values("jumlah_kandidat_saran").plot.barh(x="aspek",y="jumlah_kandidat_saran",ax=ax,legend=False,title="Tema yang muncul dalam kandidat saran")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 25
## 10. Frasa dominan dan topic discovery

# %% Cell 26
valid=df[df.text_norm.ne("")].copy()
bi=TfidfVectorizer(ngram_range=(2,2),min_df=5,max_df=.98,token_pattern=r"(?u)\b\w+\b")
XB=bi.fit_transform(valid.text_norm)
bf=np.asarray((XB>0).sum(axis=0)).ravel()
bigrams=pd.DataFrame({"frasa":bi.get_feature_names_out(),"jumlah_dokumen":bf}).sort_values("jumlah_dokumen",ascending=False)
display(bigrams.head(40)); bigrams.to_csv(OUT/"frasa_dua_kata.csv",index=False,encoding="utf-8-sig")

N_CLUSTERS=8
vec=TfidfVectorizer(ngram_range=(1,2),min_df=8,max_df=.95,max_features=30000,token_pattern=r"(?u)\b\w+\b")
X=vec.fit_transform(valid.text_norm)
km=KMeans(n_clusters=N_CLUSTERS,random_state=SEED,n_init=10)
valid["topic_cluster"]=km.fit_predict(X)
terms=np.array(vec.get_feature_names_out()); rows=[]
for k in range(N_CLUSTERS):
    top=terms[np.argsort(km.cluster_centers_[k])[::-1][:12]]
    sub=valid[valid.topic_cluster==k]
    rows.append({"cluster":k,"jumlah":len(sub),"persen":round(len(sub)/len(valid)*100,2),"kata_kunci":", ".join(top)})
topic_summary=pd.DataFrame(rows).sort_values("jumlah",ascending=False)
display(topic_summary)
for k in topic_summary.cluster:
    print("CLUSTER",k)
    display(valid[valid.topic_cluster==k][["comment","sentiment_group"]].head(5))
topic_summary.to_csv(OUT/"ringkasan_cluster_topik.csv",index=False,encoding="utf-8-sig")
valid[["comment_id","topic_cluster"]].to_csv(OUT/"cluster_per_komentar.csv",index=False)

# %% [markdown] Cell 27
## 11. Tren sentimen, perbandingan video, dan pola balasan

# %% Cell 28
daily=df.dropna(subset=["create_time"]).groupby([df.create_time.dt.date,"sentiment_group"]).size().unstack(fill_value=0)
video_sent=df.groupby(["video_id","sentiment_group"]).size().unstack(fill_value=0)
video_pct=video_sent.div(video_sent.sum(axis=1),axis=0)*100
display(daily.tail(20)); display(video_sent.head(15)); display(video_pct.head(15))
daily.to_csv(OUT/"tren_harian_sentimen.csv",encoding="utf-8-sig")
video_sent.to_csv(OUT/"jumlah_sentimen_per_video.csv",encoding="utf-8-sig")
video_pct.to_csv(OUT/"persentase_sentimen_per_video.csv",encoding="utf-8-sig")
fig,ax=plt.subplots(1,2,figsize=(16,5))
daily.plot(ax=ax[0],title="Tren harian sentimen")
video_pct.plot(kind="bar",stacked=True,ax=ax[1],title="Komposisi sentimen per video (%)")
ax[1].legend(loc="upper left",bbox_to_anchor=(1,1)); plt.tight_layout(); plt.show()
display(df.groupby("is_reply").agg(jumlah=("comment_id","size"),akun=("username","nunique"),rata_kata=("word_count","mean"),skor=("sentiment_score","mean")).round(2))

# %% [markdown] Cell 29
## 12. Komentar prioritas ditinjau dan KPI dashboard

# %% Cell 30
df["risk_review_flag"]=(
 (df.get("aspect_UMKM_dan_persaingan",False) & df.sentiment_group.isin(["negatif","perlu_tinjau","campuran"])) |
 (df.get("aspect_tata_kelola_dan_transparansi",False) & df.sentiment_group.isin(["negatif","perlu_tinjau","campuran"])) |
 (df.get("aspect_modal_dan_keuntungan",False) & df.sentiment_group.isin(["negatif","perlu_tinjau","campuran"]))
)
priority=df[df.risk_review_flag][["create_time","video_id","comment","sentiment_group","sentiment_score","negative_evidence"]]
display(priority.head(30))
priority.to_csv(OUT/"komentar_prioritas_tinjau.csv",index=False,encoding="utf-8-sig")

sent_counts=df.sentiment_group.value_counts()
sent_summary=pd.DataFrame({"kelompok":sent_counts.index,"jumlah":sent_counts.values})
sent_summary["persen"]=(sent_summary.jumlah/len(df)*100).round(2)
display(sent_summary)
kpi={"baris_mentah":int(len(raw)),"komentar_unik":int(len(df)),"video_unik":int(df.video_id.nunique()),
"akun_unik":int(df.username.nunique()),"periode_mulai":str(df.create_time.min()),
"periode_akhir":str(df.create_time.max()),"balasan":int(df.is_reply.sum()),
"komentar_utama":int((~df.is_reply).sum()),"teks_kosong":int(df.is_empty.sum())}
display(pd.Series(kpi).to_frame("nilai"))
sent_summary.to_csv(OUT/"kpi_sentimen.csv",index=False,encoding="utf-8-sig")
with open(OUT/"kpi_dashboard.json","w",encoding="utf-8") as f: json.dump(kpi,f,ensure_ascii=False,indent=2)

# %% [markdown] Cell 31
## 13. Kesimpulan otomatis dan ekspor detail

# %% Cell 32
print("KESIMPULAN EKSPLORASI KDMP")
print(f"Dataset berisi {len(raw):,} baris mentah; setelah deduplikasi tersisa {len(df):,} komentar unik.")
print(f"Komentar berasal dari {df.video_id.nunique():,} video dan {df.username.nunique():,} akun.")
print(f"Rentang waktu: {df.create_time.min()} sampai {df.create_time.max()}.")
print(f"Balasan: {df.is_reply.sum():,} ({df.is_reply.mean()*100:.2f}%).")
print("Distribusi sentimen indikatif:")
for _,r in sent_summary.iterrows(): print(f"- {r.kelompok}: {r.jumlah:,} ({r.persen:.2f}%).")
a=aspect_summary.iloc[0]
print(f"Aspek terdeteksi terbanyak: {a.aspek} ({a.jumlah:,} komentar; {a.persen:.2f}%).")
e=emotion_summary.sort_values("jumlah",ascending=False).iloc[0]
print(f"Indikator emosi terbanyak: {e.emosi} ({e.jumlah:,} komentar).")
t=topic_summary.iloc[0]
print(f"Cluster terbesar: {int(t.cluster)}; kata kunci: {t.kata_kunci}.")
print("Catatan: label berbasis kamus/aturan belum tervalidasi; perlu anotasi manusia.")

# %% Cell 33
cluster_map=valid[["comment_id","topic_cluster"]].drop_duplicates("comment_id")
final=df.merge(cluster_map,on="comment_id",how="left")
export_cols=["video_id","comment_id","parent_comment_id","level","username","nickname","create_time",
"month","weekday","hour","comment","text_norm","word_count","char_count","is_reply",
"sentiment_detail","sentiment_group","sentiment_primary","neutral_reason","sentiment_score","positive_score","negative_score",
"positive_evidence","negative_evidence","sarcasm_flag","review_priority","topic_cluster","emoji_list","emoji_count","emoji_positive","emoji_negative","emoji_contextual","is_suggestion_candidate"] 
export_cols += [c for c in df.columns if c.startswith(("aspect_","emotion_","intent_"))]
export_cols=list(dict.fromkeys(c for c in export_cols if c in final.columns))
final[export_cols].to_csv(OUT/"komentar_hasil_eksplorasi.csv",index=False,encoding="utf-8-sig")
video_summary.to_csv(OUT/"ringkasan_video.csv",encoding="utf-8-sig")
print("File siap untuk dashboard:")
for p in sorted(OUT.glob("*")): print(p.name,round(p.stat().st_size/1e6,2),"MB")

# %% [markdown] Cell 34
## 14. Panduan dashboard yang dapat dibangun

- **Overview:** total komentar unik, video, akun, rentang tanggal, komentar utama vs balasan.
- **Sentiment Explorer:** positif/negatif/netral pertanyaan/netral informatif/campuran/ambigu/tidak terdeteksi.
- **Issue Explorer:** UMKM dan persaingan, harga, gudang vs toko, modal, tata kelola, implementasi, distribusi, manfaat.
- **Emotion & Intent:** dukungan, harapan, kekhawatiran, kecewa, marah, bingung, humor; pertanyaan, saran, keluhan, pengalaman.
- **Topic Discovery:** cluster, kata kunci, contoh komentar, distribusi sentimen per cluster.
- **Timeline & Video:** tren harian/bulanan dan perbandingan komposisi sentimen antarvideo.
- **Review Center:** komentar yang ambigu, campuran, sarkastik, atau prioritas ditinjau.

**Validasi yang disarankan:** ambil sampel acak berstrata, minta minimal dua penilai memberi label secara independen, hitung Cohen’s Kappa, selesaikan perbedaan, lalu gunakan label konsensus untuk mengevaluasi model dengan precision, recall, F1 per kelas, dan confusion matrix. Jangan melaporkan akurasi model terhadap label kamus sebagai akurasi kebenaran.

# %% [markdown] Cell 35
Bagian ini memperbanyak visualisasi agar dashboard dapat menyajikan pola lintas dimensi. Grafik dihitung dari komentar unik setelah deduplikasi.

# %% [markdown] Cell 36
### 15.1 Distribusi kelas sentimen dan cakupan klasifikasi

# %% Cell 37
fig,ax=plt.subplots(1,2,figsize=(14,5))
vc=df.sentiment_detail.value_counts()
vc.plot(kind="bar",ax=ax[0],title="Jumlah komentar per label detail",rot=35)
ax[0].set_ylabel("Jumlah komentar")
coverage=pd.Series({"Ada indikasi polaritas":int(df.sentiment_detail.isin(["positif_indikatif","negatif_indikatif","campuran","ambigu_perlu_tinjau"]).sum()),
                    "Netral terindikasi":int(df.sentiment_detail.isin(["netral_pertanyaan","netral_informatif"]).sum()),
                    "Belum terdeteksi/reaksi singkat":int(df.sentiment_detail.isin(["belum_terdeteksi_opini","reaksi_singkat_tanpa_polaritas"]).sum()),
                    "Teks kosong":int(df.sentiment_detail.eq("tidak_ada_teks").sum())})
coverage.plot(kind="pie",autopct="%1.1f%%",ax=ax[1],title="Cakupan hasil aturan",ylabel="")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 38
### 15.2 Heatmap aktivitas hari dan jam

# %% Cell 39
hourday=pd.crosstab(df.create_time.dt.day_name(),df.create_time.dt.hour)
order=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
hourday=hourday.reindex([x for x in order if x in hourday.index])
fig,ax=plt.subplots(figsize=(15,5))
im=ax.imshow(hourday.values,aspect="auto")
ax.set_yticks(range(len(hourday.index)),hourday.index)
ax.set_xticks(range(len(hourday.columns)),hourday.columns)
ax.set_xlabel("Jam"); ax.set_title("Heatmap volume komentar: hari × jam")
fig.colorbar(im,ax=ax,label="Jumlah komentar")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 40
### 15.3 Kalender tren bulanan dan pertumbuhan batch

# %% Cell 41
monthly=df.groupby("month").size().rename("komentar").to_frame()
monthly["perubahan_persen"]=monthly.komentar.pct_change()*100
fig,ax=plt.subplots(2,1,figsize=(14,8),sharex=True)
monthly.komentar.plot(marker="o",ax=ax[0],title="Volume komentar per bulan")
monthly.perubahan_persen.plot(kind="bar",ax=ax[1],title="Perubahan volume bulanan (%)")
ax[1].axhline(0,linewidth=1)
plt.tight_layout(); plt.show()
display(monthly.round(2))

# %% [markdown] Cell 42
### 15.4 Distribusi panjang komentar menurut sentimen

# %% Cell 43
order=[x for x in ["positif_indikatif","negatif_indikatif","netral_pertanyaan","netral_informatif","campuran","ambigu_perlu_tinjau","belum_terdeteksi_opini"] if x in df.sentiment_detail.unique()]
data=[df.loc[df.sentiment_detail==x,"word_count"].clip(upper=df.word_count.quantile(.95)).dropna() for x in order]
fig,ax=plt.subplots(figsize=(13,5))
ax.boxplot(data,tick_labels=order,showfliers=False)
ax.set_title("Panjang komentar menurut kategori"); ax.set_ylabel("Jumlah kata")
plt.xticks(rotation=35,ha="right"); plt.tight_layout(); plt.show()

# %% [markdown] Cell 44
### 15.5 Top video: volume dan komposisi respons

# %% Cell 45
topv=video_summary.head(12).sort_values("jumlah")
fig,ax=plt.subplots(1,2,figsize=(15,6))
topv.jumlah.plot(kind="barh",ax=ax[0],title="12 video dengan komentar terbanyak")
video_pct.loc[topv.index].plot(kind="barh",stacked=True,ax=ax[1],title="Komposisi sentimen per video (%)")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 46
### 15.6 Heatmap sentimen per video

# %% Cell 47
hm=video_pct.loc[video_summary.head(15).index]
fig,ax=plt.subplots(figsize=(12,7))
im=ax.imshow(hm.fillna(0).values,aspect="auto")
ax.set_yticks(range(len(hm.index)),hm.index)
ax.set_xticks(range(len(hm.columns)),hm.columns,rotation=35,ha="right")
ax.set_title("Heatmap persentase kategori respons per video")
fig.colorbar(im,ax=ax,label="Persentase (%)")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 48
### 15.7 Aspek isu: jumlah dan persentase

# %% Cell 49
fig,ax=plt.subplots(1,2,figsize=(15,6))
aspect_summary.sort_values("jumlah").plot.barh(x="aspek",y="jumlah",ax=ax[0],legend=False,title="Jumlah komentar per aspek")
aspect_summary.sort_values("persen").plot.barh(x="aspek",y="persen",ax=ax[1],legend=False,title="Persentase komentar per aspek")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 50
### 15.8 Heatmap sentimen × aspek

# %% Cell 51
cols=[c for c in ["positif","negatif","netral","campuran","perlu_tinjau","belum_terdeteksi"] if c in aspect_sentiment.columns]
mat=aspect_sentiment.set_index("aspek")[cols]
fig,ax=plt.subplots(figsize=(13,7))
im=ax.imshow(mat.values,aspect="auto")
ax.set_yticks(range(len(mat.index)),mat.index)
ax.set_xticks(range(len(mat.columns)),mat.columns,rotation=30,ha="right")
ax.set_title("Jumlah sentimen pada setiap aspek isu")
fig.colorbar(im,ax=ax,label="Jumlah komentar")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 52
### 15.9 Emosi dan jenis tanggapan

# %% Cell 53
fig,ax=plt.subplots(1,2,figsize=(15,6))
emotion_summary.sort_values("jumlah").plot.barh(x="emosi",y="jumlah",ax=ax[0],legend=False,title="Indikator emosi")
intent_summary.sort_values("jumlah").plot.barh(x="jenis_tanggapan",y="jumlah",ax=ax[1],legend=False,title="Jenis tindak tutur")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 54
### 15.10 Top kata dan frasa dominan

# %% Cell 55
fig,ax=plt.subplots(1,2,figsize=(15,7))
top_words.head(20).sort_values("frekuensi").plot.barh(x="kata",y="frekuensi",ax=ax[0],legend=False,title="20 kata paling sering")
bigrams.head(20).sort_values("jumlah_dokumen").plot.barh(x="frasa",y="jumlah_dokumen",ax=ax[1],legend=False,title="20 frasa dua kata")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 56
### 15.11 Distribusi cluster topik

# %% Cell 57
fig,ax=plt.subplots(figsize=(10,5))
topic_summary.sort_values("jumlah").plot.barh(x="cluster",y="jumlah",ax=ax,legend=False,title="Jumlah komentar per cluster topik")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 58
### 15.12 Pola interaksi komentar utama dan balasan

# %% Cell 59
reply_counts=df.is_reply.value_counts().rename(index={False:"Komentar utama",True:"Balasan"})
fig,ax=plt.subplots(1,2,figsize=(13,5))
reply_counts.plot(kind="pie",autopct="%1.1f%%",ax=ax[0],ylabel="",title="Proporsi komentar utama dan balasan")
df.groupby("is_reply").word_count.mean().rename(index={False:"Utama",True:"Balasan"}).plot(kind="bar",ax=ax[1],title="Rata-rata panjang komentar")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 60
### 15.13 Distribusi skor sentimen

# %% Cell 61
fig,ax=plt.subplots(1,2,figsize=(14,5))
df.sentiment_score.clip(-8,8).plot(kind="hist",bins=25,ax=ax[0],title="Distribusi skor sentimen (dipotong -8 s.d. 8)")
df.groupby("sentiment_detail").sentiment_score.mean().sort_values().plot(kind="barh",ax=ax[1],title="Rata-rata skor per label")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 62
### 15.14 Komentar yang paling sering mendapat respons

# %% Cell 63
reply_counts_by_parent=df[df.is_reply].groupby("parent_comment_id").size().sort_values(ascending=False).head(15)
parent_comments=df.drop_duplicates("comment_id").set_index("comment_id")
popular=parent_comments.reindex(reply_counts_by_parent.index)[["video_id","comment","sentiment_detail"]]
popular["jumlah_balasan"]=reply_counts_by_parent
display(popular.sort_values("jumlah_balasan",ascending=False))
popular.sort_values("jumlah_balasan").jumlah_balasan.plot(kind="barh",figsize=(10,6),title="Komentar dengan balasan terbanyak")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 64
## 16. Visualisasi utama dashboard: sentimen, emoji, dan saran

# %% Cell 65
# Grafik utama yang menonjolkan tiga sentimen, dengan kelompok validasi ditampilkan terpisah.
primary_counts=df["sentiment_primary"].value_counts().reindex(["positif","negatif","netral","perlu_validasi"],fill_value=0)
fig,ax=plt.subplots(1,2,figsize=(14,5))
primary_counts.plot(kind="bar",ax=ax[0],title="Sentimen utama KDMP",rot=0)
ax[0].set_ylabel("Jumlah komentar")
primary_counts.plot(kind="pie",autopct="%1.1f%%",ax=ax[1],title="Proporsi sentimen utama",ylabel="")
plt.tight_layout(); plt.show()

# Bandingkan sentimen utama dengan indikator emoji dan kandidat saran
cross_emoji=pd.crosstab(df["sentiment_primary"],df["emoji_count"].gt(0).map({True:"Ada emoji",False:"Tanpa emoji"}))
cross_emoji.plot(kind="bar",stacked=True,figsize=(10,5),title="Sentimen utama: komentar dengan dan tanpa emoji")
plt.tight_layout(); plt.show()

suggestion_by_sentiment=pd.crosstab(df["sentiment_primary"],df["is_suggestion_candidate"])
suggestion_by_sentiment.plot(kind="bar",stacked=True,figsize=(10,5),title="Kandidat saran menurut sentimen utama")
plt.tight_layout(); plt.show()

# %% [markdown] Cell 66
## 17. Struktur halaman dashboard yang direkomendasikan

1. **Overview:** total komentar, video, akun, periode, dan volume batch.
2. **Sentiment utama:** positif, negatif, netral; kelompok perlu validasi ditampilkan sebagai kontrol kualitas.
3. **Detail sentimen:** skor, bukti kata, subkategori netral, dan contoh komentar.
4. **Emoji & ekspresi:** emoji populer, emoji positif/negatif/kontekstual, serta perbandingan emoji dengan sentimen teks.
5. **Saran masyarakat:** kandidat saran, contoh komentar, dan tema saran berdasarkan aspek KDMP.
6. **Aspek dan isu:** UMKM, harga, modal, tata kelola, implementasi, distribusi, dan lainnya.
7. **Emosi & jenis tanggapan:** dukungan, harapan, kekhawatiran, kritik, pertanyaan, keluhan.
8. **Topik & tren batch:** cluster, perubahan topik, tren waktu, perbandingan video.
9. **Percakapan:** komentar utama, balasan, dan komentar yang paling banyak mendapat balasan.

Sentimen positif/negatif/netral tetap menjadi fokus utama. Emoji, saran, emosi, dan aspek merupakan dimensi pendukung yang memperkaya penjelasan mengapa dan tentang apa opini tersebut disampaikan.

