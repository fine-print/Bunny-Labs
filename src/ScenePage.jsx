import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import uiMap from "./uiMap.json";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default function ScenePage({ pageKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editMode = new URLSearchParams(location.search).get("edit") === "1";

  const pageData = uiMap[pageKey];
  if (!pageData) {
    return <div style={{ color: "white", padding: 20 }}>Unknown pageKey: {pageKey}</div>;
  }

  // In edit mode we keep a local editable copy.
  const [hotspots, setHotspots] = useState(() =>
    editMode ? deepClone(pageData.hotspots) : pageData.hotspots
  );

  // If you switch pages, reset editable hotspots for that page
  useEffect(() => {
    setHotspots(editMode ? deepClone(pageData.hotspots) : pageData.hotspots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, editMode]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const stageRef = useRef(null); // wrapper sized to the rendered image
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
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pageData.background]);

  // --- Drag state ---
  const drag = useRef({
    active: false,
    idx: null,
    startMouseX: 0,
    startMouseY: 0,
    startX: 0,
    startY: 0
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

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  // --- Keyboard edit: arrows nudge; +/- resize; shift = bigger step ---
  useEffect(() => {
    if (!editMode) return;

    function onKeyDown(e) {
      if (selectedIndex == null) return;
      const step = e.shiftKey ? 0.02 : 0.01;

      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_"].includes(e.key)) {
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

          if (e.key === "ArrowLeft") nx = clamp(nx - step, 0, 1);
          if (e.key === "ArrowRight") nx = clamp(nx + step, 0, 1);
          if (e.key === "ArrowUp") ny = clamp(ny - step, 0, 1);
          if (e.key === "ArrowDown") ny = clamp(ny + step, 0, 1);

          if (e.key === "+" || e.key === "=") {
            nw = clamp(nw + 0.01, 0.01, 1);
            nh = clamp(nh + 0.01, 0.01, 1);
          }
          if (e.key === "-" || e.key === "_") {
            nw = clamp(nw - 0.01, 0.01, 1);
            nh = clamp(nh - 0.01, 0.01, 1);
          }

          return { ...h, x: nx, y: ny, w: nw, h: nh };
        })
      );
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
      alert("Copied current page hotspots JSON!");
    } catch {
      alert("Clipboard failed. Copy manually from the console.");
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
      pxH: h.h * stageH
    }));
  }, [hotspots, stageSize]);

  const selected = editMode && hotspots[selectedIndex] ? hotspots[selectedIndex] : null;

    return (
    <div className="stage">
      <div className="stage-overlay" />

      <div className="stage-frame" ref={stageRef}>
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

        {positionedHotspots.map((h, idx) => (
          <button
            key={h.id}
            className={`hotspot-btn${editMode && idx === selectedIndex ? " selected" : ""}`}
            style={{
              left: `${h.pxLeft}px`,
              top: `${h.pxTop}px`,
              width: `${h.pxW}px`,
              height: `${h.pxH}px`
            }}
            onMouseDown={(e) => onMouseDownHotspot(e, idx)}
            onClick={() => onClickHotspot(h, idx)}
          >
            <img
              src={h.img}
              alt={h.label}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
            />
          </button>
        ))}
      </div>

      {editMode && selected && (
        <div className="live-coords">
          page: {pageKey} &nbsp;
          x: {selected.x.toFixed(3)} &nbsp;
          y: {selected.y.toFixed(3)} &nbsp;
          w: {selected.w.toFixed(3)} &nbsp;
          h: {selected.h.toFixed(3)}
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
