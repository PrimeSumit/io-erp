"use client";

import { useState } from "react";

export function ModernDonut({ data, total }: { data: any[]; total: number }) {
  const size = 200;
  const center = size / 2;
  const thickness = 16;
  const radius = (size - thickness) / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  const [hovered, setHovered] = useState<number | null>(null);
  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center group">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((s, i) => {
          if (s.value === 0) return null;
          const percentage = s.value / (total || 1);
          const dash = percentage * circumference;
          const gap = 6; 

          const offset = currentOffset;
          currentOffset -= dash;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={hovered === i ? thickness + 4 : thickness}
              strokeDasharray={`${dash - gap} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="transition-all duration-300 cursor-pointer"
              style={{ opacity: hovered !== null && hovered !== i ? 0.4 : 1 }}
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center animate-in zoom-in duration-300">
        <span className="text-4xl font-black text-slate-800">
          {hovered !== null ? data[hovered].value : total}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {hovered !== null ? data[hovered].label : "Total Active"}
        </span>
      </div>
    </div>
  );
}
