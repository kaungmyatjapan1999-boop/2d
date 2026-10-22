import { TwoDRecord } from '../types';
import { sortRecords, padZero } from './storage';

export interface NumberProbability {
  number: string;
  rank: number;
  probability: number; // percentage, e.g. 2.85 (meaning 2.85%)
  relativeRatio: number; // probability / 1.00% (baseline)
  score: number; // 0 to 100 composite index
  currentGap: number; // draws since last appeared
  meanInterval: number; // average draws between appearances
  overdueRatio: number; // currentGap / meanInterval
  wmaScore: number; // Weighted Moving Average frequency score
  recurrenceFactor: number; // 0 to 1 recurrence timing factor
  status: 'highly_due' | 'due_soon' | 'hot_momentum' | 'normal' | 'recent';
  lastSeenDate?: string;
  lastSeenTime?: string;
}

export interface ProbabilityAnalysisResult {
  totalDraws: number;
  topProbabilities: NumberProbability[];
  allProbabilities: NumberProbability[];
  meanProbability: number; // 1.00%
  highestProbability: NumberProbability;
  lowestProbability: NumberProbability;
  highProbabilityCount: number; // numbers with > 1.5%
  overdueCount: number; // numbers with currentGap >= meanInterval
  headProbabilities: { digit: number; probability: number }[]; // 0 to 9
  tailProbabilities: { digit: number; probability: number }[]; // 0 to 9
  parityProbabilities: { even: number; odd: number };
  lowHighProbabilities: { low: number; high: number };
}

