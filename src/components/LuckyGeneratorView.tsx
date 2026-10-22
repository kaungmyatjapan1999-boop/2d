import React, { useState, useEffect, useMemo } from 'react';
import { TwoDRecord, DrawTime, LuckyPreset } from '../types';
import {
  generateLuckyNumbers,
  GeneratedLuckyNumber,
  loadPresetsFromStorage,
  savePresetsToStorage,
} from '../utils/luckyGenerator';
import { TIMES } from '../utils/storage';
import {
  Dices,
  Sparkles,
  Save,
  Trash2,
  Bookmark,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ArrowRight,
  TrendingUp,
  RotateCw,
  FolderPlus,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyGeneratorViewProps {
  records: TwoDRecord[];
  onSelectNumberForEntry: (num: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const LuckyGeneratorView: React.FC<LuckyGeneratorViewProps> = ({
  records,
  onSelectNumberForEntry,
  onNavigateTab,
}) => {
  const [strategy, setStrategy] = useState<LuckyPreset['strategy']>('statistical_wma');
  const [count, setCount] = useState<number>(5);
  const [dreamKeyword, setDreamKeyword] = useState<string>('');
  const [targetTime, setTargetTime] = useState<DrawTime>('4:30 PM');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<GeneratedLuckyNumber[]>([]);
  const [selectedNumbersForPreset, setSelectedNumbersForPreset] = useState<string[]>([]);
  const [presetName, setPresetName] = useState<string>('');
  const [presetNotes, setPresetNotes] = useState<string>('');
  const [presets, setPresets] = useState<LuckyPreset[]>(() => loadPresetsFromStorage());
  const [analyzingPreset, setAnalyzingPreset] = useState<LuckyPreset | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Initial generation on first mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setStatusMessage('');

    setTimeout(() => {
      const results = generateLuckyNumbers(
        records,
        strategy,
        count,
        dreamKeyword,
        Date.now()
      );
      setGeneratedNumbers(results);
      setSelectedNumbersForPreset(results.map(r => r.number));
      setIsGenerating(false);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 300);
  };

  const toggleSelectNumber = (numStr: string) => {
    setSelectedNumbersForPreset(prev =>
      prev.includes(numStr) ? prev.filter(n => n !== numStr) : [...prev, numStr]
    );
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNumbersForPreset.length === 0) {
      alert('အနည်းဆုံး ဂဏန်း ၁ လုံး ရွေးချယ်ပေးပါ။');
      return;
    }

    const name = presetName.trim() || `Lucky Preset (${targetTime})`;
    const newPreset: LuckyPreset = {
      id: 'preset_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      strategy,
      targetDrawTime: targetTime,
      numbers: [...selectedNumbersForPreset],
      notes: presetNotes.trim(),
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    savePresetsToStorage(updated);

    setPresetName('');
    setPresetNotes('');
    setStatusMessage(`Preset "${name}" ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။`);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  const handleDeletePreset = (id: string) => {
    if (confirm('ဤ Preset ကို ဖျက်ပစ်မှာ သေချာပါသလား?')) {
      const updated = presets.filter(p => p.id !== id);
      setPresets(updated);
      savePresetsToStorage(updated);
      if (analyzingPreset?.id === id) setAnalyzingPreset(null);
    }
  };

  // Preset Analysis Metrics
  const presetAnalysisMetrics = useMemo(() => {
    if (!analyzingPreset) return null;
    const nums = analyzingPreset.numbers;

    // Check hit count in user records
    let hitCount = 0;
    records.forEach(r => {
      if (nums.includes(r.number)) hitCount++;
    });

    let evenCount = 0;
    let lowCount = 0;
    nums.forEach(n => {
      const val = Number(n);
      if (val % 2 === 0) evenCount++;
      if (val < 50) lowCount++;
    });

    return {
      totalNumbers: nums.length,
      hitCount,
      evenCount,
      oddCount: nums.length - evenCount,
      lowCount,
      highCount: nums.length - lowCount,
    };
  }, [analyzingPreset, records]);

  return (
    <article className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white grid place-items-center shadow-xs">
              <Dices className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-800">
              🎲 ကံထူးဂဏန်း ထုတ်ပေးစနစ် (Lucky Generator & Presets)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pseudo-Random စနစ်များနှင့် သမားရိုးကျ အလေးပေးတွက်ချက်မှုများဖြင့် လာမည့် Draw အတွက် အကြံပြုဂဏန်းများ ရယူပြီး Preset အဖြစ် သိမ်းဆည်းလေ့လာနိုင်ပါသည်။
          </p>
        </div>

        <span className="text-[10px] font-extrabold tracking-wider bg-amber-50 text-amber-700 px-3 py-1 rounded-full uppercase border border-amber-200 self-start sm:self-auto flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> LUCKY ALGORITHM
        </span>
      </div>

      {/* Generator Configuration Card */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>ထုတ်ယူလိုသော နည်းစနစ် ရွေးချယ်ရန် (Generation Strategy)</span>
        </h3>

        {/* Strategy Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setStrategy('statistical_wma')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              strategy === 'statistical_wma'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-200 shadow-xs'
                : 'bg-white/70 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div>
              <b className="text-xs text-slate-800 block">📊 စာရင်းအင်း အလေးပေး</b>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                WMA & Recurrence အလေးပေး Weighted Random
              </span>
            </div>
            <span className="text-[9px] text-indigo-600 font-bold mt-2">
              (Recommended)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStrategy('astrology')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              strategy === 'astrology'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-200 shadow-xs'
                : 'bg-white/70 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div>
              <b className="text-xs text-slate-800 block">🔮 နက္ခတ် / နေ့နံ ဂဏန်း</b>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ယနေ့နေ့နံ ဂြိုဟ်အလိုက် ဓာတ်တည့်တွဲစပ်မှု
              </span>
            </div>
            <span className="text-[9px] text-purple-600 font-bold mt-2">
              Auspicious Astrological
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStrategy('dream_seed')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              strategy === 'dream_seed'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-200 shadow-xs'
                : 'bg-white/70 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div>
              <b className="text-xs text-slate-800 block">✨ အိပ်မက် / ကံထူးစကားလုံး</b>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Keyword Seed ဖြင့် PRNG ထုတ်ယူမှု
              </span>
            </div>
            <span className="text-[9px] text-rose-600 font-bold mt-2">
              Deterministic Seeded
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStrategy('balanced')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              strategy === 'balanced'
                ? 'bg-white border-indigo-600 ring-2 ring-indigo-200 shadow-xs'
                : 'bg-white/70 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div>
              <b className="text-xs text-slate-800 block">⚖️ စုံ/မ • နိမ့်/မြင့် မျှခြေ</b>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Odd/Even & High/Low မျှတစွာ စီစဉ်ပေးခြင်း
              </span>
            </div>
            <span className="text-[9px] text-emerald-600 font-bold mt-2">
              Balanced Distribution
            </span>
          </button>
        </div>

        {/* Dynamic Controls based on strategy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {strategy === 'dream_seed' ? (
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                အိပ်မက် / နိမိတ်စကားလုံး (Dream Seed)
              </label>
              <input
                type="text"
                value={dreamKeyword}
                onChange={(e) => setDreamKeyword(e.target.value)}
                placeholder="ဥပမာ- ရွှေငါး၊ ကားတိုက်၊ မြွေကြီး..."
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          ) : (
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ရည်ရွယ်သော အချိန်ပိုင်း (Target Draw)
              </label>
              <select
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value as DrawTime)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:border-indigo-600 focus:outline-none cursor-pointer"
              >
                {TIMES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ထုတ်ယူမည့် ဂဏန်းအရေအတွက်
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 10].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer font-mono ${
                    count === n
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {n} လုံး
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'ထုတ်ယူနေပါသည်…' : '🎲 ကံထူးဂဏန်း ထုတ်ယူမည်'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Lucky Numbers Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>လတ်တလော ထွက်ရှိထားသော ကံထူးဂဏန်းများ ({generatedNumbers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Preset တွင် ထည့်လိုသော ဂဏန်းများကို အမှန်ခြစ် ရွေးချယ်နိုင်ပါသည်
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {generatedNumbers.map((item) => {
            const isSelected = selectedNumbersForPreset.includes(item.number);
            return (
              <div
                key={item.number}
                onClick={() => toggleSelectNumber(item.number)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-50/90 to-white border-indigo-400 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                }`}
              >
                {/* Select Checkbox badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">
                    {item.probability}%
                  </span>
                </div>

                {/* Big Lucky Number Ball */}
                <div className="text-center my-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-[#1685ff] to-[#7438ef] text-white font-mono font-black text-2xl grid place-items-center shadow-md group-hover:scale-105 transition-transform">
                    {item.number}
                  </div>
                </div>

                {/* Number Metadata & Tags */}
                <div className="space-y-1 text-center">
                  <div className="text-[11px] font-bold text-slate-700">
                    အတိတ်တွင် {item.historyCount} ကြိမ် ထွက်ဖူး
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500 font-semibold flex-wrap">
                    <span>{item.parity === 'even' ? 'စုံ' : 'မ'}</span>
                    <span>•</span>
                    <span>{item.category === 'low' ? 'နိမ့်' : 'မြင့်'}</span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNumberForEntry(item.number);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                  >
                    စာရင်းသွင်းရန် →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save to Presets Form */}
      <form
        onSubmit={handleSavePreset}
        className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              ရွေးချယ်ထားသော ({selectedNumbersForPreset.length}) လုံးကို Preset အဖြစ် သိမ်းဆည်းရန်
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700">
            [{selectedNumbersForPreset.join(', ') || 'မရှိသေး'}]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
              Preset အမည်
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder={`ဥပမာ- ${targetTime} အထူးကံထူးအတွဲ`}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50/50 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
              မှတ်စု (Notes - Optional)
            </label>
            <input
              type="text"
              value={presetNotes}
              onChange={(e) => setPresetNotes(e.target.value)}
              placeholder="ဥပမာ- မနက်ပိုင်း အိပ်မက်အရ..."
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50/50 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={selectedNumbersForPreset.length === 0}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Preset အဖြစ် သိမ်းဆည်းမည် (Save)</span>
            </button>
          </div>
        </div>
      </form>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Saved Presets Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-indigo-600" />
            <span>သိမ်းဆည်းထားသော Presets များ ({presets.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            လေ့လာလိုသော Preset ကို နှိပ်၍ သုံးသပ်နိုင်ပါသည်
          </span>
        </div>

        {presets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((preset) => {
              return (
                <div
                  key={preset.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs transition space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs">
                        {preset.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(preset.createdAt).toLocaleDateString()} • {preset.targetDrawTime || 'All Times'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer transition"
                      title="ဖျက်မည်"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Numbers Pills in Preset */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {preset.numbers.map((num) => (
                      <span
                        key={num}
                        onClick={() => onSelectNumberForEntry(num)}
                        className="py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono font-black text-xs border border-indigo-200 cursor-pointer transition"
                        title="ဒီဂဏန်းဖြင့် စာရင်းသွင်းရန်"
                      >
                        {num}
                      </span>
                    ))}
                  </div>

                  {preset.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      "{preset.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setAnalyzingPreset(preset)}
                      className="py-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] cursor-pointer transition flex items-center gap-1"
                    >
                      <span>📊 ခွဲခြမ်းစိတ်ဖြာရန်</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('matrix')}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 font-bold cursor-pointer"
                    >
                      ၁၀၀ ကွက်ဇယားတွင် ကြည့်ရန် →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            သိမ်းဆည်းထားသော Preset မရှိသေးပါ။ အထက်ပါ ကံထူးဂဏန်းများကို ထုတ်ယူပြီး Preset အဖြစ် သိမ်းဆည်းနိုင်ပါသည်။
          </div>
        )}
      </div>

      {/* Preset Analysis Modal / Drawer */}
      {analyzingPreset && presetAnalysisMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Preset သုံးသပ်ချက်: {analyzingPreset.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ဂဏန်း {analyzingPreset.numbers.length} လုံး ပါဝင်ပါသည်
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAnalyzingPreset(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Included Numbers */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">
                ပါဝင်သော ဂဏန်းများ:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {analyzingPreset.numbers.map(n => (
                  <span
                    key={n}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono font-black text-sm grid place-items-center shadow-xs"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Analysis Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-slate-600 block text-[11px]">အတိတ်မှတ်တမ်းတွင် ထွက်ခဲ့ဖူးမှု</span>
                <span className="font-mono font-black text-emerald-800 text-xl block mt-1">
                  {presetAnalysisMetrics.hitCount} ကြိမ်
                </span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-slate-600 block text-[11px]">စုံ / မ အချိုး</span>
                <span className="font-mono font-black text-purple-800 text-base block mt-1.5">
                  စုံ: {presetAnalysisMetrics.evenCount} | မ: {presetAnalysisMetrics.oddCount}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>အနိမ့် (00-49) / အမြင့် (50-99):</span>
                <b className="font-mono">
                  {presetAnalysisMetrics.lowCount} လုံး / {presetAnalysisMetrics.highCount} လုံး
                </b>
              </div>
              <div className="flex justify-between">
                <span>ပစ်မှတ်ချိန်:</span>
                <b className="font-mono text-indigo-700">{analyzingPreset.targetDrawTime || 'All Times'}</b>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('entry');
                  setAnalyzingPreset(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:opacity-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <span>စာရင်းသွင်းရန် စာမျက်နှာသို့ သွားမည်</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAnalyzingPreset(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
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
