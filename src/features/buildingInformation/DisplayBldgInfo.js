import React, { useState, useEffect, useMemo } from "react";
import { useHasRole, useIsActive } from "../../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DisplayBldgInfo.css";

const currencyFormatter = new Intl.NumberFormat("en-US");



// Renders a circular progress chart, with `percentage` 0–100
const CircularChart = ({ percentage, colorClass }) => {
  const dash = `${percentage}, 100`;
  return (
    <svg viewBox="0 0 36 36" className={`circular-chart ${colorClass}`}>
      <path
        className="circle-bg"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="circle"
        strokeDasharray={dash}
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.35" className="percentage">
        {`${percentage}%`}
      </text>
    </svg>
  );
};

const columns = [
  { key: "address",       label: "Address",          sortable: true  },
  { key: "subMarket",     label: "Sub Market",       sortable: true  },
  { key: "yoc",           label: "YOC",              sortable: true  },
  { key: "currentOwner",  label: "Current Owner",    sortable: false },
  { key: "previousOwner", label: "Previous Owner",   sortable: false },
  { key: "leaseRate",     label: "Lease Rate",       sortable: true  },
  { key: "vacancyRate",   label: "Vacancy Rate",     sortable: true },
  { key: "lsf",           label: "Last Sold For",    sortable: true  },
  { key: "on",            label: "On",               sortable: false },
];

const DisplayBldgInfo = () => {
  const navigate = useNavigate();
  const active   = useIsActive();
  const isEmployee = useHasRole("Employee") && active;

  // State
  const [allBuildings, setAllBuildings] = useState(null);
  const [search,       setSearch]       = useState("");
  const [subMarket,    setSubMarket]    = useState("");
  const [sortColumn,   setSortColumn]   = useState(null);
  const [sortOrder,    setSortOrder]    = useState("asc");

  // Fetch once on mount
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URI}/buildings`, { withCredentials: true })
      .then(res => setAllBuildings(res.data))
      .catch(err => { console.error(err); setAllBuildings([]); });
  }, []);

  // Sorting handler
  const handleSort = column => {
    if (sortColumn === column) {
      setSortOrder(o => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Clear filters and sort
  const handleClear = () => {
    setSearch("");
    setSubMarket("");
    setSortColumn(null);
    setSortOrder("asc");
  };

  // Delete building (client-side update)
  const handleDelete = id => {
    if (window.confirm("Delete this building?")) {
      axios
        .delete(`${process.env.REACT_APP_URI}/buildings/${id}`, { withCredentials: true })
        .then(() => setAllBuildings(prev => prev.filter(b => b._id !== id)))
        .catch(console.error);
    }
  };

  // Filtered + sorted data
  const buildings = useMemo(() => {
    if (!allBuildings) return null;
    let data = allBuildings;

    if (search) {
      data = data.filter(b =>
        b.address.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (subMarket) {
      data = data.filter(b => b.subMarket === subMarket);
    }
    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const rawA = a[sortColumn] ?? "";
        const rawB = b[sortColumn] ?? "";
      
        // Try to turn them into floats
        const numA = parseFloat(rawA) || 0;
        const numB = parseFloat(rawB) || 0;
      
        // If both really are numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }
      
        // Fallback to string compare
        if (rawA < rawB) return sortOrder === "asc" ? -1 : 1;
        if (rawA > rawB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [allBuildings, search, subMarket, sortColumn, sortOrder]);

  if (buildings === null) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Building Manager</h2>
      <div className="table">
        <div className="filter-container">
          <div className="search-container">
            <div className="left-side-btns">
              <input
                className="search-input"
                type="text"
                placeholder="Search by address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="dropdown">
                <button className="dropbtn">Sub-markets</button>
                <div className="dropdown-content">
                  {["", "DTC", "Centennial", "Greenwood Village"].map(m => (
                    <button
                      key={m}
                      className="subMarket-filter-btn"
                      onClick={() => setSubMarket(m)}
                    >
                      {m || "All"}
                    </button>
                  ))}
                </div>
              </div>
              <button className="clearbtn" onClick={handleClear}>
                Clear
              </button>
            </div>
            {isEmployee && (
              <div className="button-nav-container">
                <Link className="btn-add link-dec" to="/add">
                  Add +
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                {columns.map(({ key, label, sortable }) => (
                  <th
                    key={key}
                    onClick={sortable ? () => handleSort(key) : undefined}
                  >
                    {label}
                    {sortable && sortColumn === key &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </th>
                ))}
                {isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {buildings.map(b => (
                <tr key={b._id} onDoubleClick={() => navigate(`/tenant/${b._id}`)}>
                  <td>{b.address}</td>
                  <td>{b.subMarket}</td>
                  <td>{b.yoc || "UNK"}</td>
                  <td>{b.currentOwner || "N/A"}</td>
                  <td>{b.previousOwner || "N/A"}</td>
                  <td>{b.leaseRate ? `$${b.leaseRate}/SF` : "UNK"}</td>
                  <td className="dbi-td dbi-td-vacancy">
                    {b.vacancyRate != null ? (
                      <CircularChart
                        percentage={b.vacancyRate}
                        colorClass={
                          b.vacancyRate < 30
                            ? "green"
                            : b.vacancyRate < 70
                            ? "orange"
                            : "blue"
                        }
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {b.lsf
                      ? `$${currencyFormatter.format(b.lsf)}`
                      : "UNK"
                    }
                  </td>
                  <td>{b.on}</td>
                  {isEmployee && (
                    <td>
                      <div className="btn-layout">
                        <button className="btn-del" onClick={() => handleDelete(b._id)}>
                          Delete
                        </button>
                        <Link className="btn-upd" to={`/edit/${b._id}`}>
                          Edit
                        </Link>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisplayBldgInfo;
