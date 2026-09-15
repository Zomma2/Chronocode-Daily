import React, { useState } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateTooltip(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    const dayName = DAY_LABELS[d.getUTCDay()];
    const monthName = MONTH_NAMES[d.getUTCMonth()];
    return `${dayName}, ${monthName} ${day}`;
  } catch (e) {
    return dateStr;
  }
}

export default function ActivityCalendar({
  calendar = [],
  activeDaysCount = 0,
  className = '',
}) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Group the days into 7-day columns (weeks)
  const weeks = [];
  if (calendar && calendar.length > 0) {
    let currentWeek = [];
    calendar.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === calendar.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
  }

  const getCellColor = (level, count) => {
    if (count === 0 || level === 0) {
      return 'bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700';
    }
    if (level === 1) {
      return 'bg-emerald-950/70 border-emerald-800/60 hover:border-emerald-600 text-emerald-300';
    }
    if (level === 2) {
      return 'bg-emerald-700/80 border-emerald-600/70 hover:border-emerald-500 text-white';
    }
    // Level 3: completed 4+ questions daily challenge
    return 'bg-emerald-500 border-emerald-400 hover:border-emerald-300 shadow-sm shadow-emerald-500/30 text-white';
  };

  return (
    <div className={`p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-900">
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">
            Quiz Activity (Last 60 Days)
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daily consistency and challenge completion history
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1 rounded-md self-start sm:self-auto">
          <strong>{activeDaysCount}</strong> active day{activeDaysCount === 1 ? '' : 's'}
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[480px]">
          {/* Day Grid: Columns of Weeks */}
          <div className="flex gap-1.5 justify-start">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const isHovered = hoveredDay?.date === day.date;
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 rounded-[3px] border transition-all duration-150 cursor-pointer ${getCellColor(
                        day.level,
                        day.count
                      )} ${isHovered ? 'scale-125 z-10 shadow-lg' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Tooltip info bar */}
        <div className="min-h-[26px] mt-3 flex items-center justify-between text-xs text-zinc-400">
          {hoveredDay ? (
            <div className="flex items-center gap-2 animate-fade-in font-mono">
              <span className="text-zinc-300 font-semibold">
                {formatDateTooltip(hoveredDay.date)}:
              </span>
              <span>
                {hoveredDay.count === 0 ? (
                  <span className="text-zinc-500">No quiz activity</span>
                ) : (
                  <>
                    <strong className="text-white">{hoveredDay.count}</strong> question
                    {hoveredDay.count === 1 ? '' : 's'} (
                    <span className="text-emerald-400">{hoveredDay.accuracy}% accuracy</span>)
                    {hoveredDay.completed && (
                      <span className="ml-1 text-[11px] text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                        Challenge Completed
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          ) : (
            <span className="text-zinc-500 text-[11px]">
              Hover over a square to inspect daily completion & accuracy
            </span>
          )}

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 ml-auto">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800" title="0 questions" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-800/60" title="1-2 questions" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700 border border-emerald-600" title="3 questions" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 border border-emerald-400" title="4+ questions (Completed)" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
