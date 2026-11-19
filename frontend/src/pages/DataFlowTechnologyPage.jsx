import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  FileSpreadsheet, 
  Database, 
  Filter, 
  Binary, 
  Layers, 
  BarChart3, 
  PieChart as PieIcon, 
  Cpu, 
  LayoutDashboard, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Code2, 
  Server, 
  Globe, 
  Users, 
  Activity,
  Zap,
  Box,
  Eye,
  X
} from 'lucide-react';

import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InterpretationBox from '../components/InterpretationBox';

export default function DataFlowTechnologyPage({ data }) {
  const meta = data?.metadata || {};
  const flowSteps = data?.data_flow || [];
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const activeStep = flowSteps[selectedStepIndex] || flowSteps[0] || {};

  // Technology Stack Definitions based strictly on project files
  const techStackGroups = [
    {
      category: "1. Programming Language",
      badge: "Core Language",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      items: [
        { name: "Python 3.12", role: "Bahasa pemrograman utama untuk komputasi data, normalisasi NLP, pemodelan ML, dan ekstraksi analitis.", icon: "🐍", level: "Backend / Processing" },
        { name: "JavaScript (ES6+)", role: "Bahasa interaktif client-side modern untuk visualisasi dinamis, animasi, dan manipulasi DOM.", icon: "⚡", level: "Frontend" }
      ]
    },
    {
      category: "2. Data Processing & Manipulation",
      badge: "Data Wrangling",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      items: [
        { name: "pandas (pd)", role: "Manipulasi DataFrame 220k baris, deduplikasi comment_id, audit missing value, dan grouping agregasi.", icon: "🐼", level: "Data Core" },
        { name: "numpy (np)", role: "Operasi array biner terarah, perhitungan matriks koefisien, dan transformasi numerik vektor.", icon: "🔢", level: "Math Core" },
        { name: "openpyxl", role: "Engine parser file Excel (.xlsx) untuk membaca tabel multikolom tanpa merusak format ID besar.", icon: "📊", level: "I/O Engine" },
        { name: "re (Regular Expressions)", role: "Kompilasi pola regex teks, pembersihan URL/mention, dan ekstraksi karakter Unicode emoji.", icon: "🔍", level: "Text Engine" },
        { name: "collections.Counter", role: "Penghitungan efisien frekuensi kata konten dominan dan distribusi simbol visual emoji.", icon: "🧮", level: "Utility" }
      ]
    },
    {
      category: "3. Text Processing & Normalization",
      badge: "NLP Pipeline",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      items: [
        { name: "Case Folding", role: "Konversi seragam seluruh huruf komentar ke format lowercase untuk menghindari pemisahan token identik.", icon: "🔡", level: "Normalizer" },
        { name: "Regex Data Cleaning", role: "Pembersihan URL, user handle (@user), hashtag (#tag), tanda kurung stiker, dan tanda baca non-alfanumerik.", icon: "🧹", level: "Cleaner" },
        { name: "Character Reduction", role: "Normalisasi huruf berulang berlebihan (>2 menjadi 2 karakter, contoh: 'mantaaaap' -> 'mantaap').", icon: "✂️", level: "Slang Reducer" },
        { name: "Tokenization", role: "Pemecahan kalimat komentar menjadi satuan token kata independen untuk ekstraksi fitur leksikal.", icon: "🧩", level: "Tokenizer" },
        { name: "Stopword Removal", role: "Penyaringan 41 kata hubung umum bahasa Indonesia yang tidak memiliki muatan opini evaluatif.", icon: "🛡️", level: "Filter" }
      ]
    },
    {
      category: "4. Sentiment Analysis Models",
      badge: "Core Classification",
      badgeColor: "bg-crimson-50 text-crimson-700 border-crimson-200",
      items: [
        { name: "InSet Lexicon (Diperluas)", role: "Kamus polaritas kata afektif bahasa Indonesia berbobot heuristik (+1 s.d. +3 dan -1 s.d. -3) + kamus konteks KDMP.", icon: "📖", level: "Lexicon Heuristic" },
        { name: "Negation Handler", role: "Logika pembalik polaritas heuristik untuk memproses kata ingkar (tidak, bukan, jangan, belum, kurang).", icon: "🔄", level: "Logic Rule" },
        { name: "Multinomial Naive Bayes", role: "Model probabilistik klasifikasi teks berbasis teorema Bayes pada frekuensi token unigram & bigram TF-IDF.", icon: "📐", level: "Supervised ML" },
        { name: "Linear SVM (LinearSVC)", role: "Pengklasifikasi margin optimal pemisah hyperplane linear berdimensi tinggi untuk membedakan sentimen.", icon: "⚔️", level: "Supervised ML" }
      ]
    },
    {
      category: "5. Supporting Analysis Models",
      badge: "Multi-Dimension",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      items: [
        { name: "K-Means Clustering", role: "Algoritma tanpa supervisi untuk mengelompokkan 127k komentar ke dalam 8 cluster topik tematik.", icon: "🎯", level: "Unsupervised ML" },
        { name: "TfidfVectorizer", role: "Ekstraksi fitur pembobotan Term Frequency - Inverse Document Frequency (Unigram & Bigram 10.000 max features).", icon: "📈", level: "Feature Engine" },
        { name: "Multi-Label Aspect Tagger", role: "Deteksi disjungsi regex 10 aspek isu strategis KDMP (UMKM, harga, modal, gudang/toko, tata kelola, dll).", icon: "🏷️", level: "Rule-Based" },
        { name: "Affective Emotion Classifier", role: "Pemetaan 7 spektrum psikologis publik (dukungan, harapan, cemas, kecewa, marah, bingung, humor).", icon: "❤️", level: "Linguistic" },
        { name: "Suggestion Cues Parser", role: "Ekstraksi 16 pemicu leksikal saran (sebaiknya, harusnya, solusinya, perlu) untuk menangkap usulan warga.", icon: "💡", level: "Rule-Based" }
      ]
    },
    {
      category: "6. Backend & Processing Engine",
      badge: "Data Engine",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
      items: [
        { name: "Python Processing Pipeline", role: "Script 'process_dataset.py' yang mengeksekusi end-to-end audit, normalisasi, sentimen, dan benchmark ML.", icon: "⚙️", level: "Batch Engine" },
        { name: "Structured JSON Data Layer", role: "Output kompilasi metrik serialisasi terkompresi (~340 KB) untuk konsumsi instan tanpa latensi API.", icon: "📦", level: "Serialization" }
      ]
    },
    {
      category: "7. Frontend Framework & Styling",
      badge: "UI / UX System",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      items: [
        { name: "React 18", role: "Library antarmuka berbasis komponen modular, reactive state management, dan virtual DOM reconciliation.", icon: "⚛️", level: "Frontend Core" },
        { name: "Vite 5", role: "Build tool modern dengan modul HMR super cepat dan kompilator bundling ES modules teroptimasi.", icon: "⚡", level: "Build Tool" },
        { name: "Tailwind CSS 3.4", role: "Utility-first CSS framework dengan kustomisasi palet warna resmi 'Crimson Forest' (#aa161a, #20524d).", icon: "🎨", level: "Design System" },
        { name: "Framer Motion 11", role: "Production-ready motion library untuk transisi halaman halus, animasi sidebar, cards hover, dan SVG flow.", icon: "✨", level: "Animation" },
        { name: "Lucide React", role: "Koleksi ikon SVG presisi dan konsisten untuk navigasi, indikator status, dan badge dashboard.", icon: "🖼️", level: "Iconography" }
      ]
    },
    {
      category: "8. Data Visualization Library",
      badge: "Interactive Charts",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
      items: [
        { name: "Recharts 2.12", role: "Library grafik berbasis SVG responsif untuk Pie/Donut Chart, Area Chart, Bar Chart vertikal/horizontal, dan Tooltips.", icon: "📊", level: "Chart Engine" },
        { name: "Custom SVG Heatmaps", role: "Visualisasi peta panas hari × jam interaktif dengan penskalaan intensitas warna Crimson-Forest adaptif.", icon: "🔥", level: "Custom Chart" }
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Data Pipeline & Architecture"
        badgeColor="forest"
        title="Alur Data & Teknologi (Data Flow & Technology Stack)"
        description="Dokumentasi teknis komprehensif mengenai perjalanan data dari file mentah KDMP.xlsx hingga menjadi 11 modul visualisasi interaktif di dashboard, spesifikasi pustaka perangkat lunak yang digunakan, serta arsitektur sistem menyeluruh."
      />

      {/* 2. Statistik Alur Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Input Data Mentah"
          value={meta.total_raw ?? 0}
          suffix=" Baris"
          subtext="Dataset Excel KDMP.xlsx"
          icon={FileSpreadsheet}
          colorScheme="neutral"
          tooltip="Ukuran input awal sebelum proses pembersihan"
        />
        <StatCard
          title="Hasil Deduplikasi"
          value={meta.total_unique ?? 0}
          suffix=" Unik"
          subtext="92.912 salinan dieliminasi"
          icon={Filter}
          colorScheme="forest"
          tooltip="Dataset bersih unik yang diolah pada seluruh tahapan analitis"
        />
        <StatCard
          title="Jumlah Tahapan Alur Data"
          value="9 Tahap"
          subtext="End-to-End Pipeline Otomatis"
          icon={Workflow}
          colorScheme="crimson"
          tooltip="Alur transformasi dari Data Ingestion hingga Visualisasi Dashboard"
        />
        <StatCard
          title="Waktu Komputasi Pipeline"
          value="~71.3 Detik"
          subtext="Pemrosesan 220k baris di Python"
          icon={Zap}
          colorScheme="amber"
          tooltip="Kecepatan komputasi batch script pada proses lokal"
        />
      </div>

      {/* BAGIAN 1: ALUR DATA INTERAKTIF & ANIMATIF */}
      <div className="bg-white p-5 lg:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl gradient-crimson text-white">
                <Workflow className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                1. Diagram Alur Data Interaktif (End-to-End Data Flow)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Klik setiap tahapan di bawah untuk melihat rincian input, transformasi komputasi, dan output data riil
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest-50 text-forest-700 border border-forest-200">
            Aliran Data Berkesinambungan
          </span>
        </div>

        {/* Interactive Pipeline Horizontal Nodes */}
        <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2">
          <div className="flex items-center min-w-[950px] gap-2">
            {flowSteps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              return (
                <React.Fragment key={step.id || idx}>
                  {/* Step Card Node */}
                  <motion.button
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`relative p-3.5 rounded-2xl border text-left flex-1 min-w-[125px] transition-all ${
                      isSelected
                        ? 'border-crimson-600 bg-crimson-50/70 shadow-hover ring-2 ring-crimson-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-crimson-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                        {step.output_count > 100 ? `${(step.output_count/1000).toFixed(0)}k` : `${step.output_count} item`}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight">
                      {step.name.split(' (')[0]}
                    </h4>

                    <span className="inline-block mt-2 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-full">
                      {step.badge}
                    </span>

                    {/* Active Bottom Pulse */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-crimson-600 rounded-full" />
                    )}
                  </motion.button>

                  {/* Flow Arrow */}
                  {idx < flowSteps.length - 1 && (
                    <div className="flex items-center justify-center text-slate-300 flex-shrink-0">
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ChevronRight className="w-5 h-5 text-crimson-500/70" />
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id || selectedStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 shadow-sm space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl gradient-crimson text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  {activeStep.step_number}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                      {activeStep.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-crimson-50 text-crimson-700 border border-crimson-200">
                      {activeStep.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tahapan ke-{activeStep.step_number} dari 9 alur pemrosesan data analitis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-2xs">
                  Data Masuk: <strong>{activeStep.input_count?.toLocaleString('id-ID')}</strong> → Data Keluar: <strong>{activeStep.output_count?.toLocaleString('id-ID')}</strong>
                </span>
              </div>
            </div>

            {/* Input - Proses - Output Triad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    Input Data
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded">
                    {activeStep.input_count?.toLocaleString('id-ID')} baris
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeStep.input_desc}
                </p>
              </div>

              {/* Process Box */}
              <div className="p-4 rounded-xl bg-crimson-50/40 border border-crimson-200/60 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-crimson-700">
                    Proses & Algoritma
                  </span>
                  <span className="text-xs font-bold text-crimson-700 bg-crimson-100/60 px-2 py-0.5 rounded">
                    Komputasi
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {activeStep.process_desc}
                </p>
              </div>

              {/* Output Box */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/60 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-forest-700">
                    Output Data
                  </span>
                  <span className="text-xs font-mono font-bold text-forest-800 bg-forest-100/60 px-2 py-0.5 rounded">
                    {activeStep.output_count?.toLocaleString('id-ID')} {activeStep.output_count > 11 ? 'baris' : 'modul'}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {activeStep.output_desc}
                </p>
              </div>
            </div>

            {/* Sub-Details Bullet List */}
            {activeStep.details && (
              <div className="p-4 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">
                  Rincian Parameter & Eksekusi Lapangan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                  {activeStep.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BAGIAN 2: TECHNOLOGY STACK */}
      <div className="bg-white p-5 lg:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl gradient-forest text-white">
                <Code2 className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                2. Technology Stack Proyek
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Perangkat lunak, pustaka Python, algoritma ML, dan framework UI yang benar-benar digunakan pada implementasi proyek
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Diverifikasi dari Notebook & Repo
          </span>
        </div>

        {/* Stack Groups Grid as Clean Bullet Points without Emoji */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techStackGroups.map((grp, gIdx) => (
            <div 
              key={gIdx}
              className="p-5 rounded-2xl bg-[#fbfaf7] border border-slate-200/80 space-y-3"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                {grp.category}
              </h4>

              <ul className="space-y-2 text-xs text-slate-700">
                {grp.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#315343] mt-1.5 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-semibold">{item.name}:</strong>{' '}
                      <span className="text-slate-600">{item.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
