import React, { useState, useMemo } from 'react';
import { AnalysisSummary, computeAnalysis } from '../utils/analysis';
import { TwoDRecord, DrawTime } from '../types';
import { padZero } from '../utils/storage';
import {
  Flame,
  Snowflake,
  Clock,
  Search,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Target,
  Calendar,
  Filter,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';

interface DashboardViewProps {
  summary: AnalysisSummary;
  records: TwoDRecord[];
  onNavigateTab: (tab: any) => void;
  onSelectNumberForDetail: (num: string) => void;
}

type DatePreset = 'all' | 'today' | 'this_week' | 'last_week' | 'this_month' | 'last_30_days';

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary: defaultSummary,
  records,
  onNavigateTab,
  onSelectNumberForDetail,
}) => {
  const [searchNum, setSearchNum] = useState<string>('');
  const [activePreset, setActivePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [tablePage, setTablePage] = useState<number>(1);
  const tablePageSize = 6;

  // Compute reference latest date from records or current date
  const latestDateStr = useMemo(() => {
    if (records.length === 0) return new Date().toISOString().slice(0, 10);
    const sorted = records.map(r => r.date).sort();
    return sorted[sorted.length - 1];
  }, [records]);

  // Apply Date Presets
  const handleApplyPreset = (preset: DatePreset) => {
    setActivePreset(preset);
    setTablePage(1);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const refD = new Date(latestDateStr + 'T00:00:00');
    const fmt = (d: Date) => `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;

    if (preset === 'today') {
      setStartDate(latestDateStr);
      setEndDate(latestDateStr);
    } else if (preset === 'this_week') {
      // Last 7 days leading up to refDate
      const start = new Date(refD);
      start.setDate(start.getDate() - 6);
      setStartDate(fmt(start));
      setEndDate(latestDateStr);
    } else if (preset === 'last_week') {
      // Days 7 to 13
      const end = new Date(refD);
      end.setDate(end.getDate() - 7);
      const start = new Date(refD);
      start.setDate(start.getDate() - 13);
      setStartDate(fmt(start));
      setEndDate(fmt(end));
    } else if (preset === 'this_month') {
      // 1st of current month to end of current month
      const y = refD.getFullYear();
      const m = refD.getMonth() + 1;
      const start = `${y}-${padZero(m)}-01`;
      const end = `${y}-${padZero(m)}-${padZero(new Date(y, m, 0).getDate())}`;
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last_30_days') {
      const start = new Date(refD);
      start.setDate(start.getDate() - 29);
      setStartDate(fmt(start));
      setEndDate(latestDateStr);
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setActivePreset('all');
    setTablePage(1);
  };

  // Filter records based on selected date range
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });
  }, [records, startDate, endDate]);

  // Dynamically compute summary for the chosen date range
  const isFiltered = Boolean(startDate || endDate);
  const activeSummary = useMemo(() => {
    if (!isFiltered) return defaultSummary;
    return computeAnalysis(filteredRecords);
  }, [isFiltered, defaultSummary, filteredRecords]);

  // Paginated recent records in range (sorted descending by date and time)
  const sortedRangeRecords = useMemo(() => {
    const timesOrder: DrawTime[] = ['11:00 AM', '12:01 PM', '3:00 PM', '4:30 PM'];
    return [...filteredRecords].sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      if (d !== 0) return d;
      return timesOrder.indexOf(b.time) - timesOrder.indexOf(a.time);
    });
  }, [filteredRecords]);

  const totalTablePages = Math.ceil(sortedRangeRecords.length / tablePageSize) || 1;
  const paginatedRangeRecords = sortedRangeRecords.slice(
    (tablePage - 1) * tablePageSize,
    tablePage * tablePageSize
  );

  const slotIcons: Record<DrawTime, string> = {
    '11:00 AM': '☀️',
    '12:01 PM': '🌤️',
    '3:00 PM': '🌇',
    '4:30 PM': '🌙',
  };

  // Search details calculation
  const searchResults = searchNum.length === 2 ? {
    found: filteredRecords.filter(r => r.number === searchNum),
    count: activeSummary.frequency[Number(searchNum)] || 0,
    isEven: Number(searchNum) % 2 === 0,
    isLow: Number(searchNum) < 50,
  } : null;

  return (
    <div className="space-y-4">
      {/* Date Range Filter Bar */}
      <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-extrabold text-slate-800">
                ရက်စွဲကာလ ရွေးချယ်စစ်ထုတ်ရန် (Date Range Filter)
              </h2>
              <p className="text-xs text-slate-500">
                သတ်မှတ် ရက်သတ္တပတ် သို့မဟုတ် လအလိုက် သီးသန့် အချက်အလက်များကို ခွဲခြမ်းစိတ်ဖြာနိုင်ပါသည်။
              </p>
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={() => handleApplyPreset('all')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>မူလအတိုင်း အားလုံးပြရန်</span>
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>ကာလ:</span>
          </span>

          <button
            onClick={() => handleApplyPreset('all')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePreset === 'all' && !startDate && !endDate
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            အားလုံး (All Time)
          </button>

          <button
            onClick={() => handleApplyPreset('today')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePreset === 'today'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ယနေ့ (Today)
          </button>

          <button
            onClick={() => handleApplyPreset('this_week')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePreset === 'this_week'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ယခုအပတ် (၇ ရက်)
          </button>

          <button
            onClick={() => handleApplyPreset('last_week')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePreset === 'last_week'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ပြီးခဲ့သောပတ်
          </button>

          <button
            onClick={() => handleApplyPreset('this_month')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePreset === 'this_month'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ယခုလ (October)
          </button>

          <button
            onClick={() => handleApplyPreset('last_30_days')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePreset === 'last_30_days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ရက် ၃၀ (30 Days)
          </button>
        </div>

        {/* Custom Start / End Date Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                စတင်ရက် (Start Date)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50/70 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <span className="text-slate-400 font-bold self-end mb-2.5">~</span>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                ကုန်ဆုံးရက် (End Date)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50/70 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Active Range Information Pill */}
          <div className="w-full sm:w-auto p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between sm:justify-start gap-2.5 text-xs text-indigo-900">
            <span className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>စစ်ထုတ်ထားမှု:</span>
            </span>
            <span className="font-mono font-black text-indigo-700">
              {filteredRecords.length} ကြိမ်
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({isFiltered ? `${startDate || 'အစ'} မှ ${endDate || 'ယနေ့'}` : 'မှတ်တမ်းအားလုံး'})
            </span>
          </div>
        </div>
      </article>

      {/* 2-Column Grid: Latest Slots & Hot/Cold Cards (Filtered dynamically) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest Slots Card */}
        <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span>🌟</span>
              <span>နောက်ဆုံးရလဒ်များ {isFiltered && <span className="text-xs font-normal text-indigo-600 font-sans">(ရွေးချယ်ထားသောကာလ)</span>}</span>
            </h2>
            <span className="text-[10px] font-extrabold tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase border border-blue-100">
              {isFiltered ? 'FILTERED SLOTS' : 'LATEST SLOTS'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {activeSummary.latestSlots.map((slot) => {
              const rec = slot.record;
              return (
                <div
                  key={slot.time}
                  className="p-3.5 rounded-xl border border-blue-100/80 bg-gradient-to-br from-blue-50/50 to-white hover:border-blue-300 transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span>{slotIcons[slot.time]}</span>
                      <span>{slot.time}</span>
                    </span>
                    {rec?.source && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {rec.source}
                      </span>
                    )}
                  </div>

                  <div className="text-center my-2">
                    <span className="text-3xl md:text-4xl font-black tracking-widest text-[#2468ce] font-mono group-hover:scale-105 inline-block transition-transform">
                      {rec ? rec.number : '--'}
                    </span>
                  </div>

                  <div className="text-center text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 opacity-60" />
                    <span>{rec ? rec.date : 'ရလဒ်မရှိသေးပါ'}</span>
                  </div>

                  {rec?.setIndex && (
                    <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>SET: {rec.setIndex}</span>
                      <span>Val: {rec.value}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>မှတ်တမ်းအသစ်ကို Data Entry သို့မဟုတ် Auto Fetch ဖြင့် ထည့်နိုင်ပါသည်။</span>
            <button
              onClick={() => onNavigateTab('entry')}
              className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 text-xs cursor-pointer"
            >
              ထည့်ရန် <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </article>

        {/* Hot & Cold Numbers Container */}
        <div className="space-y-4">
          {/* Hot Numbers Card */}
          <article className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-[#fff0f5] to-white border border-[#ffd6e4] shadow-[0_6px_23px_rgba(255,66,132,0.06)]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-100">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Hot Numbers {isFiltered ? '(ကာလအတွင်း အထွက်များ)' : '(အထွက်များ)'}</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('trends')}
                  className="text-[10px] text-rose-600 font-extrabold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  ၄ ပတ် Shift လိုင်းဇယား →
                </button>
                <span className="text-[10px] font-extrabold tracking-wider bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full uppercase">
                  HOT
                </span>
              </div>
            </div>

            <div className="flex items-center justify-around flex-wrap gap-2 py-1">
              {activeSummary.hotNumbers.length > 0 ? (
                activeSummary.hotNumbers.map((item, idx) => (
                  <button
                    key={item.number}
                    onClick={() => onSelectNumberForDetail(item.number)}
                    className="text-center group cursor-pointer transition-transform hover:-translate-y-1"
                    title={`${item.number}: ${item.count} ကြိမ် ထွက်ဖူးပါသည်`}
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-full text-white font-black text-lg md:text-xl font-mono shadow-md border-2 border-white bg-gradient-to-br from-[#ff5287] via-[#ff3366] to-[#ee2256] group-hover:shadow-rose-300">
                      {item.number}
                    </div>
                    <small className="block mt-1.5 text-[11px] font-bold text-slate-600">
                      {item.count} ကြိမ်
                    </small>
                    <span className="text-[9px] text-rose-500 font-semibold">
                      #{idx + 1} Hot
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3">ရွေးချယ်ထားသော ကာလအတွင်း ရလဒ်မရှိသေးပါ။</p>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {isFiltered
                ? 'ရွေးချယ်ထားသော ကာလအတွင်း အကြိမ်ရေ အများဆုံးထွက်ထားသော ဂဏန်းများ။'
                : 'သင့်မှတ်တမ်းထဲတွင် အကြိမ်ရေ အများဆုံးထွက်ထားသော ဂဏန်းများ ဖြစ်ပါသည်။'}
            </p>
          </article>

          {/* Cold Numbers Card */}
          <article className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-[#effaff] to-white border border-[#cceeff] shadow-[0_6px_23px_rgba(22,133,255,0.06)]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-sky-100">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-sky-500" />
                <span>Cold Numbers {isFiltered ? '(ကာလအတွင်း အထွက်နည်း)' : '(အထွက်နည်း)'}</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('trends')}
                  className="text-[10px] text-sky-600 font-extrabold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  ၄ ပတ် Shift လိုင်းဇယား →
                </button>
                <span className="text-[10px] font-extrabold tracking-wider bg-sky-100 text-sky-600 px-2.5 py-1 rounded-full uppercase">
                  COLD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-around flex-wrap gap-2 py-1">
              {activeSummary.coldNumbers.length > 0 ? (
                activeSummary.coldNumbers.map((item) => (
                  <button
                    key={item.number}
                    onClick={() => onSelectNumberForDetail(item.number)}
                    className="text-center group cursor-pointer transition-transform hover:-translate-y-1"
                    title={`${item.number}: ${item.count} ကြိမ်သာ ထွက်ဖူးပါသည်`}
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-full text-white font-black text-lg md:text-xl font-mono shadow-md border-2 border-white bg-gradient-to-br from-[#09baff] to-[#1467f4] group-hover:shadow-sky-300">
                      {item.number}
                    </div>
                    <small className="block mt-1.5 text-[11px] font-bold text-slate-600">
                      {item.count} ကြိမ်
                    </small>
                    <span className="text-[9px] text-sky-600 font-semibold">
                      အေးခဲ
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3">ရွေးချယ်ထားသော ကာလအတွင်း ရလဒ်မရှိသေးပါ။</p>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {isFiltered
                ? 'ရွေးချယ်ထားသော ကာလအတွင်း တွေ့ရအနည်းဆုံး ဂဏန်းများ။'
                : 'သိမ်းဆည်းထားသော ရလဒ်များထဲတွင် တွေ့ရအနည်းဆုံး (သို့) မထွက်သေးသော ဂဏန်းများ။'}
            </p>
          </article>
        </div>
      </div>

      {/* Recent Records Table for Selected Date Range */}
      <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800">
                ရွေးချယ်ထားသော ကာလအတွင်း ရလဒ်မှတ်တမ်းများ (Recent Records in Range)
              </h3>
              <p className="text-[11px] text-slate-500">
                {isFiltered
                  ? `${startDate || 'အစ'} မှ ${endDate || 'ယနေ့'} ကာလအတွင်း ထွက်ရှိခဲ့သော မှတ်တမ်းများ`
                  : 'လတ်တလော ထွက်ရှိထားသော ရလဒ်မှတ်တမ်းများ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 font-mono">
              {filteredRecords.length} RECORDS
            </span>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>မှတ်တမ်းအပြည့်အစုံ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">ရက်စွဲ (Date)</th>
                <th className="py-2.5 px-3">အချိန်ပိုင်း (Draw Time)</th>
                <th className="py-2.5 px-3 text-center">ထွက်ဂဏန်း (Number)</th>
                <th className="py-2.5 px-3">အမျိုးအစား (Source)</th>
                <th className="py-2.5 px-3 text-right">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedRangeRecords.length > 0 ? (
                paginatedRangeRecords.map((r, i) => {
                  const isEven = Number(r.number) % 2 === 0;
                  const isLow = Number(r.number) < 50;
                  return (
                    <tr key={`${r.date}-${r.time}-${i}`} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                        {r.date}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span>{slotIcons[r.time] || '🕒'}</span>
                          <span>{r.time}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-black text-sm tracking-wider shadow-2xs">
                          {r.number}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {r.source || 'Manual'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
                            {isEven ? 'စုံ' : 'မ'} • {isLow ? 'နိမ့်' : 'မြင့်'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectNumberForDetail(r.number)}
                          className="py-1 px-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold transition cursor-pointer"
                        >
                          စစ်ဆေးရန်
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    ရွေးချယ်ထားသော ရက်စွဲကာလအတွင်း ရလဒ်မှတ်တမ်း မတွေ့ရှိပါ။
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalTablePages > 1 && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <span>
              စာမျက်နှာ {tablePage} / {totalTablePages} (စုစုပေါင်း {filteredRecords.length} ခု)
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                disabled={tablePage === 1}
                className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                disabled={tablePage === totalTablePages}
                className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </article>

      {/* Next Draw Probability Highlights Banner */}
      <article className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-300" /> STATISTICAL ENGINE
              </span>
              <span className="text-xs text-indigo-200">
                WMA & Recurrence Intervals
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-white">
              နောက်ထွက်ဂဏန်း ဖြစ်နိုင်ခြေ သုံးသပ်ချက် (Next Draw Probability)
            </h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              သမားရိုးကျ 1.00% မျှခြေထက် သာလွန်သော ပျမ်းမျှလည်ပတ်ချိန်နှင့် မကြာမီအရှိန်အဟုန်ကို တွက်ချက်ထားသော ထိပ်တန်းဂဏန်းများ။
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => onNavigateTab('probabilities')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-900 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>ဖြစ်နိုင်ခြေ အပြည့်အစုံ ကြည့်ရန်</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Quick 2D Live Number Checker */}
      <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>ဂဏန်းစစ်ဆေးရန် (Quick 2D Checker)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              မိမိနှစ်သက်ရာ (၀၀ မှ ၉၉ အထိ) ရိုက်ထည့်၍ မှတ်တမ်းအချက်အလက်ကို ချက်ချင်း စစ်ဆေးနိုင်ပါသည်။
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              maxLength={2}
              value={searchNum}
              onChange={(e) => setSearchNum(e.target.value.replace(/\D/g, ''))}
              placeholder="ဂဏန်း (00-99)"
              className="w-32 md:w-36 text-center font-mono font-black text-xl py-2 px-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:outline-none bg-indigo-50/40 text-indigo-900"
            />
          </div>
        </div>

        {searchResults ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-mono font-black text-2xl grid place-items-center shadow-md">
                  {searchNum}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>ဂဏန်း {searchNum} ၏ သုံးသပ်ချက်</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      {searchResults.isEven ? 'စုံဂဏန်း (Even)' : 'မဂဏန်း (Odd)'}
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      {searchResults.isLow ? 'အနိမ့် (00-49)' : 'အမြင့် (50-99)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ထိပ်ဂဏန်း: <b className="text-slate-700">{searchNum[0]}</b> • နောက်ပိတ်: <b className="text-slate-700">{searchNum[1]}</b>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  {isFiltered ? 'ကာလအတွင်း ထွက်ရှိမှု' : 'စုစုပေါင်းထွက်ရှိမှု'}
                </span>
                <span className="text-2xl font-black text-indigo-600 font-mono">
                  {searchResults.count} <span className="text-xs font-normal text-slate-600">ကြိမ်</span>
                </span>
              </div>
            </div>

            {searchResults.found.length > 0 ? (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  မကြာသေးမီက ထွက်ရှိခဲ့သည့် ရက်စွဲများ:
                </span>
                <div className="flex flex-wrap gap-2">
                  {searchResults.found.slice(0, 6).map((rec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-mono"
                    >
                      📅 {rec.date} <span className="text-indigo-600 font-bold font-sans">({rec.time})</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                ဤဂဏန်းသည် {isFiltered ? 'ရွေးချယ်ထားသော ကာလအတွင်း' : 'သိမ်းဆည်းထားသော မှတ်တမ်းထဲတွင်'} ထွက်ပေါ်ခဲ့ဖူးခြင်း မရှိသေးပါ။
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 py-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              အပေါ်က အကွက်တွင် ၂ လုံးဂဏန်း (ဥပမာ- ၇၂၊ ၃၈) ရိုက်ထည့်ပြီး ရှာဖွေနိုင်ပါသည်။
            </span>
            <button
              onClick={() => onNavigateTab('matrix')}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              ၁၀၀ ကွက်ဇယားအပြည့်အစုံ ကြည့်ရန် →
            </button>
          </div>
        )}
      </article>
    </div>
  );
};
