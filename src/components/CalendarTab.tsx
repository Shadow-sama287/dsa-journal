import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
} from 'lucide-react';
import { Attempt, Difficulty, ProblemWithStats } from '../types/journal';

interface CalendarTabProps {
  allAttempts: Attempt[];
  problemsWithStats: ProblemWithStats[];
  onSelectProblem: (problemId: string) => void;
  onOpenAddModalWithDate: (dateStr: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  allAttempts,
  problemsWithStats,
  onSelectProblem,
  onOpenAddModalWithDate,
}) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Group attempts by date
  const attemptsByDate = useMemo(() => {
    const map = new Map<string, Attempt[]>();
    allAttempts.forEach(att => {
      const list = map.get(att.date) || [];
      list.push(att);
      map.set(att.date, list);
    });
    return map;
  }, [allAttempts]);

  // Heatmap generation: 20 weeks (140 days)
  const heatmapData = useMemo(() => {
    const days: { date: Date; dateStr: string; count: number; dayOfWeek: number }[] = [];
    const end = new Date();
    const dayOfWeek = end.getDay();
    end.setDate(end.getDate() + (6 - dayOfWeek));

    const totalDays = 140;
    const start = new Date(end);
    start.setDate(start.getDate() - totalDays + 1);

    const curr = new Date(start);
    while (curr <= end) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;

      const count = attemptsByDate.get(dStr)?.length || 0;
      days.push({
        date: new Date(curr),
        dateStr: dStr,
        count,
        dayOfWeek: curr.getDay(),
      });
      curr.setDate(curr.getDate() + 1);
    }

    const weeks: { weekIndex: number; monthLabel?: string; days: typeof days }[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      const firstOfMonth = weekDays.find(d => d.date.getDate() <= 7 && d.date.getDay() === 0);
      const monthLabel = firstOfMonth
        ? firstOfMonth.date.toLocaleString('default', { month: 'short' })
        : undefined;

      weeks.push({
        weekIndex: Math.floor(i / 7),
        monthLabel,
        days: weekDays,
      });
    }

    return { weeks, allDays: days };
  }, [attemptsByDate]);

  const selectedAttempts = attemptsByDate.get(selectedDateStr) || [];

  const formatSelectedDateHeader = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getHeatmapColor = (count: number, isSelected: boolean) => {
    let base = '';
    if (count === 0) {
      base = 'bg-zinc-150 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800';
    } else if (count === 1) {
      base = 'bg-emerald-300 dark:bg-emerald-900';
    } else if (count === 2) {
      base = 'bg-emerald-400 dark:bg-emerald-700';
    } else if (count === 3) {
      base = 'bg-emerald-500 dark:bg-emerald-500';
    } else {
      base = 'bg-emerald-600 dark:bg-emerald-400';
    }

    if (isSelected) {
      return `${base} ring-1 ring-zinc-900 dark:ring-white scale-110 z-10`;
    }
    return base;
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Hard':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-3.5 select-none font-sans">
      {/* Header (Top cards removed as requested) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Activity Calendar</span>
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            20-week LeetCode solve heatmap
          </p>
        </div>
        <button
          onClick={() => setSelectedDateStr(todayStr)}
          className={`text-xs px-2.5 py-1 rounded-none border transition ${
            selectedDateStr === todayStr
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold border-zinc-900 dark:border-zinc-100'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          Today
        </button>
      </div>

      {/* GitHub Heatmap Card with sharp 1px borders */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-none p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-mono text-[11px]">Past 20 Weeks</span>
          <span className="text-[10px] font-mono">click square to inspect</span>
        </div>

        {/* Scrollable Heatmap Grid */}
        <div className="overflow-x-auto pb-1 pt-1 -mx-2 px-2 scrollbar-none">
          <div className="min-w-max flex gap-1">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between py-0.5 text-[8px] text-zinc-400 font-mono pr-1 select-none">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Weeks */}
            {heatmapData.weeks.map(week => (
              <div key={week.weekIndex} className="flex flex-col gap-1">
                <span className="text-[8px] font-mono text-zinc-400 h-2.5 text-center">
                  {week.monthLabel || ''}
                </span>

                <div className="flex flex-col gap-1">
                  {week.days.map(day => {
                    const isSelected = day.dateStr === selectedDateStr;
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setSelectedDateStr(day.dateStr)}
                        className={`w-3.5 h-3.5 rounded-none transition-transform cursor-pointer ${getHeatmapColor(
                          day.count,
                          isSelected
                        )}`}
                        title={`${day.dateStr}: ${day.count} solved`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800 font-mono">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-none bg-zinc-150 dark:bg-zinc-850" />
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-300 dark:bg-emerald-900" />
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-400 dark:bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-500 dark:bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-600 dark:bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Selected Day Details Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {formatSelectedDateHeader(selectedDateStr)}
            </h3>
            <p className="text-[11px] text-zinc-500">
              {selectedAttempts.length} {selectedAttempts.length === 1 ? 'question' : 'questions'} logged
            </p>
          </div>

          <button
            onClick={() => onOpenAddModalWithDate(selectedDateStr)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium transition active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Add on date</span>
          </button>
        </div>

        {/* List of Entries on that Day */}
        {selectedAttempts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-none p-5 text-center">
            <p className="text-xs text-zinc-400">No questions recorded on this date.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedAttempts.map(attempt => {
              const problemStat = problemsWithStats.find(p => p.problem.id === attempt.problemId);
              const problemTitle = problemStat?.problem.title || 'Unknown Problem';

              return (
                <div
                  key={attempt.id}
                  onClick={() => onSelectProblem(attempt.problemId)}
                  className="bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-none p-3 space-y-2 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                        {problemTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 flex-wrap">
                        <span className={getDifficultyColor(attempt.feltDifficulty)}>
                          {attempt.feltDifficulty}
                        </span>
                        {problemStat && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{problemStat.repetitionCount}x total</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 pt-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div
                          key={star}
                          className={`w-1.5 h-1.5 rounded-none ${
                            star <= attempt.confidence
                              ? 'bg-amber-500'
                              : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {attempt.timeTakenMinutes && (
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{attempt.timeTakenMinutes} minutes</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
