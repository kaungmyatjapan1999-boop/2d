import React, { useState } from 'react';
import { TwoDRecord } from '../types';
import { padZero } from '../utils/storage';
import { Grid, Sparkles, X, Clock, Calendar, CheckCircle } from 'lucide-react';

interface MatrixViewProps {
  frequency: number[];
  records: TwoDRecord[];
  onSelectNumberForEntry: (num: string) => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  frequency,
  records,
  onSelectNumberForEntry,
}) => {
  const [selectedNum, setSelectedNum] = useState<string | null>(null);

  const maxCount = Math.max(1, ...frequency);

  const getHeatBg = (count: number) => {
    if (count === 0) return 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100';
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 font-bold';
    if (ratio < 0.5) return 'bg-indigo-200 text-indigo-900 border-indigo-300 hover:bg-indigo-300 font-bold';
    if (ratio < 0.75) return 'bg-purple-300 text-purple-950 border-purple-400 hover:bg-purple-400 font-extrabold';
    return 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white border-rose-400 shadow-sm font-black hover:opacity-95';
  };

  const selectedRecords = selectedNum
    ? records.filter(r => r.number === selectedNum)
    : [];

  return (
    <article className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Grid className="w-4 h-4 text-indigo-600" />
            <span>၁၀၀ ကွက် ဂဏန်းအပူချိန်ဇယား (00–99 Matrix)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ဂဏန်းတစ်ခုချင်းစီ၏ အကြိမ်ရေအပူချိန်ကို အရောင်ဖြင့် လေ့လာနိုင်ပြီး နှိပ်၍ အသေးစိတ်စစ်ဆေးနိုင်ပါသည်။
          </p>
        </div>

        {/* Heat Legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span> မထွက်သေး
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span> နည်း
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-indigo-200 border border-indigo-300"></span> အသင့်အတင့်
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600"></span> အများဆုံး (Hot)
          </span>
        </div>
      </div>

      {/* 10x10 Grid */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 md:gap-2">
        {Array.from({ length: 100 }, (_, i) => {
          const numStr = padZero(i);
          const count = frequency[i] || 0;
          const bgClass = getHeatBg(count);
          return (
            <button
              key={numStr}
              onClick={() => setSelectedNum(numStr)}
              className={`aspect-square rounded-lg sm:rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer p-0.5 ${bgClass}`}
              title={`ဂဏန်း ${numStr}: ${count} ကြိမ်`}
            >
              <span className="text-xs sm:text-sm font-mono leading-none">{numStr}</span>
              <span className="text-[9px] opacity-80 leading-none mt-0.5 sm:mt-1 hidden xs:inline-block">
                {count > 0 ? `${count}` : '0'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Number Details Modal / Drawer */}
      {selectedNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono font-black text-2xl grid place-items-center shadow-md">
                  {selectedNum}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    ဂဏန်း {selectedNum} အသေးစိတ်
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>{Number(selectedNum) % 2 === 0 ? 'စုံဂဏန်း (Even)' : 'မဂဏန်း (Odd)'}</span>
                    <span>•</span>
                    <span>{Number(selectedNum) < 50 ? 'အနိမ့် (Low)' : 'အမြင့် (High)'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedNum(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="text-xs text-indigo-700 font-bold block">စုစုပေါင်းထွက်ရှိမှု</span>
                <span className="text-2xl font-black text-indigo-900 font-mono">
                  {frequency[Number(selectedNum)] || 0} ကြိမ်
                </span>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="text-xs text-purple-700 font-bold block">ထိပ်စီး / နောက်ပိတ်</span>
                <span className="text-base font-black text-purple-900 font-mono mt-1 block">
                  ထိပ်: {selectedNum[0]} | ပိတ်: {selectedNum[1]}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>ထွက်ရှိခဲ့သည့် မှတ်တမ်းများ ({selectedRecords.length})</span>
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedRecords.length > 0 ? (
                  selectedRecords.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono"
                    >
                      <span className="text-slate-700">{r.date}</span>
                      <span className="text-indigo-600 font-bold font-sans">{r.time}</span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-500 font-sans">
                        {r.source || 'Manual'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    မှတ်တမ်းမရှိသေးပါ။
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onSelectNumberForEntry(selectedNum);
                  setSelectedNum(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:opacity-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>ဤဂဏန်းဖြင့် စာရင်းသွင်းရန်</span>
              </button>
              <button
                onClick={() => setSelectedNum(null)}
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
