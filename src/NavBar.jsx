import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from './game/GameProvider';
import { formatCarrots } from './game/gameConfig';

const linkStyle = ({ isActive }) => ({
  padding: '8px 12px',
  borderRadius: 999,
  textDecoration: 'none',
  color: isActive ? '#0b1f22' : 'rgba(255,255,255,0.9)',
  background: isActive ? 'rgba(255,255,255,0.85)' : 'transparent',
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.2,
});

export default function NavBar() {
  const { carrots, cps } = useGame();

  return (
    <div className="nav-wrap">
      <div className="nav">
        <div className="nav-left">
          <div className="nav-brand">🐰 BunnyLab</div>
          <NavLink to="/" style={linkStyle} end>
            Landing
          </NavLink>
          <NavLink to="/lab" style={linkStyle}>
            Genetics Lab
          </NavLink>
          <NavLink to="/supply" style={linkStyle}>
            Supply Bay
          </NavLink>
          <NavLink to="/storage" style={linkStyle}>
            Storage Vault
          </NavLink>
          <NavLink to="/invite" style={linkStyle}>
            Invite Researchers
          </NavLink>
          <NavLink to="/profile" style={linkStyle}>
            Command Console
          </NavLink>
        </div>

        <div className="nav-right">
          <div className="nav-stat">
            <span className="nav-stat-label">Carrots</span>
            <span className="nav-stat-value">{formatCarrots(carrots)}</span>
          </div>
          <div className="nav-stat">
            <span className="nav-stat-label">/sec</span>
            <span className="nav-stat-value">{formatCarrots(cps)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
