import React from 'react';

// Judul utama halaman ada di Header (satu-satunya judul tebal).
// Komponen ini hanya menampilkan subjudul + keterangan singkat.
export default function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 -mb-1.5">
      <div className="min-w-0">
        {title && (
          <h2 className="text-base font-medium text-[#315343] leading-snug">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[13px] font-normal text-[#737c76] mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
