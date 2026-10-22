import React, { useState } from 'react';
import { TwoDRecord, DrawTime } from '../types';
import { getTodayString, TIMES } from '../utils/storage';
import { PlusCircle, Download, Upload, CheckCircle2, AlertCircle, Sparkles, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DataEntryViewProps {
  onAddRecord: (date: string, time: DrawTime, number: string) => { success: boolean; message: string };
  onImportCsv: (csvContent: string) => { added: number; skipped: number };
  onExportCsv: () => void;
  onResetSeedData: () => void;
  initialSelectedNumber?: string;
}

export const DataEntryView: React.FC<DataEntryViewProps> = ({
  onAddRecord,
  onImportCsv,
  onExportCsv,
  onResetSeedData,
  initialSelectedNumber = '',
}) => {
  const [date, setDate] = useState<string>(getTodayString());
  const [time, setTime] = useState<DrawTime>('11:00 AM');
  const [number, setNumber] = useState<string>(initialSelectedNumber);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{2}$/.test(number.trim())) {
      setStatusType('error');
      setStatusMessage('ဂဏန်းသည် ၂ လုံးဂဏန်း (00–99) ဖြစ်ရပါမည်။');
      return;
    }

    const res = onAddRecord(date, time, number.trim());
    if (res.success) {
      setStatusType('success');
      setStatusMessage(res.message);
      setNumber('');

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    } else {
      setStatusType('error');
      setStatusMessage(res.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const res = onImportCsv(text);
          setStatusType('success');
          setStatusMessage(
            `CSV မှတ်တမ်း Import ပြီးပါပြီ။ ထည့်သွင်း/အစားထိုး: ${res.added} ခု၊ ကျော်သွား: ${res.skipped} ခု။`
          );
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err: any) {
          setStatusType('error');
          setStatusMessage('CSV ဖိုင်ဖတ်မရပါ သို့မဟုတ် ဖော်မတ်မှားယွင်းနေပါသည်။');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDigitClick = (digit: string) => {
    if (number.length < 2) {
      setNumber(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  return (
    <article className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <span>✍️ ရလဒ်အသစ်ထည့်ရန် (Manual Data Entry)</span>
        </h2>
        <span className="text-[10px] font-extrabold tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase border border-indigo-100">
          ENTRY FORM
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ရက်စွဲ (Draw Date)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50/50 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              အချိန်ပိုင်း (Draw Time)
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value as DrawTime)}
              className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50/50 focus:border-indigo-600 focus:outline-none cursor-pointer"
            >
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ၂ လုံးဂဏန်း (00–99)
            </label>
            <input
              type="text"
              required
              maxLength={2}
              inputMode="numeric"
              pattern="[0-9]{2}"
              placeholder="00–99"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full py-2 px-3.5 border-2 border-indigo-200 rounded-xl text-center text-xl font-black font-mono text-indigo-700 bg-indigo-50/40 focus:border-indigo-600 focus:outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Quick Touch Keypad for Mobile Comfort */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-sm mx-auto sm:max-w-none">
          <div className="text-[11px] font-bold text-slate-500 mb-2 text-center">
            အမြန်ကီးပတ် (Touch Keypad)
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitClick(digit)}
                className="py-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 font-mono font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="col-span-1 sm:col-span-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer transition"
              title="ဖျက်ရန်"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setNumber('')}
              className="col-span-1 sm:col-span-1 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs cursor-pointer transition"
            >
              C
            </button>
          </div>
        </div>

        {/* Buttons / Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>＋ သိမ်းဆည်းရန် (Save)</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>⬇ CSV Export</span>
          </button>

          <label className="py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4" />
            <span>⬆ CSV Import</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onResetSeedData}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer ml-auto flex items-center gap-1.5"
            title="နမူနာဒေတာ ပြန်လည်ဖြည့်သွင်းရန်"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>နမူနာဒေတာ ဖြည့်ရန်</span>
          </button>
        </div>
      </form>

      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            statusType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
    </article>
  );
};
