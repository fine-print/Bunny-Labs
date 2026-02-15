import React from "react";
import { Routes, Route } from "react-router-dom";
import ScenePage from "./ScenePage.jsx";
import NavBar from "./NavBar";


export default function App() {
  return (
    <>
	  <NavBar />
      <Routes>
        {/* Main pages driven by uiMap.json */}
        <Route path="/" element={<ScenePage pageKey="landing" />} />
        <Route path="/marketplace" element={<ScenePage pageKey="marketplace" />} />

        {/* Placeholders for now (we'll build these scenes next) */}
        <Route path="/referrals" element={<ScenePage pageKey="referrals" />} />
        <Route path="/breeding" element={<ScenePage pageKey="breeding" />} />
        <Route path="/bpacks" element={<ScenePage pageKey="bpacks" />} />
        <Route path="/profile" element={<ScenePage pageKey="profile" />} />

        {/* Fallback */}
        <Route path="*" element={<div style={{ color: "white", padding: 20 }}>404 Not Found</div>} />
      </Routes>
	</>
  );
}
