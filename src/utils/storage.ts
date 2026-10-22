import { TwoDRecord, DrawTime } from '../types';
import { INITIAL_RECORDS } from '../data/seedData';

export const STORAGE_KEY = 'twoDAnalysisRecords_v3';
export const TIMES: DrawTime[] = ['11:00 AM', '12:01 PM', '3:00 PM', '4:30 PM'];

export function padZero(n: number | string): string {
  return String(n).padStart(2, '0');
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function isValidRecord(r: Partial<TwoDRecord>): boolean {
  return Boolean(
    r &&
    r.date &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
    r.time &&
    TIMES.includes(r.time as DrawTime) &&
    r.number !== undefined &&
    /^\d{2}$/.test(String(r.number).trim())
  );
}

export function loadRecordsFromStorage(): TwoDRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization with seed data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      return data.filter(isValidRecord);
    }
    return INITIAL_RECORDS;
  } catch (err) {
    console.error('Failed to load records from storage', err);
    return INITIAL_RECORDS;
  }
}

export function saveRecordsToStorage(records: TwoDRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to storage', err);
  }
}

export function sortRecords(records: TwoDRecord[], order: 'asc' | 'desc' = 'asc'): TwoDRecord[] {
  const sorted = [...records].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return TIMES.indexOf(a.time) - TIMES.indexOf(b.time);
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}
