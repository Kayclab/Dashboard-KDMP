import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Video, 
  Binary, 
  Sparkles,
  Layers,
  BarChart2,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';
import CommentTable from '../components/CommentTable';
import WrapTick from '../components/WrapTick';

export default function TopicTrendPage({ data }) {
  const topics = data?.topics || [];
  const bigrams = (data?.vocabulary?.bigrams || []).slice(0, 15);
  const videos = (data?.videos || []).slice(0, 10);
  const heatmap = data?.temporal?.heatmap_day_hour || [];
  const allBigrams = data?.vocabulary?.bigrams || [];
  const hourly = data?.temporal?.hourly || [];
  const peak = hourly.reduce((a, b) => (b.total > (a?.total || 0) ? b : a), null);
  const nextHour = peak ? `${String((parseInt(peak.hour, 10) + 1) % 24).padStart(2, '0')}:00` : '';
  const topicsBySize = [...topics].sort((a, b) => b.jumlah - a.jumlah);
  const entityTopics = topics.filter((t) => /indomaret|alfamart|warung/.test(t.kata_kunci || ''));
  const clusterTotal = topics.reduce((a, t) => a + (t.jumlah || 0), 0);
  const bigramHeight = Math.max(320, bigrams.length * 30 + 60);

  const videoChartData = videos.map(v => ({
    video: `Video ...${v.video_id.slice(-6)}`,
    video_id: v.video_id,
    total: v.total_comments,
    positif: v.positif,
    negatif: v.negatif,
    netral: v.netral,
    pos_pct: v.pos_pct,
    neg_pct: v.neg_pct
  }));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Discovery & Temporal Dynamics"
        badgeColor="forest"
        title="Analisis Topik, Kluster K-Means, & Tren Waktu"
        description="Eksplorasi penemuan topik tanpa supervisi (Unsupervised K-Means Clustering dengan TF-IDF), ekstraksi frasa dua kata (bigram), peta panas waktu unggah (hari × jam), serta perbandingan polaritas antar-video TikTok."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cluster Topik Terbentuk"
          value={`${topics.length} Cluster`}
          subtext="Model K-Means (TF-IDF 10k fitur)"
          icon={Layers}
          colorScheme="forest"
          tooltip="Hasil klusterisasi topik otomatis berbasis kesamaan kosakata komentar"
        />
        <StatCard
          title="Frasa Dua Kata Dominan"
          value={`${allBigrams.length} Bigram`}
          subtext="TF-IDF N-Gram (2,2) min_df=5"
          icon={Binary}
          colorScheme="crimson"
          tooltip="Frasa dua kata yang paling sering muncul berpasangan"
        />
        <StatCard
          title="Video Teratas"
          value={videos[0]?.total_comments ?? 0}
          suffix=" Komentar"
          subtext={`ID: ...${videos[0]?.video_id?.slice(-6) ?? '-'}`}
          icon={Video}
          colorScheme="blue"
          tooltip="Video TikTok dengan volume keterlibatan (engagement) publik terbesar"
        />
        <StatCard
          title="Waktu Aktivitas Puncak"
          value={peak ? `${peak.hour} - ${nextHour}` : '-'}
          subtext={peak ? `${peak.total.toLocaleString('id-ID')} komentar pada jam ini (jam tersibuk)` : ''}
          icon={Clock}
          colorScheme="amber"
          tooltip="Jam dengan frekuensi pengunggahan komentar terpadat"
        />
      </div>

      {/* 3. Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 8 Cluster Topik K-Means */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Distribusi 8 Cluster Topik (K-Means)
              </h3>
              <p className="text-xs text-slate-500">{`Jumlah komentar dan kata kunci tiap cluster, dihitung pada sampel acak ${clusterTotal.toLocaleString('id-ID')} dari ${(data?.metadata?.total_unique ?? 0).toLocaleString('id-ID')} komentar`}</p>
            </div>
            <span className="p-2 rounded-xl bg-forest-50 text-forest-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
            {topics.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-forest-300 transition-all text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-forest-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {t.nama}
                  </span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {t.jumlah.toLocaleString('id-ID')} ({t.persen}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  <strong className="text-slate-800">Kata Kunci:</strong> {t.kata_kunci}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 15 Bigram Teratas */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                15 Frasa Dua Kata (Bigram) Teratas
              </h3>
              <p className="text-xs text-slate-500">Pasangan kata paling konsisten diungkapkan publik</p>
            </div>
            <span className="p-2 rounded-xl bg-crimson-50 text-crimson-600">
              <Binary className="w-4 h-4" />
            </span>
          </div>

          <div className="w-full" style={{ height: bigramHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bigrams} layout="vertical" margin={{ top: 5, right: 24, left: 0, bottom: 5 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="frasa" type="category" width={112} interval={0} tickLine={false} axisLine={false} tick={<WrapTick max={16} fontSize={11} />} />
                <Tooltip 
                  formatter={(val) => [`${val.toLocaleString('id-ID')} kemunculan`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar isAnimationActive={false} dataKey="jumlah" fill="#aa161a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Pola Tematik & Waktu Komentar"
        variant="forest"
        points={[
          `Klaster terbesar (Cluster ${(topicsBySize[0]?.cluster ?? 0) + 1}) memuat ${topicsBySize[0]?.persen ?? 0}% dari sampel ${clusterTotal.toLocaleString('id-ID')} komentar yang dikelompokkan, dengan kata kunci: ${(topicsBySize[0]?.kata_kunci || '').split(', ').slice(0, 7).join(', ')}. Kata kunci yang umum seperti ini menandakan klaster berisi percakapan singkat umum, bukan topik yang spesifik.`,
          `Klaster dengan kata kunci entitas yang jelas lebih kecil: ${entityTopics.map((t) => `Cluster ${t.cluster + 1} (${(t.kata_kunci || '').split(', ').slice(0, 3).join(', ')}) ${t.persen}%`).join('; ') || '-'}.`,
          `Frasa dua kata paling sering: ${bigrams.slice(0, 3).map((b) => `"${b.frasa}" (${b.jumlah.toLocaleString('id-ID')})`).join(', ')}. Jam tersibuk komentar adalah ${peak ? `${peak.hour} - ${nextHour}` : '-'}.`
        ]}
        recommendations={[
          "Sampaikan penjelasan secara berkala bahwa koperasi desa hadir untuk memasok barang murah bagi warung warga, bukan untuk menyaingi usaha kecil.",
          "Gunakan bahasa yang sederhana dan ramah dalam setiap konten video agar masyarakat merasa terayomi dan terinformasi dengan jelas."
        ]}
        notes="Klusterisasi menggunakan KMeans dengan TF-IDF Vectorizer (ngram 1-2, 10.000 max features, random_state=42) pada sampel acak 40.000 komentar (bukan seluruh data), sesuai implementasi notebook."
      />

      {/* 5. Detail Data */}
      <CommentTable
        comments={[
          ...(data?.samples?.positif || []),
          ...(data?.samples?.negatif || []),
          ...(data?.samples?.netral || []),
          ...(data?.samples?.prioritas_tinjau || []),
          ...(data?.samples?.saran || [])
        ]}
        title="Sampel Komentar Berdasarkan Topik"
        subtitle="Eksplorasi tanggapan publik pada berbagai topik perbincangan"
      />
    </div>
  );
}
