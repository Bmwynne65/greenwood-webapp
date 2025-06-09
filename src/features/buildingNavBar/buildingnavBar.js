
import { NavLink, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import "./buildingNavBar.css";




function BuildingNavBar({ buildingId = '' }) {
  
  // const navigate = useNavigate();

  return (
    <nav className="sub-nav">
      {/* Back arrow */}
      {/* <div
        className="sub-nav__back"
        onClick={() => navigate(-1)}
        role="button"
        aria-label="Go back"
      >
        <FaArrowLeft className="sub-nav__back-icon" />
      </div> */}

      <div
        className="sub-nav__back"
        // onClick={() => navigate(-1)}
        role="button"
        aria-label="Go back to manager page"
      >
        <NavLink
          to={`/manager`}
        >
          <FaArrowLeft className="sub-nav__back-icon" />
        </NavLink>
        
      </div>

      <ul className="sub-nav__list">
        <li className="sub-nav__item">
          <NavLink
            to={`/buildingSummary/${buildingId}`}
            className={({ isActive }) =>
              isActive ? 'sub-nav__link sub-nav__link--active' : 'sub-nav__link'
            }
          >
            Building Summary
          </NavLink>
        </li>
        <li className="sub-nav__item">
          <NavLink
            to={`/stackingPage/${buildingId}`}
            className={({ isActive }) =>
              isActive ? 'sub-nav__link sub-nav__link--active' : 'sub-nav__link'
            }
          >
            Stacking Plan
          </NavLink>
        </li>
        <li className="sub-nav__item">
          <NavLink
            to={`/tenant/${buildingId}`}
            className={({ isActive }) =>
              isActive ? 'sub-nav__link sub-nav__link--active' : 'sub-nav__link'
            }
          >
            Tenant Plan
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};


export default BuildingNavBar;
