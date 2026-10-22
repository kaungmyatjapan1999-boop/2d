import { TwoDRecord } from '../types';
import { padZero } from './storage';

export interface WeekPeriod {
  index: number; // 4 (oldest), 3, 2, 1 (current)
  label: string; // e.g. "Week 4", "Week 3", "Week 2", "Week 1 (Current)"
  shortLabel: string; // "W4", "W3", "W2", "W1"
  startDate: string;
  endDate: string;
  records: TwoDRecord[];
  frequency: number[]; // size 100
  totalDraws: number;
}

export interface NumberShiftTrend {
  number: string;
  w4Count: number;
  w3Count: number;
  w2Count: number;
  w1Count: number;
  total4W: number;
  change: number; // w1 - w2 (or w1 - average)
  momentum: 'rising' | 'cooling' | 'steady_hot' | 'dormant' | 'spike';
  category: 'hot' | 'cold' | 'neutral';
  color: string;
}

export interface FourWeekTrendsData {
  weeks: WeekPeriod[]; // index 0 is Week 4, 1 is Week 3, 2 is Week 2, 3 is Week 1
  topHotShifts: NumberShiftTrend[];
  coldShifts: NumberShiftTrend[];
  allTrends: Record<string, NumberShiftTrend>;
  maxWeeklyCount: number;
}

const TREND_COLORS = [
  '#ff3366', // Rose / Red
  '#ff9900', // Orange
  '#00c99a', // Emerald
  '#0099ff', // Sky blue
  '#893cff', // Purple
  '#e024c3', // Pink
  '#10b981', // Green
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
];

export function computeFourWeekTrends(records: TwoDRecord[]): FourWeekTrendsData {
  // Determine reference latest date from records or today
  let refDate = new Date();
  if (records.length > 0) {
    const dates = records.map(r => r.date).sort();
    const latestStr = dates[dates.length - 1];
    const parsed = new Date(latestStr + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      refDate = parsed;
    }
  }

  // Construct 4 weeks (each 7 days)
  // Week 1 (most recent): Days 0 to 6
  // Week 2: Days 7 to 13
  // Week 3: Days 14 to 20
  // Week 4: Days 21 to 27
  const weeks: WeekPeriod[] = [];

  const getWeekRange = (startOffsetDays: number, endOffsetDays: number, index: number, label: string, shortLabel: string): WeekPeriod => {
    const endD = new Date(refDate);
    endD.setDate(endD.getDate() - startOffsetDays);

    const startD = new Date(refDate);
    startD.setDate(startD.getDate() - endOffsetDays);

    const fmt = (d: Date) => `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
    const startStr = fmt(startD);
    const endStr = fmt(endD);

    const weekRecords = records.filter(r => r.date >= startStr && r.date <= endStr);
    const frequency = Array(100).fill(0);
    weekRecords.forEach(r => {
      const n = Number(r.number);
      if (!isNaN(n) && n >= 0 && n <= 99) {
        frequency[n]++;
      }
    });

    return {
      index,
      label,
      shortLabel,
      startDate: startStr,
      endDate: endStr,
      records: weekRecords,
      frequency,
      totalDraws: weekRecords.length,
    };
  };

  const w4 = getWeekRange(21, 27, 4, 'Week 4 (3 ပတ်အလို)', 'W4');
  const w3 = getWeekRange(14, 20, 3, 'Week 3 (2 ပတ်အလို)', 'W3');
  const w2 = getWeekRange(7, 13, 2, 'Week 2 (ပြီးခဲ့သောပတ်)', 'W2');
  const w1 = getWeekRange(0, 6, 1, 'Week 1 (ယခုလက်ရှိပတ်)', 'W1 (လက်ရှိ)');

  // Chronological order: Week 4, Week 3, Week 2, Week 1
  weeks.push(w4, w3, w2, w1);

  let maxWeeklyCount = 1;

  // Build trend for all 100 numbers
  const allTrends: Record<string, NumberShiftTrend> = {};
  const list: NumberShiftTrend[] = [];

  for (let i = 0; i < 100; i++) {
    const numStr = padZero(i);
    const c4 = w4.frequency[i] || 0;
    const c3 = w3.frequency[i] || 0;
    const c2 = w2.frequency[i] || 0;
    const c1 = w1.frequency[i] || 0;
    const total4W = c4 + c3 + c2 + c1;

    if (c4 > maxWeeklyCount) maxWeeklyCount = c4;
    if (c3 > maxWeeklyCount) maxWeeklyCount = c3;
    if (c2 > maxWeeklyCount) maxWeeklyCount = c2;
    if (c1 > maxWeeklyCount) maxWeeklyCount = c1;

    const change = c1 - c2;
    let momentum: NumberShiftTrend['momentum'] = 'dormant';
    let category: NumberShiftTrend['category'] = 'neutral';

    if (total4W >= 4) {
      category = 'hot';
      if (change > 0 && c1 >= 2) momentum = 'rising';
      else if (change < 0 && c1 <= 1) momentum = 'cooling';
      else momentum = 'steady_hot';
    } else if (total4W <= 1) {
      category = 'cold';
      if (c1 > 0 && c2 === 0 && c3 === 0) momentum = 'spike';
      else momentum = 'dormant';
    } else {
      if (c1 >= 2 && c2 <= 1) momentum = 'spike';
      else if (change > 0) momentum = 'rising';
      else if (change < 0) momentum = 'cooling';
    }

    const item: NumberShiftTrend = {
      number: numStr,
      w4Count: c4,
      w3Count: c3,
      w2Count: c2,
      w1Count: c1,
      total4W,
      change,
      momentum,
      category,
      color: TREND_COLORS[i % TREND_COLORS.length],
    };

    allTrends[numStr] = item;
    list.push(item);
  }

  // Top Hot numbers across 4 weeks (sorted by total 4-week count desc)
  const topHotShifts = [...list]
    .filter(t => t.total4W > 0)
    .sort((a, b) => b.total4W - a.total4W || b.w1Count - a.w1Count)
    .slice(0, 7)
    .map((t, idx) => ({ ...t, color: TREND_COLORS[idx % TREND_COLORS.length] }));

  // Cold / Delayed numbers (sorted by lowest count desc order of coolness)
  const coldShifts = [...list]
    .sort((a, b) => a.total4W - b.total4W || a.w1Count - b.w1Count)
    .slice(0, 5)
    .map((t, idx) => ({ ...t, color: ['#00b4d8', '#0077b6', '#48cae4', '#90e0ef', '#03045e'][idx % 5] }));

  return {
    weeks,
    topHotShifts,
    coldShifts,
    allTrends,
    maxWeeklyCount: Math.max(4, maxWeeklyCount),
  };
}
