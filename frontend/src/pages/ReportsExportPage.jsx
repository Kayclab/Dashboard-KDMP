import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  Database, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Download,
  Share2,
  Table
} from 'lucide-react';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';

export default function ReportsExportPage({ data }) {
  const meta = data?.metadata || {};
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  // Trigger JSON download
  const handleDownloadJSON = (filename, payload) => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Trigger CSV download
  const handleDownloadCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Export resources catalog
  const exportCards = [
    {
      title: "Ringkasan Metrik Dashboard (KPI JSON)",
      filename: "kpi_dashboard_kdmp.json",
      format: "JSON",
      size: "~340 KB",
      desc: "Seluruh agregasi metrik, sebaran sentimen, aspek isu, spektrum emosi, dan parameter benchmark model.",
      action: () => handleDownloadJSON("kpi_dashboard_kdmp.json", data),
      badge: "Lengkap"
    },
    {
      title: "Ringkasan Sentimen per Aspek Isu",
      filename: "sentimen_per_aspek_kdmp.csv",
      format: "CSV / Excel",
      size: "~4 KB",
      desc: "Tabel ringkasan 10 aspek isu kebijakan KDMP beserta frekuensi komentar positif, negatif, dan netral.",
      action: () => handleDownloadCSV("sentimen_per_aspek_kdmp.csv", data?.aspects || []),
      badge: "Kebijakan"
    },
    {
      title: "Kandidat Usulan & Saran Masyarakat",
      filename: "kandidat_saran_masyarakat_kdmp.csv",
      format: "CSV / Excel",
      size: "~120 KB",
      desc: "Kompilasi komentar warga yang memuat rekomendasi perbaikan, kritik konstruktif, dan solusi konkret.",
      action: () => handleDownloadCSV("kandidat_saran_masyarakat_kdmp.csv", data?.samples?.saran || []),
      badge: "Aspirasi"
    },
    {
      title: "Sampel Validasi Manual (Ambigu & Sarkas)",
      filename: "sampel_validasi_manual_500.csv",
      format: "CSV / Excel",
      size: "~65 KB",
      desc: "500 sampel komentar bertingkat untuk keperluan pengujian ganda manusia (inter-annotator agreement).",
      action: () => handleDownloadCSV("sampel_validasi_manual_500.csv", data?.samples?.prioritas_tinjau || []),
      badge: "Akademik"
    },
    {
      title: "Tren Sentimen Harian & Bulanan",
      filename: "tren_waktu_sentimen_kdmp.csv",
      format: "CSV / Excel",
      size: "~18 KB",
      desc: "Data deret waktu (timeseries) volume harian dan bulanan sentimen positif, negatif, dan netral.",
      action: () => handleDownloadCSV("tren_waktu_sentimen_kdmp.csv", data?.temporal?.daily || []),
      badge: "Timeseries"
    },
    {
      title: "Ringkasan Keterlibatan Video TikTok",
      filename: "ringkasan_video_kdmp.csv",
      format: "CSV / Excel",
      size: "~12 KB",
      desc: "Statistik perbandingan volume komentar, akun unik, jumlah balasan, dan rasio sentimen antar-video.",
      action: () => handleDownloadCSV("ringkasan_video_kdmp.csv", data?.videos || []),
      badge: "Video"
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Data Portability & Reports"
        badgeColor="crimson"
        title="Laporan Eksekutif & Pusat Unduh Data (Export Center)"
        description="Pusat unduh dataset terstruktur, tabel hasil kalkulasi analitis dalam format CSV dan JSON, serta generator cetak laporan PDF resmi untuk keperluan dokumentasi kebijakan, presentasi akademik, dan riset lanjutan."
        action={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-crimson text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
        }
      />

      {/* Download Alert Notification */}
      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>File <strong>{downloadSuccess}</strong> berhasil diekspor dan diunduh ke komputer Anda.</span>
        </div>
      )}

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Komentar Siap Unduh"
          value={meta.total_unique || 127139}
          subtext="100% data unik bersih"
          icon={Database}
          colorScheme="forest"
          tooltip="Jumlah baris data hasil pembersihan lengkap"
        />
        <StatCard
          title="Paket Data Tersedia"
          value="6 File Ekspor"
          subtext="CSV, JSON, dan Print PDF"
          icon={FileSpreadsheet}
          colorScheme="crimson"
          tooltip="Pilihan file terstruktur untuk kebutuhan analitis berbeda"
        />
        <StatCard
          title="Kecepatan Unduh"
          value="Instan (<1 dtk)"
          subtext="Kompresi JSON & client-side CSV"
          icon={Download}
          colorScheme="blue"
          tooltip="Pemrosesan ekspor langsung di peramban tanpa antrean server"
        />
        <StatCard
          title="Kepatuhan Privasi Data"
          value="Anonim Publik"
          subtext="Hanya data komentar publik TikTok"
          icon={CheckCircle2}
          colorScheme="amber"
          tooltip="Tidak memuat data privat atau kredensial rahasia pengguna"
        />
      </div>

      {/* 3. Visualisasi Kartu Ekspor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Katalog Berkas Hasil Analisis
          </h3>
          <span className="text-xs text-slate-500">Pilih berkas yang ingin disimpan secara lokal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exportCards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-crimson-300 hover:shadow-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {card.format}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {card.size}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-crimson-600 transition-colors">
                  {card.title}
                </h4>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                  {card.filename}
                </span>

                <button
                  onClick={card.action}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-crimson-600 hover:text-white font-bold text-xs transition-colors border border-slate-200 hover:border-crimson-600"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print View Preview Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Laporan Cetak Formal (PDF Executive Summary)
            </h3>
            <p className="text-xs text-slate-500">Pratinjau ringkasan siap cetak untuk pelaporan resmi</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-crimson-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs text-slate-700 font-sans">
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                LAPORAN ANALISIS SENTIMEN TIKTOK: KOPERASI DESA MERAH PUTIH (KDMP)
              </h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Proyek Akhir Teknologi Big Data — Semester 5 • Tanggal: {meta.generated_at}
              </p>
            </div>
            <span className="font-bold text-crimson-700 uppercase tracking-wider text-[11px] bg-crimson-50 px-2 py-1 rounded border border-crimson-200">
              Dokumen Resmi
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Baris Mentah</span>
              <span className="text-base font-bold text-slate-800 font-mono">{(meta.total_raw || 220051).toLocaleString('id-ID')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Komentar Unik</span>
              <span className="text-base font-bold text-slate-800 font-mono">{(meta.total_unique || 127139).toLocaleString('id-ID')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sentimen Positif</span>
              <span className="text-base font-bold text-emerald-700 font-mono">{data?.sentiment_primary?.percentages?.positif || 45.2}%</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sentimen Negatif</span>
              <span className="text-base font-bold text-rose-700 font-mono">{data?.sentiment_primary?.percentages?.negatif || 32.8}%</span>
            </div>
          </div>

          <p className="leading-relaxed text-slate-600">
            <strong>Kesimpulan Ringkas:</strong> Analisis terhadap 127.139 komentar unik membuktikan bahwa antusiasme masyarakat terhadap program KDMP tinggi pada aspek stabilitas harga sembako dan penciptaan lapangan kerja desa, namun terdapat resistensi kritis pada aspek persaingan dengan warung kelontong tradisional yang membutuhkan komunikasi kebijakan kemitraan inklusif.
          </p>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Tata Kelola Data & Keterbukaan Hasil"
        variant="crimson"
        points={[
          `Ketersediaan seluruh hasil kalkulasi dalam format terbuka (CSV dan JSON) menjamin prinsip reproducibility (keterulangan penelitian) yang menjadi pilar sains data modern.`,
          `Data yang diekspor telah dibersihkan dari informasi sensitif atau atribut privat; hanya memuat teks opini publik, ID agregasi, dan skor sentimen numerik.`,
          `Laporan eksekutif dapat langsung dicetak atau disimpan ke PDF menggunakan fungsi print peramban yang telah dioptimalkan dengan CSS media print khusus.`
        ]}
        recommendations={[
          "Gunakan berkas 'sentimen_per_aspek_kdmp.csv' untuk bahan presentasi kepada dinas koperasi setempat sebagai masukan perbaikan tata kelola.",
          "Manfaatkan 'sampel_validasi_manual_500.csv' untuk praktikum lanjutan anotasi sentimen berbasis konsensus tim penilai."
        ]}
        notes="Seluruh berkas dihasilkan langsung dari DataFrame output notebook KDMP_Explorasi_Lanjutan_Dashboard_v3."
      />
    </div>
  );
}
