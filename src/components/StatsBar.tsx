import React from 'react';
import { AnalysisSummary } from '../utils/analysis';
import { Database, Award, Sun, Moon } from 'lucide-react';

interface StatsBarProps {
  summary: AnalysisSummary;
}

export const StatsBar: React.FC<StatsBarProps> = ({ summary }) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5 my-4">
      {/* 1. Total records */}
      <div className="p-3.5 md:p-4 rounded-2xl text-white shadow-md bg-gradient-to-br from-[#078cff] to-[#4e36ee] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between opacity-95">
          <span className="text-xs md:text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 opacity-90" /> စုစုပေါင်းမှတ်တမ်း
          </span>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 tracking-tight">
          {summary.total.toLocaleString()}
        </div>
        <div className="text-[11px] text-blue-100/90 font-medium mt-1">
          သိမ်းထားသောရလဒ်များ
        </div>
      </div>

      {/* 2. Last result */}
      <div className="p-3.5 md:p-4 rounded-2xl text-white shadow-md bg-gradient-to-br from-[#00c99a] to-[#079a85] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between opacity-95">
          <span className="text-xs md:text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 opacity-90" /> နောက်ဆုံးရလဒ်
          </span>
          {summary.lastRecord && (
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono font-bold">
              {summary.lastRecord.time}
            </span>
          )}
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 tracking-widest font-mono">
          {summary.lastRecord ? summary.lastRecord.number : '--'}
        </div>
        <div className="text-[11px] text-emerald-100/90 font-medium mt-1 truncate">
          {summary.lastRecord
            ? `${summary.lastRecord.date} • ${summary.lastRecord.time}`
            : 'မှတ်တမ်းမရှိသေးပါ'}
        </div>
      </div>

      {/* 3. AM count */}
      <div className="p-3.5 md:p-4 rounded-2xl text-white shadow-md bg-gradient-to-br from-[#ffbd19] to-[#ff7900] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between opacity-95">
          <span className="text-xs md:text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 opacity-90" /> 11:00 AM
          </span>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 tracking-tight">
          {summary.amCount}
        </div>
        <div className="text-[11px] text-amber-100/90 font-medium mt-1">
          AM မှတ်တမ်းအကြိမ်ရေ
        </div>
      </div>

      {/* 4. PM count */}
      <div className="p-3.5 md:p-4 rounded-2xl text-white shadow-md bg-gradient-to-br from-[#893cff] to-[#d52de5] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between opacity-95">
          <span className="text-xs md:text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 opacity-90" /> PM ရလဒ်များ
          </span>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 tracking-tight">
          {summary.pmCount}
        </div>
        <div className="text-[11px] text-purple-100/90 font-medium mt-1">
          12:01, 3:00, 4:30 PM
        </div>
      </div>
    </section>
  );
};
