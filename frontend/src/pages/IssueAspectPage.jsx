import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  BarChart2,
  Table
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';
import CommentTable from '../components/CommentTable';

export default function IssueAspectPage({ data }) {
  const aspects = data?.aspects || [];
  const [selectedAspect, setSelectedAspect] = useState(aspects[0]?.aspek || 'UMKM_dan_persaingan');

  // Chart data: stacked sentiment composition per aspect
  const stackedData = aspects.map(a => ({
    aspek: a.label,
    rawKey: a.aspek,
    positif: a.positif,
    negatif: a.negatif,
    netral: a.netral,
    perlu_tinjau: (a.campuran || 0) + (a.perlu_tinjau || 0),
    total: a.jumlah,
    neg_pct: a.jumlah ? Number(((a.negatif / a.jumlah) * 100).toFixed(1)) : 0,
    pos_pct: a.jumlah ? Number(((a.positif / a.jumlah) * 100).toFixed(1)) : 0
  }));

  const activeAspectData = aspects.find(a => a.aspek === selectedAspect) || aspects[0] || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Multi-Label Thematic Analysis"
        badgeColor="crimson"
        title="Analisis 10 Isu & Aspek Kebijakan KDMP"
        description="Pemetaan multi-label terhadap 10 dimensi strategis operasional Koperasi Desa Merah Putih untuk mengidentifikasi isu mana yang paling banyak menuai dukungan publik serta area kritis yang memicu resistensi masyarakat."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Isu Paling Banyak Dibahas"
          value={aspects[0]?.label || "UMKM & Persaingan"}
          subtext={`${aspects[0]?.jumlah?.toLocaleString('id-ID')} komentar (${aspects[0]?.persen}%)`}
          icon={Layers}
          colorScheme="crimson"
          tooltip="Aspek kebijakan dengan volume tanggapan tertinggi"
        />
        <StatCard
          title="Isu Kedua Terpopuler"
          value={aspects[1]?.label || "Harga & Keterjangkauan"}
          subtext={`${aspects[1]?.jumlah?.toLocaleString('id-ID')} komentar (${aspects[1]?.persen}%)`}
          icon={TrendingUp}
          colorScheme="forest"
          tooltip="Aspek perbandingan harga sembako dan stabilitas HET"
        />
        <StatCard
          title="Area Risiko Kritis Tertinggi"
          value="Tata Kelola"
          subtext="Rasio sentimen kritis & ambigu dominan"
          icon={AlertTriangle}
          colorScheme="amber"
          tooltip="Isu seputar transparansi pengurus dan pengawasan anggaran"
        />
        <StatCard
          title="Aspek Sentimen Paling Positif"
          value="Pemberdayaan Desa"
          subtext="Harapan lapangan kerja & ekonomi desa"
          icon={CheckCircle2}
          colorScheme="forest"
          tooltip="Isu manfaat langsung yang paling diapresiasi publik"
        />
      </div>

      {/* 3. Visualisasi Stacked Bar Sentimen per Aspek */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Komposisi Sentimen pada Setiap Aspek Kebijakan
            </h3>
            <p className="text-xs text-slate-500">Perbandingan jumlah komentar positif, negatif, netral, dan perlu validasi</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-forest-500" /> Positif</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-crimson-600" /> Negatif</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-400" /> Netral</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Ambigu</span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="aspek" type="category" stroke="#1e293b" fontSize={11} />
              <Tooltip 
                formatter={(val, name) => [`${val.toLocaleString('id-ID')} komentar`, name.toUpperCase()]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="positif" stackId="a" fill="#499667" name="Positif" />
              <Bar dataKey="negatif" stackId="a" fill="#aa161a" name="Negatif" />
              <Bar dataKey="netral" stackId="a" fill="#94a3b8" name="Netral" />
              <Bar dataKey="perlu_tinjau" stackId="a" fill="#f59e0b" name="Perlu Validasi" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Matriks 10 Aspek & Drilldown Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Tinjauan Cepat 10 Aspek Isu KDMP
          </h3>
          <span className="text-xs text-slate-500">Klik kartu aspek untuk melihat rincian polaritas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {aspects.map((asp, idx) => {
            const isSelected = selectedAspect === asp.aspek;
            return (
              <button
                key={idx}
                onClick={() => setSelectedAspect(asp.aspek)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected 
                    ? 'border-[#315343] bg-[#edf3ef] shadow-xs ring-2 ring-[#315343]/20' 
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>{asp.label}</span>
                  <span className="font-mono">{asp.persen}% data</span>
                </div>
                <p className="text-base font-black text-slate-900 mt-1 font-mono">
                  {asp.jumlah.toLocaleString('id-ID')}
                </p>

                <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[#315343] font-semibold">{asp.positif?.toLocaleString('id-ID')} positif</span>
                  <span className="text-[#aa161a] font-semibold">{asp.negatif?.toLocaleString('id-ID')} negatif</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi & Implikasi Isu Aspek KDMP"
        variant="crimson"
        points={[
          `Aspek 'UMKM & Persaingan' memuncaki daftar perbincangan dengan porsi tertinggi, menunjukkan bahwa persepsi ancaman terhadap warung kelontong merupakan sensitivitas utama publik terhadap model bisnis KDMP.`,
          `Aspek 'Tata Kelola & Transparansi' memiliki proporsi komentar kritis/perlu tinjau yang signifikan; masyarakat secara berulang menyinggung kekhawatiran program hanya menguntungkan elit desa atau berakhir mangkrak seperti program koperasi masa lampau.`,
          `Aspek 'Manfaat & Pemberdayaan' memiliki tingkat sentimen positif tertinggi (mencapai >60%), mengonfirmasi bahwa jika KDMP mampu membuktikan diri sebagai penyerap komoditas dan pembuka lapangan kerja, dukungan publik akan melonjak signifikan.`
        ]}
        recommendations={[
          "Susun perjanjian kerja sama resmi dengan pedagang warung desa setempat untuk menjamin pasokan barang berharga distributor tanpa memangkas pasar mereka.",
          "Laporkan pertanggungjawaban dana koperasi secara terbuka di media sosial sebagai bukti akuntabilitas berkala."
        ]}
        notes="Klasifikasi multi-label dilakukan menggunakan kamus kata kunci 10 aspek (Cell 18 notebook), di mana satu komentar dapat memiliki lebih dari satu label aspek."
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
        title="Contoh Komentar Terkait Aspek Isu"
        subtitle="Eksplorasi tanggapan publik pada berbagai spektrum isu kebijakan"
      />
    </div>
  );
}
