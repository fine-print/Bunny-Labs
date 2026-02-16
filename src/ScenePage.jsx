import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import uiMap from './uiMap.json';
import { useGame } from './game/GameProvider';
import { STARTER_BUNNIES, formatCarrots } from './game/gameConfig';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pctRectToPx(rect, stageSize) {
  const { w, h } = stageSize;
  return {
    left: rect.x * w,
    top: rect.y * h,
    width: rect.w * w,
    height: rect.h * h,
  };
}

function OverlayCard({ stageSize, rect, title, children }) {
  const px = pctRectToPx(rect, stageSize);
  return (
    <div
      className="overlay-card"
      style={{
        left: `${px.left}px`,
        top: `${px.top}px`,
        width: `${px.width}px`,
        height: `${px.height}px`,
      }}
    >
      <div className="overlay-card-title">{title}</div>
      <div className="overlay-card-body">{children}</div>
    </div>
  );
}

function LabUI({ stageSize }) {
  const { carrots, cps, carrotSynthLevel, carrotMultiplier, buyCarrotSynthUpgrade } = useGame();

  const nextCost = Math.floor(20 * Math.pow(1.6, carrotSynthLevel));

  return (
    <OverlayCard
      stageSize={stageSize}
      rect={{ x: 0.63, y: 0.17, w: 0.32, h: 0.62 }}
      title="GENETICS LAB"
    >
      <div className="kvs">
        <div className="kv">
          <span className="k">Total Carrots</span>
          <span className="v">{formatCarrots(carrots)}</span>
        </div>
        <div className="kv">
          <span className="k">Carrots / sec</span>
          <span className="v">{formatCarrots(cps)}</span>
        </div>
        <div className="kv">
          <span className="k">Synth Multiplier</span>
          <span className="v">x{carrotMultiplier.toFixed(2)}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Carrot Synth Upgrade</div>
        <div className="muted">Increases all production by +15% per level. Slow growth on purpose.</div>
        <button
          className="btn"
          onClick={() => buyCarrotSynthUpgrade()}
          title={`Cost: ${nextCost} carrots`}
        >
          Upgrade Synth (Lv {carrotSynthLevel}) — Cost {nextCost}
        </button>
      </div>

      <div className="section">
        <div className="section-title">Faucet (Later)</div>
        <div className="muted">
          This is where server-validated claim buttons and the ledger-backed micro payout flow will live.
        </div>
        <button className="btn btn-ghost" disabled>
          Claim (Coming soon)
        </button>
      </div>
    </OverlayCard>
  );
}

function SupplyUI({ stageSize }) {
  const { carrots, unlockBunny } = useGame();

  return (
    <OverlayCard stageSize={stageSize} rect={{ x: 0.08, y: 0.18, w: 0.84, h: 0.66 }} title="SUPPLY BAY">
      <div className="muted">
        V1: lightweight store. Unlock a bunny in Storage Vault, then come back here for upgrades later.
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title">Quick Actions</div>
          <button
            className="btn"
            onClick={() => {
              // small debug-ish helper for you while building, not player-facing forever
              if (carrots < 10) {
                alert('Not enough carrots yet. Let the lab run for a bit.');
              } else {
                alert('Nice. You have carrots.');
              }
            }}
          >
            Check Inventory
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              const res = unlockBunny('tech');
              if (!res.ok) alert(res.reason);
            }}
          >
            Buy Lab Tech (shortcut)
          </button>
          <div className="muted" style={{ marginTop: 10 }}>
            (That shortcut button is just for development speed. Remove anytime.)
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Planned Shelves</div>
          <ul className="list">
            <li>Yield modules (cps multipliers)</li>
            <li>Automation chips (offline earnings later)</li>
            <li>Cosmetics (badges, lab coats, UI skins)</li>
            <li>Offerwall/ad boosts (far later, optional)</li>
          </ul>
        </div>
      </div>
    </OverlayCard>
  );
}

