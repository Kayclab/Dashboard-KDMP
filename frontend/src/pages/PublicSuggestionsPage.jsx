import React from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  MessageSquare, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText
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

export default function PublicSuggestionsPage({ data }) {
  const suggestions = data?.suggestions || { themes: [] };
  const themes = (suggestions.themes || []).slice(0, 8);
  const sampleSuggestions = [
    ...(data?.samples?.saran || []),
    ...(data?.samples?.positif || []),
    ...(data?.samples?.negatif || []),
    ...(data?.samples?.netral || [])
  ];

  const suggCueData = [
    { cue: 'perlu / mestinya', jumlah: 4210, desc: 'Tuntutan kebutuhan mendesak' },
    { cue: 'sebaiknya / harusnya', jumlah: 3890, desc: 'Rekomendasi perbaikan sistem' },
    { cue: 'solusinya / saran saya', jumlah: 2450, desc: 'Usulan solusi konkret masyarakat' },
    { cue: 'lebih baik / tolong', jumlah: 1980, desc: 'Permohonan kebijakan adaptif' },
    { cue: 'jangan sampai', jumlah: 1620, desc: 'Peringatan mitigasi risiko' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Citizen Feedback & Aspirations"
        badgeColor="forest"
        title="Saran, Usulan, & Rekomendasi Masyarakat"
        description="Penyaringan otomatis komentar publik yang berpotensi memuat masukan konstruktif, rekomendasi tata kelola, dan peringatan risiko menggunakan 16 pemicu linguistik (suggestion cues) seperti 'harusnya', 'sebaiknya', 'solusinya', dan 'perlu'."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Kandidat Komentar Saran"
          value={suggestions.total_count || 14160}
          suffix={` (${suggestions.percentage || 11.1}%)`}
          subtext="Dari total 127.139 komentar unik"
          icon={Lightbulb}
          colorScheme="forest"
          tooltip="Komentar yang memuat penanda leksikal saran dan rekomendasi"
        />
        <StatCard
          title="Fokus Saran: Warung & UMKM"
          value={themes[0]?.jumlah || 5420}
          subtext="38.3% dari total usulan saran"
          icon={Layers}
          colorScheme="crimson"
          tooltip="Masukan terbanyak berkaitan dengan proteksi pedagang kecil"
        />
        <StatCard
          title="Fokus Saran: Transparansi"
          value={themes[2]?.jumlah || 2890}
          subtext="Pengawasan dana & pengurus"
          icon={CheckCircle2}
          colorScheme="blue"
          tooltip="Usulan mengenai audit terbuka dan laporan keuangan"
        />
        <StatCard
          title="Kepadatan Kata Rata-rata"
          value="18.4 Kata"
          subtext="2.3x lebih panjang dari rata-rata"
          icon={FileText}
          colorScheme="amber"
          tooltip="Komentar berisi saran cenderung berupa argumen panjang dan terperinci"
        />
      </div>

      {/* 3. Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart Tema Saran Berdasarkan Aspek */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Tema Isu dalam Saran Masyarakat
              </h3>
              <p className="text-xs text-slate-500">Distribusi usulan warga menurut aspek kebijakan KDMP</p>
            </div>
            <span className="p-2 rounded-xl bg-forest-50 text-forest-600">
              <Lightbulb className="w-4 h-4" />
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={themes} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="label" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${val.toLocaleString('id-ID')} usulan (${item.payload.persen}%)`, 
                    'Jumlah Saran'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="jumlah" fill="#20524d" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Mayoritas saran terkonsentrasi pada perlindungan pedagang warung & harga kulak.</span>
            <span className="font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">High Value Feedback</span>
          </div>
        </div>

        {/* Pemicu Saran (Suggestion Cues) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Pemicu Leksikal Usulan (Suggestion Cues)
              </h3>
              <p className="text-xs text-slate-500">Kata kunci penanda komentar berbentuk saran</p>
            </div>
            <span className="p-2 rounded-xl bg-crimson-50 text-crimson-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3 my-auto">
            {suggCueData.map((cue, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold font-mono text-slate-900 text-[11px] block">
                    "{cue.cue}"
                  </span>
                  <span className="text-[11px] text-slate-500">{cue.desc}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    {cue.jumlah.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-slate-400">komentar</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
            *Dideteksi menggunakan regex disjungsi 16 pemicu saran terverifikasi (Cell 24 notebook).
          </div>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Aspirasi & Rekomendasi Publik"
        variant="forest"
        points={[
          `Dari 14.160 komentar saran terdeteksi, lebih dari 38% menuntut agar KDMP berperan murni sebagai 'Grosir/Penyuplai Warung Desa' (B2B) dengan harga distributor resmi, bukan menjadi toko retail kelontong yang bersaing langsung memperebutkan pembeli akhir warga sekitar.`,
          `Usulan transparansi tata kelola mengusulkan pembentukan sistem keanggotaan digital koperasi dan pembagian Sisa Hasil Usaha (SHU) yang transparan dan dapat dipantau oleh anggota warga desa secara berkala.`,
          `Masyarakat mengusulkan agar komoditas lokal desa (hasil panen petani lokal) wajib diserap oleh koperasi sebagai etalase penjualan ke luar daerah, sehingga perputaran uang tidak hanya bersifat satu arah konsumtif.`
        ]}
        recommendations={[
          "Rumuskan aturan zonasi operasional atau kuota belanja partai besar khusus bagi pemilik warung yang terdaftar sebagai anggota resmi KDMP.",
          "Publikasikan katalog harga kulak grosir KDMP secara transparan di media sosial agar pemilik warung kelontong mengetahui keuntungan margin laba mereka."
        ]}
        notes="Kandidat saran disaring menggunakan kamus SUGGESTION_CUES. Setiap saran tetap perlu dibaca secara manual untuk membedakan saran serius dari sindiran hipotetis."
      />

      {/* 5. Detail Data */}
      <CommentTable
        comments={sampleSuggestions}
        title="Daftar Komentar Berisi Saran & Usulan Konkret"
        subtitle="Rekomendasi, kritik membangun, dan gagasan solusi langsung dari warga"
        initialFilter="saran"
      />
    </div>
  );
}
