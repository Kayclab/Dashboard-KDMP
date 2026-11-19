import React, { useEffect, useState } from 'react';

// true bila lebar layar <= 640px (ponsel); dipakai untuk mengecilkan label sumbu Y
export function useIsNarrow(maxWidth = 640) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches : false);
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [maxWidth]);
  return narrow;
}

// Memecah label panjang menjadi beberapa baris agar tidak saling menimpa / terpotong.
export const wrapLabel = (text, max = 20) => {
  const words = String(text ?? '').split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    const next = (cur + ' ' + w).trim();
    if (next.length > max && cur) { lines.push(cur); cur = w; } else { cur = next; }
  });
  if (cur) lines.push(cur);
  return lines;
};

export default function WrapTick({ x, y, payload, max = 20, fontSize = 12, fill = '#1e293b', lineHeight = 1.15 }) {
  const lines = wrapLabel(payload?.value, max);
  const firstDy = 0.35 - ((lines.length - 1) * lineHeight) / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="end" fill={fill} fontSize={fontSize} fontFamily="Poppins, sans-serif">
        {lines.map((l, i) => (
          <tspan key={i} x={-8} dy={`${i === 0 ? firstDy : lineHeight}em`}>{l}</tspan>
        ))}
      </text>
    </g>
  );
}
