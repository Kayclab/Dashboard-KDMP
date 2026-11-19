import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

export default function InterpretationBox({ 
  title = "Interpretasi & Implikasi Strategis", 
  points = [], 
  recommendations = [], 
  notes 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-[28px] bg-white shadow-xs border border-transparent my-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-[#edf3ef] text-[#315343] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1a2e26] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#737c76]">
            Sintesis temuan analitis berdasarkan agregasi data dan kaidah metodologi notebook
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temuan Utama */}
        {points.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#737c76] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#315343]" />
              Temuan Kunci Data
            </h4>
            <div className="space-y-2">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f6f5ef] text-[#1a2e26]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 bg-[#edf3ef] text-[#315343]">
                    {idx + 1}
                  </span>
                  <div className="text-xs md:text-sm text-[#1a2e26] leading-relaxed font-medium">
                    {pt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rekomendasi / Tindak Lanjut */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#737c76] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#315343]" />
              Rekomendasi Kebijakan & Komunikasi
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#edf3ef] text-[#1a2e26]">
                  <CheckCircle2 className="w-4 h-4 text-[#315343] flex-shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-[#1a2e26] leading-relaxed font-medium">
                    {rec}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {notes && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-[#737c76]">
          <AlertCircle className="w-4 h-4 text-[#315343] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#1a2e26] font-semibold">Catatan Metodologis:</strong> {notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
