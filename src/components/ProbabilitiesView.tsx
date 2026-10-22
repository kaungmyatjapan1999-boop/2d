import React, { useState, useMemo } from 'react';
import { TwoDRecord } from '../types';
import {
  computeNextDrawProbabilities,
  NumberProbability,
} from '../utils/probabilityEngine';
import {
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  Info,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProbabilitiesViewProps {
  records: TwoDRecord[];
  onSelectNumberForEntry: (num: string) => void;
}

type FilterMode = 'all' | 'top20' | 'overdue' | 'momentum';

export const ProbabilitiesView: React.FC<ProbabilitiesViewProps> = ({
  records,
  onSelectNumberForEntry,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNumberDetail, setSelectedNumberDetail] = useState<NumberProbability | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Compute mathematical probabilities
  const probData = useMemo(() => computeNextDrawProbabilities(records), [records]);

  // Filtered list
  const filteredList = useMemo(() => {
    let list = probData.allProbabilities;

    if (filterMode === 'top20') {
      list = list.slice(0, 20);
    } else if (filterMode === 'overdue') {
      list = list.filter(r => r.status === 'highly_due' || r.status === 'due_soon');
    } else if (filterMode === 'momentum') {
      list = list.filter(r => r.status === 'hot_momentum');
    }

    if (searchQuery.trim()) {
      list = list.filter(r => r.number.includes(searchQuery.trim()));
    }

    return list;
  }, [probData, filterMode, searchQuery]);

  const handlePickNumber = (num: string) => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });
    onSelectNumberForEntry(num);
  };

  return (
    <article className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white grid place-items-center shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-800">
              နောက်ထွက်ဂဏန်း ဖြစ်နိုင်ခြေ သုံးသပ်ချက် (Next Draw Probabilities)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            အတိတ်ရလဒ်များ၏ <b>ပြန်လည်ထွက်ပေါ်ချိန် (Recurrence Interval)</b> နှင့် <b>အလေးပေးပျမ်းမျှခြင်း (Weighted Moving Averages)</b> ကို အခြေခံ၍ ဖြစ်နိုင်ခြေ ရာခိုင်နှုန်းကို သင်္ချာနည်းကျ တွက်ချက်ထားပါသည်။
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>တွက်ချက်ပုံ ဖော်မြူလာ</span>
          </button>
        </div>
      </div>

      {/* Formula Explanation Collapsible */}
      {showFormulaInfo && (
        <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-2xl border border-indigo-100 text-xs text-slate-700 space-y-2 animate-in fade-in">
          <div className="font-extrabold text-indigo-900 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>သင်္ချာစနစ်ဖြင့် ဖြစ်နိုင်ခြေ တွက်ချက်ပုံ နည်းစနစ်:</span>
          </div>
          <p className="leading-relaxed">
            ဤစနစ်သည် ကံစမ်းဂဏန်းများ၏ သမားရိုးကျ Random 1.00% မျှခြေထက် သာလွန်စေရန် ခေတ်မီ <b>Probability Renewal Process</b> နှင့် <b>Time-Decay Weighted Moving Average</b> တို့ကို ပေါင်းစပ်တွက်ချက်ထားပါသည်:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
            <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-1">
              <b className="text-indigo-800 font-sans block">1. Recurrence Interval (ထွက်ချိန်စက်ဝန်း)</b>
              <span>• ပျမ်းမျှလည်ပတ်ချိန် (Mean Interval): ဂဏန်းတစ်ခု ထွက်ပေါ်သည့် အကြိမ်ခြား ပျမ်းမျှ</span>
              <br />
              <span>• Overdue Ratio: မထွက်ဘဲ ကြာမြင့်နေသော အကြိမ်ရေ / ပျမ်းမျှလည်ပတ်ချိန်</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-1">
              <b className="text-purple-800 font-sans block">2. Weighted Moving Average (မကြာမီအပူချိန်)</b>
              <span>• လတ်တလော ထွက်ရှိထားသော ဒေတာများကို ပိုမိုမြင့်မားသော အလေးချိန် (Weight 3.5x) ပေး၍ အရှိန်အဟုန်ကို တိုင်းတာပါသည်</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Top Pick */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200">
          <span className="text-[11px] font-bold text-indigo-700 block">
            ⭐ အလားအလာ အမြင့်ဆုံး
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-indigo-900">
              {probData.highestProbability.number}
            </span>
            <span className="text-xs font-bold text-indigo-600 font-mono">
              ({probData.highestProbability.probability}%)
            </span>
          </div>
          <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">
            ပျမ်းမျှထက် {probData.highestProbability.relativeRatio}x ပိုမြင့်
          </span>
        </div>

        {/* Overdue Count */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200">
          <span className="text-[11px] font-bold text-amber-700 block">
            ⏱️ ထွက်ချိန်နီးကပ်ဂဏန်းများ
          </span>
          <div className="text-2xl font-black font-mono text-amber-900 mt-1">
            {probData.overdueCount} <span className="text-xs font-sans text-amber-700 font-bold">လုံး</span>
          </div>
          <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
            Gap &gt;= ပျမ်းမျှလည်ပတ်ချိန်
          </span>
        </div>

        {/* High Probability Count */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-700 block">
            🔥 အားကောင်းသော ဂဏန်း
          </span>
          <div className="text-2xl font-black font-mono text-emerald-900 mt-1">
            {probData.highProbabilityCount} <span className="text-xs font-sans text-emerald-700 font-bold">လုံး</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
            ဖြစ်နိုင်ခြေ &gt;= 1.5% အထက်
          </span>
        </div>

        {/* Parity probability */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-200">
          <span className="text-[11px] font-bold text-purple-700 block">
            🌓 စုံ / မ ခန့်မှန်းချက်
          </span>
          <div className="text-sm font-black font-mono text-purple-900 mt-1.5 flex items-center justify-between">
            <span>စုံ: {probData.parityProbabilities.even}%</span>
            <span>မ: {probData.parityProbabilities.odd}%</span>
          </div>
          <span className="text-[10px] text-purple-600 block mt-0.5 font-medium">
            အနိမ့်: {probData.lowHighProbabilities.low}% | အမြင့်: {probData.lowHighProbabilities.high}%
          </span>
        </div>
      </div>

      {/* Top 10 High Probability Cards Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>ထိပ်တန်း ဖြစ်နိုင်ခြေအများဆုံး ဂဏန်း (၁၀) လုံး</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">
            စံနှုန်းအခြေခံ (Baseline): 1.00%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {probData.topProbabilities.map((item, idx) => {
            const isTop3 = idx < 3;
            return (
              <div
                key={item.number}
                className={`p-3 rounded-2xl border transition hover:shadow-md relative overflow-hidden group cursor-pointer ${
                  isTop3
                    ? 'bg-gradient-to-b from-indigo-50/80 via-white to-white border-indigo-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedNumberDetail(item)}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : idx === 2
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-mono">
                    {item.relativeRatio}x
                  </span>
                </div>

                {/* Number Circle */}
                <div className="text-center my-1.5">
                  <span className="text-3xl font-black font-mono tracking-wider text-slate-800 group-hover:scale-110 inline-block transition-transform">
                    {item.number}
                  </span>
                </div>

                {/* Probability progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">ဖြစ်နိုင်ခြေ:</span>
                    <span className="text-indigo-600 font-mono font-black">
                      {item.probability}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, (item.probability / 3.5) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Info and quick entry */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    Gap: <b>{item.currentGap}</b> ကြိမ်
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickNumber(item.number);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                  >
                    ရွေးမည် +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Head & Tail Probability Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Head Digits */}
        <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>ထိပ်စီးဂဏန်း ဖြစ်နိုင်ခြေ ခန့်မှန်းချက် (Head Digits)</span>
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 text-center font-mono">
            {probData.headProbabilities.map(h => (
              <div key={h.digit} className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs font-black text-slate-800 block">{h.digit}</span>
                <span className="text-[10px] font-bold text-indigo-600 block mt-0.5">{h.probability}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tail Digits */}
        <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>နောက်ပိတ်ဂဏန်း ဖြစ်နိုင်ခြေ ခန့်မှန်းချက် (Tail Digits)</span>
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 text-center font-mono">
            {probData.tailProbabilities.map(t => (
              <div key={t.digit} className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs font-black text-slate-800 block">{t.digit}</span>
                <span className="text-[10px] font-bold text-sky-600 block mt-0.5">{t.probability}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full 100-Number Table and Search */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterMode('all')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ဂဏန်းအားလုံး (All 100)
            </button>
            <button
              onClick={() => setFilterMode('top20')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === 'top20'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ထိပ်တန်း ၂၀ (Top 20)
            </button>
            <button
              onClick={() => setFilterMode('overdue')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === 'overdue'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⏱️ ထွက်ချိန်နီးကပ် (Overdue)
            </button>
            <button
              onClick={() => setFilterMode('momentum')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === 'momentum'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔥 Hot Momentum
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <input
              type="text"
              maxLength={2}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))}
              placeholder="ဂဏန်းရှာရန် (00-99)"
              className="w-full py-1.5 pl-3 pr-8 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:border-indigo-600 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">ဂဏန်း (Number)</th>
                <th className="py-2.5 px-3 text-center">ဖြစ်နိုင်ခြေ (Probability)</th>
                <th className="py-2.5 px-3 text-center">စံနှုန်းထက် (Ratio)</th>
                <th className="py-2.5 px-3 text-center">မထွက်ရသေးသော အကြိမ် (Gap)</th>
                <th className="py-2.5 px-3 text-center">ပျမ်းမျှလည်ပတ်ချိန် (Mean Interval)</th>
                <th className="py-2.5 px-3 text-center">အခြေအနေ</th>
                <th className="py-2.5 px-3 text-right">ရွေးချယ်ရန်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredList.map(item => {
                return (
                  <tr
                    key={item.number}
                    className="hover:bg-indigo-50/40 transition cursor-pointer"
                    onClick={() => setSelectedNumberDetail(item)}
                  >
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                      #{item.rank}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-black text-sm text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {item.number}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-black text-indigo-700">
                      {item.probability}%
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-600">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.relativeRatio >= 1.5
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.relativeRatio <= 0.8
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.relativeRatio}x
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-700">
                      {item.currentGap} ကြိမ်
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-500">
                      ~ {item.meanInterval} ကြိမ်
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.status === 'highly_due' ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          ⏱️ အထူးထွက်ချိန်ရောက်
                        </span>
                      ) : item.status === 'due_soon' ? (
                        <span className="text-[10px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full">
                          ထွက်ချိန်နီး
                        </span>
                      ) : item.status === 'hot_momentum' ? (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3 text-rose-500" /> Hot
                        </span>
                      ) : item.status === 'recent' ? (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          လတ်တလောထွက်
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          ပုံမှန်
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePickNumber(item.number);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        ရွေးမည် +
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for Selected Number */}
      {selectedNumberDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono font-black text-2xl grid place-items-center shadow-md">
                  {selectedNumberDetail.number}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    ဂဏန်း {selectedNumberDetail.number} ၏ ဖြစ်နိုင်ခြေ သုံးသပ်ချက်
                  </h3>
                  <div className="text-xs text-indigo-600 font-bold">
                    အဆင့် Rank: #{selectedNumberDetail.rank}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedNumberDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="font-bold text-indigo-900">နောက်တစ်ကြိမ် ထွက်နိုင်ခြေ:</span>
                <span className="text-xl font-black font-mono text-indigo-700">
                  {selectedNumberDetail.probability}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">မထွက်ဘဲ ကြာချိန် (Gap)</span>
                  <span className="font-mono font-black text-slate-800 text-sm mt-0.5 block">
                    {selectedNumberDetail.currentGap} ကြိမ်
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">ပျမ်းမျှလည်ပတ်ချိန်</span>
                  <span className="font-mono font-black text-slate-800 text-sm mt-0.5 block">
                    ~ {selectedNumberDetail.meanInterval} ကြိမ်
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>WMA အလေးပေးရမှတ်:</span>
                  <b className="font-mono">{selectedNumberDetail.wmaScore}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Overdue အချိုး:</span>
                  <b className="font-mono">{selectedNumberDetail.overdueRatio}x</b>
                </div>
                {selectedNumberDetail.lastSeenDate && (
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200 text-[11px]">
                    <span>နောက်ဆုံးထွက်ခဲ့သည့် ရက်:</span>
                    <b className="font-mono">{selectedNumberDetail.lastSeenDate} ({selectedNumberDetail.lastSeenTime})</b>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  handlePickNumber(selectedNumberDetail.number);
                  setSelectedNumberDetail(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:opacity-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ဤဂဏန်းဖြင့် စာရင်းသွင်းမည်</span>
              </button>
              <button
                onClick={() => setSelectedNumberDetail(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
