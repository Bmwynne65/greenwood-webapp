import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../../features/button/Button";
import "./Navbar.css";

import logo from '../../images/GCRE+Logo.png'

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener("resize", showButton);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="navbar-logo" onClick={closeMobileMenu}>
            {/* GREENWOOD */}
            {/* <i className="fab fa-typo3" /> */}
            {/* GREENWOOD
            <img
              className="img-logo"
              src="../images/GREENWOOD-LOGO-ICON.png"
              alt="logo"
            /> */}
            <img
              className="img-logo"
              src={logo}
              alt="logo"
            />
          </NavLink>
          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fa-solid fa-bars"} />
          </div>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={closeMobileMenu}
              >
                Map
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/manager"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={closeMobileMenu}
              >
                Manager
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/sign-in"
                className={({ isActive }) =>
                  isActive ? "nav-links-mobile active" : "nav-links-mobile"
                }
                onClick={closeMobileMenu}
              >
                Sign In
              </NavLink>
            </li>
          </ul>
          {button && <Button buttonStyle="btn--outline">SIGN IN</Button>}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
