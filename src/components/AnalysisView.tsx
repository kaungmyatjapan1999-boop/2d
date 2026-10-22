import React from 'react';
import { AnalysisSummary } from '../utils/analysis';
import { padZero } from '../utils/storage';
import { BarChart3, PieChart, Layers, Calendar, Shuffle, Compass } from 'lucide-react';

interface AnalysisViewProps {
  summary: AnalysisSummary;
  onSelectNumber: (num: string) => void;
}

const BAR_COLORS = [
  '#ff4f88', '#ff9b22', '#ffca31', '#31c98b',
  '#05bfa8', '#1aa8ff', '#3178ff', '#8056f5',
  '#c54cf2', '#e448b3',
];

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  summary,
  onSelectNumber,
}) => {
  const maxFreq = Math.max(1, ...summary.top10.map(t => t.count));
  const evenPct = summary.total > 0 ? (summary.evenCount / summary.total) * 100 : 50;
  const oddPct = 100 - evenPct;

  const lowPct = summary.total > 0 ? ((summary.lowCount / summary.total) * 100).toFixed(1) : '0';
  const highPct = summary.total > 0 ? ((summary.highCount / summary.total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Upper Grid: Frequency Bar Chart & Even/Odd Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Frequency Bar Chart */}
        <article className="lg:col-span-7 p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>📈 Frequency Analysis (အကြိမ်ရေ အများဆုံး)</span>
            </h2>
            <span className="text-[10px] font-extrabold tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase border border-indigo-100">
              TOP 10
            </span>
          </div>

          {summary.top10.length > 0 ? (
            <div className="flex items-end justify-around gap-1.5 md:gap-2 h-44 border-b border-slate-200 pb-2 px-1">
              {summary.top10.map((item, idx) => {
                const heightPercent = Math.max(6, (item.count / maxFreq) * 100);
                return (
                  <button
                    key={item.number}
                    onClick={() => onSelectNumber(item.number)}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-1 group cursor-pointer"
                    title={`ဂဏန်း ${item.number}: ${item.count} ကြိမ် (${item.percentage.toFixed(1)}%)`}
                  >
                    <span className="text-[11px] font-extrabold text-slate-500 group-hover:text-indigo-600">
                      {item.count}
                    </span>
                    <div
                      className="w-full max-w-[28px] rounded-t-md transition-all duration-300 group-hover:opacity-90 group-hover:scale-105"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                      }}
                    />
                    <span className="text-xs font-mono font-black text-slate-700 group-hover:text-indigo-600">
                      {item.number}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-44 grid place-items-center text-xs text-slate-400">
              Frequency ပြသရန် မှတ်တမ်းထည့်သွင်းပါ။
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            ဂဏန်းတစ်လုံးချင်းစီ ပေါ်လာသည့် အကြိမ်ရေကို အစဉ်လိုက် နှိုင်းယှဉ်ပြထားပါသည်။
          </p>
        </article>

        {/* Even / Odd Parity Donut Chart */}
        <article className="lg:col-span-5 p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>🌓 စုံ / မ Analysis</span>
            </h2>
            <span className="text-[10px] font-extrabold tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase border border-emerald-100">
              PARITY
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-around gap-4 flex-wrap py-2">
            {/* Donut graphic */}
            <div
              className="w-28 h-28 md:w-32 md:h-32 rounded-full grid place-items-center flex-shrink-0 shadow-md relative transition-transform duration-300 hover:scale-105"
              style={{
                background: summary.total > 0
                  ? `conic-gradient(#08c997 0% ${evenPct}%, #ff4771 ${evenPct}% 100%)`
                  : '#e2e8f0',
              }}
            >
              <div className="w-20 h-20 md:w-22 md:h-22 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  စုစုပေါင်း
                </span>
                <strong className="text-lg md:text-xl font-black text-slate-800 font-mono">
                  {summary.total}
                </strong>
              </div>
            </div>

            {/* Legend & metrics */}
            <div className="space-y-2.5 min-w-[140px]">
              <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#08c997] shadow-xs"></span>
                  စုံဂဏန်း (Even)
                </span>
                <div className="text-right">
                  <b className="text-emerald-700 text-sm font-mono block leading-none">
                    {summary.evenCount}
                  </b>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {evenPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-rose-50/70 border border-rose-100 text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#ff4771] shadow-xs"></span>
                  မဂဏန်း (Odd)
                </span>
                <div className="text-right">
                  <b className="text-rose-700 text-sm font-mono block leading-none">
                    {summary.oddCount}
                  </b>
                  <span className="text-[10px] text-rose-600 font-medium">
                    {oddPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            စုံဂဏန်း (0, 2, 4, 6, 8 ဖြင့်ဆုံး) နှင့် မဂဏန်း (1, 3, 5, 7, 9 ဖြင့်ဆုံး) အချိုးအစား ဖြစ်ပါသည်။
          </p>
        </article>
      </div>

      {/* Middle Grid: Head (ထိပ်ဂဏန်း) & Tail (နောက်ဂဏန်း) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Head Digits */}
        <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>🟣 ထိပ်ဂဏန်းများ (Head Digits 0-9)</span>
            </h2>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              HEAD
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 py-1">
            {summary.heads.map((count, digit) => {
              const isMax = count === Math.max(...summary.heads) && count > 0;
              return (
                <div key={digit} className="text-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full grid place-items-center text-white font-mono font-black text-xs sm:text-sm shadow-sm transition-transform hover:scale-110 ${
                      isMax
                        ? 'bg-gradient-to-tr from-purple-600 to-pink-500 ring-2 ring-purple-300'
                        : 'bg-gradient-to-tr from-[#17cba0] to-[#087df5]'
                    }`}
                  >
                    {digit}
                  </div>
                  <small className="block mt-1 font-bold text-[10px] text-slate-600">
                    {count}
                  </small>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            ရှေ့ဂဏန်း (ထိပ်စီး) အကြိမ်ရေ အများဆုံးကို ပေါ်လွင်စေရန် ပြသထားပါသည်။
          </p>
        </article>

        {/* Tail Digits */}
        <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>🔵 နောက်ဂဏန်းများ (Tail Digits 0-9)</span>
            </h2>
            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              TAIL
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 py-1">
            {summary.tails.map((count, digit) => {
              const isMax = count === Math.max(...summary.tails) && count > 0;
              return (
                <div key={digit} className="text-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full grid place-items-center text-white font-mono font-black text-xs sm:text-sm shadow-sm transition-transform hover:scale-110 ${
                      isMax
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 ring-2 ring-sky-300'
                        : 'bg-gradient-to-tr from-[#00c99a] to-[#078cff]'
                    }`}
                  >
                    {digit}
                  </div>
                  <small className="block mt-1 font-bold text-[10px] text-slate-600">
                    {count}
                  </small>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            နောက်ဂဏန်း (နောက်ပိတ်) အကြိမ်ရေ အများဆုံးကို ပေါ်လွင်စေရန် ပြသထားပါသည်။
          </p>
        </article>
      </div>

      {/* Lower Grid: Last 7 Days, Pair Patterns, Low/High */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Last 7 Days Table */}
        <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>📅 နောက်ဆုံး ၇ ရက်မှတ်တမ်း</span>
            </h2>
          </div>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <th className="py-2 px-2">ရက်စွဲ</th>
                  <th className="py-2 px-1 text-center">ကြိမ်</th>
                  <th className="py-2 px-2 text-right">ရလဒ်များ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {summary.last7Days.map((day) => (
                  <tr key={day.date} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2 text-slate-600 text-[11px]">
                      {day.date.slice(5)}
                    </td>
                    <td className="py-2 px-1 text-center text-slate-500 font-bold">
                      {day.draws.length}
                    </td>
                    <td className="py-2 px-2 text-right font-black text-blue-600">
                      {day.draws.length > 0
                        ? day.draws.map(d => d.number).join(' • ')
                        : <span className="text-slate-300 font-sans">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Pair Patterns */}
        <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Shuffle className="w-4 h-4 text-purple-600" />
              <span>🔁 Pair Pattern (အကူးအပြောင်း)</span>
            </h2>
          </div>

          <div className="space-y-1.5 py-1">
            {summary.pairPatterns.length > 0 ? (
              summary.pairPatterns.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-100 text-xs font-mono"
                >
                  <span className="font-bold text-blue-600 tracking-wider">
                    {item.pair}
                  </span>
                  <span className="text-[11px] font-sans font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {item.count} ကြိမ်
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                ဆက်တိုက်ရလဒ် ၂ ခုထက်ပို ထည့်ပါ။
              </p>
            )}
          </div>

          <p className="text-[10px] text-slate-400 mt-2 font-medium">
            အတိတ်ရလဒ်များ၏ အဆက်အစပ် ပုံစံများကိုသာ ဖော်ပြခြင်းဖြစ်ပါသည်။
          </p>
        </article>

        {/* Low / High */}
        <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>🎯 အနိမ့် / အမြင့် (Low & High)</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 py-2">
            <div className="text-center p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <b className="text-emerald-700 text-xs font-bold block">
                အနိမ့် (00–49)
              </b>
              <h3 className="text-2xl font-black text-emerald-800 font-mono my-1">
                {summary.lowCount}
              </h3>
              <small className="text-xs text-emerald-600 font-bold">
                {lowPct}%
              </small>
            </div>

            <div className="text-center p-3.5 bg-purple-50 rounded-xl border border-purple-100">
              <b className="text-purple-700 text-xs font-bold block">
                အမြင့် (50–99)
              </b>
              <h3 className="text-2xl font-black text-purple-800 font-mono my-1">
                {summary.highCount}
              </h3>
              <small className="text-xs text-purple-600 font-bold">
                {highPct}%
              </small>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-1 font-medium text-center">
            ၀၀ မှ ၄၉ (အနိမ့်) နှင့် ၅၀ မှ ၉၉ (အမြင့်) ပျံ့နှံ့မှု အချိုး
          </p>
        </article>
      </div>
    </div>
  );
};
