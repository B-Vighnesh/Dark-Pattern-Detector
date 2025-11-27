import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../assets/Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleHamburger = () => setIsActive(!isActive);
  const closeMenu = () => setIsActive(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
  <img 
    src="/logo.png" 
    alt="Dark Pattern Detector Logo" 
    className="logo-image" 
  />
  <span className="logo-text">DPD</span>
</Link>


        <div
          className={`navbar__hamburger ${isActive ? 'active' : ''}`}
          onClick={toggleHamburger}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <ul className={`navbar__links ${isActive ? 'active' : ''}`}>
          <li className="navbar__item">
            <NavLink to="/" className="navbar__link" onClick={closeMenu}>
              Overview
            </NavLink>
          </li>
          <li className="navbar__item">
            <NavLink to="/features" className="navbar__link" onClick={closeMenu}>
              Features
            </NavLink>
          </li>
          <li className="navbar__item">
            <NavLink to="/download" className="navbar__link" onClick={closeMenu}>
              Download
            </NavLink>
          </li>
          <li className="navbar__item">
            <NavLink to="/team" className="navbar__link" onClick={closeMenu}>
              Team
            </NavLink>
          </li>
          <li className="navbar__item">
            <NavLink
              to="/report-issue"
              className="navbar__link report-link"
              onClick={closeMenu}
            >
              Report Issue
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