export function computeNextDrawProbabilities(records: TwoDRecord[]): ProbabilityAnalysisResult {
  const ordered = sortRecords(records, 'asc');
  const totalDraws = ordered.length;

  // If no records, return uniform distribution (1% for each)
  if (totalDraws === 0) {
    const uniform = Array.from({ length: 100 }, (_, i) => {
      const numStr = padZero(i);
      return {
        number: numStr,
        rank: i + 1,
        probability: 1.0,
        relativeRatio: 1.0,
        score: 50,
        currentGap: 0,
        meanInterval: 100,
        overdueRatio: 0,
        wmaScore: 1,
        recurrenceFactor: 0.5,
        status: 'normal' as const,
      };
    });

    return {
      totalDraws: 0,
      topProbabilities: uniform.slice(0, 10),
      allProbabilities: uniform,
      meanProbability: 1.0,
      highestProbability: uniform[0],
      lowestProbability: uniform[99],
      highProbabilityCount: 0,
      overdueCount: 0,
      headProbabilities: Array.from({ length: 10 }, (_, d) => ({ digit: d, probability: 10.0 })),
      tailProbabilities: Array.from({ length: 10 }, (_, d) => ({ digit: d, probability: 10.0 })),
      parityProbabilities: { even: 50.0, odd: 50.0 },
      lowHighProbabilities: { low: 50.0, high: 50.0 },
    };
  }

  // 1. Calculate occurrence indices and gaps for each number (00 to 99)
  const occurrences: Record<number, { indices: number[]; records: TwoDRecord[] }> = {};
  for (let i = 0; i < 100; i++) {
    occurrences[i] = { indices: [], records: [] };
  }

  ordered.forEach((rec, idx) => {
    const n = Number(rec.number);
    if (!isNaN(n) && n >= 0 && n <= 99) {
      occurrences[n].indices.push(idx);
      occurrences[n].records.push(rec);
    }
  });

  // 2. Compute Recurrence Intervals
  const recurrenceData: {
    meanInterval: number;
    currentGap: number;
    overdueRatio: number;
    recurrenceFactor: number;
    lastRecord?: TwoDRecord;
  }[] = [];

  for (let n = 0; n < 100; n++) {
    const list = occurrences[n].indices;
    const count = list.length;
    let meanInterval = 100; // default baseline interval
    let currentGap = totalDraws;
    let lastRecord: TwoDRecord | undefined;

    if (count > 0) {
      const lastIndex = list[list.length - 1];
      currentGap = totalDraws - 1 - lastIndex;
      lastRecord = occurrences[n].records[count - 1];

      if (count === 1) {
        // Only one occurrence: estimate interval using totalDraws
        meanInterval = totalDraws;
      } else {
        // Average diff between occurrences
        let diffSum = 0;
        for (let i = 1; i < count; i++) {
          diffSum += list[i] - list[i - 1];
        }
        meanInterval = Math.max(1, diffSum / (count - 1));
      }
    } else {
      meanInterval = totalDraws + 10;
      currentGap = totalDraws;
    }

    const overdueRatio = currentGap / Math.max(1, meanInterval);

    // Hazard recurrence timing factor:
    // Follows Weibull probability curve: as gap approaches/exceeds meanInterval, probability increases
    // S-curve centered around overdueRatio = 1.0
    const recurrenceFactor = 1 / (1 + Math.exp(-2.5 * (overdueRatio - 1.0)));

    recurrenceData.push({
      meanInterval,
      currentGap,
      overdueRatio,
      recurrenceFactor,
      lastRecord,
    });
  }

  // 3. Compute Weighted Moving Average (WMA)
  // Divide timeline into exponential or tiered weights:
  // Recent 20 draws get 3.0x weight, next 20 get 2.0x, older get 1.0x
  const wmaCounts = Array(100).fill(0);
  let totalWmaWeight = 0;

  ordered.forEach((rec, idx) => {
    const n = Number(rec.number);
    if (isNaN(n) || n < 0 || n > 99) return;

    const age = totalDraws - 1 - idx; // 0 for most recent draw
    let weight = 1.0;
    if (age < 15) {
      weight = 3.5;
    } else if (age < 35) {
      weight = 2.0;
    } else {
      weight = 1.0;
    }

    wmaCounts[n] += weight;
    totalWmaWeight += weight;
  });

  const normalizedWma = wmaCounts.map(count =>
    totalWmaWeight > 0 ? count / totalWmaWeight : 0.01
  );

  // 4. Combine into Joint Probability Score
  // P(n) = alpha * WMA + beta * RecurrenceFactor + gamma * UniformBaseline
  const rawScores: number[] = [];
  const alpha = 0.48; // Recent frequency momentum
  const beta = 0.42; // Overdue recurrence interval
  const gamma = 0.10; // Uniform baseline guarantee

  const maxRecurrenceFactor = Math.max(0.01, ...recurrenceData.map(r => r.recurrenceFactor));

  for (let n = 0; n < 100; n++) {
    const wmaNorm = normalizedWma[n];
    const recNorm = recurrenceData[n].recurrenceFactor / (maxRecurrenceFactor * 100);
    const uniformNorm = 0.01;

    // Composite raw score
    const score = alpha * wmaNorm + beta * recNorm + gamma * uniformNorm;
    rawScores.push(Math.max(0.0001, score));
  }

  // Normalize so sum equals 100%
  const sumRaw = rawScores.reduce((acc, v) => acc + v, 0);
  const normalizedProbabilities = rawScores.map(score => (score / sumRaw) * 100);

  // 5. Build full probability list and determine statuses
  const results: NumberProbability[] = [];

  for (let n = 0; n < 100; n++) {
    const prob = normalizedProbabilities[n];
    const rec = recurrenceData[n];
    const numStr = padZero(n);

    let status: NumberProbability['status'] = 'normal';
    if (rec.currentGap <= 1) {
      status = 'recent';
    } else if (rec.overdueRatio >= 1.4) {
      status = 'highly_due';
    } else if (rec.overdueRatio >= 1.0) {
      status = 'due_soon';
    } else if (prob > 1.6) {
      status = 'hot_momentum';
    }

    // Relative ratio to random uniform 1.00%
    const relativeRatio = prob / 1.0;

    // Composite score 0 - 100
    const compositeScore = Math.min(99, Math.max(10, Math.round(prob * 32)));

    results.push({
      number: numStr,
      rank: 0,
      probability: Number(prob.toFixed(2)),
      relativeRatio: Number(relativeRatio.toFixed(2)),
      score: compositeScore,
      currentGap: rec.currentGap,
      meanInterval: Number(rec.meanInterval.toFixed(1)),
      overdueRatio: Number(rec.overdueRatio.toFixed(2)),
      wmaScore: Number((normalizedWma[n] * 100).toFixed(2)),
      recurrenceFactor: Number(rec.recurrenceFactor.toFixed(2)),
      status,
      lastSeenDate: rec.lastRecord?.date,
      lastSeenTime: rec.lastRecord?.time,
    });
  }

  // Sort descending by calculated probability
  results.sort((a, b) => b.probability - a.probability || a.currentGap - b.currentGap);

  // Assign ranks
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  const topProbabilities = results.slice(0, 10);
  const highestProbability = results[0];
  const lowestProbability = results[results.length - 1];

  const highProbabilityCount = results.filter(r => r.probability >= 1.5).length;
  const overdueCount = results.filter(r => r.currentGap >= r.meanInterval).length;

  // Head and Tail digit aggregated probabilities
  const headTotals = Array(10).fill(0);
  const tailTotals = Array(10).fill(0);
  let evenTotal = 0;
  let lowTotal = 0;

  results.forEach(item => {
    const h = Number(item.number[0]);
    const t = Number(item.number[1]);
    const numVal = Number(item.number);

    headTotals[h] += item.probability;
    tailTotals[t] += item.probability;

    if (numVal % 2 === 0) evenTotal += item.probability;
    if (numVal < 50) lowTotal += item.probability;
  });

  const headProbabilities = headTotals.map((prob, digit) => ({
    digit,
    probability: Number(prob.toFixed(1)),
  }));

  const tailProbabilities = tailTotals.map((prob, digit) => ({
    digit,
    probability: Number(prob.toFixed(1)),
  }));

  return {
    totalDraws,
    topProbabilities,
    allProbabilities: results,
    meanProbability: 1.0,
    highestProbability,
    lowestProbability,
    highProbabilityCount,
    overdueCount,
    headProbabilities,
    tailProbabilities,
    parityProbabilities: {
      even: Number(evenTotal.toFixed(1)),
      odd: Number((100 - evenTotal).toFixed(1)),
    },
    lowHighProbabilities: {
      low: Number(lowTotal.toFixed(1)),
      high: Number((100 - lowTotal).toFixed(1)),
    },
  };
}
