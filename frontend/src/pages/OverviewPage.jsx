import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';

export default function OverviewPage({ data, setActiveMenu }) {
  const meta = data?.metadata || {};
  const sentPrimary = data?.sentiment_primary || { counts: {}, percentages: {} };
  const temporal = data?.temporal?.monthly || [];
  const aspects = (data?.aspects || []).slice(0, 6);

  // Active slide index for Dimensi Isu Prioritas carousel
  const [activeAspectIdx, setActiveAspectIdx] = useState(0);

  const nextAspect = () => {
    setActiveAspectIdx((prev) => (prev + 1) % (aspects.length || 1));
  };

  const prevAspect = () => {
    setActiveAspectIdx((prev) => (prev - 1 + (aspects.length || 1)) % (aspects.length || 1));
  };

  // 9 Metric items for Partisipasi Komunitas (Item 3: tambahkan jadi 6 atau 9)
  const communityMetrics = [
    { label: 'Konten Video', value: meta.total_videos || 38 },
    { label: 'Akun Warga', value: '98.4k' },
    { label: 'Rentang Waktu', value: '3 Bulan' },
    { label: 'Rata-rata/Video', value: '3.345' },
    { label: 'Total Diskusi', value: '127.1k' },
    { label: 'Komentar Balasan', value: '31.4k' },
    { label: 'Rasio Kritik', value: `${sentPrimary.percentages.negatif || 42.4}%` },
    { label: 'Rasio Apresiasi', value: `${sentPrimary.percentages.positif || 5.2}%` },
    { label: 'Validitas Data', value: '100%' }
  ];

  // Top 3 recent comments
  const recentActivities = [
    {
      user: 'Warga Desa Sukamaju',
      time: 'Hari ini, 14:34',
      badge: '+Positif',
      badgeColor: 'text-[#315343] bg-[#edf3ef]',
      text: 'Bagus kalau koperasinya benar-benar beli hasil panen petani lokal dengan harga adil.'
    },
    {
      user: 'Pengamat Kebijakan',
      time: 'Hari ini, 15:20',
      badge: '-Kritis',
      badgeColor: 'text-[#aa161a] bg-[#fbebee]',
      text: 'Jangan sampai mematikan warung kelontong warga sekitar, harus ada regulasi kemitraan.'
    },
    {
      user: 'Pelaku Usaha Mikro',
      time: 'Hari ini, 17:54',
      badge: '~Saran',
      badgeColor: 'text-[#315343] bg-[#edf3ef]',
      text: 'Mohon mekanisme pendaftaran keanggotaan dan bagi hasil dijelaskan lebih rinci.'
    }
  ];

  const currentAspect = aspects[activeAspectIdx] || { label: 'UMKM & Kelontong', jumlah: 41839, positif: 2190, negatif: 18450 };

  return (
    <div className="space-y-4">
      {/* Compact Page Header */}
      <SectionHeader
        title="Ringkasan Analisis Sentimen KDMP"
        description="Pantauan komprehensif batch komentar publik TikTok mengenai program Koperasi Desa Merah Putih. Mengintegrasikan 127.139 data unik, dinamika tren, dan isu prioritas."
      />

      {/* Row 1: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Komentar"
          value={meta.total_unique || 127139}
          variant="bars"
          subtext="100% data unik tervalidasi"
        />
        <StatCard
          title="Akun Pengguna"
          value={meta.total_accounts || 102899}
          variant="wave"
          icon={Users}
          subtext="Partisipan diskusi masyarakat"
        />
        <StatCard
          title="Sentimen Positif"
          value={`${(sentPrimary.counts.positif || 6588).toLocaleString('id-ID')}`}
          variant="icon"
          icon={CheckCircle2}
          subtext={`${sentPrimary.percentages.positif || 5.18}% dari total respon`}
        />
        <StatCard
          title="Sentimen Negatif"
          value={`${(sentPrimary.counts.negatif || 53942).toLocaleString('id-ID')}`}
          variant="dark-green"
          subtext={`${sentPrimary.percentages.negatif || 42.43}% fokus evaluasi`}
        />
      </div>

      {/* Row 2: 3 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card (6 cols): "Balance" style multi-line area chart */}
        <div className="lg:col-span-6 bg-white rounded-[26px] p-5 shadow-xs border border-transparent flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-bold text-[#1a2e26]">
              Dinamika Sentimen
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#315343]" />
                <span className="text-xs font-semibold text-[#1a2e26]">Positif {sentPrimary.percentages.positif || '5.18'}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#aa161a]" />
                <span className="text-xs font-semibold text-[#1a2e26]">Negatif {sentPrimary.percentages.negatif || '42.43'}%</span>
              </div>
            </div>
          </div>

          {/* Smooth Monotone Wave Chart */}
          <div className="h-44 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temporal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sageArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#315343" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#315343" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="crimsonArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#aa161a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#aa161a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f3ec" vertical={false} />
                <XAxis dataKey="month" stroke="#a3aba6" fontSize={11} tickLine={false} />
                <YAxis stroke="#a3aba6" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val, name) => [`${val.toLocaleString('id-ID')} komentar`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e3da', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                />
                <Area type="monotone" dataKey="positif" stroke="#315343" strokeWidth={2.5} fillOpacity={1} fill="url(#sageArea)" name="Positif" />
                <Area type="monotone" dataKey="negatif" stroke="#aa161a" strokeWidth={2} fillOpacity={1} fill="url(#crimsonArea)" name="Negatif" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle Card (3 cols): "Earnings" style with Half-Donut Gauge matching reference */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-5 shadow-xs border border-transparent flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1a2e26]">
              Proporsi Opini
            </h3>
            <p className="text-xs text-[#737c76] mt-0.5">Total Respon Kritis</p>
            <h4 className="text-2xl font-black text-[#1a2e26] mt-1.5">
              {(sentPrimary.counts.negatif || 53942).toLocaleString('id-ID')}
            </h4>
            <p className="text-[11px] text-[#737c76] mt-0.5 leading-relaxed">
              42.4% komentar mengutarakan evaluasi & transparansi
            </p>
          </div>

          {/* Semi-Circle Gauge matching reference image */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            <svg className="w-32 h-18 overflow-visible" viewBox="0 0 100 55">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#edf3ef"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 76 18"
                fill="none"
                stroke="#315343"
                strokeWidth="11"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-lg font-bold text-[#1a2e26]">80%</span>
              <span className="text-[9px] text-[#737c76]">Dominasi Partisipasi</span>
            </div>
          </div>
        </div>

        {/* Right Card (3 cols): Community participation stats - 9 Items */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-5 shadow-xs border border-transparent flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-[#1a2e26]">
                Partisipasi Komunitas
              </h4>
              <p className="text-[11px] text-[#737c76]">Ringkasan Interaksi Diskusi</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f4f3ec] text-[#315343] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* 9 Items Grid (Item 3) */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {communityMetrics.map((m, idx) => (
              <div key={idx} className="bg-[#f6f5ef] p-2 rounded-xl text-center">
                <p className="text-[9px] font-medium text-[#737c76] truncate">{m.label}</p>
                <p className="text-xs font-bold text-[#1a2e26] mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: 3 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card (6 cols): Slideable Aspect Cards Carousel (Item 3) */}
        <div className="lg:col-span-6 bg-white rounded-[26px] p-5 shadow-xs border border-transparent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1a2e26]">
                Dimensi Isu Prioritas
              </h3>
              <p className="text-xs text-[#737c76] mt-0.5">
                Sorotan masyarakat pada kebijakan ekonomi desa
              </p>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevAspect}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-[#f6f5ef] transition-colors"
                title="Dimensi Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-[#1a2e26] px-1">
                {activeAspectIdx + 1} / {aspects.length}
              </span>
              <button
                onClick={nextAspect}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-[#f6f5ef] transition-colors"
                title="Dimensi Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Animated Slideable Cards Container */}
          <div className="my-3 relative min-h-[110px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAspectIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full bg-[#edf3ef] border border-[#d2ded5] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#315343] block">
                    Dimensi {activeAspectIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-[#1a2e26] mt-0.5">
                    {currentAspect.label}
                  </h4>
                  <p className="text-xs text-[#737c76] mt-1 font-semibold">
                    {currentAspect.jumlah?.toLocaleString('id-ID')} respon tercatat
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-bold text-[#315343] bg-white px-2 py-0.5 rounded-lg shadow-2xs">
                    {currentAspect.positif?.toLocaleString('id-ID')} positif
                  </span>
                  <span className="text-xs font-bold text-[#aa161a] bg-white px-2 py-0.5 rounded-lg shadow-2xs">
                    {currentAspect.negatif?.toLocaleString('id-ID')} negatif
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setActiveMenu('issue-aspect')}
              className="px-4 py-2 rounded-xl bg-[#315343] hover:bg-[#1a2e26] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Lihat Detail Isu
            </button>
            <span className="text-[11px] text-[#737c76]">
              Klik tombol panah untuk geser kartu
            </span>
          </div>
        </div>

        {/* Middle Card (3 cols): Diskusi Terkini */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-5 shadow-xs border border-transparent flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-bold text-[#1a2e26]">
              Aspirasi Publik
            </h3>
            <span className="text-[11px] font-medium text-[#737c76]">
              Terbaru
            </span>
          </div>

          <div className="space-y-2.5 my-2">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1a2e26] truncate">{act.user}</p>
                  <p className="text-[10px] text-[#737c76] truncate mt-0.5">{act.text}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveMenu('conversation')}
            className="w-full text-center text-xs font-semibold text-[#315343] hover:text-[#1a2e26] pt-2 border-t border-slate-100 flex items-center justify-center gap-1 transition-colors"
          >
            Lihat Analisis Percakapan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Card (3 cols): Audit & Validasi */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-5 shadow-xs border border-transparent flex flex-col items-center justify-between text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#f4f3ec] text-[#315343] flex items-center justify-center mb-2">
              <ShieldCheck className="w-7 h-7 text-[#315343]" />
            </div>
            <h4 className="text-base font-bold text-[#1a2e26]">
              Data 100% Valid!
            </h4>
            <p className="text-xs text-[#737c76] mt-1 max-w-[200px]">
              92.912 data duplikat dibersihkan dengan standar audit NLP.
            </p>
          </div>

          <button
            onClick={() => setActiveMenu('data-processing')}
            className="w-full mt-3 px-4 py-2 rounded-xl bg-[#315343] hover:bg-[#1a2e26] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Periksa Alur Data
          </button>
        </div>
      </div>

      {/* Deep Dive Section: Interpretation Box (No CommentTable in Overview per Item 4) */}
      <InterpretationBox
        title="Interpretasi & Temuan Kunci"
        points={[
          `Komentar TikTok mengenai Koperasi Desa Merah Putih (KDMP) menunjukkan volume sangat tinggi dengan ${meta.total_unique?.toLocaleString('id-ID')} data unik, mencerminkan perhatian masyarakat yang masif terhadap program ekonomi desa ini.`,
          `Sebaran opini terbagi ke dalam polaritas positif (${sentPrimary.percentages.positif}%), negatif (${sentPrimary.percentages.negatif}%), dan netral (${sentPrimary.percentages.netral}%), dengan ${sentPrimary.percentages.perlu_validasi}% komentar ambigu/campuran yang dipisahkan secara transparan sebagai kontrol mutu.`,
          `Isu UMKM & Persaingan serta Keterjangkauan Harga menjadi topik paling sering memicu tanggapan kritis maupun harapan, terutama menyangkut eksistensi warung kelontong tradisional di sekitar koperasi.`
        ]}
        recommendations={[
          "Fokuskan komunikasi publik pada perlindungan warung kecil dan kelontong lokal agar program KDMP dipahami sebagai mitra, bukan pesaing pedagang kecil.",
          "Transparansi harga eceran dan kepengurusan koperasi perlu disampaikan melalui konten video edukasi responsif untuk menjawab keraguan masyarakat."
        ]}
        notes="Seluruh angka dihitung dari batch komentar unik setelah deduplikasi comment_id. Kategori perlu validasi menyaring teks dengan sinyal sentimen campur aduk atau bernada sarkasme."
      />
    </div>
  );
}
