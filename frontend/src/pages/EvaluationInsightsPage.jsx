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
  const setup = data?.evaluation?.setup || {};
  const base = models[0] || {};
  const nb = models[1] || {};
  const svm = models[2] || {};
  const [selectedModel, setSelectedModel] = useState(models[2] || models[0]);

  // Model comparison bar data
  const comparisonData = models.map(m => ({
    name: m.model.split(' (')[0],
    akurasi: m.accuracy,
    precision: m.precision,
    recall: m.recall,
    f1_score: m.f1_score,
    macro_f1: m.macro_f1
  }));

  // Confusion matrix data for active selected model
  const cm = selectedModel.confusion_matrix || [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const rowSum = (r) => (r || []).reduce((a, b) => a + b, 0);
  const recallOf = (i) => (rowSum(cm[i]) ? Math.round((cm[i][i] / rowSum(cm[i])) * 1000) / 10 : 0);
  const cmLabels = selectedModel.labels || ['positif', 'negatif', 'netral'];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Deskripsi */}
      <SectionHeader
        badge="Quality Assurance & Model Validation"
        badgeColor="forest"
        title="Evaluasi Model, Validasi Metodologi, & Temuan Utama"
        description="Perbandingan Multinomial Naive Bayes dan Linear SVM berbasis TF-IDF terhadap baseline mayoritas, lengkap dengan matriks konfusi. Seluruh skor dihitung terhadap label aturan kamus otomatis, bukan label manusia."
      />

      {/* 2. Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Akurasi Linear SVM"
          value={svm.accuracy ?? 0}
          suffix="%"
          subtext="Terhadap label aturan kamus, bukan kebenaran sentimen"
          icon={Award}
          colorScheme="forest"
          tooltip="Seberapa mirip prediksi SVM dengan label yang dibuat aturan kamus pada data uji"
        />
        <StatCard
          title="Baseline Mayoritas"
          value={base.accuracy ?? 0}
          suffix="%"
          subtext={`Selalu menebak ${setup.majority_class ?? '-'} sudah mencapai angka ini; SVM hanya unggul ${((svm.accuracy ?? 0) - (base.accuracy ?? 0)).toFixed(1)} poin`}
          icon={ShieldCheck}
          colorScheme="crimson"
          tooltip="Akurasi model tanpa kemampuan apa pun yang hanya memilih kelas terbanyak"
        />
        <StatCard
          title="Macro F1 Linear SVM"
          value={svm.macro_f1 ?? 0}
          suffix="%"
          subtext={`Naive Bayes ${nb.macro_f1 ?? 0}% | baseline ${base.macro_f1 ?? 0}%`}
          icon={Cpu}
          colorScheme="blue"
          tooltip="Rata-rata F1 ketiga kelas dengan bobot sama; tidak tertipu oleh kelas netral yang dominan"
        />
        <StatCard
          title="Validasi Manual"
          value="Belum"
          subtext="500 sampel prioritas disiapkan di notebook, belum dinilai penilai manusia"
          icon={Layers}
          colorScheme="amber"
          tooltip="Skor di halaman ini belum diuji terhadap label manusia"
        />
      </div>

      {/* 3. Visualisasi Komparasi Model Benchmark */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Komparasi Metrik Evaluasi: Baseline Mayoritas vs Naive Bayes vs Linear SVM
            </h3>
            <p className="text-xs text-slate-500">Akurasi, presisi, recall, dan F1 berbobot kelas (weighted), serta macro F1 (%). Sumbu mulai dari 0.</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-forest-600" /> Akurasi</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Precision</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Recall</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-crimson-600" /> F1 (weighted)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-600" /> Macro F1</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#1e293b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip 
                formatter={(val) => [`${val}%`, 'Skor']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="akurasi" fill="#20524d" name="Akurasi" radius={[4, 4, 0, 0]} />
              <Bar dataKey="precision" fill="#499667" name="Precision" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" fill="#f59e0b" name="Recall" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1_score" fill="#aa161a" name="F1 (weighted)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="macro_f1" fill="#475569" name="Macro F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Rincian Spesifikasi Model Benchmark */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 overflow-hidden space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
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
                <th className="py-3 px-3 text-center">F1 (weighted)</th>
                <th className="py-3 px-3 text-center">Macro F1</th>
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
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700 font-mono">
                    {m.macro_f1}%
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
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
                {cm[0]?.[0]} <span className="block text-[10px] font-normal text-emerald-700">True Pos</span>
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
                {cm[1]?.[1]} <span className="block text-[10px] font-normal text-rose-700">True Neg</span>
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
                {cm[2]?.[2]} <span className="block text-[10px] font-normal text-slate-700">True Net</span>
              </div>
            </div>
          </div>

          {/* Sebelah Kanan: Penjelasan Poin 1, 2, 3, 4 */}
          <div className="lg:col-span-6 space-y-3 bg-[#fbfaf7] p-5 rounded-2xl border border-slate-200/70">
            <h4 className="text-xs font-semibold text-slate-900">
              Penjelasan Hasil Matriks Konfusi
            </h4>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <p><strong>Diagonal Utama:</strong> kotak tebal adalah komentar yang prediksinya sama dengan label aturan kamus.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <p><strong>Recall per kelas ({selectedModel.model.split(' (')[0]}):</strong> positif {recallOf(0)}%, negatif {recallOf(1)}%, netral {recallOf(2)}%.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <p><strong>Kelas netral mendominasi:</strong> {setup.majority_share_test_pct ?? '-'}% data uji berkelas {setup.majority_class ?? '-'}, jadi menebak selalu {setup.majority_class ?? '-'} sudah menghasilkan akurasi {base.accuracy ?? '-'}%.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#edf3ef] text-[#315343] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">4</span>
                <p><strong>Cara membaca skor:</strong> angka ini mengukur kemiripan model dengan aturan kamus yang membuat labelnya, bukan seberapa benar sentimennya. Hasil belum boleh dipakai sebagai dasar keputusan kebijakan tanpa validasi manusia.</p>
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
          `Akurasi Linear SVM ${svm.accuracy ?? '-'}% dan Naive Bayes ${nb.accuracy ?? '-'}% dihitung terhadap label aturan kamus otomatis. Skor ini mengukur seberapa baik model meniru aturan tersebut, bukan ketepatan sentimen yang sebenarnya.`,
          `Data uji sangat timpang: ${setup.majority_share_test_pct ?? '-'}% berkelas ${setup.majority_class ?? '-'}. Baseline yang selalu menebak kelas itu sudah mencapai akurasi ${base.accuracy ?? '-'}% tetapi macro F1 hanya ${base.macro_f1 ?? '-'}%. Karena itu macro F1 (SVM ${svm.macro_f1 ?? '-'}%, Naive Bayes ${nb.macro_f1 ?? '-'}%) lebih informatif daripada akurasi.`,
          `F1 per kelas Naive Bayes: positif ${nb.f1_per_class?.positif ?? '-'}%, negatif ${nb.f1_per_class?.negatif ?? '-'}%, netral ${nb.f1_per_class?.netral ?? '-'}%. Linear SVM: positif ${svm.f1_per_class?.positif ?? '-'}%, negatif ${svm.f1_per_class?.negatif ?? '-'}%, netral ${svm.f1_per_class?.netral ?? '-'}%. Naive Bayes jauh lebih lemah pada kelas positif dan negatif.`,
          `Label dibuat dari kata-kata kamus yang juga menjadi fitur TF-IDF, sehingga SVM mudah meniru aturan itu. Skor tinggi bukan bukti bahwa sistem memahami sentimen, terutama karena sarkasme dan konteks video tidak tertangkap.`,
          `Diperlukan validasi manual independen oleh minimal 2 penilai dengan uji Cohen's Kappa. Sampel prioritas 500 komentar disiapkan di notebook tetapi belum dinilai.`
        ]}
        recommendations={[
          "Nilai sampel validasi manual (sampel_validasi_manual.csv dari notebook) oleh minimal dua penilai, hitung Cohen's Kappa, lalu evaluasi ulang model terhadap label konsensus.",
          "Laporkan macro F1 beserta baseline mayoritas, bukan akurasi saja, dan jangan menyebut skor SVM sebagai akurasi sentimen."
        ]}
        notes={`Evaluasi pada ${(setup.sample_size ?? 0).toLocaleString('id-ID')} komentar berlabel (latih ${(setup.n_train ?? 0).toLocaleString('id-ID')}, uji ${(setup.n_test ?? 0).toLocaleString('id-ID')}, random_state=42); komentar berstatus perlu validasi tidak diikutkan. Sumber label: ${setup.label_source ?? '-'}.`}
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
