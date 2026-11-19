import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
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

const pct1 = (n) => Number(n || 0).toFixed(1).replace('.', ',');

export default function IssueAspectPage({ data }) {
  const aspects = data?.aspects || [];
  const [selectedAspect, setSelectedAspect] = useState(aspects[0]?.aspek || '');
  const [showAll, setShowAll] = useState(true);
  const narrow = useIsNarrow();

  // Komposisi sentimen per aspek (nilai asli dari data)
  const stackedData = aspects.map((a) => ({
    aspek: a.label,
    rawKey: a.aspek,
    positif: a.positif,
    negatif: a.negatif,
    netral: a.netral,
    belum_terdeteksi: a.belum_terdeteksi || 0,
    perlu_tinjau: (a.campuran || 0) + (a.perlu_tinjau || 0),
    total: a.jumlah
  }));
  const chartRows = showAll ? stackedData : stackedData.slice(0, 5);
  const chartHeight = Math.max(300, chartRows.length * 56 + 70);

  // Isu dengan porsi kritik / dukungan tertinggi (dihitung dari data)
  const share = aspects.map((a) => ({
    ...a,
    negShare: a.jumlah ? (a.negatif / a.jumlah) * 100 : 0,
    posShare: a.jumlah ? (a.positif / a.jumlah) * 100 : 0,
    undetShare: a.jumlah ? ((a.belum_terdeteksi || 0) / a.jumlah) * 100 : 0
  }));
  const topNeg = [...share].sort((x, y) => y.negShare - x.negShare)[0] || {};
  const topNeg2 = [...share].sort((x, y) => y.negShare - x.negShare)[1] || {};
  const topPos = [...share].sort((x, y) => y.posShare - x.posShare)[0] || {};
  const topPos2 = [...share].sort((x, y) => y.posShare - x.posShare)[1] || {};
  const avgUndet = share.length ? share.reduce((s, a) => s + a.undetShare, 0) / share.length : 0;

  const active = share.find((a) => a.aspek === selectedAspect) || share[0] || {};
  const breakdown = [
    { key: 'positif', label: 'Positif', value: active.positif || 0, bar: 'bg-[#499667]', text: 'text-[#20524d]' },
    { key: 'negatif', label: 'Negatif', value: active.negatif || 0, bar: 'bg-[#aa161a]', text: 'text-[#aa161a]' },
    { key: 'netral', label: 'Netral', value: active.netral || 0, bar: 'bg-slate-400', text: 'text-slate-600' },
    { key: 'belum', label: 'Belum terdeteksi', value: active.belum_terdeteksi || 0, bar: 'bg-slate-300', text: 'text-slate-500' },
    { key: 'tinjau', label: 'Campuran / perlu tinjau', value: (active.campuran || 0) + (active.perlu_tinjau || 0), bar: 'bg-amber-500', text: 'text-amber-700' }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <SectionHeader
        title="Analisis 10 Isu & Aspek Kebijakan KDMP"
        description="Pemetaan multi-label terhadap 10 dimensi operasional Koperasi Desa Merah Putih: isu mana yang paling sering dibahas dan di mana kritik atau dukungan paling menonjol. Satu komentar dapat memuat lebih dari satu aspek."
      />

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Isu Paling Banyak Dibahas"
          value={aspects[0]?.label || '-'}
          subtext={`${aspects[0]?.jumlah?.toLocaleString('id-ID') ?? 0} komentar (${aspects[0]?.persen ?? 0}%)`}
          icon={Layers}
        />
        <StatCard
          title="Isu Kedua Terbanyak"
          value={aspects[1]?.label || '-'}
          subtext={`${aspects[1]?.jumlah?.toLocaleString('id-ID') ?? 0} komentar (${aspects[1]?.persen ?? 0}%)`}
          icon={TrendingUp}
        />
        <StatCard
          title="Porsi Negatif Tertinggi"
          value={topNeg.label || '-'}
          subtext={`${pct1(topNeg.negShare)}% dari komentar aspek ini bernada negatif`}
          icon={AlertTriangle}
        />
        <StatCard
          title="Porsi Positif Tertinggi"
          value={topPos.label || '-'}
          subtext={`${pct1(topPos.posShare)}% dari komentar aspek ini bernada positif`}
          icon={CheckCircle2}
        />
      </div>

      {/* Grafik komposisi sentimen per aspek */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Komposisi Sentimen pada Setiap Aspek
            </h3>
            <p className="text-xs text-slate-500">Jumlah komentar per kategori sentimen; aspek diurutkan dari yang paling banyak dibahas</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#499667]" /> Positif</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#aa161a]" /> Negatif</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-400" /> Netral</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-300" /> Belum terdeteksi</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Campuran / perlu tinjau</span>
            {stackedData.length > 5 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="ml-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-[#315343] hover:bg-[#f6f5ef] transition-colors"
              >
                {showAll ? 'Tampilkan 5 teratas' : `Tampilkan semua ${stackedData.length}`}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto -mx-1 px-1">
          <div style={{ height: chartHeight, minWidth: narrow ? 0 : 560 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} layout="vertical" margin={{ top: 4, right: narrow ? 8 : 24, left: 0, bottom: 4 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <YAxis
                  dataKey="aspek"
                  type="category"
                  width={narrow ? 108 : 170}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={<WrapTick max={narrow ? 14 : 22} fontSize={narrow ? 11 : 12} />}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(49,83,67,0.05)' }}
                  formatter={(val, name) => [`${Number(val).toLocaleString('id-ID')} komentar`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar isAnimationActive={false} dataKey="positif" stackId="a" fill="#499667" name="Positif" />
                <Bar isAnimationActive={false} dataKey="negatif" stackId="a" fill="#aa161a" name="Negatif" />
                <Bar isAnimationActive={false} dataKey="netral" stackId="a" fill="#94a3b8" name="Netral" />
                <Bar isAnimationActive={false} dataKey="belum_terdeteksi" stackId="a" fill="#cbd5e1" name="Belum terdeteksi" />
                <Bar isAnimationActive={false} dataKey="perlu_tinjau" stackId="a" fill="#f59e0b" name="Campuran / perlu tinjau" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tinjauan cepat 10 aspek + rincian aspek terpilih */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Tinjauan Cepat {aspects.length} Aspek Isu KDMP
          </h3>
          <span className="text-xs text-slate-500">Klik kartu untuk melihat rincian polaritas</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {aspects.map((asp) => {
            const isSelected = selectedAspect === asp.aspek;
            return (
              <button
                key={asp.aspek}
                onClick={() => setSelectedAspect(asp.aspek)}
                className={`min-w-0 p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-[#315343] bg-[#edf3ef] shadow-xs ring-2 ring-[#315343]/20'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-semibold text-slate-800 leading-snug break-words min-h-[2.2rem]">
                  {asp.label}
                </p>
                <p className="text-base font-semibold text-slate-900 mt-1.5">
                  {asp.jumlah.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-slate-500">{asp.persen}% dari komentar</p>

                <div className="flex items-center justify-between gap-1 text-[10px] mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[#315343] font-medium">{asp.positif?.toLocaleString('id-ID')} pos</span>
                  <span className="text-[#aa161a] font-medium">{asp.negatif?.toLocaleString('id-ID')} neg</span>
                </div>
              </button>
            );
          })}
        </div>

        {active.aspek && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <h4 className="text-sm font-semibold text-slate-900">Rincian: {active.label}</h4>
              <span className="text-xs text-slate-500">{active.jumlah?.toLocaleString('id-ID')} komentar menyebut aspek ini</span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
              {breakdown.map((b) => (
                <div
                  key={b.key}
                  className={b.bar}
                  style={{ width: `${active.jumlah ? (b.value / active.jumlah) * 100 : 0}%` }}
                  title={`${b.label}: ${b.value.toLocaleString('id-ID')}`}
                />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
              {breakdown.map((b) => (
                <div key={b.key} className="min-w-0">
                  <p className="text-[11px] text-slate-500 leading-snug">{b.label}</p>
                  <p className={`text-sm font-semibold ${b.text}`}>{b.value.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-400">{active.jumlah ? pct1((b.value / active.jumlah) * 100) : '0,0'}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <InterpretationBox
        title="Interpretasi Isu & Aspek KDMP"
        variant="crimson"
        points={[
          `${aspects[0]?.label ?? '-'} adalah aspek yang paling sering disebut (${aspects[0]?.jumlah?.toLocaleString('id-ID') ?? 0} komentar, ${aspects[0]?.persen ?? 0}%), diikuti ${aspects[1]?.label ?? '-'} (${aspects[1]?.persen ?? 0}%). Frekuensi menunjukkan topik yang ramai dibicarakan, bukan otomatis topik yang paling bermasalah.`,
          `Porsi komentar negatif tertinggi ada pada ${topNeg.label ?? '-'} (${pct1(topNeg.negShare)}%) dan ${topNeg2.label ?? '-'} (${pct1(topNeg2.negShare)}%).`,
          `Porsi komentar positif tertinggi ada pada ${topPos.label ?? '-'} (${pct1(topPos.posShare)}%) dan ${topPos2.label ?? '-'} (${pct1(topPos2.posShare)}%).`,
          `Rata-rata ${pct1(avgUndet)}% komentar pada tiap aspek belum terdeteksi polaritasnya oleh aturan kamus, sehingga porsi positif dan negatif di atas kemungkinan lebih rendah daripada sentimen sebenarnya.`
        ]}
        recommendations={[
          "Baca contoh komentar pada aspek dengan porsi negatif tertinggi untuk memahami penyebab kritik sebelum menarik kesimpulan.",
          "Validasi manual sampel komentar per aspek agar porsi positif dan negatif dapat dipercaya."
        ]}
        notes="Klasifikasi multi-label memakai kamus kata kunci 10 aspek (notebook v3), sehingga satu komentar dapat masuk ke lebih dari satu aspek dan jumlah antar-aspek tidak boleh dijumlahkan."
      />

      <CommentTable
        comments={[
          ...(data?.samples?.positif || []),
          ...(data?.samples?.negatif || []),
          ...(data?.samples?.netral || []),
          ...(data?.samples?.prioritas_tinjau || []),
          ...(data?.samples?.saran || [])
        ]}
        title="Contoh Komentar Terkait Aspek Isu"
        subtitle="Eksplorasi tanggapan publik pada berbagai spektrum isu kebijakan"
      />
    </div>
  );
}
