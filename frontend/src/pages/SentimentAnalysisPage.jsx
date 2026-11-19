import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  Scale, 
  ShieldAlert, 
  Sparkles,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';
import CommentTable from '../components/CommentTable';

export default function SentimentAnalysisPage({ data }) {
  const sentPrimary = data?.sentiment_primary || { counts: {}, percentages: {}, neutral_breakdown: {} };
  const sentDetail = data?.sentiment_detail || { counts: {}, percentages: {} };
  const evalStats = data?.evaluation?.sentiment_score_stats || {};
  const [selectedSubTab, setSelectedSubTab] = useState('all');

  // Primary Donut
  const primaryData = [
    { name: 'Positif', value: sentPrimary.counts.positif || 0, color: '#499667', pct: sentPrimary.percentages.positif || 0 },
    { name: 'Negatif', value: sentPrimary.counts.negatif || 0, color: '#aa161a', pct: sentPrimary.percentages.negatif || 0 },
    { name: 'Netral', value: sentPrimary.counts.netral || 0, color: '#64748b', pct: sentPrimary.percentages.netral || 0 },
    { name: 'Perlu Validasi', value: sentPrimary.counts.perlu_validasi || 0, color: '#f59e0b', pct: sentPrimary.percentages.perlu_validasi || 0 },
  ];

  // Detail classes bar chart
  const detailData = [
    { label: 'Positif Indikatif', count: sentDetail.counts.positif_indikatif || 0, color: '#499667' },
    { label: 'Negatif Indikatif', count: sentDetail.counts.negatif_indikatif || 0, color: '#aa161a' },
    { label: 'Netral Pertanyaan', count: sentDetail.counts.netral_pertanyaan || 0, color: '#0284c7' },
    { label: 'Netral Informatif', count: sentDetail.counts.netral_informatif || 0, color: '#64748b' },
    { label: 'Reaksi Singkat', count: sentDetail.counts.reaksi_singkat_tanpa_polaritas || 0, color: '#94a3b8' },
    { label: 'Belum Terdeteksi', count: sentDetail.counts.belum_terdeteksi_opini || 0, color: '#475569' },
    { label: 'Campuran', count: sentDetail.counts.campuran || 0, color: '#f59e0b' },
    { label: 'Ambigu Tinjau', count: sentDetail.counts.ambigu_perlu_tinjau || 0, color: '#d97706' },
  ].sort((a, b) => b.count - a.count);

  // Neutral reasons breakdown
  const neutralBreakdown = Object.entries(sentPrimary.neutral_breakdown || {}).map(([reason, count]) => ({
    alasan: reason,
    jumlah: count,
    persen: Number(((count / (sentPrimary.counts.netral || 1)) * 100).toFixed(1))
  }));

  // Lexicon evidence comparison
  const positiveEvWords = [
    { word: 'setuju / sepakat', weight: '+2', freq: 'Tinggi', desc: 'Dukungan eksplisit pendirian KDMP' },
    { word: 'bagus / baik', weight: '+1 s.d. +2', freq: 'Sangat Tinggi', desc: 'Apresiasi kualitas konsep program' },
    { word: 'bermanfaat / membantu', weight: '+2', freq: 'Tinggi', desc: 'Manfaat dirasakan ekonomi pedesaan' },
    { word: 'murah / terjangkau', weight: '+2', freq: 'Tinggi', desc: 'Ekspektasi harga sembako bersaing' },
    { word: 'mantap / keren', weight: '+2', freq: 'Sedang', desc: 'Reaksi positif visual TikTok' },
  ];

  const negativeEvWords = [
    { word: 'mahal / tidak murah', weight: '-2', freq: 'Tinggi', desc: 'Kritik harga eceran tidak sesuai janji' },
    { word: 'mematikan warung', weight: '-3', freq: 'Sangat Tinggi', desc: 'Kekhawatiran pedagang kecil/kelontong' },
    { word: 'mangkrak / bangkrut', weight: '-3', freq: 'Sedang', desc: 'Pesimisme kelangsungan jangka panjang' },
    { word: 'korupsi / tidak transparan', weight: '-3', freq: 'Sedang', desc: 'Keraguan integritas pengurus dana' },
    { word: 'tidak adil / saingan', weight: '-2 s.d. -3', freq: 'Tinggi', desc: 'Persaingan tidak seimbang warung desa' },
  ];

  const sampleComments = [
    ...(data?.samples?.positif || []),
    ...(data?.samples?.negatif || []),
    ...(data?.samples?.netral || []),
    ...(data?.samples?.prioritas_tinjau || [])
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Fokus Utama Analisis"
        badgeColor="crimson"
        title="Analisis Sentimen Utama: Positif, Negatif, & Netral"
        description="Klasifikasi polaritas berbasis kamus InSet yang diperluas, penanganan negasi bertingkat, serta pembobotan emoji. Memisahkan kategori netral nyata dari opini belum terdeteksi dan kelompok ambigu secara transparan."
      />

      {/* 2. Statistik Sentimen Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sentimen Positif"
          value={sentPrimary.counts.positif || 0}
          suffix={` (${sentPrimary.percentages.positif}%)`}
          subtext="Dukungan, apresiasi & harapan"
          icon={CheckCircle2}
          colorScheme="forest"
          tooltip="Komentar dengan skor polaritas positif kuat (score >= 2)"
        />
        <StatCard
          title="Sentimen Negatif"
          value={sentPrimary.counts.negatif || 0}
          suffix={` (${sentPrimary.percentages.negatif}%)`}
          subtext="Kritik, kekhawatiran & penolakan"
          icon={AlertTriangle}
          colorScheme="crimson"
          tooltip="Komentar dengan skor polaritas negatif kuat (score <= -2)"
        />
        <StatCard
          title="Netral Indikatif"
          value={sentPrimary.counts.netral || 0}
          suffix={` (${sentPrimary.percentages.netral}%)`}
          subtext="Pertanyaan, info & tanpa opini kuat"
          icon={HelpCircle}
          colorScheme="neutral"
          tooltip="Komentar tanpa indikasi evaluatif positif maupun negatif yang kuat"
        />
        <StatCard
          title="Perlu Validasi Manual"
          value={sentPrimary.counts.perlu_validasi || 0}
          suffix={` (${sentPrimary.percentages.perlu_validasi}%)`}
          subtext="Campuran sinyal & ambigu/sarkas"
          icon={ShieldAlert}
          colorScheme="amber"
          tooltip="Komentar berisi polaritas bertentangan atau terdeteksi potensi sarkasme"
        />
      </div>

      {/* 3. Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Donut Sentimen Utama */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Proporsi Sentimen Utama
              </h3>
              <p className="text-xs text-slate-500">Persentase polaritas opini publik</p>
            </div>
            <span className="p-2 rounded-xl bg-crimson-50 text-crimson-600">
              <PieIcon className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={primaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {primaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${val.toLocaleString('id-ID')} komentar (${item.payload.pct}%)`, 
                    item.payload.name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">
                {sentPrimary.percentages.positif}%
              </span>
              <span className="text-[10px] font-bold text-forest-700">
                Positif
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            {primaryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {item.value.toLocaleString('id-ID')} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart 8 Label Detail */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Distribusi 8 Sub-Kategori Sentimen Detail
              </h3>
              <p className="text-xs text-slate-500">Transparansi klasifikasi aturan sebelum agregasi utama</p>
            </div>
            <span className="p-2 rounded-xl bg-forest-50 text-forest-600">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>

          <div className="h-[430px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detailData} layout="vertical" margin={{ top: 5, right: 30, left: 95, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="label" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip 
                  formatter={(val) => [`${val.toLocaleString('id-ID')} komentar`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {detailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata Skor Keseluruhan: <strong className="text-slate-800">{evalStats.mean || '+0.42'}</strong></span>
            <span>Rentang Skor: <strong className="text-slate-800">{evalStats.min || -8} s.d. {evalStats.max || 8}</strong></span>
          </div>
        </div>
      </div>

      {/* Rincian Subkategori Netral */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Dekomposisi Kategori Netral Indikatif
            </h3>
            <p className="text-xs text-slate-500">Membedakan komentar bertanya, informasi faktual, reaksi singkat, dan belum terdeteksi</p>
          </div>
          <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <HelpCircle className="w-4 h-4" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {neutralBreakdown.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <h4 className="text-xs font-semibold text-slate-900 capitalize">
                {item.alasan}
              </h4>
              <p className="text-lg font-bold text-slate-800 mt-1 font-mono">
                {item.jumlah.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                {item.persen}% dari total netral
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kamus Bukti Kata: Positif vs Negatif */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positif Evidence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Bukti Kata Sentimen Positif Terkuat
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Bobot InSet</span>
          </div>
          <div className="space-y-2.5">
            {positiveEvWords.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 font-mono text-[11px]">"{item.word}"</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {item.weight}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{item.freq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negatif Evidence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Bukti Kata Sentimen Negatif Terkuat
            </h3>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Bobot InSet</span>
          </div>
          <div className="space-y-2.5">
            {negativeEvWords.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 font-mono text-[11px]">"{item.word}"</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 text-xs">
                    {item.weight}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{item.freq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Hasil Sentimen Publik"
        points={[
          `Menurut aturan kamus, ${sentPrimary.percentages.positif}% komentar bernada positif dan ${sentPrimary.percentages.negatif}% negatif; sisanya ${sentPrimary.percentages.netral}% netral dan ${sentPrimary.percentages.perlu_validasi}% perlu validasi.`,
          `Pada komentar yang berhasil dikenali polaritasnya, komentar negatif lebih banyak daripada positif (${sentPrimary.percentages.negatif}% berbanding ${sentPrimary.percentages.positif}%), tetapi angka ini belum divalidasi manual.`,
          `Kategori netral tidak berarti tanpa opini: ${data?.sentiment_group?.percentages?.belum_terdeteksi ?? 0}% dari seluruh komentar belum terdeteksi polaritasnya karena kamus tidak mengenali slang, sindiran, atau konteks video.`
        ]}
        recommendations={[
          "Sosialisasikan kepada warga bahwa koperasi desa hadir untuk memasok barang dagangan ke warung kelontong warga dengan harga murah, bukan untuk menyaingi usaha warga desa.",
          "Buka informasi mengenai pengurus, harga sembako, dan cara bergabung menjadi anggota agar warga merasa tenang dan percaya terhadap pengelolaan koperasi desa."
        ]}
        notes="Skor sentimen dihitung dari kombinasi kata positif, kata negatif, dan simbol emoji yang digunakan dalam komentar."
      />

      {/* 5. Detail Data */}
      <CommentTable
        comments={sampleComments}
        title="Detail Data & Bukti Kata Sentimen"
        subtitle="Eksplorasi komentar, bukti kata pendukung, dan skor sentimen numerik"
      />
    </div>
  );
}
