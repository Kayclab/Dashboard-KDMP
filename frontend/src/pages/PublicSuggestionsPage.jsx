import React, { useState } from 'react';
import {
  Lightbulb,
  Layers,
  Sparkles,
  FileText,
  Quote
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';
import CommentTable from '../components/CommentTable';
import WrapTick, { useIsNarrow } from '../components/WrapTick';

const fmt1 = (n) => Number(n || 0).toFixed(1).replace('.', ',');

const sentimentChip = {
  positif: 'bg-[#edf3ef] text-[#20524d]',
  negatif: 'bg-[#fbebee] text-[#aa161a]',
  netral: 'bg-slate-100 text-slate-600',
  perlu_validasi: 'bg-amber-50 text-amber-700'
};

export default function PublicSuggestionsPage({ data }) {
  const meta = data?.metadata || {};
  const suggestions = data?.suggestions || { themes: [], cues: [] };
  const themes = [...(suggestions.themes || [])].sort((a, b) => b.jumlah - a.jumlah);
  const cues = suggestions.cues || [];
  const [showAllCues, setShowAllCues] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(true);
  const narrow = useIsNarrow();

  const themeRows = showAllThemes ? themes : themes.slice(0, 5);
  const themeChartHeight = Math.max(300, themeRows.length * 46 + 60);
  const cueRows = showAllCues ? cues : cues.slice(0, 6);

  const sampleSuggestions = [
    ...(data?.samples?.saran || []),
    ...(data?.samples?.positif || []),
    ...(data?.samples?.negatif || []),
    ...(data?.samples?.netral || [])
  ];

  const ratio = suggestions.avg_words_all ? (suggestions.avg_words_suggestion / suggestions.avg_words_all) : 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      <SectionHeader
        title="Saran, Usulan, & Rekomendasi Masyarakat"
        description="Penyaringan otomatis komentar yang berpotensi memuat masukan, memakai 17 kata pemicu seperti 'harusnya', 'sebaiknya', 'coba', dan 'perlu'. Hasilnya berupa kandidat saran dan tetap perlu dibaca manual."
      />

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Kandidat Komentar Saran"
          value={suggestions.total_count ?? 0}
          subtext={`${suggestions.percentage ?? 0}% dari ${(meta.total_unique ?? 0).toLocaleString('id-ID')} komentar unik`}
          icon={Lightbulb}
        />
        <StatCard
          title="Tema Saran Terbanyak"
          value={themes[0]?.label || '-'}
          subtext={`${(themes[0]?.jumlah ?? 0).toLocaleString('id-ID')} saran (${fmt1(themes[0]?.persen)}% dari kandidat saran)`}
          icon={Layers}
        />
        <StatCard
          title="Pemicu Saran Terbanyak"
          value={cues[0] ? `"${cues[0].cue}"` : '-'}
          subtext={`${(cues[0]?.jumlah ?? 0).toLocaleString('id-ID')} komentar memuat kata ini`}
          icon={Sparkles}
        />
        <StatCard
          title="Rata-rata Panjang Saran"
          value={`${fmt1(suggestions.avg_words_suggestion)} kata`}
          subtext={`vs ${fmt1(suggestions.avg_words_all)} kata pada seluruh komentar (${fmt1(ratio)}x lebih panjang)`}
          icon={FileText}
        />
      </div>

      {/* Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Tema Isu dalam Saran Masyarakat
              </h3>
              <p className="text-xs text-slate-500">Jumlah kandidat saran menurut aspek kebijakan (satu saran dapat masuk lebih dari satu tema)</p>
            </div>
            {themes.length > 5 && (
              <button
                onClick={() => setShowAllThemes((v) => !v)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-[#315343] hover:bg-[#f6f5ef] transition-colors"
              >
                {showAllThemes ? 'Top 5' : `Semua ${themes.length}`}
              </button>
            )}
          </div>

          <div className="overflow-x-auto -mx-1 px-1">
            <div style={{ height: themeChartHeight, minWidth: narrow ? 0 : 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={themeRows} layout="vertical" margin={{ top: 4, right: narrow ? 8 : 24, left: 0, bottom: 4 }} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={narrow ? 108 : 150}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={<WrapTick max={narrow ? 14 : 20} fontSize={narrow ? 11 : 12} />}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(49,83,67,0.05)' }}
                    formatter={(val, name, item) => [`${Number(val).toLocaleString('id-ID')} saran (${item.payload.persen}%)`, 'Jumlah saran']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar isAnimationActive={false} dataKey="jumlah" fill="#20524d" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Pemicu Saran (Suggestion Cues)
              </h3>
              <p className="text-xs text-slate-500">Jumlah komentar yang memuat tiap kata pemicu</p>
            </div>
            {cues.length > 6 && (
              <button
                onClick={() => setShowAllCues((v) => !v)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-[#315343] hover:bg-[#f6f5ef] transition-colors"
              >
                {showAllCues ? 'Top 6' : `Semua ${cues.length}`}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {cueRows.map((cue) => (
              <div key={cue.cue} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-slate-800">"{cue.cue}"</span>
                <span className="text-right flex-shrink-0">
                  <span className="font-semibold text-slate-800">{cue.jumlah.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-slate-400"> komentar</span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
            Satu komentar dapat memuat lebih dari satu pemicu, dan pemicu pendek seperti "saran" juga mencocokkan frasa yang lebih panjang, sehingga angka tidak boleh dijumlahkan.
          </p>
        </div>
      </div>

      {/* Contoh komentar asli per tema */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Contoh Komentar Asli per Tema Saran</h3>
          <span className="text-xs text-slate-500">Dipilih acak dari kandidat saran pada tiap tema; teks tidak diubah</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((t) => (
            <div key={t.aspek} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm min-w-0">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug break-words">{t.label}</h4>
                  <p className="text-xs text-slate-500">{t.jumlah.toLocaleString('id-ID')} kandidat saran ({fmt1(t.persen)}%)</p>
                </div>
                <span className="p-2 rounded-xl bg-[#edf3ef] text-[#315343] flex-shrink-0">
                  <Quote className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {(t.examples || []).map((ex) => (
                  <div key={ex.comment_id} className="p-3 rounded-xl bg-[#f6f5ef]">
                    <p className="text-xs text-[#1a2e26] leading-relaxed break-words">{ex.comment}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                      <span className="truncate">@{ex.username} • {ex.create_time}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${sentimentChip[ex.sentiment_primary] || sentimentChip.netral}`}>
                        {ex.sentiment_primary === 'perlu_validasi' ? 'perlu validasi' : ex.sentiment_primary}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <InterpretationBox
        title="Interpretasi Saran Masyarakat"
        variant="forest"
        points={[
          `Terdeteksi ${(suggestions.total_count ?? 0).toLocaleString('id-ID')} kandidat komentar saran (${suggestions.percentage ?? 0}% dari komentar unik). Angka ini adalah komentar yang memuat kata pemicu, bukan jumlah saran yang sudah terbukti valid.`,
          `Tema dengan kandidat saran terbanyak adalah ${themes[0]?.label ?? '-'} (${(themes[0]?.jumlah ?? 0).toLocaleString('id-ID')}), ${themes[1]?.label ?? '-'} (${(themes[1]?.jumlah ?? 0).toLocaleString('id-ID')}), dan ${themes[2]?.label ?? '-'} (${(themes[2]?.jumlah ?? 0).toLocaleString('id-ID')}).`,
          `Komentar bernada saran rata-rata ${fmt1(suggestions.avg_words_suggestion)} kata, sekitar ${fmt1(ratio)} kali lebih panjang daripada rata-rata seluruh komentar (${fmt1(suggestions.avg_words_all)} kata).`
        ]}
        recommendations={[
          "Baca contoh komentar tiap tema untuk membedakan saran yang serius dari sindiran atau pengandaian, lalu rangkum isinya secara manual.",
          "Validasi sampel kandidat saran oleh penilai manusia sebelum angka ini dipakai dalam laporan."
        ]}
        notes="Kandidat saran disaring dengan kamus 17 kata pemicu (SUGGESTION_CUES, notebook v3). Pencocokan berbasis kata kunci sehingga dapat menangkap komentar yang bukan saran dan melewatkan saran yang ditulis tanpa kata pemicu."
      />

      <CommentTable
        comments={sampleSuggestions}
        title="Daftar Komentar Berisi Saran & Usulan"
        subtitle="Contoh komentar dengan kata pemicu saran, diurutkan dari yang terpanjang"
        initialFilter="saran"
      />
    </div>
  );
}
