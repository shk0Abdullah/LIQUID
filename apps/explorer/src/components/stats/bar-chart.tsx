"use client";

interface BarData {
  label: string;
  values: { key: string; value: number; color: string }[];
}

interface BarChartProps {
  data: BarData[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  if (data.length === 0)
    return <div className="text-muted-foreground text-sm">No data</div>;

  const allValues = data.flatMap((d) => d.values.map((v) => v.value));
  const maxVal = Math.max(...allValues, 1);

  const barWidth = 30;
  const groupWidth = barWidth * 3 + 10;
  const totalWidth = data.length * groupWidth + 40;
  const padding = { top: 10, bottom: 30, left: 40 };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth} ${height + padding.top + padding.bottom}`}
        className="min-w-[400px] w-full"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const y = padding.top + height * (1 - i / 4);
          const val = Math.round(maxVal * (i / 4));
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={totalWidth - 10}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              <text
                x={padding.left - 5}
                y={y + 4}
                textAnchor="end"
                fill="currentColor"
                className="text-[10px]"
                opacity={0.5}
              >
                {val}
              </text>
            </g>
          );
        })}

        {data.map((group, gi) => {
          const groupX = padding.left + gi * groupWidth + 10;
          return (
            <g key={group.label}>
              <text
                x={groupX + (groupWidth - 10) / 2}
                y={height + padding.top + padding.bottom - 5}
                textAnchor="middle"
                fill="currentColor"
                className="text-[10px]"
                opacity={0.6}
              >
                {group.label}
              </text>

              {group.values.map((bar, bi) => {
                const barX = groupX + bi * (barWidth + 2);
                const barH = Math.max(
                  (bar.value / maxVal) * height,
                  bar.value > 0 ? 2 : 0,
                );
                const barY = padding.top + height - barH;
                return (
                  <g key={bar.key}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barH}
                      fill={bar.color}
                      rx={2}
                      opacity={0.8}
                    />
                    {bar.value > 0 && (
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 4}
                        textAnchor="middle"
                        fill={bar.color}
                        className="text-[9px]"
                      >
                        {bar.value}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 mt-2 justify-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block opacity-80" />
          Txs Confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block opacity-80" />
          Forks (x10)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block opacity-80" />
          Blocks
        </span>
      </div>
    </div>
  );
}
