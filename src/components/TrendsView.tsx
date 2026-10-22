import React, { useState, useMemo } from 'react';
import { TwoDRecord } from '../types';
import { computeFourWeekTrends, NumberShiftTrend } from '../utils/trends';
import {
  TrendingUp,
  Flame,
  Snowflake,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TrendsViewProps {
  records: TwoDRecord[];
  onSelectNumberForEntry: (num: string) => void;
}

type FilterMode = 'hot' | 'cold' | 'rising' | 'custom';

export const TrendsView: React.FC<TrendsViewProps> = ({
  records,
  onSelectNumberForEntry,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('hot');
  const [customNumbers, setCustomNumbers] = useState<string[]>(['72', '38', '89', '14', '50']);
  const [hoveredPoint, setHoveredPoint] = useState<{
    number: string;
    weekLabel: string;
    count: number;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const [activeNumber, setActiveNumber] = useState<string | null>(null);

  // Compute 4-week trends
  const trendsData = useMemo(() => computeFourWeekTrends(records), [records]);
  const { weeks, topHotShifts, coldShifts, allTrends, maxWeeklyCount } = trendsData;

  // Determine which numbers to display on the chart
  const displayedTrends: NumberShiftTrend[] = useMemo(() => {
    if (filterMode === 'hot') {
      return topHotShifts.slice(0, 5);
    }
    if (filterMode === 'cold') {
      return coldShifts.slice(0, 5);
    }
    if (filterMode === 'rising') {
      const rising = Object.values(allTrends)
        .filter(t => t.change > 0 && t.total4W >= 2)
        .sort((a, b) => b.change - a.change || b.w1Count - a.w1Count)
        .slice(0, 5);
      return rising.length > 0 ? rising : topHotShifts.slice(0, 5);
    }
    // Custom
    return customNumbers
      .map(num => allTrends[num])
      .filter(Boolean);
  }, [filterMode, topHotShifts, coldShifts, allTrends, customNumbers]);

  // Chart layout calculations
  const chartWidth = 720;
  const chartHeight = 280;
  const padding = { top: 30, right: 40, bottom: 50, left: 50 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  // X coordinate for each week (0 to 3)
  const getX = (weekIdx: number) => {
    return padding.left + (weekIdx / 3) * usableWidth;
  };

  // Y coordinate for frequency count
  const getY = (count: number) => {
    const safeMax = Math.max(3, maxWeeklyCount);
    return padding.top + usableHeight - (count / safeMax) * usableHeight;
  };

  // Y-axis tick values
  const yTicks = useMemo(() => {
    const max = Math.max(3, maxWeeklyCount);
    const step = max > 6 ? 2 : 1;
    const ticks: number[] = [];
    for (let i = 0; i <= max; i += step) {
      ticks.push(i);
    }
    if (!ticks.includes(max)) ticks.push(max);
    return ticks;
  }, [maxWeeklyCount]);

  const toggleCustomNumber = (numStr: string) => {
    setCustomNumbers(prev => {
      if (prev.includes(numStr)) {
        return prev.filter(n => n !== numStr);
      }
      if (prev.length >= 6) {
        // limit to 6 custom numbers for readability
        return [...prev.slice(1), numStr];
      }
      return [...prev, numStr];
    });
  };

  return (
    <article className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 text-white grid place-items-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-800">
              ၄ ပတ်တာ ဂဏန်းအပူချိန်ပြောင်းလဲမှု လိုင်းဇယား (4-Week Shift Trends)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ပြီးခဲ့သော ၄ ပတ် (၂၈ ရက်) အတွင်း Hot & Cold ဂဏန်းများ အပတ်စဉ် မည်သို့အတက်အကျပြောင်းလဲခဲ့သည်ကို မျဉ်းကွေးဖြင့် နှိုင်းယှဉ်လေ့လာနိုင်ပါသည်။
          </p>
        </div>

        <span className="text-[10px] font-extrabold tracking-wider bg-rose-50 text-rose-600 px-3 py-1 rounded-full uppercase border border-rose-100 self-start sm:self-auto flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-rose-500" /> 4-WEEK SHIFT
        </span>
      </div>

      {/* Filter and Mode Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterMode('hot')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'hot'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>အပူဆုံးဂဏန်းများ (Hot)</span>
          </button>

          <button
            onClick={() => setFilterMode('rising')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'rising'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>အရှိန်တက်ဂဏန်းများ (Rising)</span>
          </button>

          <button
            onClick={() => setFilterMode('cold')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'cold'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500" />
            <span>အထွက်နည်းဂဏန်းများ (Cold)</span>
          </button>

          <button
            onClick={() => setFilterMode('custom')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'custom'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>စိတ်ကြိုက်ရွေးချယ်ရန် (Custom)</span>
          </button>
        </div>

        {/* Legend pills for current active lines */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {displayedTrends.map(trend => {
            const isHighlighted = activeNumber === null || activeNumber === trend.number;
            return (
              <button
                key={trend.number}
                onClick={() => setActiveNumber(activeNumber === trend.number ? null : trend.number)}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border transition cursor-pointer text-xs font-mono font-bold ${
                  isHighlighted
                    ? 'bg-white shadow-xs'
                    : 'opacity-40 bg-slate-50 border-slate-200'
                }`}
                style={{ borderColor: trend.color }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: trend.color }}
                />
                <span>{trend.number}</span>
                <span className="text-[10px] text-slate-500 font-sans font-normal">
                  ({trend.total4W}ကြိမ်)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Number Picker (Visible in Custom Mode) */}
      {filterMode === 'custom' && (
        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 animate-in fade-in">
          <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
            <span>နှိုင်းယှဉ်လိုသော ဂဏန်းများကို နှိပ်၍ ရွေးချယ်ပါ (အများဆုံး ၆ လုံး):</span>
            <span className="text-[11px] text-indigo-600 font-mono">
              {customNumbers.length}/6 ရွေးချယ်ပြီး
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {topHotShifts.concat(coldShifts).slice(0, 20).map(t => {
              const isSelected = customNumbers.includes(t.number);
              return (
                <button
                  key={t.number}
                  onClick={() => toggleCustomNumber(t.number)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {t.number} ({t.total4W})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The Line Chart SVG Area */}
      <div className="relative bg-gradient-to-b from-slate-50/60 to-white rounded-2xl border border-slate-200 p-2 md:p-4 overflow-hidden">
        {/* Subtle grid background */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[580px] select-none"
          >
            <defs>
              {displayedTrends.map(trend => (
                <linearGradient
                  key={trend.number}
                  id={`gradient-${trend.number}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={trend.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={trend.color} stopOpacity="0.0" />
                </linearGradient>
              ))}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Y Axis Gridlines and Labels */}
            {yTicks.map(val => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={val === 0 ? undefined : '4 4'}
                    strokeWidth={val === 0 ? '1.5' : '1'}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] font-mono fill-slate-400 font-semibold"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X Axis Week Columns */}
            {weeks.map((week, idx) => {
              const x = getX(idx);
              return (
                <g key={week.label}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="#f1f5f9"
                    strokeWidth="1.5"
                  />
                  {/* Column Header */}
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 18}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-slate-700"
                  >
                    {week.shortLabel}
                  </text>
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 32}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400"
                  >
                    {week.startDate.slice(5)} ~ {week.endDate.slice(5)}
                  </text>
                </g>
              );
            })}

            {/* Render Area and Lines for each displayed number */}
            {displayedTrends.map(trend => {
              const isHighlighted = activeNumber === null || activeNumber === trend.number;
              const opacity = isHighlighted ? 1 : 0.15;
              const strokeWidth = activeNumber === trend.number ? 3.5 : 2.5;

              // Generate coordinate points for W4, W3, W2, W1
              const points = [
                { x: getX(0), y: getY(trend.w4Count), count: trend.w4Count, week: weeks[0].label },
                { x: getX(1), y: getY(trend.w3Count), count: trend.w3Count, week: weeks[1].label },
                { x: getX(2), y: getY(trend.w2Count), count: trend.w2Count, week: weeks[2].label },
                { x: getX(3), y: getY(trend.w1Count), count: trend.w1Count, week: weeks[3].label },
              ];

              // Smooth curve path command
              let pathData = `M ${points[0].x} ${points[0].y}`;
              for (let i = 0; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                const controlX = (current.x + next.x) / 2;
                pathData += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
              }

              // Area fill path
              const areaPath = `${pathData} L ${points[points.length - 1].x} ${getY(0)} L ${points[0].x} ${getY(0)} Z`;

              return (
                <g key={trend.number} style={{ opacity }} className="transition-opacity duration-200">
                  {/* Soft area under active curve */}
                  {activeNumber === trend.number && (
                    <path
                      d={areaPath}
                      fill={`url(#gradient-${trend.number})`}
                      pointerEvents="none"
                    />
                  )}

                  {/* Main Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={trend.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />

                  {/* Data Points on each week */}
                  {points.map((pt, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={pt.x}
                      cy={pt.y}
                      r={activeNumber === trend.number ? 6 : 4.5}
                      fill="#ffffff"
                      stroke={trend.color}
                      strokeWidth={activeNumber === trend.number ? 3 : 2}
                      className="cursor-pointer transition-transform hover:scale-150"
                      onMouseEnter={() => {
                        setHoveredPoint({
                          number: trend.number,
                          weekLabel: pt.week,
                          count: pt.count,
                          x: pt.x,
                          y: pt.y,
                          color: trend.color,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Tooltip when hover over point */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/90 text-white rounded-xl py-1.5 px-3 shadow-xl backdrop-blur-xs text-xs font-mono animate-in fade-in"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${(hoveredPoint.y / chartHeight) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hoveredPoint.color }}
              />
              <span>ဂဏန်း: {hoveredPoint.number}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-sans">
              {hoveredPoint.weekLabel}
            </div>
            <div className="text-sm font-black text-amber-300 mt-0.5">
              {hoveredPoint.count} ကြိမ် ထွက်ခဲ့သည်
            </div>
          </div>
        )}
      </div>

      {/* 4-Week Pattern Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Rising Hot */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>🚀 အရှိန်တက် Hot ဂဏန်းများ</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              Rising
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            ပြီးခဲ့သောပတ်ထက် ယခုလက်ရှိပတ်တွင် ထွက်ရှိမှု အကြိမ်ရေ ပိုမိုမြင့်တက်လာသော ဂဏန်းများ:
          </p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {Object.values(allTrends)
              .filter(t => t.change > 0 && t.total4W >= 2)
              .sort((a, b) => b.change - a.change)
              .slice(0, 4)
              .map(t => (
                <button
                  key={t.number}
                  onClick={() => onSelectNumberForEntry(t.number)}
                  className="py-1 px-2.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1 hover:bg-emerald-50 cursor-pointer shadow-xs"
                >
                  <span>{t.number}</span>
                  <span className="text-[10px] text-emerald-600 font-sans">
                    (+{t.change})
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* 2. Cooling Down */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-800 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4 text-blue-600" />
              <span>❄️ အပူချိန်ကျဆင်း ဂဏန်းများ</span>
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              Cooling
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            အရင်ပတ်များက အထွက်များခဲ့သော်လည်း ယခုလက်ရှိပတ်တွင် အကြိမ်ရေ လျော့ကျသွားသော ဂဏန်းများ:
          </p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {Object.values(allTrends)
              .filter(t => t.change < 0 && t.w2Count >= 2)
              .sort((a, b) => a.change - b.change)
              .slice(0, 4)
              .map(t => (
                <button
                  key={t.number}
                  onClick={() => onSelectNumberForEntry(t.number)}
                  className="py-1 px-2.5 rounded-lg bg-white border border-blue-300 text-blue-800 font-mono font-bold text-xs flex items-center gap-1 hover:bg-blue-50 cursor-pointer shadow-xs"
                >
                  <span>{t.number}</span>
                  <span className="text-[10px] text-blue-600 font-sans">
                    ({t.change})
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* 3. Dormant Cold */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
              <Minus className="w-4 h-4 text-slate-500" />
              <span>💤 ၄ ပတ်လုံး ငြိမ်နေသော ဂဏန်းများ</span>
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              Dormant
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            လွန်ခဲ့သော ၄ ပတ်လုံးတွင် တစ်ကြိမ်မျှ ထွက်ရှိခြင်း မရှိသေးသော အေးခဲဂဏန်းများ:
          </p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {Object.values(allTrends)
              .filter(t => t.total4W === 0)
              .slice(0, 4)
              .map(t => (
                <button
                  key={t.number}
                  onClick={() => onSelectNumberForEntry(t.number)}
                  className="py-1 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-600 font-mono font-bold text-xs hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <span>{t.number}</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    (0)
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* 4-Week Detailed Shifts Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>၄ ပတ်တာ အပတ်စဉ် အသေးစိတ်ပြောင်းလဲမှု ဇယား</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">ဂဏန်း (Number)</th>
                <th className="py-2.5 px-3 text-center">Week 4 ({weeks[0].shortLabel})</th>
                <th className="py-2.5 px-3 text-center">Week 3 ({weeks[1].shortLabel})</th>
                <th className="py-2.5 px-3 text-center">Week 2 ({weeks[2].shortLabel})</th>
                <th className="py-2.5 px-3 text-center bg-indigo-50/60 text-indigo-900 font-extrabold">
                  Week 1 (ယခုပတ်)
                </th>
                <th className="py-2.5 px-3 text-center">၄ ပတ်ပေါင်း</th>
                <th className="py-2.5 px-3 text-center">အပြောင်းအလဲ</th>
                <th className="py-2.5 px-3 text-right">အခြေအနေ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {displayedTrends.map(trend => {
                return (
                  <tr key={trend.number} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: trend.color }}
                        />
                        <span className="text-sm font-black text-slate-800">
                          {trend.number}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {trend.w4Count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {trend.w3Count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {trend.w2Count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-black text-indigo-700 bg-indigo-50/30">
                      {trend.w1Count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-black text-slate-800">
                      {trend.total4W}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {trend.change > 0 ? (
                        <span className="text-emerald-600 font-bold">
                          +{trend.change}
                        </span>
                      ) : trend.change < 0 ? (
                        <span className="text-rose-600 font-bold">
                          {trend.change}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {trend.momentum === 'rising' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" /> အရှိန်တက်
                        </span>
                      ) : trend.momentum === 'cooling' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <ArrowDownRight className="w-3 h-3" /> ကျဆင်း
                        </span>
                      ) : trend.momentum === 'steady_hot' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3" /> ပုံမှန်အပူ
                        </span>
                      ) : trend.momentum === 'spike' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3" /> ရုတ်တရက်
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <Minus className="w-3 h-3" /> အေးခဲ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
};
