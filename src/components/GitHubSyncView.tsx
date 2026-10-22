import React, { useState } from 'react';
import {
  GitBranch,
  Github,
  Check,
  Copy,
  Terminal,
  Zap,
  Globe,
  FileCode,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GitHubSyncView: React.FC = () => {
  const [username, setUsername] = useState<string>('kaungmyatjapan1999-boop');
  const [repoName, setRepoName] = useState<string>('2d');
  const [authType, setAuthType] = useState<'https' | 'ssh'>('https');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'autobuild' | 'pages'>('autobuild');

  const remoteUrl =
    authType === 'https'
      ? `https://github.com/${username || 'username'}/${repoName || 'repo'}.git`
      : `git@github.com:${username || 'username'}/${repoName || 'repo'}.git`;

  const pushCommand = `git remote add origin ${remoteUrl}
git branch -M main
git push -u origin main`;

  const updateRemoteCommand = `git remote set-url origin ${remoteUrl}
git push -u origin main`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const autobuildYaml = `name: CI & Autobuild

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

concurrency:
  group: ` + '${{ github.workflow }}-${{ github.ref }}' + `
  cancel-in-progress: true

jobs:
  build:
    name: Build & Verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist-build-output
          path: dist/`;

  const pagesYaml = `name: Autobuild & Deploy to GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ` + '${{ steps.deployment.outputs.page_url }}' + `
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white shadow-inner">
              <Github className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
                  GitHub Sync & Autobuild Dashboard
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Ready to Sync
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-0.5">
                GitHub Repository သို့ ချိတ်ဆက်ပြီး Push တိုင်းတွင် အလိုအလျောက် Compile & Build (CI/CD) စနစ် ထည့်သွင်းထားပြီးပါပြီ။
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 font-mono flex items-center gap-1.5 text-indigo-200">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>branch: <strong>main</strong></span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Committed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Setup Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>၁။ GitHub Repository ချိတ်ဆက်ပြီး Code တင်ရန် (Push Command Generator)</span>
          </h4>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase border border-indigo-200">
            Automated CLI
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GitHub Username / Org:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="e.g. kye77877"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Repository Name:
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value.trim())}
              placeholder="e.g. myanmar-2d-analysis"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Protocol:
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => setAuthType('https')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  authType === 'https'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                HTTPS (လွယ်ကူ)
              </button>
              <button
                type="button"
                onClick={() => setAuthType('ssh')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  authType === 'ssh'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                SSH Key
              </button>
            </div>
          </div>
        </div>

        {/* Command Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Terminal တွင် Run ရမည့် Command များ:</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Target: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">{remoteUrl}</code>
            </span>
          </div>

          <div className="relative group">
            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
              {pushCommand}
            </pre>
            <button
              onClick={() => handleCopy(pushCommand, 'main-push')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {copiedId === 'main-push' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* If remote already exists */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-700">သတိပြုရန်:</span> အကယ်၍ Terminal တွင် <code>fatal: remote origin already exists</code> ဟု ပြပါက:
          </div>
          <button
            onClick={() => handleCopy(updateRemoteCommand, 'remote-set-url')}
            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            {copiedId === 'remote-set-url' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy "set-url" Command</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Autobuild Features & Workflows */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>၂။ GitHub Actions Autobuild စနစ်များ (Configured Workflows)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              အောက်ပါ YAML ဖိုင် ၂ ခုကို repository ထဲတွင် အသင့်ထည့်သွင်းပေးထားပြီးဖြစ်ပါသည်။
            </p>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveWorkflowTab('autobuild')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeWorkflowTab === 'autobuild'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>.github/workflows/autobuild.yml (CI Build)</span>
          </button>
          <button
            onClick={() => setActiveWorkflowTab('pages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeWorkflowTab === 'pages'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>.github/workflows/deploy-pages.yml (GitHub Pages Live)</span>
          </button>
        </div>

        {/* Workflow Details */}
        {activeWorkflowTab === 'autobuild' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Trigger Events:</span>
                <span className="text-slate-600 font-mono mt-0.5 block">push to main, pull_request, manual</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Build Pipeline:</span>
                <span className="text-slate-600 font-mono mt-0.5 block">node v20, lint, vite build</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Output Artifacts:</span>
                <span className="text-emerald-700 font-semibold mt-0.5 block">dist/ zip download (14 days)</span>
              </div>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {autobuildYaml}
              </pre>
              <button
                onClick={() => handleCopy(autobuildYaml, 'autobuild-yaml')}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedId === 'autobuild-yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy YAML</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Deploy Trigger:</span>
                <span className="text-slate-600 font-mono mt-0.5 block">push to main branch</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Target Host:</span>
                <span className="text-indigo-700 font-bold mt-0.5 block">Free GitHub Pages</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Live URL Format:</span>
                <span className="text-slate-600 font-mono text-[10px] mt-0.5 block break-all">
                  https://{username || 'username'}.github.io/{repoName || 'repo'}/
                </span>
              </div>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {pagesYaml}
              </pre>
              <button
                onClick={() => handleCopy(pagesYaml, 'pages-yaml')}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedId === 'pages-yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy YAML</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step by step Guide in Burmese */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-4">
        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>၃။ အဆင့်ဆင့် လုပ်ဆောင်နည်း လမ်းညွှန် (Step-by-Step Guide)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
              <span>အဆင့် (၁)</span> <ArrowRight className="w-3 h-3" /> GitHub Repo ဖန်တီးခြင်း
            </span>
            <p className="text-slate-600 leading-relaxed">
              GitHub.com တွင် Login ဝင်ပြီး <strong>New repository</strong> ကို နှိပ်ပါ။ Repo Name ရေးပြီး <strong>Create repository</strong> ကို နှိပ်ပါ (Initialize with README မရွေးပါနှင့်)။
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
              <span>အဆင့် (၂)</span> <ArrowRight className="w-3 h-3" /> Terminal မှ Push တင်ခြင်း
            </span>
            <p className="text-slate-600 leading-relaxed">
              အပေါ်က Command များကို ကူးယူပြီး Terminal တွင် Run ပါ။ Password တောင်းပါက GitHub <strong>Personal Access Token (classic)</strong> ကို Password အဖြစ် ထည့်သွင်းပေးပါ။
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
              <span>အဆင့် (၃)</span> <ArrowRight className="w-3 h-3" /> Autobuild စစ်ဆေးခြင်း
            </span>
            <p className="text-slate-600 leading-relaxed">
              Push ပြီးသည်နှင့် GitHub repository စာမျက်နှာရှိ <strong>Actions</strong> tab သို့ သွားပါ။ CI & Autobuild အလိုအလျောက် စတင် run နေသည်ကို အစိမ်းရောင် အမှတ်အသားဖြင့် မြင်တွေ့ရပါမည်။
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
              <span>အဆင့် (၄)</span> <ArrowRight className="w-3 h-3" /> GitHub Pages ဖွင့်လှစ်ခြင်း
            </span>
            <p className="text-slate-600 leading-relaxed">
              Repository ရှိ <strong>Settings &gt; Pages</strong> သို့ သွားပြီး <strong>Source</strong> တွင် <strong>GitHub Actions</strong> ကို ရွေးချယ်ပေးပါက အလိုအလျောက် Live Website လွှင့်ပေးပါမည်။
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
