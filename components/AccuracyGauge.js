import React from 'react';

export default function AccuracyGauge({
  correct = 0,
  incorrect = 0,
  size = 140,
  strokeWidth = 10,
  className = '',
}) {
  const total = correct + incorrect;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  const roundedAccuracy = total > 0 ? accuracy.toFixed(1) : '0.0';

  // SVG Geometry
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Length of the correct segment
  const correctStrokeLength = total > 0 ? (correct / total) * circumference : 0;
  const incorrectStrokeLength = total > 0 ? (incorrect / total) * circumference : 0;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-6 ${className}`}>
      {/* SVG Donut Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#27272a"
            strokeWidth={strokeWidth}
          />

          {/* Incorrect Segment (underneath / background fill for attempts) */}
          {total > 0 && incorrect > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Correct Segment */}
          {total > 0 && correct > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${correctStrokeLength} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap={incorrect === 0 ? 'round' : 'butt'}
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
            {total > 0 ? `${roundedAccuracy}%` : '—'}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
            Accuracy
          </span>
        </div>
      </div>

      {/* Legend & Count Details */}
      <div className="flex flex-col gap-2.5 min-w-[140px]">
        <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-zinc-300">Correct</span>
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-400">
            {correct}{' '}
            <span className="text-[10px] text-zinc-500 font-normal">
              ({total > 0 ? Math.round((correct / total) * 100) : 0}%)
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-medium text-zinc-300">Incorrect</span>
          </div>
          <span className="font-mono text-xs font-semibold text-rose-400">
            {incorrect}{' '}
            <span className="text-[10px] text-zinc-500 font-normal">
              ({total > 0 ? Math.round((incorrect / total) * 100) : 0}%)
            </span>
          </span>
        </div>

        <div className="text-[11px] text-zinc-500 text-center font-mono">
          {total} total question{total === 1 ? '' : 's'} attempted
        </div>
      </div>
    </div>
  );
}
