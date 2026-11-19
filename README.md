# KDMP Social Media Analytics Dashboard
> **Platform Analisis Sentimen Komentar TikTok tentang Koperasi Desa Merah Putih (KDMP)**  
> Proyek Akhir Teknologi Big Data — Semester 5

Website dashboard interaktif modern, responsif, dan kaya visualisasi yang dibangun berdasarkan notebook analitis `KDMP_Explorasi_Lanjutan_Dashboard_v3.ipynb` dan dataset riil `KDMP.xlsx` (220.051 baris mentah, 127.139 baris unik pasca-deduplikasi).

---

## 🎨 Palet Desain: Crimson Forest
Dashboard ini dirancang secara elegan dengan dominasi warna putih bersih (*crisp white*) dan aksen palet **Crimson Forest**:
- **Crimson Red:** `#aa161a` (Primary Deep Crimson), `#d22c3a` (Vibrant Crimson)
- **Forest Green:** `#20524d` (Deep Pine / Evergreen), `#499667` (Fresh Forest Green)
- **Neutrals & Canvas:** `#ffffff`, `#f8fafc`, `#f1f5f9`, `#0f172a` (Charcoal Slate)

---

## 🚀 Fitur Utama & Struktur Menu

Navigasi sidebar menyediakan 11 menu utama + 1 halaman khusus:

1. **Overview**
   - KPI Utama: 127.139 komentar unik, 38 video, 98.450 akun unik.
   - Donut Chart Sentimen Utama (Positif 45.2%, Negatif 32.8%, Netral 22.0%, Perlu Validasi).
   - Grafik Area tren sentimen bulanan dan Top 5 Isu terpopuler.
2. **Data Understanding**
   - Audit kelengkapan 8 kolom atribut, rasio deduplikasi (92.912 salinan dikeluarkan).
   - Tabel skema struktur dataset lengkap dengan jumlah nilai unik.
3. **Data Processing**
   - Alur NLP Preprocessing 5 tahap: Regex Cleaning, Reduksi Huruf Berulang, Case Folding, Ekstraksi Emoji, Tokenisasi, dan Stopwords Removal (32 kata hubung).
   - Tabel perbandingan teks sebelum vs sesudah transformasi (*before-after*).
4. **Sentiment Analysis (Positif, Negatif, Netral)**
   - Fokus utama analisis polaritas berbasis kamus InSet yang diperluas konteks KDMP.
   - Dekomposisi 8 sub-kategori sentimen dan pemilahan netral pertanyaan/informatif.
   - Kamus bukti kata terkuat (*evidence words*) positif vs negatif.
5. **Emoji & Emotion Analysis**
   - Frekuensi 15 emoji terpopuler (👍, ❤️, 😂, 👎, 😡, dll).
   - Distribusi 7 spektrum psikologis emosi: Dukungan, Harapan, Khawatir, Kecewa, Marah, Bingung, Humor/Sarkasme.
6. **Public Suggestions**
   - Penyaringan 14.160 komentar saran masyarakat menggunakan 16 pemicu leksikal (*suggestion cues*).
   - Pengelompokan tema usulan warga berbasis isu operasional KDMP.
7. **Issue & Aspect Analysis**
   - Analisis multi-label 10 isu strategis (UMKM & Persaingan, Harga, Modal, Tata Kelola, Distribusi, dll).
   - Stacked bar perbandingan rasio sentimen pada setiap aspek.
8. **Topic & Trend Analysis**
   - 8 Cluster Topik tematik berbasis algoritma **K-Means Clustering** (TF-IDF 10.000 fitur).
   - Top 15 frasa dua kata (*bigram*) dan Peta Panas (*Heatmap*) aktivitas Hari × Jam (24 jam).
   - Komparasi komposisi sentimen antar-video TikTok viral.
9. **Conversation Analysis**
   - Proporsi Komentar Utama (70%) vs Balasan/Replies (30%).
   - Komparasi rata-rata panjang kata dan skor sentimen.
   - 10 Komentar Induk paling banyak memicu perdebatan (*most debated parent comments*).
10. **Evaluation & Insights**
    - Komparasi performa model: **InSet Lexicon Heuristics (88.4%)** vs **Multinomial Naive Bayes (86.8%)** vs **Linear SVM (89.2% / F1: 89.4%)**.
    - Matriks Konfusi (*Confusion Matrix*) interaktif 3×3 untuk kelas Positif, Negatif, dan Netral.
    - Penjelasan batas metodologis dan 500 sampel prioritas validasi manual (*human annotation*).
11. **Reports & Export**
    - Unduh data agregasi dalam format CSV dan JSON siap pakai.
    - Generator cetak laporan formal PDF (*Executive Summary*) menggunakan tampilan cetak teroptimasi.
12. **Data Flow & Technology (Halaman Khusus)**
    - Diagram alur interaktif 9 tahap dari file mentah `KDMP.xlsx` hingga visualisasi.
    - Tampilan teknologi nyata: Python, pandas, numpy, scikit-learn, React 18, Tailwind CSS, Framer Motion, Recharts.
    - Diagram arsitektur sistem 5 lapis (*5-Layer Architecture*).

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi server preview saat ini aktif di:
```bash
http://localhost:5173/
```

Untuk menjalankan ulang aplikasi di lingkungan lokal:

1. **Jalankan Pipeline Data Python (Opsional, data JSON sudah tersedia):**
   ```bash
   python process_dataset.py
   ```

2. **Jalankan Frontend (Mode Development):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Jalankan Frontend (Mode Production Preview):**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```
   Buka peramban di `http://localhost:5173/`.
