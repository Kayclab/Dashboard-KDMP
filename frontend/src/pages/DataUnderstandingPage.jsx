import React from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  HelpCircle, 
  Hash, 
  AlignLeft, 
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';

export default function DataUnderstandingPage({ data }) {
  const meta = data?.metadata || {};
  const audit = data?.audit || { null_counts: {}, unique_counts: {} };

  // Data schema table
  const schemaDetails = [
    { name: "video_id", type: "String / BigInt", unique: meta.total_videos || 38, nulls: audit.null_counts.video_id || 0, desc: "ID unik video TikTok yang menjadi sumber tanggapan publik" },
    { name: "comment_id", type: "String / BigInt", unique: meta.total_unique || 127139, nulls: audit.null_counts.comment_id || 0, desc: "ID unik komentar pada platform TikTok (primary key dedup)" },
    { name: "parent_comment_id", type: "String / BigInt", unique: 4120, nulls: audit.null_counts.parent_comment_id || 0, desc: "ID komentar induk; berisi jika komentar berstatus balasan" },
    { name: "level", type: "String / Int", unique: 2, nulls: audit.null_counts.level || 0, desc: "Tingkat hirarki komentar (level 1 = utama, level 2 = balasan)" },
    { name: "username", type: "String", unique: meta.total_accounts || 98450, nulls: audit.null_counts.username || 0, desc: "Handle akun TikTok pengunggah komentar" },
    { name: "nickname", type: "String", unique: 92310, nulls: audit.null_counts.nickname || 0, desc: "Nama tampilan (display name) akun pengguna" },
    { name: "comment", type: "String (Text)", unique: 118420, nulls: audit.null_counts.comment || 0, desc: "Teks isi komentar mentah yang diunggah pengguna" },
    { name: "create_time", type: "Datetime", unique: 124800, nulls: audit.null_counts.create_time || 0, desc: "Waktu komentar diposting (YYYY-MM-DD HH:MM:SS)" },
  ];

  // Missing values chart data
  const nullChartData = Object.entries(audit.null_counts || {}).map(([key, val]) => ({
    kolom: key,
    kosong: val,
    persen: Number(((val / (meta.total_raw || 220051)) * 100).toFixed(2))
  }));

  // Deduplication pie data
  const dedupData = [
    { name: 'Komentar Unik', value: meta.total_unique || 127139, color: '#20524d', pct: ((meta.total_unique / meta.total_raw) * 100).toFixed(1) },
    { name: 'Salinan Duplikat', value: meta.duplicates_removed || 92912, color: '#aa161a', pct: ((meta.duplicates_removed / meta.total_raw) * 100).toFixed(1) },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Data Profiling"
        badgeColor="forest"
        title="Pemahaman & Audit Kualitas Dataset KDMP"
        description="Analisis mendalam terhadap struktur data mentah, audit nilai null, penghitungan entitas unik, dan evaluasi integritas 220.051 baris komentar TikTok sebelum proses pembersihan."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Baris Mentah"
          value={meta.total_raw || 220051}
          subtext="Hasil pembacaan file KDMP.xlsx"
          icon={FileSpreadsheet}
          colorScheme="neutral"
          tooltip="Ukuran dataset mentah dari file Excel sebelum deduplikasi"
        />
        <StatCard
          title="Komentar Unik Terverifikasi"
          value={meta.total_unique || 127139}
          subtext={`${((meta.total_unique / meta.total_raw) * 100).toFixed(1)}% dari total raw`}
          icon={CheckCircle2}
          colorScheme="forest"
          tooltip="Baris dengan comment_id unik yang dipertahankan"
        />
        <StatCard
          title="Baris Duplikat Dikeluarkan"
          value={meta.duplicates_removed || 92912}
          subtext={`${((meta.duplicates_removed / meta.total_raw) * 100).toFixed(1)}% redundansi data`}
          icon={Copy}
          colorScheme="crimson"
          tooltip="Salinan baris yang dieliminasi untuk menghindari bias agregasi"
        />
        <StatCard
          title="Jumlah Atribut / Fitur"
          value="8 Kolom"
          subtext="Struktur standar komentar TikTok"
          icon={Layers}
          colorScheme="blue"
          tooltip="8 kolom atribut data mentah yang diaudit integritasnya"
        />
      </div>

      {/* 3. Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deduplikasi & Komposisi */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Rasio Deduplikasi Data
              </h3>
              <p className="text-xs text-slate-500">Perbandingan komentar unik vs baris salinan</p>
            </div>
            <span className="p-2 rounded-xl bg-crimson-50 text-crimson-600">
              <Copy className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dedupData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dedupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${val.toLocaleString('id-ID')} baris (${item.payload.pct}%)`, 
                    item.payload.name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800">
                {dedupData[0].pct}%
              </span>
              <span className="text-[10px] font-bold text-forest-600">
                Data Unik
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-forest-50/60 border border-forest-100">
              <p className="text-[10px] font-bold text-forest-700">Unik Dipertahankan</p>
              <p className="text-base font-black text-forest-800 mt-0.5">{(meta.total_unique || 127139).toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <p className="text-[10px] font-bold text-rose-700">Duplikat Dibuang</p>
              <p className="text-base font-black text-rose-800 mt-0.5">{(meta.duplicates_removed || 92912).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Audit Missing Value per Kolom */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Audit Nilai Kosong (Missing Values)
              </h3>
              <p className="text-xs text-slate-500">Persentase data kosong pada setiap atribut mentah</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nullChartData} layout="vertical" margin={{ top: 5, right: 30, left: 75, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 100]} />
                <YAxis dataKey="kolom" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip 
                  formatter={(val, name, item) => [`${val}% (${item.payload.kosong.toLocaleString('id-ID')} baris)`, 'Data Kosong']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="persen" fill="#d22c3a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Kolom <code>parent_comment_id</code> kosong pada komentar utama (bukan indikasi data rusak).</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Atribut Teks & ID 100% Lengkap</span>
          </div>
        </div>
      </div>

      {/* Skema Atribut & Metadata Detail */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Struktur Skema Dataset KDMP
            </h3>
            <p className="text-xs text-slate-500">Spesifikasi 8 atribut data masukan dari notebook</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Format: XLSX (15.8 MB)
          </span>
        </div>

        <div className="overflow-x-auto mt-4 -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-3">Nama Kolom</th>
                <th className="py-3 px-3">Tipe Data</th>
                <th className="py-3 px-3">Nilai Unik</th>
                <th className="py-3 px-3">Status Missing</th>
                <th className="py-3 px-3">Fungsi Analitis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {schemaDetails.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold font-mono text-slate-900 text-xs">
                    {col.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {col.type}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {col.unique.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3">
                    {col.nulls === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> 0% (Lengkap)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {((col.nulls / (meta.total_raw || 220051)) * 100).toFixed(1)}% ({col.nulls.toLocaleString('id-ID')})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {col.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Kualitas & Karakteristik Data"
        variant="forest"
        points={[
          `Tingkat duplikasi sebesar 42,22% (92.912 salinan) merupakan konsekuensi umum dari proses scraping komentar TikTok multi-thread pada video dengan engagement tinggi atau paginasi ulang.`,
          `Seluruh 127.139 baris komentar unik memiliki atribut komentar dan timestamp yang utuh, memastikan tidak ada data sentimen yang hilang atau terdistorsi akibat nilai kosong.`,
          `Keberadaan 98.450 akun unik pada 38 video menunjukkan jangkauan percakapan yang tersebar luas (rata-rata 1,29 komentar per pengguna), meminimalkan risiko manipulasi opini oleh segelintir buzzer.`
        ]}
        recommendations={[
          "Deduplikasi berbasis ID primer wajib diterapkan di awal pipeline; jika diabaikan, video viral dengan tingkat duplikat tinggi akan mendominasi dan menggeser distribusi polaritas sebenarnya.",
          "Nilai kosong pada parent_comment_id harus dimanfaatkan secara eksplisit untuk memetakan arsitektur percakapan (komentar utama vs balasan bertingkat)."
        ]}
        notes="Audit dilakukan menggunakan pandas isna() dan nunique() sesuai implementasi Cell 4 di notebook KDMP_Explorasi_Lanjutan_Dashboard_v3."
      />
    </div>
  );
}
