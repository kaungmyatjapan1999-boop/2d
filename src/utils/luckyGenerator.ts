import { TwoDRecord, LuckyPreset } from '../types';
import { computeNextDrawProbabilities } from './probabilityEngine';
import { padZero } from './storage';

export const LUCKY_PRESETS_STORAGE_KEY = 'twoDLuckyPresets_v1';

// Deterministic PRNG: Mulberry32
export function createMulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string keyword (e.g. dream word) into a numeric seed
export function hashStringToSeed(str: string): number {
  let hash = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return hash >>> 0;
}

export interface GeneratedLuckyNumber {
  number: string;
  probability: number;
  historyCount: number;
  parity: 'even' | 'odd';
  category: 'low' | 'high';
  head: number;
  tail: number;
  tags: string[];
}

// Generate lucky numbers based on selected strategy
export function generateLuckyNumbers(
  records: TwoDRecord[],
  strategy: LuckyPreset['strategy'],
  count: number = 5,
  seedWord: string = '',
  randomSeedOffset: number = Date.now()
): GeneratedLuckyNumber[] {
  const probData = computeNextDrawProbabilities(records);
  const probMap = new Map<string, number>();
  probData.allProbabilities.forEach(p => probMap.set(p.number, p.probability));

  // Frequency map
  const freqMap = new Map<string, number>();
  for (let i = 0; i < 100; i++) {
    freqMap.set(padZero(i), 0);
  }
  records.forEach(r => {
    const n = String(r.number).trim().padStart(2, '0');
    freqMap.set(n, (freqMap.get(n) || 0) + 1);
  });

  const selectedNumbers: Set<string> = new Set();
  const seed = seedWord.trim() ? hashStringToSeed(seedWord) : randomSeedOffset;
  const prng = createMulberry32(seed);

  if (strategy === 'statistical_wma') {
    // Weighted roulette wheel sampling from probabilityEngine
    const candidates = [...probData.allProbabilities];
    let safetyLoop = 0;

    while (selectedNumbers.size < count && safetyLoop < 500) {
      safetyLoop++;
      // Weighted random pick
      const roll = prng() * 100;
      let cumulative = 0;
      for (const item of candidates) {
        cumulative += item.probability;
        if (roll <= cumulative) {
          selectedNumbers.add(item.number);
          break;
        }
      }
    }
  } else if (strategy === 'astrology') {
    // Myanmar Day Astrology Table
    // Day numbers: Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6, Sat=7
    const todayDay = new Date().getDay(); // 0 = Sunday, 1 = Monday...
    const dayPlanetDigits: Record<number, number[]> = {
      0: [1, 6, 8], // တနင်္ဂနွေ (1)
      1: [2, 7, 4], // တနင်္လာ (2)
      2: [3, 8, 5], // အင်္ဂါ (3)
      3: [4, 9, 2], // ဗုဒ္ဓဟူး (4)
      4: [5, 0, 7], // ကြာသပတေး (5)
      5: [6, 1, 3], // သောကြာ (6)
      6: [7, 2, 0], // စနေ (7)
    };

    const compatibleDigits = dayPlanetDigits[todayDay] || [1, 2, 3, 4, 5];
    const pairs: string[] = [];

    // Generate head-tail combinations from auspicious digits
    for (const h of compatibleDigits) {
      for (let t = 0; t <= 9; t++) {
        pairs.push(`${h}${t}`);
      }
    }

    // Shuffle using prng
    const shuffled = [...pairs].sort(() => prng() - 0.5);
    for (const num of shuffled) {
      if (selectedNumbers.size >= count) break;
      selectedNumbers.add(num);
    }
  } else if (strategy === 'dream_seed') {
    // Pseudo-random generation from dream keyword
    let safety = 0;
    while (selectedNumbers.size < count && safety < 300) {
      safety++;
      const val = Math.floor(prng() * 100);
      selectedNumbers.add(padZero(val));
    }
  } else {
    // Balanced: Alternate Even/Odd and Low/High
    let needEven = true;
    let needLow = true;
    let safety = 0;

    while (selectedNumbers.size < count && safety < 500) {
      safety++;
      const val = Math.floor(prng() * 100);
      const isEven = val % 2 === 0;
      const isLow = val < 50;

      if (isEven === needEven && isLow === needLow) {
        selectedNumbers.add(padZero(val));
        needEven = !needEven;
        needLow = !needLow;
      }
    }
  }

  // Fallback if set size < count
  let fillSafety = 0;
  while (selectedNumbers.size < count && fillSafety < 100) {
    fillSafety++;
    const r = Math.floor(prng() * 100);
    selectedNumbers.add(padZero(r));
  }

  // Construct structured result list
  return Array.from(selectedNumbers).map(numStr => {
    const val = Number(numStr);
    const prob = probMap.get(numStr) || 1.0;
    const historyCount = freqMap.get(numStr) || 0;
    const parity = val % 2 === 0 ? 'even' : 'odd';
    const category = val < 50 ? 'low' : 'high';
    const head = Number(numStr[0]);
    const tail = Number(numStr[1]);

    const tags: string[] = [];
    if (prob > 1.6) tags.push('🔥 High Probability');
    if (historyCount >= 5) tags.push('⭐ Frequent');
    if (parity === 'even') tags.push('စုံဂဏန်း');
    else tags.push('မဂဏန်း');
    if (category === 'low') tags.push('အနိမ့် (00-49)');
    else tags.push('အမြင့် (50-99)');

    return {
      number: numStr,
      probability: prob,
      historyCount,
      parity,
      category,
      head,
      tail,
      tags,
    };
  });
}

// Preset storage helpers
export function loadPresetsFromStorage(): LuckyPreset[] {
  try {
    const raw = localStorage.getItem(LUCKY_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load lucky presets', err);
    return [];
  }
}

export function savePresetsToStorage(presets: LuckyPreset[]): void {
  try {
    localStorage.setItem(LUCKY_PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save lucky presets', err);
  }
}
