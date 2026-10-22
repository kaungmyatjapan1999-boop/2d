import { TwoDRecord, DrawTime } from '../types';
import { padZero, TIMES, sortRecords } from './storage';

export interface AnalysisSummary {
  total: number;
  lastRecord: TwoDRecord | null;
  amCount: number;
  pmCount: number;
  frequency: number[]; // size 100
  hotNumbers: { number: string; count: number }[];
  coldNumbers: { number: string; count: number }[];
  top10: { number: string; count: number; percentage: number }[];
  evenCount: number;
  oddCount: number;
  heads: number[]; // 0 to 9
  tails: number[]; // 0 to 9
  lowCount: number; // 00 - 49
  highCount: number; // 50 - 99
  last7Days: { date: string; draws: TwoDRecord[] }[];
  pairPatterns: { pair: string; count: number }[];
  latestSlots: { time: DrawTime; record: TwoDRecord | null }[];
}

export function computeAnalysis(records: TwoDRecord[]): AnalysisSummary {
  const total = records.length;
  const orderedAsc = sortRecords(records, 'asc');
  const lastRecord = orderedAsc.length > 0 ? orderedAsc[orderedAsc.length - 1] : null;

  const amCount = records.filter(r => r.time === '11:00 AM').length;
  const pmCount = records.filter(r => r.time !== '11:00 AM').length;

  const frequency = Array(100).fill(0);
  records.forEach(r => {
    const n = Number(r.number);
    if (!isNaN(n) && n >= 0 && n <= 99) {
      frequency[n]++;
    }
  });

  const nonzero = Array.from({ length: 100 }, (_, n) => n)
    .filter(n => frequency[n] > 0)
    .sort((a, b) => frequency[b] - frequency[a] || a - b);

  const hotNumbers = nonzero.slice(0, 5).map(n => ({
    number: padZero(n),
    count: frequency[n],
  }));

  const coldNumbers = Array.from({ length: 100 }, (_, n) => n)
    .sort((a, b) => frequency[a] - frequency[b] || a - b)
    .slice(0, 5)
    .map(n => ({
      number: padZero(n),
      count: frequency[n],
    }));

  const top10 = nonzero.slice(0, 10).map(n => ({
    number: padZero(n),
    count: frequency[n],
    percentage: total > 0 ? (frequency[n] / total) * 100 : 0,
  }));

  const evenCount = records.filter(r => Number(r.number) % 2 === 0).length;
  const oddCount = total - evenCount;

  const heads = Array(10).fill(0);
  const tails = Array(10).fill(0);

  records.forEach(r => {
    const numStr = String(r.number).padStart(2, '0');
    const h = Number(numStr[0]);
    const t = Number(numStr[1]);
    if (!isNaN(h) && h >= 0 && h <= 9) heads[h]++;
    if (!isNaN(t) && t >= 0 && t <= 9) tails[t]++;
  });

  const lowCount = records.filter(r => Number(r.number) < 50).length;
  const highCount = total - lowCount;

  // Last 7 days
  const last7Days: { date: string; draws: TwoDRecord[] }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
    const dayRecords = sortRecords(records.filter(r => r.date === dateStr), 'asc');
    last7Days.push({
      date: dateStr,
      draws: dayRecords,
    });
  }

  // Pair pattern transitions: e.g. "84 → 12"
  const pairMap: Record<string, number> = {};
  for (let i = 1; i < orderedAsc.length; i++) {
    const key = `${orderedAsc[i - 1].number} → ${orderedAsc[i].number}`;
    pairMap[key] = (pairMap[key] || 0) + 1;
  }
  const pairPatterns = Object.entries(pairMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pair, count]) => ({ pair, count }));

  // Latest slots
  const latestSlots = TIMES.map(time => {
    const slotRecords = orderedAsc.filter(r => r.time === time);
    return {
      time,
      record: slotRecords.length > 0 ? slotRecords[slotRecords.length - 1] : null,
    };
  });

  return {
    total,
    lastRecord,
    amCount,
    pmCount,
    frequency,
    hotNumbers,
    coldNumbers,
    top10,
    evenCount,
    oddCount,
    heads,
    tails,
    lowCount,
    highCount,
    last7Days,
    pairPatterns,
    latestSlots,
  };
}
