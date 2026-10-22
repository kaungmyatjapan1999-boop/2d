export type DrawTime = '11:00 AM' | '12:01 PM' | '3:00 PM' | '4:30 PM';

export interface TwoDRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  time: DrawTime;
  number: string; // 2 digits: "00" to "99"
  source?: 'Manual' | 'API' | 'CSV' | 'Preset';
  setIndex?: string;
  value?: string;
}

export interface LuckyPreset {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  strategy: 'statistical_wma' | 'astrology' | 'dream_seed' | 'balanced';
  targetDrawTime?: DrawTime;
  numbers: string[]; // array of 2-digit numbers
  notes?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'analysis'
  | 'probabilities'
  | 'trends'
  | 'matrix'
  | 'lucky'
  | 'autofetch'
  | 'history'
  | 'entry'
  | 'settings'
  | 'github';
