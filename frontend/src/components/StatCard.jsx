import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ 
  title, 
  value, 
  subtext, 
  variant = 'default', // 'bars', 'wave', 'icon', 'dark-green', 'default'
  icon: Icon,
  badgeText
}) {
  const [displayValue, setDisplayValue] = useState(0);
  // Hanya tipe number yang dianimasikan. Teks (mis. "21,7 kata" atau "6.588") ditampilkan apa adanya
  // agar format angka Indonesia tidak salah dibaca sebagai desimal.
  const isNumber = typeof value === 'number' && !isNaN(value);
  const numericVal = isNumber ? value : 0;

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const end = numericVal;
    const duration = 800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericVal, isNumber]);

  const formattedDisplay = isNumber 
    ? displayValue.toLocaleString('id-ID') 
    : value;

  // Dark Green Card (Variant 4 from reference)
  if (variant === 'dark-green') {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="relative p-5 rounded-[24px] bg-[#315343] text-white shadow-xs overflow-hidden flex items-center justify-between gap-2"
      >
        <div className="z-10 min-w-0">
          <p className="text-xs font-medium text-white/80">{title}</p>
          <h3 className={`${isNumber ? 'text-2xl' : 'text-base leading-snug break-words'} font-semibold tracking-tight text-white mt-1`}>
            {formattedDisplay}
          </h3>
          {subtext && (
            <p className="text-[11px] text-white/70 mt-1">{subtext}</p>
          )}
        </div>

        {/* Glowing smooth wave sparkline */}
        <div className="w-20 h-10 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
            <path
              d="M 0 35 C 20 10, 40 45, 60 20 C 80 -5, 90 25, 100 15"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </motion.div>
    );
  }

  // Pure White Card (Variants 1, 2, 3)
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-[24px] bg-white shadow-xs border border-transparent hover:shadow-md transition-all flex items-center justify-between gap-2 min-w-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-[#f4f3ec] text-[#315343] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#737c76]">{title}</p>
          <h3 className={`${isNumber ? 'text-2xl' : 'text-base leading-snug break-words'} font-semibold tracking-tight text-[#1a2e26] mt-0.5`}>
            {formattedDisplay}
          </h3>
          {subtext && (
            <p className="text-[11px] text-[#8e9791] mt-0.5">{subtext}</p>
          )}
        </div>
      </div>

      {/* Mini Bar Sparkline (Variant 1) */}
      {variant === 'bars' && (
        <div className="flex items-end gap-1.5 h-8 pl-2 flex-shrink-0">
          <div className="w-1.5 h-3 bg-[#e4e2d7] rounded-full" />
          <div className="w-1.5 h-5 bg-[#315343] rounded-full" />
          <div className="w-1.5 h-7 bg-[#315343] rounded-full" />
          <div className="w-1.5 h-4 bg-[#e4e2d7] rounded-full" />
          <div className="w-1.5 h-6 bg-[#315343] rounded-full" />
        </div>
      )}

      {/* Mini Line Wave Sparkline (Variant 2) */}
      {variant === 'wave' && (
        <div className="w-16 h-8 flex items-center justify-center pl-2 flex-shrink-0">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
            <path
              d="M 0 40 C 25 40, 45 10, 70 30 C 85 45, 95 15, 100 20"
              fill="none"
              stroke="#315343"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
