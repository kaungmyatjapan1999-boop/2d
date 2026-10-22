import React, { useState, useMemo } from 'react';
import { TwoDRecord, DrawTime } from '../types';
import { BookOpen, Search, Filter, Trash2, Edit2, RotateCcw, Download, X, Check } from 'lucide-react';
import { TIMES } from '../utils/storage';

interface HistoryViewProps {
  records: TwoDRecord[];
  onDeleteRecord: (date: string, time: DrawTime) => void;
  onEditRecord: (oldRecord: TwoDRecord, updatedRecord: TwoDRecord) => void;
  onExportCsv: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onDeleteRecord,
  onEditRecord,
  onExportCsv,
}) => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterTime, setFilterTime] = useState<string>('');
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Edit record modal state
  const [editingRecord, setEditingRecord] = useState<TwoDRecord | null>(null);
  const [editNumber, setEditNumber] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<DrawTime>('11:00 AM');

  // Filter and sort records (descending date)
  const filteredRecords = useMemo(() => {
    return [...records]
      .filter((r) => {
        if (filterDate && r.date !== filterDate) return false;
        if (filterTime && r.time !== filterTime) return false;
        if (searchNumber && !r.number.includes(searchNumber)) return false;
        return true;
      })
      .sort((a, b) => {
        const d = b.date.localeCompare(a.date);
        if (d !== 0) return d;
        return TIMES.indexOf(b.time) - TIMES.indexOf(a.time);
      });
  }, [records, filterDate, filterTime, searchNumber]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startEdit = (rec: TwoDRecord) => {
    setEditingRecord(rec);
    setEditDate(rec.date);
    setEditTime(rec.time);
    setEditNumber(rec.number);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!/^\d{2}$/.test(editNumber.trim())) {
      alert('ဂဏန်းသည် ၂ လုံးဂဏန်း (00–99) ဖြစ်ရပါမည်။');
      return;
    }

    onEditRecord(editingRecord, {
      ...editingRecord,
      date: editDate,
      time: editTime,
      number: editNumber.trim(),
    });

    setEditingRecord(null);
  };

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterTime('');
    setSearchNumber('');
    setCurrentPage(1);
  };

  return (
    <article className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_6px_23px_rgba(38,61,128,0.05)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-extrabold text-slate-800">
            ရလဒ်မှတ်တမ်းဇယား (History Logs)
          </h2>
          <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 font-mono">
            {filteredRecords.length} RECORDS
          </span>
        </div>

        <button
          onClick={onExportCsv}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV Export</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">
            ရက်စွဲဖြင့် ရှာရန်
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50/50 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">
            အချိန်ပိုင်းဖြင့် ရှာရန်
          </label>
          <select
            value={filterTime}
            onChange={(e) => {
              setFilterTime(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50/50 focus:border-indigo-600 focus:outline-none cursor-pointer"
          >
            <option value="">အချိန်အားလုံး (All Times)</option>
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">
            ဂဏန်းဖြင့် ရှာရန်
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={2}
              value={searchNumber}
              onChange={(e) => {
                setSearchNumber(e.target.value.replace(/\D/g, ''));
                setCurrentPage(1);
              }}
              placeholder="00-99"
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50/50 focus:border-indigo-600 focus:outline-none font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ရှင်းလင်း (Clear)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3">ရက်စွဲ (Date)</th>
              <th className="py-2.5 px-3">အချိန် (Time)</th>
              <th className="py-2.5 px-3 text-center">ဂဏန်း (Number)</th>
              <th className="py-2.5 px-3">အမျိုးအစား (Source)</th>
              <th className="py-2.5 px-3 text-right">လုပ်ဆောင်ချက် (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((r, idx) => {
                const isEven = Number(r.number) % 2 === 0;
                return (
                  <tr key={`${r.date}-${r.time}-${idx}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {r.time}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-black text-sm tracking-widest shadow-xs">
                        {r.number}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {r.source || 'Manual'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => startEdit(r)}
                        className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>ပြင်</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${r.date} ${r.time} ရလဒ် (${r.number}) ကို ဖျက်မှာ သေချာပါသလား?`)) {
                            onDeleteRecord(r.date, r.time);
                          }
                        }}
                        className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ဖျက်</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  ရှာဖွေမှုနှင့် ကိုက်ညီသော မှတ်တမ်း မတွေ့ရှိပါ။
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
          <span>
            စာမျက်နှာ {currentPage} / {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">
                မှတ်တမ်း ပြင်ဆင်ရန်
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  ရက်စွဲ (Date)
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  အချိန်ပိုင်း (Time)
                </label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value as DrawTime)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-600 focus:outline-none cursor-pointer"
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  ၂ လုံးဂဏန်း (00–99)
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-center text-xl font-black font-mono text-indigo-700 bg-indigo-50/30 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:opacity-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>သိမ်းဆည်းမည်</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                >
                  ပယ်ဖျက်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-500 font-medium">
        မှတ်တမ်းများကို သင့် Browser ၏ Local Storage ထဲတွင် လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။ ဒေတာများ မပျောက်ပျက်စေရန် CSV Export ဖြင့် Backup ပြုလုပ်ထားနိုင်ပါသည်။
      </p>
    </article>
  );
};
