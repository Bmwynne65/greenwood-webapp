import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../../features/button/Button";
import { hasRole, isActive } from "../../utils/auth";
import "./Navbar.css";

import logo from '../../images/GCRE+Logo.png'

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const navigate = useNavigate();


  // Check roles and active status
  const isAdmin = hasRole('Admin')
  const isManager = hasRole('Manager') && isActive()
  const isEmployee = hasRole('Employee')
  const active = isActive()

  // Handle menu click toggles
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  // Show button based on window size
  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
    window.addEventListener("resize", showButton);
    return () => window.addEventListener("resize", showButton);
  }, []);

  // Sign-out handler
  const handleSignOut = () => {
    document.cookie = 'authToken=; Max-Age=0; path=/;'; // Clear the authToken cookie
    navigate('/sign-in'); // Redirect to the sign-in page
    window.location.reload(); // Reload to reset state
  };

  // window.addEventListener("resize", showButton);

  console.log("user active: ", isManager)
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
            {(isAdmin || isManager) && (
              <li>
                <NavLink
                  to="/user-management"
                  className={({ isActive }) =>
                    isActive ? "nav-links active" : "nav-links"
                  }
                  onClick={closeMobileMenu}
                >
                  User Management
                </NavLink>
              </li>
            )}
            {active ? 
            (
              <li>
                <NavLink
                  to="/sign-in"
                  className={({ isActive }) =>
                    isActive ? "nav-links-mobile active" : "nav-links-mobile"
                  }
                  onClick={() => {
                    handleSignOut()
                    closeMobileMenu()
                  }}
                >
                  Sign Out
                </NavLink>
              </li>
              ) :
              (
                <li>
                  <NavLink
                    to="/sign-in"
                    className={({ isActive }) =>
                      isActive ? "nav-links-mobile active" : "nav-links-mobile"
                    }
                    onClick={
                      closeMobileMenu
                    }
                  >
                    Sign In
                  </NavLink>
                </li>
                )
            } 
          </ul>
          {
            active ? 
            (button && <Button buttonStyle="btn--outline" onClick={handleSignOut}>SIGN OUT</Button>) :
            (button &&<Button buttonStyle="btn--outline">SIGN IN</Button>) 
          }
        </div>
      </nav>
    </>
  );
}

export default Navbar;
