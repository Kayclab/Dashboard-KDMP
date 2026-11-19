import React from 'react';

export default function SectionHeader({ 
  title, 
  description, 
  action 
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 mb-3">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-[#1a2e26] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[#737c76] mt-0.5 max-w-3xl leading-relaxed">
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
