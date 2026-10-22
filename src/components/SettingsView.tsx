import React, { useState } from 'react';
import { TwoDRecord } from '../types';
import { Settings, Save, Trash2, Upload, Database, ShieldCheck, AlertTriangle, CheckCircle2, Github, GitBranch, ArrowRight, Zap } from 'lucide-react';

interface SettingsViewProps {
  records: TwoDRecord[];
  onBackupJson: () => void;
  onRestoreJson: (jsonData: TwoDRecord[]) => void;
  onClearAll: () => void;
  onNavigateToGitHub?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  records,
  onBackupJson,
  onRestoreJson,
  onClearAll,
  onNavigateToGitHub,
}) => {
  const [status, setStatus] = useState<string>('');

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          onRestoreJson(parsed);
          setStatus('JSON Backup မှ ဒေတာများကို အောင်မြင်စွာ ပြန်လည်သိမ်းဆည်းပြီးပါပြီ။');
        } else {
          setStatus('ဖိုင်ဖော်မတ် မမှန်ကန်ပါ။ JSON array ဖြစ်ရပါမည်။');
        }
      } catch (err) {
        setStatus('JSON ဖိုင်ဖတ်မရပါ။ ဖိုင်မှန်ကန်မှု ရှိမရှိ စစ်ဆေးပါ။');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (confirm('သတိပြုရန်! သိမ်းဆည်းထားသော ရလဒ်မှတ်တမ်းအားလုံးကို ဖျက်ပစ်မှာ သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။')) {
      onClearAll();
      setStatus('ဒေတာမှတ်တမ်း အားလုံးကို အပြီးတိုင် ဖျက်ပစ်လိုက်ပါပြီ။');
    }
  };

  return (
    <article className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>⚙️ Settings & ဒေတာထိန်းချုပ်မှု (Data Management)</span>
        </h2>
        <span className="text-[10px] font-extrabold tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase border border-slate-200">
          STORAGE
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>သီးသန့်ကိုယ်ပိုင် ဒေတာလုံခြုံရေး:</span>
        </p>
        <p>
          ဒေတာများကို ဒီဖုန်း/ကွန်ပျူတာ၏ Browser Local Storage ထဲတွင်သာ လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။
          ဖုန်းလဲခြင်း သို့မဟုတ် Browser cache ရှင်းလင်းပါက မပျောက်ပျက်စေရန် အောက်ပါ Backup ခလုတ်ဖြင့် သိမ်းဆည်းထားနိုင်ပါသည်။
        </p>
      </div>

      {/* Storage summary statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <span className="text-[11px] font-bold text-indigo-700 block">စုစုပေါင်း မှတ်တမ်းအရေအတွက်</span>
          <span className="text-xl font-black text-indigo-900 font-mono mt-1 block">
            {records.length} ခု
          </span>
        </div>
        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
          <span className="text-[11px] font-bold text-blue-700 block">အစောဆုံး မှတ်တမ်းရက်စွဲ</span>
          <span className="text-xs font-bold text-blue-900 font-mono mt-2 block">
            {records.length > 0 ? [...records].sort((a,b)=>a.date.localeCompare(b.date))[0].date : '—'}
          </span>
        </div>
        <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
          <span className="text-[11px] font-bold text-purple-700 block">နောက်ဆုံး ရလဒ်ရက်စွဲ</span>
          <span className="text-xs font-bold text-purple-900 font-mono mt-2 block">
            {records.length > 0 ? [...records].sort((a,b)=>b.date.localeCompare(a.date))[0].date : '—'}
          </span>
        </div>
      </div>

      {/* GitHub Sync & Autobuild Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white flex-shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">🐙 GitHub Sync & Autobuild CI/CD</span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Workflows Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Git repository ကို commit ပြုလုပ်ပြီး CI autobuild & GitHub Pages workflows များကို ထည့်သွင်းထားပြီးဖြစ်ပါသည်။
            </p>
          </div>
        </div>
        {onNavigateToGitHub && (
          <button
            onClick={onNavigateToGitHub}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer flex-shrink-0 w-full sm:w-auto justify-center"
          >
            <span>GitHub Sync ဖွင့်ရန်</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Backup and Restore Controls */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Backup & Restore (အရန်သိမ်းခြင်းနှင့် ပြန်လည်ရယူခြင်း)
        </h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onBackupJson}
            className="py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>💾 JSON Backup ဒေါင်းလုဒ်လုပ်ရန်</span>
          </button>

          <label className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs">
            <Upload className="w-4 h-4" />
            <span>📂 JSON မှ ပြန်လည်သွင်းရန် (Restore)</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClear}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs transition cursor-pointer ml-auto flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>🗑️ ဒေတာအားလုံးဖျက်ရန် (Clear All)</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {status && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{status}</span>
        </div>
      )}

      {/* Notice & Disclaimer */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
        <p className="font-semibold text-slate-500 mb-1">
          ⚠️ သတိပြုရန် ရှင်းလင်းချက် (Disclaimer):
        </p>
        <p>
          2D Analysis Tool သည် ကိန်းဂဏန်းမှတ်တမ်းများနှင့် သင်္ချာနည်းကျ ပျံ့နှံ့မှုများကို လေ့လာစောင့်ကြည့်ရန်အတွက်သာ ရည်ရွယ်တည်ဆောက်ထားခြင်းဖြစ်ပါသည်။
          အတိတ်ရလဒ်များသည် အနာဂတ်တွင် ထွက်မည့်ရလဒ်ကို အာမခံခြင်းမရှိပါ။
        </p>
      </div>
    </article>
  );
};
