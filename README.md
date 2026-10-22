# Myanmar 2D Analysis Tool (2D Live & Statistics) 🇲🇲📊

မြန်မာ့ ၂လုံး ထီ/စတော့ရှယ်ယာ (SET Index) ရလဒ်များ၊ ကိန်းဂဏန်းစာရင်းအင်း (Statistics)၊ Hot/Cold ဂဏန်းတွက်ချက်မှု၊ ကံစမ်းဂဏန်းထုတ်ပေးစနစ် (Lucky Generator) နှင့် အချိန်နှင့်တပြေးညီ Analysis လုပ်ဆောင်နိုင်သော ခေတ်မီ Web Dashboard ဖြစ်ပါသည်။

---

## 🚀 GitHub ဆီသို့ Sync ပြုလုပ်နည်း (How to Push to GitHub)

သင့်၏ ကိုယ်ပိုင် GitHub Repository သို့ Code များကို တင်ရန် (Push) အောက်ပါ အဆင့်များကို လုပ်ဆောင်နိုင်ပါသည်:

### ၁။ GitHub တွင် Repository အသစ်တစ်ခု တည်ဆောက်ပါ
1. [github.com](https://github.com) သို့ သွားပြီး **New repository** ကို နှိပ်ပါ။
2. Repository Name တစ်ခု ပေးပါ (ဥပမာ - `myanmar-2d-analysis`)။
3. **Public** သို့မဟုတ် **Private** ရွေးချယ်ပြီး **Create repository** ကို နှိပ်ပါ။

### ၂။ ဤစက်မှ GitHub သို့ ချိတ်ဆက်ပြီး Push လုပ်ပါ
Terminal / Command Line တွင် အောက်ပါ Command များကို အစဉ်လိုက် ရိုက်ထည့်ပါ:

```bash
# ၁။ GitHub Remote Address ချိတ်ဆက်ရန် (သင်၏ GitHub Username နှင့် Repo အမည် ပြောင်းထည့်ပါ)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# ၂။ main branch သို့ အမည်သတ်မှတ်ရန်
git branch -M main

# ၃။ Code အားလုံးကို GitHub သို့ Push လုပ်ရန်
git push -u origin main
```

*(မှတ်ချက် - အကယ်၍ Remote ရှိပြီးသားဖြစ်ပါက `git remote set-url origin <URL>` ဖြင့် ပြောင်းနိုင်ပါသည်)*

---

## ⚡ GitHub Actions Autobuild (အလိုအလျောက် Build လုပ်ဆောင်မှု)

ဤပရောဂျက်တွင် **GitHub Actions Workflows** များကို အဆင်သင့်ထည့်သွင်းပေးထားပြီး ဖြစ်ပါသည်:

1. **`.github/workflows/autobuild.yml`** (CI & Autobuild)
   - သင် GitHub သို့ `git push` ပြုလုပ်လိုက်တိုင်း သို့မဟုတ် Pull Request လုပ်တိုင်း GitHub runner ပေါ်တွင် အလိုအလျောက် `npm install`၊ `npm run lint` နှင့် `npm run build` ပြုလုပ်ပြီး Build error ရှိမရှိ စစ်ဆေးပေးပါမည်။
   - Build ပြီးထွက်လာသော `dist/` ဖိုင်များကို Actions Artifacts အဖြစ် အလိုအလျောက် သိမ်းဆည်းပေးပါသည်။

2. **`.github/workflows/deploy-pages.yml`** (GitHub Pages Auto-Deployment)
   - သင် `main` branch သို့ push တိုင်း GitHub Pages ပေါ်သို့ အခမဲ့ Website အဖြစ် အလိုအလျောက် Build လုပ်ပြီး Deploy တင်ပေးပါသည်။
   - **GitHub Pages ဖွင့်နည်း:**
     1. GitHub repository စာမျက်နှာတွင် **Settings** > **Pages** သို့ သွားပါ။
     2. **Build and deployment > Source** တွင် **GitHub Actions** ကို ရွေးချယ်ပေးလိုက်ရုံဖြင့် push တိုင်း live link ရရှိမည် ဖြစ်ပါသည်။

---

## 🛠️ Local Development & Scripts

စက်ထဲတွင် စမ်းသပ်မောင်းနှင်ရန်:

```bash
# Dependency များ install ပြုလုပ်ရန်
npm install

# Local Dev Server ဖွင့်ရန် (Port 3000)
npm run dev

# Production Build လုပ်ရန် (dist folder ထုတ်ပေးမည်)
npm run build

# TypeScript / Code Lint စစ်ဆေးရန်
npm run lint
```

---

## 🌟 အဓိက ပါဝင်သော စနစ်များ (Features)
- 📊 **Dashboard:** 12:01 PM & 4:30 PM ရလဒ်များ၊ Live Market နာရီ၊ ယနေ့ အပိတ်/အဖွင့် အချက်အလက်
- 📈 **Statistics & Analysis:** ထွက်အများဆုံး (Hot)၊ ထွက်အနည်းဆုံး (Cold)၊ ထိပ်စီး/နောက်ပိတ် အကြိမ်အရေအတွက်
- 🎯 **Probabilities & Matrix:** ၁၀၀ ကွက် Matrix ဇယား၊ မထွက်တာကြာသော အကွက်များ
- 🎲 **Lucky Number Generator:** AI/Formula အခြေပြု ကံစမ်းဂဏန်း ရွေးချယ်ပေးစနစ်
- 📅 **History Management:** သမိုင်းမှတ်တမ်း ရှာဖွေခြင်း၊ ပြင်ဆင်ခြင်း၊ CSV/JSON Export & Import
