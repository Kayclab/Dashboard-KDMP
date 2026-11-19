import React from 'react';
import { 
  Smile, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Laugh, 
  AlertCircle, 
  Sparkles,
  BarChart2,
  PieChart as PieIcon
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
import CommentTable from '../components/CommentTable';

export default function EmojiEmotionPage({ data }) {
  const emojiData = data?.emojis || { summary: [] };
  const emotions = data?.emotions || [];
  const totalUnique = data?.metadata?.total_unique || 0;
  const emojiPct = totalUnique ? ((emojiData.total_comments_with_emoji ?? 0) / totalUnique * 100).toFixed(1).replace('.', ',') : '0';
  const topEmoji = (emojiData.summary || []).slice(0, 3);
  const contextualSum = (emojiData.summary || []).filter((e) => e.polaritas === 'kontekstual').reduce((a, e) => a + e.frekuensi, 0);
  const emotionsSorted = [...emotions].sort((a, b) => b.jumlah - a.jumlah);
  const emoFmt = (n) => Number(n || 0).toLocaleString('id-ID');
  const topEmojis = (emojiData.summary || []).slice(0, 15);

  const emojiPolarityData = [
    { name: 'Emoji Positif (👍, ❤️, 👏)', value: emojiData.positive_count ?? 0, color: '#499667' },
    { name: 'Emoji Negatif (👎, 😡, 😠)', value: emojiData.negative_count ?? 0, color: '#aa161a' },
    { name: 'Emoji Kontekstual (😂, 🤣, 😭)', value: (emojiData.total_comments_with_emoji ?? 0) - ((emojiData.positive_count ?? 0) + (emojiData.negative_count ?? 0)), color: '#f59e0b' },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Visual & Emotional Expression"
        badgeColor="crimson"
        title="Analisis Emoji & Spektrum Emosi Masyarakat"
        description="Eksplorasi ekspresi visual berupa simbol emoji Unicode serta 7 spektrum psikologis publik (dukungan, harapan, kekhawatiran, kekecewaan, kemarahan, keraguan, dan humor/sarkasme)."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Komentar Menggunakan Emoji"
          value={emojiData.total_comments_with_emoji ?? 0}
          subtext={`${emojiPct}% dari total komentar unik`}
          icon={Smile}
          colorScheme="forest"
          tooltip="Komentar yang memuat setidaknya 1 simbol emoji Unicode"
        />
        <StatCard
          title="Indikator Emoji Positif"
          value={emojiData.positive_count ?? 0}
          subtext="👍, ❤️, 👏, 😊, 😍, 🙏"
          icon={ThumbsUp}
          colorScheme="forest"
          tooltip="Emoji yang secara umum berbobot apresiatif"
        />
        <StatCard
          title="Indikator Emoji Negatif"
          value={emojiData.negative_count ?? 0}
          subtext="👎, 😡, 😠, 😤, 😞, 😢"
          icon={ThumbsDown}
          colorScheme="crimson"
          tooltip="Emoji penolakan, kemarahan, atau kekecewaan"
        />
        <StatCard
          title="Emoji Kontekstual / Tawa"
          value={contextualSum}
          subtext="Kemunculan dari 30 emoji teratas bertanda kontekstual (😂 🤣 😭 😅); makna perlu dilihat dari konteks"
          icon={Laugh}
          colorScheme="amber"
          tooltip="Emoji tawa yang dapat bermakna humor wajar maupun sindiran sarkastik"
        />
      </div>

      {/* 3. Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top 15 Emoji Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                15 Emoji Paling Sering Digunakan
              </h3>
              <p className="text-xs text-slate-500">Frekuensi kemunculan simbol emoji pada teks komentar</p>
            </div>
            <span className="p-2 rounded-xl bg-crimson-50 text-crimson-600">
              <Smile className="w-4 h-4" />
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEmojis} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="emoji" type="category" stroke="#1e293b" fontSize={16} />
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${val.toLocaleString('id-ID')} kali (${item.payload.polaritas})`, 
                    `Emoji ${item.payload.emoji}`
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="frekuensi" radius={[0, 6, 6, 0]}>
                  {topEmojis.map((entry, index) => {
                    const color = entry.polaritas === 'positif' ? '#499667' : entry.polaritas === 'negatif' ? '#aa161a' : '#f59e0b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-forest-500" /> Positif</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-crimson-600" /> Negatif</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Kontekstual / Humor</span>
          </div>
        </div>

        {/* Donut Kategori Emoji */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Komposisi Kelompok Polaritas Emoji
              </h3>
              <p className="text-xs text-slate-500">Perbandingan ekspresi emosi visual</p>
            </div>
            <span className="p-2 rounded-xl bg-forest-50 text-forest-600">
              <PieIcon className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emojiPolarityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {emojiPolarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val.toLocaleString('id-ID')} kemunculan`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800">
                {topEmojis[0]?.emoji || '👍'}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Paling Populer
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            {emojiPolarityData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {item.value.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7 Spektrum Emosi Publik */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Distribusi 7 Spektrum Emosi Komentar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Kategori psikologis berdasarkan leksikon afektif bahasa Indonesia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {emotions.map((em, idx) => {
            const isPos = em.emosi.includes('dukungan') || em.emosi.includes('harapan');
            const isNeg = em.emosi.includes('khawatir') || em.emosi.includes('kecewa') || em.emosi.includes('marah');
            return (
              <div key={idx} className={`p-3.5 rounded-xl border transition-all ${
                isPos ? 'bg-emerald-50/60 border-emerald-200/70' :
                isNeg ? 'bg-rose-50/60 border-rose-200/70' :
                'bg-amber-50/60 border-amber-200/70'
              }`}>
                <div className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center text-[10px] font-bold mb-1.5">
                  {idx + 1}
                </div>
                <h4 className="text-xs font-semibold text-slate-900 truncate" title={em.label}>
                  {em.label}
                </h4>
                <p className="text-lg font-bold text-slate-800 mt-1 font-mono">
                  {em.jumlah.toLocaleString('id-ID')}
                </p>
                <span className="text-[11px] text-slate-500 font-medium">
                  {em.persen}% data
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Ekspresi Emosional & Karakteristik Komentar"
        variant="forest"
        points={[
          `Tiga emoji paling sering adalah ${topEmoji.map((e) => `${e.emoji} (${emoFmt(e.frekuensi)}, ${e.polaritas})`).join(', ')}. Emoji bertanda kontekstual dapat berarti humor, sindiran, atau kesedihan, sehingga tidak otomatis menunjukkan dukungan atau penolakan.`,
          `Emoji berpolaritas jelas jauh lebih sedikit: ${emoFmt(emojiData.positive_count)} kemunculan emoji positif dan ${emoFmt(emojiData.negative_count)} emoji negatif, dibandingkan ${emoFmt(contextualSum)} kemunculan emoji kontekstual pada 30 emoji teratas.`,
          `Indikator emosi terbanyak menurut kamus: ${emotionsSorted.slice(0, 3).map((e) => `${e.label} (${emoFmt(e.jumlah)})`).join(', ')}. Indikator ini memakai kata kunci sederhana dan belum divalidasi manual.`
        ]}
        recommendations={[
          "Pantau lonjakan emoji negatif (😡, 👎) secara real-time pada video baru untuk mendeteksi krisis komunikasi atau keluhan stok barang sebelum meluas.",
          "Jangan mengklasifikasikan emoji 😂/🤣 secara membabi-buta sebagai positif (senang); gunakan kombinasi konteks kalimat untuk membedakan lelucon ramah dari sarkasme kritis."
        ]}
        notes="Ekstraksi emoji dilakukan langsung dari teks mentah sebelum regex cleaning menggunakan pola Unicode [\\U0001F300-\\U0001FAFF] (Cell 15 notebook)."
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
        title="Sampel Komentar dengan Ekspresi Emosional Kuat"
        subtitle="Contoh komentar yang memuat simbol emoji dan muatan emosi nyata"
      />
    </div>
  );
}
