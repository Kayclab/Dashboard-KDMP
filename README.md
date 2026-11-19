# KDMP Social Media Analytics Dashboard
> **Platform Analisis Sentimen Komentar TikTok tentang Koperasi Desa Merah Putih (KDMP)**
> Proyek Akhir Teknologi Big Data — Semester 5

Dashboard interaktif (React + Vite + Tailwind + Recharts) yang membaca hasil analisis `process_dataset.py` / notebook `KDMP_Explorasi_Lanjutan_Dashboard_v3.ipynb` atas dataset `KDMP.xlsx` (220.051 baris mentah, 127.139 komentar unik setelah deduplikasi `comment_id`, 27 video, 102.899 akun).

Semua angka di dashboard dibaca dari `dashboard_data.json` (hasil `process_dataset.py`), tidak ada angka yang diketik manual di halaman.

---

## Cara Menjalankan

Prasyarat: **Node.js 18+** dan **Python 3.10+** (Python hanya perlu bila ingin membuat ulang data).

### 1. Jalankan dashboard (data JSON sudah tersedia)
```bash
cd frontend
npm install        # WAJIB sekali setelah clone (folder node_modules tidak ikut di Git)
npm run dev        # buka http://localhost:5173/
```
Atau klik dua kali `buka_dashboard.bat` (otomatis menjalankan `npm install` bila perlu).

Mode produksi:
```bash
cd frontend
npm install
npm run build
npm run preview    # buka http://localhost:5173/
```
Dari folder utama, `npm run dev` / `npm run build` / `npm run preview` meneruskan perintah ke folder `frontend` (tetap perlu `npm install` di `frontend` terlebih dahulu).

Halaman bisa dibuka langsung lewat hash URL, mis. `http://localhost:5173/#evaluation-insights`.

### 2. Membuat ulang data (opsional)
```bash
pip install pandas numpy scikit-learn openpyxl
python process_dataset.py     # butuh KDMP.xlsx di folder yang sama, sekitar 1-2 menit
```
Skrip menulis `dashboard_data.json` dan menyalinnya ke `frontend/src/data/dashboard_data.json`.

---

## Halaman Dashboard (12)

Overview · Data Understanding · Data Processing · Sentiment Analysis · Emoji & Emosi · Saran Publik · Isu & Aspek · Topik & Tren · Analisis Percakapan · Evaluasi Model · Laporan & Ekspor · Alur Data & Teknologi

## Ringkasan Hasil (dari `dashboard_data.json`)

| Kelompok sentimen utama | Jumlah | Persen |
|---|---|---|
| Netral | 95.982 | 75,49% |
| Perlu validasi | 15.204 | 11,96% |
| Negatif | 9.365 | 7,37% |
| Positif | 6.588 | 5,18% |

Catatan penting: kategori **netral** sebagian besar berarti aturan kamus belum menemukan kata bersentimen (50,73% dari seluruh komentar "belum terdeteksi"), bukan komentar yang terbukti netral.

## Evaluasi Model — cara membaca

Evaluasi memakai 20.000 komentar berlabel aturan kamus (latih 15.000, uji 5.000, `random_state=42`).

| Model | Akurasi | Macro F1 |
|---|---|---|
| Baseline mayoritas (selalu netral) | 85,38% | 30,70% |
| Multinomial Naive Bayes | 90,18% | 63,27% |
| Linear SVM | 98,28% | 94,52% |

- Label dibuat oleh aturan kamus yang kata-katanya juga menjadi fitur TF-IDF, sehingga skor mengukur **seberapa mirip model dengan aturan kamus**, bukan kebenaran sentimen.
- 85,38% data uji berkelas netral, jadi akurasi saja menyesatkan; gunakan **macro F1** dan bandingkan dengan baseline mayoritas.
- Validasi manual (500 sampel prioritas di notebook, dua penilai, Cohen's Kappa) **belum dilakukan**.

---

## Palet Desain: Crimson Forest
- **Crimson Red:** `#aa161a`, `#d22c3a`
- **Forest Green:** `#20524d`, `#499667`
- **Netral:** `#ffffff`, `#f8fafc`, `#f1f5f9`, `#0f172a`
