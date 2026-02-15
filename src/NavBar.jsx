import { NavLink } from "react-router-dom";
import "./navbar.css";

export default function NavBar() {
  return (
    <header className="nav-root">
      <div className="nav-inner">
        <div className="nav-logo">🐰 BunnyFarmers</div>

        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/marketplace">Marketplace</NavLink>
          <NavLink to="/breeding">Breeding</NavLink>
          <NavLink to="/bpacks">bPacks</NavLink>
          <NavLink to="/referrals">Referrals</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
      </div>
    </header>
  );
}
