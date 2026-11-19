import React, { useState } from 'react';
import { 
  Binary, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Smile, 
  Hash, 
  Layers,
  Scissors
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

export default function DataProcessingPage({ data }) {
  const meta = data?.metadata || {};
  const topWords = (data?.vocabulary?.top_words || []).slice(0, 15);
  const [activeStep, setActiveStep] = useState(0);

  // Preprocessing stages
  const pipelineSteps = [
    {
      title: "1. Pembersihan Teks Mentah (Regex)",
      desc: "Menghapus tautan URL, mention pengguna (@user), format hashtag (#kdmp), dan format stiker [Sticker].",
      example_before: "Keren bgt program @koperasi_kdmp https://tiktok.com #majudesa [Sticker]",
      example_after: "Keren bgt program koperasi kdmp majudesa"
    },
    {
      title: "2. Reduksi Huruf Berulang",
      desc: "Menormalkan penekanan huruf berlebih (>2 huruf berturut-turut dikurangi menjadi maksimal 2 huruf).",
      example_before: "Mantaaaaaapppppp bgtttttttttt wkwkwk",
      example_after: "Mantaapp bgtt wkwk"
    },
    {
      title: "3. Case Folding & Tanda Baca",
      desc: "Mengubah seluruh teks ke huruf kecil (lowercase) dan menghapus karakter non-alfanumerik, kecuali spasi.",
      example_before: "Koperasi Ini Sangat Membantu Warga Desa?!",
      example_after: "koperasi ini sangat membantu warga desa"
    },
    {
      title: "4. Ekstraksi Emoji Terpisah",
      desc: "Menangkap simbol emoji Unicode sebelum teks dibersihkan agar bobot visual tidak hilang saat regex.",
      example_before: "Bagus sekali program ini 👍❤️🇮🇩",
      example_after: "Teks: 'bagus sekali program ini' | Emoji: ['👍', '❤️']"
    },
    {
      title: "5. Tokenisasi & Stopword Filtering",
      desc: "Memecah teks menjadi token kata dan mengeliminasi 41 kata hubung non-esensial (yang, dan, di, dari, dll).",
      example_before: "dan ini yang sangat bagus untuk para pedagang",
      example_after: "['sangat', 'bagus', 'pedagang']"
    }
  ];

  // Transformation table examples
  const sampleTransforms = [
    {
      raw: "Semoga berkah dan sukses selalu untuk KDMP!! 👍🤲",
      norm: "semoga berkah dan sukses selalu untuk kdmp",
      tokens: "semoga, berkah, sukses, selalu, kdmp",
      emoji: "👍 🤲"
    },
    {
      raw: "Hati2 jgn sampai mematikan warung2 kecil di desa pak @menterikoperasi",
      norm: "hati jgn sampai mematikan warung kecil di desa pak",
      tokens: "hati, jgn, sampai, mematikan, warung, kecil, desa",
      emoji: "-"
    },
    {
      raw: "Apakah harga sembako disana beneran lebih murah dibanding pasar???",
      norm: "apakah harga sembako disana beneran lebih murah dibanding pasar",
      tokens: "harga, sembako, disana, beneran, lebih, murah, dibanding, pasar",
      emoji: "-"
    },
    {
      raw: "wkwkwk lawak kali ini, palingan mangkrak lg kaya program yg dulu 🤣🤣",
      norm: "wkwk lawak kali ini palingan mangkrak lg kaya program yg dulu",
      tokens: "wkwk, lawak, kali, palingan, mangkrak, kaya, program, dulu",
      emoji: "🤣 🤣"
    }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Text Normalization"
        badgeColor="crimson"
        title="Alur Pemrosesan Teks (NLP Preprocessing)"
        description="Transformasi sistematis komentar bahasa Indonesia ragam media sosial (slang, typo, singkatan, emoji) menjadi format token bersih yang siap diproses oleh modul sentimen dan algoritma machine learning."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dokumen Diproses"
          value={meta.total_unique ?? 0}
          subtext="Komentar unik teks lengkap"
          icon={FileText}
          colorScheme="crimson"
        />
        <StatCard
          title="Kosakata Teratas Ditampilkan"
          value={`${data?.vocabulary?.top_words?.length ?? 0} Kata`}
          subtext="Kata konten paling sering setelah stopword filter"
          icon={Binary}
          colorScheme="forest"
        />
        <StatCard
          title="Stopwords Kontekstual"
          value={`${(data?.data_flow?.[3]?.details || []).map((d) => (d.match(/(\d+) stopword/) || [])[1]).find(Boolean) ?? '-'} Kata`}
          subtext="Daftar stopword ringan (tanpa stemming)"
          icon={Filter}
          colorScheme="neutral"
        />
        <StatCard
          title="Komentar Berisi Emoji"
          value={(data?.emojis?.total_comments_with_emoji ?? 0).toLocaleString('id-ID')}
          subtext="Emoji dihitung dari teks asli sebelum dibersihkan"
          icon={Smile}
          colorScheme="blue"
        />
      </div>

      {/* 3. Visualisasi Alur Preprocessing */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Tahapan Alur Preprocessing Teks
            </h3>
            <p className="text-xs text-slate-500">Klik setiap tahapan untuk melihat rincian proses dan transformasi kata</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-crimson-50 text-crimson-700 rounded-lg">
            5 Tahap Otomatis
          </span>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                activeStep === idx
                  ? 'border-crimson-600 bg-crimson-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <span className={`text-[10px] font-bold block mb-1 ${
                activeStep === idx ? 'text-crimson-600' : 'text-slate-400'
              }`}>
                Langkah {idx + 1}
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                {s.title.split('. ')[1]}
              </p>
            </button>
          ))}
        </div>

        {/* Step Detail Box */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg gradient-crimson text-white flex items-center justify-center text-xs font-bold">
                {activeStep + 1}
              </span>
              {pipelineSteps[activeStep].title}
            </h4>
            <span className="text-xs text-slate-500">Fungsi Regex & Normalisasi</span>
          </div>

          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {pipelineSteps[activeStep].desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-rose-600 block mb-1">
                Sebelum (Input Mentah)
              </span>
              <p className="font-mono text-slate-700 bg-slate-50 p-2 rounded-lg text-[11px]">
                {pipelineSteps[activeStep].example_before}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-emerald-600 block mb-1">
                Sesudah (Output Normal)
              </span>
              <p className="font-mono text-slate-700 bg-emerald-50/50 p-2 rounded-lg text-[11px]">
                {pipelineSteps[activeStep].example_after}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kosakata Dominan Pasca Normalisasi */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              15 Kosakata Konten Paling Dominan
            </h3>
            <p className="text-xs text-slate-500">Frekuensi kata bersih setelah eliminasi stopwords dan angka</p>
          </div>
          <span className="p-2 rounded-xl bg-forest-50 text-forest-600">
            <Binary className="w-4 h-4" />
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topWords} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="kata" type="category" stroke="#64748b" fontSize={11} />
              <Tooltip 
                formatter={(val) => [`${val.toLocaleString('id-ID')} kemunculan`, 'Frekuensi']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="frekuensi" fill="#20524d" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Contoh Transformasi Teks */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Contoh Transformasi Teks Real
            </h3>
            <p className="text-xs text-slate-500">Perbandingan riil komentar TikTok dari input mentah ke token siap analitis</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4 -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-3 w-1/3">Komentar Asli (Raw)</th>
                <th className="py-3 px-3 w-1/4">Teks Normal (text_norm)</th>
                <th className="py-3 px-3 w-1/4">Token Konten</th>
                <th className="py-3 px-3 text-center">Emoji Terdeteksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sampleTransforms.map((tr, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-medium text-slate-800">
                    "{tr.raw}"
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 bg-slate-50/50">
                    {tr.norm}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-forest-700">
                    [{tr.tokens}]
                  </td>
                  <td className="py-3.5 px-3 text-center text-sm">
                    {tr.emoji}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Interpretasi Efektivitas Preprocessing"
        variant="crimson"
        points={[
          `${(data?.emojis?.total_comments_with_emoji ?? 0).toLocaleString('id-ID')} komentar (${meta.total_unique ? ((data?.emojis?.total_comments_with_emoji ?? 0) / meta.total_unique * 100).toFixed(1).replace('.', ',') : 0}%) memuat emoji. Emoji dihitung dari teks asli sebelum pembersihan regex menghapus simbol, sehingga tetap bisa dipakai sebagai penanda.`,
          `Skor kamus memberi bobot pada emoji berpolaritas jelas (👍 ❤️ 👏 positif; 👎 😡 😠 negatif), sedangkan emoji seperti 😂 🤣 😭 diperlakukan kontekstual dan tidak ikut menentukan label.`,
          `Kata konten paling sering setelah stopword removal adalah ${topWords.slice(0, 3).map((w) => `"${w.kata}" (${w.frekuensi.toLocaleString('id-ID')})`).join(', ')}. Daftar stopword yang ringan membuat kata umum percakapan masih mendominasi; "warung" muncul ${(topWords.find((w) => w.kata === 'warung')?.frekuensi ?? 0).toLocaleString('id-ID')} kali.`
        ]}
        recommendations={[
          "Gunakan normalisasi regex bertahap agar tidak merusak token khusus seperti nama produk atau istilah daerah.",
          "Jaga daftar stopword agar tetap selektif dan tidak membuang kata kunci pengubah makna (misalnya: tidak, jangan, belum)."
        ]}
        notes="Fungsi normalize() diimplementasikan pada Cell 8 notebook menggunakan regex compile Python standar."
      />
    </div>
  );
}
