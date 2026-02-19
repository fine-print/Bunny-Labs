import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STARTER_BUNNIES } from './gameConfig';

const STORAGE_KEY = 'bunnylab_save_v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [carrots, setCarrots] = useState(0);
  const [unlocked, setUnlocked] = useState(() => ({ intern: true }));

  // Simple v1 upgrades
  const [carrotSynthLevel, setCarrotSynthLevel] = useState(0); // global cps multiplier

  // Load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? safeParse(raw) : null;
    if (!data) return;

    if (typeof data.carrots === 'number') setCarrots(data.carrots);
    if (data.unlocked && typeof data.unlocked === 'object') setUnlocked(data.unlocked);
    if (typeof data.carrotSynthLevel === 'number') setCarrotSynthLevel(data.carrotSynthLevel);
  }, []);

  // Save (throttled)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const payload = {
        carrots,
        unlocked,
        carrotSynthLevel,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, 250);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [carrots, unlocked, carrotSynthLevel]);

  const carrotMultiplier = useMemo(() => {
    // Mild growth so it does not explode
    return 1 + carrotSynthLevel * 0.15;
  }, [carrotSynthLevel]);

  const cps = useMemo(() => {
    const base = STARTER_BUNNIES.reduce((sum, b) => (unlocked[b.id] ? sum + b.baseCps : sum), 0);
    return base * carrotMultiplier;
  }, [unlocked, carrotMultiplier]);

  // Idle tick
  const lastT = useRef(nowMs());
  useEffect(() => {
    lastT.current = nowMs();
    const id = window.setInterval(() => {
      const t = nowMs();
      const dt = Math.min(2, (t - lastT.current) / 100000); // cap to avoid huge jumps
      lastT.current = t;

      setCarrots((c) => c + cps * dt);
    }, 250);

    return () => window.clearInterval(id);
  }, [cps]);

  function canAfford(cost) {
    return carrots >= cost;
  }

  function spend(cost) {
    setCarrots((c) => c - cost);
  }

  function unlockBunny(bunnyId) {
    const b = STARTER_BUNNIES.find((x) => x.id === bunnyId);
    if (!b) return { ok: false, reason: 'Unknown bunny.' };
    if (unlocked[bunnyId]) return { ok: false, reason: 'Already unlocked.' };
    if (!canAfford(b.unlockCost)) return { ok: false, reason: 'Not enough carrots.' };

    spend(b.unlockCost);
    setUnlocked((u) => ({ ...u, [bunnyId]: true }));
    return { ok: true };
  }

  function buyCarrotSynthUpgrade() {
    const cost = Math.floor(20 * Math.pow(1.6, carrotSynthLevel));
    if (!canAfford(cost)) return { ok: false, reason: 'Not enough carrots.' };

    spend(cost);
    setCarrotSynthLevel((n) => n + 1);
    return { ok: true };
  }

  function addCarrots(amount) {
    if (!Number.isFinite(amount)) return;
    setCarrots((c) => c + Math.max(0, amount));
  }

  function hardReset() {
    localStorage.removeItem(STORAGE_KEY);
    setCarrots(0);
    setUnlocked({ intern: true });
    setCarrotSynthLevel(0);
  }

  const value = {
    carrots,
    cps,
    unlocked,
    carrotSynthLevel,
    carrotMultiplier,
    unlockBunny,
    buyCarrotSynthUpgrade,
    addCarrots,
    hardReset,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within <GameProvider>.');
  }
  return ctx;
}
