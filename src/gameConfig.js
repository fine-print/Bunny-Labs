export const STARTER_BUNNIES = [
  {
    id: 'intern',
    name: 'Intern Bunny',
    description: 'Sweeps up cables, presses buttons, accidentally increases output.',
    baseCps: 0.2,
    unlockCost: 0,
  },
  {
    id: 'tech',
    name: 'Lab Tech Bunny',
    description: 'Runs the carrot vats on schedule. Surprisingly competent.',
    baseCps: 0.6,
    unlockCost: 25,
  },
  {
    id: 'chemist',
    name: 'Carrot Chemist',
    description: 'Optimizes flavor compounds. Output rises. Ethics remain… mostly intact.',
    baseCps: 1.5,
    unlockCost: 120,
  },
  {
    id: 'engineer',
    name: 'Yield Engineer',
    description: 'Tweaks the pipes, reorders the conveyors, and calls it science.',
    baseCps: 3.5,
    unlockCost: 450,
  },
  {
    id: 'director',
    name: 'Research Director',
    description: 'Signs off on experiments and adds three more dashboards.',
    baseCps: 8.0,
    unlockCost: 1500,
  },
];

export function formatCarrots(n) {
  if (!Number.isFinite(n)) return '0';
  if (n < 1000) return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0);
  const units = ['K', 'M', 'B', 'T'];
  let x = n;
  let u = -1;
  while (x >= 1000 && u < units.length - 1) {
    x /= 1000;
    u += 1;
  }
  return `${x.toFixed(x < 10 ? 2 : x < 100 ? 1 : 0)}${units[u]}`;
}
