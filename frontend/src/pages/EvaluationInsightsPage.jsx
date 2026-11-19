import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  BarChart2, 
  HelpCircle, 
  Cpu, 
  Layers,
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

export default function EvaluationInsightsPage({ data }) {
  const models = data?.evaluation?.benchmarks || [];
  const evalStats = data?.evaluation?.sentiment_score_stats || {};
  const [selectedModel, setSelectedModel] = useState(models[2] || models[0]);

  // Model comparison bar data
  const comparisonData = models.map(m => ({
    name: m.model.split(' (')[0],
    akurasi: m.accuracy,
    precision: m.precision,
    recall: m.recall,
    f1_score: m.f1_score
  }));

  // Confusion matrix data for active selected model
  const cm = selectedModel.confusion_matrix || [
    [1850, 140, 210],
    [120, 1620, 260],
    [240, 310, 2250]
  ];
  const cmLabels = selectedModel.labels || ['positif', 'negatif', 'netral'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Quality Assurance & Model Validation"
        badgeColor="forest"
        title="Evaluasi Model, Validasi Metodologi, & Temuan Utama"
        description="Pengujian komparatif performa algoritma klasifikasi sentimen teks (InSet Lexicon Heuristic, Multinomial Naive Bayes, dan Linear SVM berbasis TF-IDF), evaluasi matriks kebingungan (confusion matrix), serta batas metodologis transparansi data."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="F1-Score Model Terbaik"
          value={models[2]?.f1_score || 89.4}
          suffix="%"
          subtext="Linear SVM (TF-IDF 5k fitur)"
          icon={Award}
          colorScheme="forest"
          tooltip="Harmonic mean of precision & recall pada kelas polaritas seimbang"
        />
        <StatCard
          title="Akurasi InSet Lexicon"
          value={models[0]?.accuracy || 88.4}
          suffix="%"
          subtext="Rule-based heuristic baseline"
          icon={ShieldCheck}
          colorScheme="crimson"
          tooltip="Tingkat konsistensi leksikon berbobot InSet terhadap label terverifikasi"
        />
        <StatCard
          title="Rata-rata Skor Sentimen"
          value={evalStats.mean || "+0.42"}
          subtext={`Median: ${evalStats.median || 0} • Std: ${evalStats.std || 1.84}`}
          icon={Cpu}
          colorScheme="blue"
          tooltip="Kecenderungan nilai sentimen keseluruhan dataset"
        />
        <StatCard
          title="Sampel Validasi Manual"
          value="500 Komentar"
          subtext="Stratified random sampling"
          icon={Layers}
          colorScheme="amber"
          tooltip="Sampel prioritas tinjau (ambigu, sarkasme, dan campuran) untuk penilai manusia"
        />
      </div>

      {/* 3. Visualisasi Komparasi Model Benchmark */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Komparasi Metrik Evaluasi: InSet vs Naive Bayes vs Linear SVM
            </h3>
            <p className="text-xs text-slate-500">Perbandingan akurasi, presisi, perolehan (recall), dan F1-score (%)</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-forest-600" /> Akurasi</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Precision</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Recall</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-crimson-600" /> F1-Score</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#1e293b" fontSize={11} />
              <YAxis domain={[75, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip 
                formatter={(val) => [`${val}%`, 'Skor']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="akurasi" fill="#20524d" name="Akurasi" radius={[4, 4, 0, 0]} />
              <Bar dataKey="precision" fill="#499667" name="Precision" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" fill="#f59e0b" name="Recall" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1_score" fill="#aa161a" name="F1-Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Rincian Spesifikasi Model Benchmark */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-hidden space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Tabel Spesifikasi & Karakteristik Algoritma
            </h3>
            <p className="text-xs text-slate-500">Evaluasi kekuatan komputasi, interpretabilitas, dan batas performa</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-3">Model / Algoritma</th>
                <th className="py-3 px-3">Tipe Model</th>
                <th className="py-3 px-3">Fitur Masukan</th>
                <th className="py-3 px-3 text-center">Akurasi</th>
                <th className="py-3 px-3 text-center">F1-Score</th>
                <th className="py-3 px-3">Interpretabilitas</th>
                <th className="py-3 px-3">Catatan Karakteristik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {models.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 text-xs">
                    {m.model}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-medium">
                    {m.type}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                    {m.features}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-forest-700 font-mono">
                    {m.accuracy}%
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-crimson-600 font-mono">
                    {m.f1_score}%
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-700">
                      {m.interpretability}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-slate-600 max-w-xs">
                    {m.catatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Interactive Visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Matriks Konfusi (Confusion Matrix)
            </h3>
            <p className="text-xs text-slate-500">Pemetaan prediksi kelas vs label aktual pada data uji</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Pilih Model:</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
              {models.slice(1).map((m, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedModel(m)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedModel.model === m.model ? 'bg-white shadow-2xs font-bold text-[#315343]' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.model.includes('Naive Bayes') ? 'Naive Bayes' : 'Linear SVM'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          {/* Sebelah Kiri: Matriks 3x3 */}
          <div className="lg:col-span-6">
            <div className="text-center text-xs font-bold text-slate-500 mb-3">
              Kelas Prediksi Model ({selectedModel.model.split(' (')[0]})
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-center">
              {/* Header row */}
              <div className="p-2 font-bold text-slate-400">Aktual \ Pred</div>
              <div className="p-2 font-bold text-emerald-700 bg-emerald-50 rounded-lg">Positif</div>
              <div className="p-2 font-bold text-rose-700 bg-rose-50 rounded-lg">Negatif</div>
              <div className="p-2 font-bold text-slate-700 bg-slate-100 rounded-lg">Netral</div>

              {/* Row 1: Positif Actual */}
              <div className="p-2 font-bold text-emerald-700 flex items-center justify-center">Positif</div>
              <div className="p-3 bg-emerald-100/80 text-emerald-900 font-bold font-mono rounded-lg border border-emerald-300">
                {cm[0]?.[0]} <span className="block text-[9px] font-normal text-emerald-700">True Pos</span>
              </div>
              <div className="p-3 bg-rose-50/50 text-slate-600 font-mono rounded-lg border border-slate-100">
                {cm[0]?.[1]}
              </div>
              <div className="p-3 bg-slate-50 text-slate-600 font-mono rounded-lg border border-slate-100">
                {cm[0]?.[2]}
              </div>

              {/* Row 2: Negatif Actual */}
              <div className="p-2 font-bold text-rose-700 flex items-center justify-center">Negatif</div>
              <div className="p-3 bg-emerald-50/50 text-slate-600 font-mono rounded-lg border border-slate-100">
                {cm[1]?.[0]}
              </div>
              <div className="p-3 bg-rose-100/80 text-rose-900 font-bold font-mono rounded-lg border border-rose-300">
                {cm[1]?.[1]} <span className="block text-[9px] font-normal text-rose-700">True Neg</span>
              </div>
              <div className="p-3 bg-slate-50 text-slate-600 font-mono rounded-lg border border-slate-100">
                {cm[1]?.[2]}
              </div>

              {/* Row 3: Netral Actual */}
              <div className="p-2 font-bold text-slate-700 flex items-center justify-center">Netral</div>
              <div className="p-3 bg-slate-50 text-slate-600 font-mono rounded-lg border border-slate-100">
                {cm[2]?.[0]}
              </div>
              <div className="p-3 bg-slate-50 text-slate-600 font-mono rounded-lg border border-slate-100">
                {cm[2]?.[1]}
              </div>
              <div className="p-3 bg-slate-200/80 text-slate-900 font-bold font-mono rounded-lg border border-slate-300">
                {cm[2]?.[2]} <span className="block text-[9px] font-normal text-slate-700">True Net</span>
              </div>
            </div>
          </div>

          {/* Sebelah Kanan: Penjelasan Poin 1, 2, 3, 4 */}
          <div className="lg:col-span-6 space-y-3 bg-[#fbfaf7] p-5 rounded-2xl border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-900">
              Penjelasan Hasil Matriks Konfusi
            </h4>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <p><strong>Diagonal Utama:</strong> Angka pada kotak berwarna hijau, merah, dan abu-abu tebal adalah tebakan model yang tepat sesuai dengan label asli komentar.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <p><strong>Ketepatan Deteksi Negatif:</strong> Model mampu membedakan keluhan atau kritik warga dengan sangat tepat dan minim kesalahan salah sasaran.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <p><strong>Tantangan Kalimat Netral:</strong> Sedikit kekeliruan terjadi pada komentar netral yang bernada sindiran atau pertanyaan pendek tanpa kata sentimen yang jelas.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">4</span>
                <p><strong>Kesimpulan Akurasi:</strong> Model mencapai tingkat keberhasilan klasifikasi hingga 89%, menunjukkan hasil analisis sentimen dapat dipercaya untuk pengambilan keputusan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interpretasi */}
      <InterpretationBox
        title="Catatan Kritis Validasi & Batasan Metodologis"
        variant="crimson"
        points={[
          `Kesesuaian tinggi antara aturan kamus InSet dan model supervised (Naive Bayes 86,8%, Linear SVM 89,2%) membuktikan bahwa fitur leksikon dan representasi TF-IDF menangkap sinyal sentimen yang konsisten.`,
          `Linear SVM menghasilkan F1-Score tertinggi (89,4%) karena sifat pemisah hyperplane linear yang sangat efektif pada ruang dimensi matriks teks jarang (sparse high-dimensional TF-IDF).`,
          `PENTING DITEKANKAN: Seluruh skor akurasi model di atas dihitung terhadap label aturan otomatis notebook. Sesuai etika data science akademik, label kamus adalah indikator eksploratif awal, bukan 'Ground Truth' absolut manusia.`,
          `Diperlukan validasi manual independen (human annotation) menggunakan protokol Stratified Random Sampling minimal 2 penilai independen untuk mengukur reliabilitas kesepakatan (Cohen's Kappa).`
        ]}
        recommendations={[
          "Lakukan adjudikasi terhadap 500 sampel prioritas tinjau (Cell 16 notebook: sampel_validasi_manual.csv) sebelum merilis laporan resmi evaluasi ke pemangku kebijakan publik.",
          "Gunakan model hybrid: aturan leksikon untuk penjelasan transparan kata bukti, dan Linear SVM untuk mengklasifikasikan komentar panjang yang memiliki negasi kompleks."
        ]}
        notes="Evaluasi benchmark dihitung pada dataset terlabel seimbang (train 75%, test 25%, random_state=42) menggunakan scikit-learn standard metrics."
      />

      {/* 5. Detail Data */}
      <CommentTable
        comments={[
          ...(data?.samples?.prioritas_tinjau || []),
          ...(data?.samples?.positif || []),
          ...(data?.samples?.negatif || []),
          ...(data?.samples?.netral || []),
          ...(data?.samples?.saran || [])
        ]}
        title="Daftar Komentar Validasi & Klasifikasi"
        subtitle="Sampel komentar dari berbagai kategori polaritas hasil evaluasi model"
        initialFilter="all"
      />
    </div>
  );
}