function StorageUI({ stageSize }) {
  const { carrots, unlocked, unlockBunny } = useGame();

  return (
    <OverlayCard stageSize={stageSize} rect={{ x: 0.06, y: 0.14, w: 0.88, h: 0.72 }} title="STORAGE VAULT">
      <div className="muted">Unlock new bunny types. Each adds a base carrots/sec contribution.</div>

      <div className="bunny-grid">
        {STARTER_BUNNIES.map((b) => {
          const isUnlocked = !!unlocked[b.id];
          const canBuy = !isUnlocked && carrots >= b.unlockCost;

          return (
            <div key={b.id} className={`bunny-card${isUnlocked ? ' unlocked' : ''}`}>
              <div className="bunny-card-top">
                <div className="bunny-name">{b.name}</div>
                <div className="bunny-cps">+{b.baseCps} cps</div>
              </div>
              <div className="bunny-desc">{b.description}</div>

              {isUnlocked ? (
                <div className="tag">Unlocked</div>
              ) : (
                <button
                  className={`btn ${canBuy ? '' : 'btn-ghost'}`}
                  onClick={() => {
                    const res = unlockBunny(b.id);
                    if (!res.ok) alert(res.reason);
                  }}
                >
                  Unlock — Cost {b.unlockCost}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </OverlayCard>
  );
}

function InviteUI({ stageSize }) {
  return (
    <OverlayCard stageSize={stageSize} rect={{ x: 0.52, y: 0.18, w: 0.42, h: 0.64 }} title="INVITE RESEARCHERS">
      <div className="muted">
        V1 referral copy (editable):
      </div>
      <div className="mono-box">
        <div style={{ marginBottom: 10 }}>
          <b>Your invite link</b>
          <div className="mono">(coming soon)</div>
        </div>
        <div>
          Invite friends to join BunnyLab. When referrals go live, successful referrals can unlock cosmetic badges
          and small in-game boosts. Real-world micro-earnings will be transparent, revenue-funded, and never framed
          as investment.
        </div>
      </div>
      <button className="btn btn-ghost" disabled>
        Copy Link (Coming soon)
      </button>
    </OverlayCard>
  );
}

function ProfileUI({ stageSize }) {
  const { hardReset } = useGame();

  return (
    <OverlayCard stageSize={stageSize} rect={{ x: 0.52, y: 0.14, w: 0.42, h: 0.74 }} title="COMMAND CONSOLE">
      <div className="muted">This page will become a credentials + stats dashboard.</div>

      <div className="kvs">
        <div className="kv">
          <span className="k">Status</span>
          <span className="v">Active</span>
        </div>
        <div className="kv">
          <span className="k">Clearance</span>
          <span className="v">Lab Visitor</span>
        </div>
        <div className="kv">
          <span className="k">Mutation Class</span>
          <span className="v">… pending</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Dev Tools</div>
        <div className="muted">For development only. Delete these buttons whenever.</div>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Hard reset your save?')) hardReset();
          }}
        >
          Hard Reset Save
        </button>
      </div>
    </OverlayCard>
  );
}

export default function ScenePage({ pageKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editMode = new URLSearchParams(location.search).get('edit') === '1';

  const pageData = uiMap[pageKey];
  if (!pageData) {
    return <div style={{ color: 'white', padding: 20 }}>Unknown pageKey: {pageKey}</div>;
  }

  // In edit mode we keep a local editable copy.
  const [hotspots, setHotspots] = useState(() => (editMode ? deepClone(pageData.hotspots) : pageData.hotspots));

  // If you switch pages, reset editable hotspots for that page
  useEffect(() => {
    setHotspots(editMode ? deepClone(pageData.hotspots) : pageData.hotspots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, editMode]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const imgRef = useRef(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  // Measure the rendered image size (that becomes our coordinate system)
  useEffect(() => {
    function measure() {
      const img = imgRef.current;
      if (!img) return;
      const rect = img.getBoundingClientRect();
      setStageSize({ w: rect.width, h: rect.height });
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pageData.background]);

  // --- Drag state ---
  const drag = useRef({
    active: false,
    idx: null,
    startMouseX: 0,
    startMouseY: 0,
    startX: 0,
    startY: 0,
  });

  function onMouseDownHotspot(e, idx) {
    if (!editMode) return;

    e.preventDefault();
    setSelectedIndex(idx);

    drag.current.active = true;
    drag.current.idx = idx;
    drag.current.startMouseX = e.clientX;
    drag.current.startMouseY = e.clientY;
    drag.current.startX = hotspots[idx].x;
    drag.current.startY = hotspots[idx].y;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (!drag.current.active || drag.current.idx == null) return;
    const idx = drag.current.idx;

    const { w: stageW, h: stageH } = stageSize;
    if (!stageW || !stageH) return;

    const dx = (e.clientX - drag.current.startMouseX) / stageW;
    const dy = (e.clientY - drag.current.startMouseY) / stageH;

    setHotspots((prev) =>
      prev.map((h, i) =>
        i === idx
          ? { ...h, x: clamp(drag.current.startX + dx, 0, 1), y: clamp(drag.current.startY + dy, 0, 1) }
          : h
      )
    );
  }

  function onMouseUp() {
    drag.current.active = false;
    drag.current.idx = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  // --- Keyboard edit: arrows nudge; +/- resize; shift = bigger step ---
  useEffect(() => {
    if (!editMode) return;

    function onKeyDown(e) {
      if (selectedIndex == null) return;
      const step = e.shiftKey ? 0.02 : 0.01;

      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_'].includes(e.key)) {
        return;
      }

      e.preventDefault();

      setHotspots((prev) =>
        prev.map((h, i) => {
          if (i !== selectedIndex) return h;

          let nx = h.x;
          let ny = h.y;
          let nw = h.w;
          let nh = h.h;

          if (e.key === 'ArrowLeft') nx = clamp(nx - step, 0, 1);
          if (e.key === 'ArrowRight') nx = clamp(nx + step, 0, 1);
          if (e.key === 'ArrowUp') ny = clamp(ny - step, 0, 1);
          if (e.key === 'ArrowDown') ny = clamp(ny + step, 0, 1);

          if (e.key === '+' || e.key === '=') {
            nw = clamp(nw + 0.01, 0.01, 1);
            nh = clamp(nh + 0.01, 0.01, 1);
          }
          if (e.key === '-' || e.key === '_') {
            nw = clamp(nw - 0.01, 0.01, 1);
            nh = clamp(nh - 0.01, 0.01, 1);
          }

          return { ...h, x: nx, y: ny, w: nw, h: nh };
        })
      );
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editMode, selectedIndex]);

  function onClickHotspot(h, idx) {
    if (editMode) {
      setSelectedIndex(idx);
    } else {
      navigate(h.to);
    }
  }

  async function copyLayout() {
    // Copy JUST the hotspots array (easy to paste back into uiMap.json)
    const text = JSON.stringify(hotspots, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied current page hotspots JSON!');
    } catch {
      alert('Clipboard failed. Copy manually from the console.');
      console.log(text);
    }
  }

  // Convert normalized x/y/w/h into pixel values relative to the rendered image
  const positionedHotspots = useMemo(() => {
    const { w: stageW, h: stageH } = stageSize;
    return hotspots.map((h) => ({
      ...h,
      pxLeft: h.x * stageW,
      pxTop: h.y * stageH,
      pxW: h.w * stageW,
      pxH: h.h * stageH,
    }));
  }, [hotspots, stageSize]);

  const selected = editMode && hotspots[selectedIndex] ? hotspots[selectedIndex] : null;

  return (
    <div className="stage">
      {/* Dynamic blurred side panels based on the current scene */}
      <div className="stage-blur stage-blur-left" style={{ backgroundImage: `url(${pageData.background})` }} />
      <div className="stage-blur stage-blur-right" style={{ backgroundImage: `url(${pageData.background})` }} />
      <div className="stage-overlay" />

      <div className="stage-frame">
        <img
          ref={imgRef}
          className="stage-bg"
          src={pageData.background}
          alt={`${pageKey} background`}
          draggable={false}
          onLoad={() => {
            const rect = imgRef.current?.getBoundingClientRect();
            if (rect) setStageSize({ w: rect.width, h: rect.height });
          }}
        />

        {/* Hotspots (used mainly for landing buttons, plus edit mode) */}
        {positionedHotspots.map((h, idx) => (
          <button
            key={h.id}
            className={`hotspot-btn${editMode && idx === selectedIndex ? ' selected' : ''}${h.img ? '' : ' hotspot-transparent'}`}
            style={{
              left: `${h.pxLeft}px`,
              top: `${h.pxTop}px`,
              width: `${h.pxW}px`,
              height: `${h.pxH}px`,
            }}
            onMouseDown={(e) => onMouseDownHotspot(e, idx)}
            onClick={() => onClickHotspot(h, idx)}
            aria-label={h.label}
            title={editMode ? h.id : h.label}
          >
            {h.img ? (
              <img
                src={h.img}
                alt={h.label}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
              />
            ) : null}
          </button>
        ))}

        {/* Page overlays */}
        {pageKey === 'lab' && <LabUI stageSize={stageSize} />}
        {pageKey === 'supply' && <SupplyUI stageSize={stageSize} />}
        {pageKey === 'storage' && <StorageUI stageSize={stageSize} />}
        {pageKey === 'invite' && <InviteUI stageSize={stageSize} />}
        {pageKey === 'profile' && <ProfileUI stageSize={stageSize} />}
      </div>

      {editMode && selected && (
        <div className="live-coords">
          page: {pageKey} &nbsp; x: {selected.x.toFixed(3)} &nbsp; y: {selected.y.toFixed(3)} &nbsp; w:{' '}
          {selected.w.toFixed(3)} &nbsp; h: {selected.h.toFixed(3)}
        </div>
      )}

      {editMode && (
        <button className="copy-btn" onClick={copyLayout}>
          Copy Layout JSON
        </button>
      )}
    </div>
  );
}
