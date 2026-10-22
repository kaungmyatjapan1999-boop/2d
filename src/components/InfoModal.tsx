import React from 'react';
import { X, Info, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 md:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 grid place-items-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                2D နှင့် Thai SET တွက်ချက်ပုံ သိကောင်းစရာ
              </h3>
              <p className="text-xs text-slate-500">
                Stock Exchange of Thailand (SET) Index အခြေခံ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula breakdown */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 space-y-2">
          <span className="text-xs font-black text-indigo-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>2D ထွက်ဂဏန်း တွက်ထုတ်နည်း စည်းမျဉ်း:</span>
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            Myanmar 2D သည် ထိုင်းနိုင်ငံစတော့အိတ်ချိန်း (Stock Exchange of Thailand - SET) ၏ တိုက်ရိုက်အချက်အလက်ကို အခြေခံတွက်ချက်ပါသည်။
          </p>
          <div className="p-3 bg-white rounded-lg border border-indigo-200/60 font-mono text-xs space-y-1">
            <div className="text-slate-600">
              ဥပမာ: SET Index = <b>1,421.7<span className="text-rose-600 font-black">2</span></b>
            </div>
            <div className="text-slate-600">
              Value (Traded) = <b>25,312.4<span className="text-blue-600 font-black">4</span></b>
            </div>
            <div className="pt-1 mt-1 border-t border-slate-100 text-indigo-800 font-black">
              → ထိပ်စည်း (Head) = SET ဒသမနောက်ဆုံးဂဏန်း = <span className="text-rose-600">2</span>
              <br />
              → နောက်ပိတ် (Tail) = Value ဒသမနောက်ဆုံးဂဏန်း = <span className="text-blue-600">4</span>
              <br />
              → ၂ လုံးရလဒ် = <span className="text-indigo-600 text-sm">24</span>
            </div>
          </div>
        </div>

        {/* Daily draw schedule */}
        <div className="space-y-2 text-xs text-slate-600">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>နေ့စဉ် ထွက်ရှိချိန် (၄) ကြိမ်:</span>
          </h4>
          <ul className="grid grid-cols-2 gap-2 font-mono">
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <b className="text-slate-800">☀️ 11:00 AM</b> - မနက်ပိုင်း
            </li>
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <b className="text-slate-800">🌤️ 12:01 PM</b> - နေ့လယ်ပိုင်း (SET 1st Half)
            </li>
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <b className="text-slate-800">🌇 3:00 PM</b> - ညနေခင်း အစောပိုင်း
            </li>
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <b className="text-slate-800">🌙 4:30 PM</b> - ညနေပိုင်း (Market Close)
            </li>
          </ul>
        </div>

        {/* Feature Highlights */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <h4 className="font-bold text-slate-800">Tool ၏ အဓိက စွမ်းဆောင်ရည်များ:</h4>
          <p>• <b>Hot & Cold:</b> အကြိမ်ရေ အများဆုံးနှင့် အထွက်နည်းသော ဂဏန်းများကို တွက်ချက်ပြသပေးခြင်း။</p>
          <p>• <b>စုံ/မ & အနိမ့်/အမြင့်:</b> ဂဏန်းများ၏ သင်္ချာပျံ့နှံ့မှု အချိုးအစားကို Donut ဖြင့် ပြသခြင်း။</p>
          <p>• <b>100 Matrix:</b> ၀၀ မှ ၉၉ အထိ အပူချိန်အရောင်ဖြင့် တစ်ကွက်ချင်း လေ့လာနိုင်ခြင်း။</p>
          <p>• <b>CSV / JSON:</b> မိမိဒေတာကို လွတ်လပ်စွာ သိမ်းဆည်း၊ ဒေါင်းလုဒ် နှင့် ပြန်သွင်းနိုင်ခြင်း။</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md"
        >
          နားလည်ပါပြီ (Close)
        </button>
      </div>
    </div>
  );
};
