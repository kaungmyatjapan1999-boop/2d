/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TwoDRecord, DrawTime, ActiveTab } from './types';
import {
  loadRecordsFromStorage,
  saveRecordsToStorage,
  isValidRecord,
  sortRecords,
  padZero,
} from './utils/storage';
import { computeAnalysis } from './utils/analysis';
import { INITIAL_RECORDS } from './data/seedData';

import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { AnalysisView } from './components/AnalysisView';
import { ProbabilitiesView } from './components/ProbabilitiesView';
import { LuckyGeneratorView } from './components/LuckyGeneratorView';
import { TrendsView } from './components/TrendsView';
import { MatrixView } from './components/MatrixView';
import { AutoFetchView } from './components/AutoFetchView';
import { HistoryView } from './components/HistoryView';
import { DataEntryView } from './components/DataEntryView';
import { SettingsView } from './components/SettingsView';
import { GitHubSyncView } from './components/GitHubSyncView';
import { InfoModal } from './components/InfoModal';

export default function App() {
  const [records, setRecords] = useState<TwoDRecord[]>(() => loadRecordsFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [apiStatus, setApiStatus] = useState<string>('Local Mode');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [preselectedNumber, setPreselectedNumber] = useState<string>('');

  // Persist records to localStorage whenever they change
  useEffect(() => {
    saveRecordsToStorage(records);
  }, [records]);

  // Compute analytics memoized
  const summary = useMemo(() => computeAnalysis(records), [records]);

  // Add a single record
  const handleAddRecord = useCallback(
    (date: string, time: DrawTime, number: string, source: 'Manual' | 'API' | 'CSV' | 'Preset' = 'Manual') => {
      const cleanNum = String(number).trim().padStart(2, '0');

      if (!isValidRecord({ date, time, number: cleanNum })) {
        return { success: false, message: 'ရက်စွဲ၊ အချိန် သို့မဟုတ် ဂဏန်း မမှန်ကန်ပါ။' };
      }

      const existingIndex = records.findIndex(r => r.date === date && r.time === time);

      if (existingIndex >= 0) {
        if (records[existingIndex].number === cleanNum) {
          return { success: false, message: 'ဤရက်စွဲနှင့် အချိန်အတွက် ရလဒ် ရှိပြီးသား ဖြစ်ပါသည်။' };
        }

        const confirmReplace = window.confirm(
          `${date} ${time} တွင် ရလဒ် (${records[existingIndex].number}) ရှိပြီးသား ဖြစ်နေပါသည်။ (${cleanNum}) ဖြင့် အစားထိုးလိုပါသလား?`
        );

        if (!confirmReplace) {
          return { success: false, message: 'အစားထိုးခြင်းကို ပယ်ဖျက်လိုက်ပါသည်။' };
        }

        const updated = [...records];
        updated[existingIndex] = { date, time, number: cleanNum, source };
        setRecords(updated);
        return { success: true, message: 'ရှိပြီးသား ရလဒ်ကို အောင်မြင်စွာ အစားထိုး သိမ်းဆည်းပြီးပါပြီ။' };
      }

      setRecords(prev => [...prev, { date, time, number: cleanNum, source }]);
      return { success: true, message: `ရလဒ် (${cleanNum}) ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။` };
    },
    [records]
  );

  // Bulk records import from API or external
  const handleRecordsImported = useCallback(
    (newRecords: TwoDRecord[], defaultSource: string = 'API') => {
      let added = 0;
      let replaced = 0;
      let skipped = 0;

      setRecords(prev => {
        const next = [...prev];
        for (const item of newRecords) {
          if (!isValidRecord(item)) {
            skipped++;
            continue;
          }
          const cleanNum = String(item.number).trim().padStart(2, '0');
          const existingIdx = next.findIndex(r => r.date === item.date && r.time === item.time);

          if (existingIdx >= 0) {
            if (next[existingIdx].number !== cleanNum) {
              next[existingIdx] = {
                ...next[existingIdx],
                ...item,
                number: cleanNum,
                source: (item.source || defaultSource) as any,
              };
              replaced++;
            } else {
              skipped++;
            }
          } else {
            next.push({
              ...item,
              number: cleanNum,
              source: (item.source || defaultSource) as any,
            });
            added++;
          }
        }
        return next;
      });

      return { added, replaced, skipped };
    },
    []
  );

  // Delete a record
  const handleDeleteRecord = useCallback((date: string, time: DrawTime) => {
    setRecords(prev => prev.filter(r => !(r.date === date && r.time === time)));
  }, []);

  // Edit a record
  const handleEditRecord = useCallback((oldRecord: TwoDRecord, updatedRecord: TwoDRecord) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.date === oldRecord.date && r.time === oldRecord.time);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRecord;
        return next;
      }
      return prev;
    });
  }, []);

  // CSV Import parser
  const handleImportCsv = useCallback(
    (content: string) => {
      const cleanContent = content.replace(/^\uFEFF/, '');
      const lines = cleanContent.split(/\r?\n/).filter(Boolean);
      let added = 0;
      let skipped = 0;

      const newItems: TwoDRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]
          .split(',')
          .map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        if (cols.length < 3) {
          skipped++;
          continue;
        }

        const [date, timeStr, number] = cols;
        const cleanNum = String(number).trim().padStart(2, '0');
        const drawTime = timeStr as DrawTime;

        if (isValidRecord({ date, time: drawTime, number: cleanNum })) {
          newItems.push({
            date,
            time: drawTime,
            number: cleanNum,
            source: 'CSV',
          });
        } else {
          skipped++;
        }
      }

      const res = handleRecordsImported(newItems, 'CSV');
      return { added: res.added + res.replaced, skipped: res.skipped + skipped };
    },
    [handleRecordsImported]
  );

  // Download helper
  const downloadFile = (name: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // CSV Export
  const handleExportCsv = useCallback(() => {
    const sorted = sortRecords(records, 'asc');
    const rows = [
      ['draw_date', 'draw_time', 'number', 'source'],
      ...sorted.map(r => [r.date, r.time, r.number, r.source || 'Manual']),
    ];

    const csvContent =
      '\ufeff' +
      rows
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    downloadFile('2d-history.csv', csvContent, 'text/csv;charset=utf-8');
  }, [records]);

  // JSON Backup
  const handleBackupJson = useCallback(() => {
    downloadFile(
      '2d-backup.json',
      JSON.stringify(records, null, 2),
      'application/json'
    );
  }, [records]);

  // JSON Restore
  const handleRestoreJson = useCallback((jsonData: TwoDRecord[]) => {
    const valid = jsonData.filter(isValidRecord);
    setRecords(valid);
  }, []);

  // Clear all data
  const handleClearAll = useCallback(() => {
    setRecords([]);
  }, []);

  // Reset seed sample data
  const handleResetSeedData = useCallback(() => {
    setRecords(INITIAL_RECORDS);
  }, []);

  // Navigate to Data Entry with prefilled number
  const handleSelectNumberForEntry = (num: string) => {
    setPreselectedNumber(num);
    setActiveTab('entry');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-[#edf5ff] to-[#fff5fa] text-[#172554] flex flex-col">
      {/* Header */}
      <Header
        apiStatus={apiStatus}
        isLiveConnected={isLiveConnected}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenGitHub={() => setActiveTab('github')}
      />

      {/* Main Container */}
      <main className="w-full max-w-[1100px] mx-auto px-3.5 sm:px-4 py-4 flex-1 pb-24 md:pb-12">
        {/* Dashboard 4 Stat Cards */}
        <StatsBar summary={summary} />

        {/* Tab Navigation */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          recordCount={records.length}
        />

        {/* Tab Contents */}
        <div className="mt-4 transition-all">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              records={records}
              onNavigateTab={setActiveTab}
              onSelectNumberForDetail={handleSelectNumberForEntry}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisView
              summary={summary}
              onSelectNumber={handleSelectNumberForEntry}
            />
          )}

          {activeTab === 'probabilities' && (
            <ProbabilitiesView
              records={records}
              onSelectNumberForEntry={handleSelectNumberForEntry}
            />
          )}

          {activeTab === 'lucky' && (
            <LuckyGeneratorView
              records={records}
              onSelectNumberForEntry={handleSelectNumberForEntry}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsView
              records={records}
              onSelectNumberForEntry={handleSelectNumberForEntry}
            />
          )}

          {activeTab === 'matrix' && (
            <MatrixView
              frequency={summary.frequency}
              records={records}
              onSelectNumberForEntry={handleSelectNumberForEntry}
            />
          )}

          {activeTab === 'autofetch' && (
            <AutoFetchView
              onRecordsImported={handleRecordsImported}
              onStatusUpdate={(status, isLive) => {
                setApiStatus(status);
                setIsLiveConnected(isLive);
              }}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onEditRecord={handleEditRecord}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'entry' && (
            <DataEntryView
              onAddRecord={handleAddRecord}
              onImportCsv={handleImportCsv}
              onExportCsv={handleExportCsv}
              onResetSeedData={handleResetSeedData}
              initialSelectedNumber={preselectedNumber}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              records={records}
              onBackupJson={handleBackupJson}
              onRestoreJson={handleRestoreJson}
              onClearAll={handleClearAll}
              onNavigateToGitHub={() => setActiveTab('github')}
            />
          )}

          {activeTab === 'github' && (
            <GitHubSyncView />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4 text-[#8591b1] text-xs leading-relaxed border-t border-slate-200/60 bg-white/40 mt-auto">
        <div className="max-w-[1100px] mx-auto space-y-1">
          <p className="font-semibold text-slate-600">
            2D Analysis Tool • Mobile Friendly Dashboard & Analytical Platform
          </p>
          <p className="text-[11px] text-slate-400">
            အတိတ်ရလဒ်များသည် အနာဂတ်ရလဒ်ကို အာမမခံပါ။ Analysis သည် မှတ်တမ်းအချက်အလက်ကိုသာ ဖော်ပြပါသည်။
          </p>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
