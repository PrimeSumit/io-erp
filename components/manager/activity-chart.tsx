"use client";

import { useState } from "react";

export function ActivityChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 1000;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...data.map((d) => d.count), 5);

  // Calculate Coordinates
  const points = data.map((d, i) => ({
    x: padding + i * (chartWidth / (data.length - 1)),
    y: height - padding - (d.count / maxVal) * chartHeight,
  }));

  // Create Smooth Path (Bézier Curve)
  const renderPath = () => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      d += ` C ${cp1x},${curr.y} ${cp1x},${next.y} ${next.x},${next.y}`;
    }
    return d;
  };

  const curvePath = renderPath();
  const areaPath = `${curvePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className="w-full h-full relative group">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line
            key={v}
            x1={padding}
            y1={padding + v * chartHeight}
            x2={width - padding}
            y2={padding + v * chartHeight}
            stroke="#f1f5f9"
            strokeWidth="2"
          />
        ))}

        {/* Area Fill */}
        <path
          d={areaPath}
          fill="url(#lineGrad)"
          className="transition-all duration-700"
        />

        {/* Main Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 8 : 4}
              fill={hovered === i ? "#8b5cf6" : "#fff"}
              stroke="#8b5cf6"
              strokeWidth="3"
              className="transition-all duration-200 cursor-pointer"
            />
            {hovered === i && (
              <g>
                <rect
                  x={p.x - 20}
                  y={p.y - 45}
                  width="40"
                  height="25"
                  rx="6"
                  fill="#1e293b"
                />
                <text
                  x={p.x}
                  y={p.y - 28}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {data[i].count}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>

      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-[4%]">
        {data.map((d, i) => (
          <span
            key={i}
            className={`text-xs font-bold uppercase ${hovered === i ? "text-primary" : "text-gray-400"}`}
          >
            {d.date}
          </span>
        ))}
      </div>
    </div>
  );
}
