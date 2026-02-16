import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScenePage from './ScenePage.jsx';
import NavBar from './NavBar.jsx';
import { GameProvider } from "./game/GameProvider";

export default function App() {
  return (
    <GameProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<ScenePage pageKey="landing" />} />
        <Route path="/lab" element={<ScenePage pageKey="lab" />} />
        <Route path="/supply" element={<ScenePage pageKey="supply" />} />
        <Route path="/storage" element={<ScenePage pageKey="storage" />} />
        <Route path="/invite" element={<ScenePage pageKey="invite" />} />
        <Route path="/profile" element={<ScenePage pageKey="profile" />} />

        <Route path="*" element={<div style={{ color: 'white', padding: 20 }}>404 Not Found</div>} />
      </Routes>
    </GameProvider>
  );
}

