import React from 'react';
import { 
  MessageSquare, 
  CornerDownRight, 
  Users, 
  Flame, 
  Sparkles, 
  AlignLeft, 
  TrendingUp,
  BarChart2,
  PieChart as PieIcon
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
  CartesianGrid 
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';

export default function ConversationPage({ data }) {
  const conv = data?.conversations?.stats || {};
  const topParents = data?.conversations?.top_parents || [];

  const conversationPropData = [
    { name: 'Komentar Utama', value: conv.main_comments || 89000, color: '#20524d', pct: conv.main_comments_pct || 70.0 },
    { name: 'Balasan (Replies)', value: conv.reply_comments || 38139, color: '#aa161a', pct: conv.reply_comments_pct || 30.0 },
  ];

  const parentChartData = topParents.slice(0, 10).map((p, i) => ({
    name: `@${p.username} (${p.date?.slice(5, 10)})`,
    full_comment: p.comment,
    replies: p.reply_count,
    sentiment: p.sentiment_primary,
    score: p.sentiment_score
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Engagement & Interaction Dynamics"
        badgeColor="crimson"
        title="Analisis Percakapan: Komentar Utama vs Balasan"
        description="Pemeriksaan mendalam terhadap struktur hirarki percakapan TikTok (Level 1 Komentar Utama vs Level 2 Balasan Bertingkat), pola argumentasi publik, serta identifikasi komentar pemicu perdebatan paling sengit (most debated parent comments)."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Komentar Utama (Level 1)"
          value={conv.main_comments || 89000}
          suffix={` (${conv.main_comments_pct || 70.0}%)`}
          subtext="Inisiator topik opini awal"
          icon={MessageSquare}
          colorScheme="forest"
          tooltip="Komentar yang diunggah langsung ke video (parent_comment_id kosong)"
        />
        <StatCard
          title="Komentar Balasan (Level 2)"
          value={conv.reply_comments || 38139}
          suffix={` (${conv.reply_comments_pct || 30.0}%)`}
          subtext="Tanggapan / sanggahan warga"
          icon={CornerDownRight}
          colorScheme="crimson"
          tooltip="Komentar yang membalas komentar pengguna lain"
        />
        <StatCard
          title="Rata-rata Panjang Balasan"
          value={conv.avg_words_reply || 11.2}
          suffix=" Kata"
          subtext={`vs ${conv.avg_words_main || 8.4} kata (utama)`}
          icon={AlignLeft}
          colorScheme="blue"
          tooltip="Komentar balasan cenderung lebih panjang karena berisi argumen penjelasan"
        />
        <StatCard
          title="Rekor Balasan Tertinggi"
          value={topParents[0]?.reply_count || 342}
          suffix=" Balasan"
          subtext={`Oleh @${topParents[0]?.username || 'user'}`}
          icon={Flame}
          colorScheme="amber"
          tooltip="Jumlah balasan terbanyak yang diterima oleh 1 komentar induk"
        />
      </div>

      {/* 3. Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Proporsi Hirarki Komentar */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Proporsi Utama vs Balasan
              </h3>
              <p className="text-xs text-slate-500">Struktur percakapan interaktif TikTok</p>
            </div>
            <span className="p-2 rounded-xl bg-forest-50 text-forest-600">
              <PieIcon className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conversationPropData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {conversationPropData.map((entry, index) => (
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
              <span className="text-xl font-black text-slate-800">
                {conv.reply_comments_pct || 30.0}%
              </span>
              <span className="text-[10px] font-bold text-crimson-600">
                Balasan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-forest-50/60 border border-forest-100">
              <p className="text-[10px] font-bold text-forest-700">Komentar Utama</p>
              <p className="text-base font-black text-forest-900 mt-0.5">{(conv.main_comments || 89000).toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <p className="text-[10px] font-bold text-rose-700">Balasan Warga</p>
              <p className="text-base font-black text-rose-900 mt-0.5">{(conv.reply_comments || 38139).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* 10 Komentar Induk Paling Banyak Dibalas Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top 10 Komentar Paling Banyak Mendulang Balasan
              </h3>
              <p className="text-xs text-slate-500">Pusat perdebatan warganet pada kolom komentar</p>
            </div>
            <span className="p-2 rounded-xl bg-crimson-50 text-crimson-600">
              <Flame className="w-4 h-4" />
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parentChartData} layout="vertical" margin={{ top: 5, right: 30, left: 75, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#1e293b" fontSize={11} />
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${val} balasan warganet`, 
                    `Sentimen: ${item.payload.sentiment}`
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="replies" fill="#aa161a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Komentar dengan balasan terbanyak rata-rata mengangkat pertanyaan skeptis terkait harga kulak dan nasib warung desa.
          </div>
        </div>
      </div>

      {/* Tabel Komentar Induk Terpopuler & Teks Lengkap */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-hidden space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Teks Komentar Pemicu Diskusi Terbesar
            </h3>
            <p className="text-xs text-slate-500">Komentar induk yang memancing ratusan sanggahan dan dukungan</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            Top Thread Induk
          </span>
        </div>

        <div className="space-y-3">
          {topParents.slice(0, 5).map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">@{p.username}</span>
                  <span className="text-slate-400 text-[11px]">• {p.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-crimson-600 bg-crimson-50 px-2 py-0.5 rounded-full text-[11px] border border-crimson-100">
                    🔥 {p.reply_count} Balasan
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    p.sentiment_primary === 'positif' ? 'bg-emerald-50 text-emerald-700' :
                    p.sentiment_primary === 'negatif' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.sentiment_primary}
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60">
                "{p.comment}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Skor Sentimen: <strong className="font-mono text-slate-700">{p.sentiment_score}</strong></span>
                <span className="font-mono text-[10px] text-slate-400">ID: {p.comment_id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Struktur Interaksi & Dinamika Diskusi"
        variant="crimson"
        points={[
          `Tingkat interaksi balasan mencapai 30,0% (${conv.reply_comments?.toLocaleString('id-ID')} balasan), menandakan bahwa topik KDMP bukan sekadar tontonan pasif, melainkan isu hangat yang memancing perdebatan interaktif dua arah antar-pengguna.`,
          `Rata-rata panjang kata pada balasan (${conv.avg_words_reply} kata) secara konsisten lebih panjang dibanding komentar utama (${conv.avg_words_main} kata). Hal ini membuktikan bahwa warganet terdorong memberikan argumentasi, bukti pengalaman pribadi, dan sanggahan naratif ketika membalas komentar orang lain.`,
          `Sebagian besar 'Thread Induk' terpopuler dipicu oleh komentar keraguan terhadap harga kulak bagi pemilik warung desa, yang kemudian dibalas oleh pendukung program maupun sesama pedagang.`
        ]}
        recommendations={[
          "Fokuskan moderasi dan respons resmi kementerian/pengurus koperasi pada komentar induk terpopuler ini, karena satu thread induk menjangkau ratusan pengguna yang aktif membaca perdebatan.",
          "Manfaatkan thread dengan balasan tinggi sebagai basis riset kualitatif untuk menangkap poin-poin keberatan masyarakat yang paling subtansial."
        ]}
        notes="Struktur percakapan dipetakan menggunakan kolom parent_comment_id dan level pada dataset mentah TikTok (Cell 59 & Cell 63 notebook)."
      />
    </div>
  );
}
