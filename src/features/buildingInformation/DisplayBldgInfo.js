import React, { useState, useEffect, useMemo } from "react";
import { useHasRole, useIsActive } from "../../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { MdLayers, MdPeople } from "react-icons/md";
import axios from "axios";
import "./DisplayBldgInfo.css";

const currencyFormatter = new Intl.NumberFormat("en-US");
const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

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
  { key: "address",       label: "Address",            sortable: true  },
  { key: "subMarket",     label: "Sub Market",         sortable: true  },
  { key: "yoc",           label: "YOC",                sortable: true  },
  { key: "currentOwner",  label: "Current Owner",      sortable: false },
  { key: "previousOwner", label: "Previous Owner",     sortable: false },
  { key: "leaseRate",     label: "Lease Rate",         sortable: true  },
  { key: "vacancyRate",   label: "Occupancy Rate",      sortable: true  },
  { key: "lsf",           label: "Last Sold For",      sortable: true  },
  { key: "on",            label: "On",                  sortable: false },
];

const DisplayBldgInfo = () => {
  const navigate = useNavigate();
  const active   = useIsActive();
  const isEmployee = useHasRole("Employee") && active;

  const [allBuildings, setAllBuildings] = useState(null);
  const [search,       setSearch]       = useState("");
  const [subMarket,    setSubMarket]    = useState("");
  const [sortColumn,   setSortColumn]   = useState(null);
  const [sortOrder,    setSortOrder]    = useState("asc");

  // Fetch buildings on mount
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
    setSortColumn('address');
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

  // Choose ring color based on occupancy percent
  const getRingColor = pct => pct > 80 ? 'green' : pct > 40 ? 'orange' : 'blue';

  // Filter and sort buildings
  const buildings = useMemo(() => {
    if (!allBuildings) return null;
    let data = allBuildings
      .filter(b => !search || b.address.toLowerCase().includes(search.toLowerCase()))
      .filter(b => !subMarket || b.subMarket === subMarket);

    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const rawA = (a[sortColumn] ?? '').toString();
        const rawB = (b[sortColumn] ?? '').toString();
        // Special-case subMarket: always sort as strings
        if (sortColumn === 'subMarket') {
          const strA = rawA.toLowerCase();
          const strB = rawB.toLowerCase();
          return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        }
        // Numeric sort if both parse
        const numA = parseFloat(rawA);
        const numB = parseFloat(rawB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }
        // Fallback to case-insensitive string
        const strA = rawA.toLowerCase();
        const strB = rawB.toLowerCase();
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return data;
  }, [allBuildings, search, subMarket, sortColumn, sortOrder]);

  // Compute summary: occupancy, sale, lease, total RSF
  const summary = useMemo(() => {
    if (!allBuildings) return {};
    const calcAvg = (arr, key) => {
      const vals = arr.map(item => parseFloat(item[key]) || 0);
      const sum = vals.reduce((a, b) => a + b, 0);
      return arr.length ? +(sum / arr.length).toFixed(2) : null;
    };
    const calcSumRsf = arr => arr.reduce((sum, item) => {
      const val = item.rsf ? parseFloat(item.rsf.replace(/,/g, '')) : 0;
      // console.log("return val:", sum + val);
      return sum + val;
    }, 0);

    // Global metrics
    const allOcc = allBuildings.filter(b => b.vacancyRate != null);
    const avgVacRaw = calcAvg(allOcc, 'vacancyRate');
    const avgOccupancy = avgVacRaw != null ? +(100 - avgVacRaw).toFixed(2) : null;
    const avgSalePrice = calcAvg(allBuildings.filter(b => b.lsf != null), 'lsf')?.toFixed(0);
    const avgLeaseRate = calcAvg(allBuildings.filter(b => b.leaseRate != null), 'leaseRate');
    const totalRsf = calcSumRsf(allBuildings);

    // Submarket metrics
    let subOcc, subSale, subLease, subTotalRsf;
    if (subMarket) {
      const subset = allBuildings.filter(b => b.subMarket === subMarket);
      const subOccRaw = calcAvg(subset.filter(b => b.vacancyRate != null), 'vacancyRate');
      subOcc = subOccRaw != null ? +(100 - subOccRaw).toFixed(2) : null;
      subSale = calcAvg(subset.filter(b => b.lsf != null), 'lsf')?.toFixed(0);
      subLease = calcAvg(subset.filter(b => b.leaseRate != null), 'leaseRate');
      subTotalRsf = calcSumRsf(subset);
    }

    return { avgOccupancy, avgSalePrice, avgLeaseRate, totalRsf, subOcc, subSale, subLease, subTotalRsf };
  }, [allBuildings, subMarket]);

  if (buildings === null) return <div className="loading-container"><div className="loading-spinner"/></div>;


  return (
    <div className="container">
      <h2>Building Manager</h2>

      {/* Summary Cards */}
      {/* Vertical summary: global and filtered side by side */}
      <div className="summary-columns">
        {/* Global Column */}
        <div className="summary-column">
          <div className="summary-card occupancy">
            <h4>South Denver Avg Occupancy</h4>
            {summary.avgOccupancy != null && <CircularChart percentage={summary.avgOccupancy} colorClass={getRingColor(summary.avgOccupancy)} />}
            <p style={{ color: getRingColor(summary.avgOccupancy) }}>{summary.avgOccupancy != null ? `${summary.avgOccupancy}%` : '—'}</p>
          </div>
          <div className="summary-card sale">
            <h4>South Denver Avg Sale Price</h4>
            <p>${summary.avgSalePrice ? currencyFormatter.format(summary.avgSalePrice) : '—'}</p>
          </div>
          <div className="summary-card lease">
            <h4>South Denver Avg Lease Rate</h4>
            <p>{summary.avgLeaseRate ? `$${summary.avgLeaseRate}/SF` : '—'}</p>
          </div>
          <div className="summary-card sqft">
            <h4>South Denver Total Square Footage</h4>
            <p>{summary.totalRsf ? `${numberFormatter.format(summary.totalRsf)} SF` : '—'}</p>
          </div>
        </div>
        {/* Filtered Column */}
        {subMarket && (
          <div className="summary-column">
            <div className="summary-card occupancy">
              <h4>{subMarket} Avg Occupancy</h4>
              {summary.subOcc != null && <CircularChart percentage={summary.subOcc} colorClass={getRingColor(summary.subOcc)} />}
              <p style={{ color: getRingColor(summary.subOcc) }}>{summary.subOcc != null ? `${summary.subOcc}%` : '—'}</p>
            </div>
            <div className="summary-card sale">
              <h4>{subMarket} Avg Sale Price</h4>
              <p>${summary.subSale ? currencyFormatter.format(summary.subSale) : '—'}</p>
            </div>
            <div className="summary-card lease">
              <h4>{subMarket} Avg Lease Rate</h4>
              <p>{summary.subLease ? `$${summary.subLease}/SF` : '—'}</p>
            </div>
            <div className="summary-card sqft">
              <h4>{subMarket} Total SF</h4>
              <p>{summary.subTotalRsf ? `${numberFormatter.format(summary.subTotalRsf)} SF` : '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Table */}
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
              <button className="clearbtn" onClick={handleClear}>Clear</button>
            </div>
            <div className="right-side-btns">
              {isEmployee && (
                <div className="button-nav-container">
                  <Link className="btn-add link-dec" to="/add">Add +</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th></th>
                {columns.map(({ key, label, sortable }) => (
                  <th key={key} onClick={sortable ? () => handleSort(key) : undefined}>
                    {label}{sortable && sortColumn === key && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </th>
                ))}
                {isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {buildings.map(b => {
                const occupancy = b.vacancyRate != null ? 100 - b.vacancyRate : null;
                return (
                  <tr key={b._id}>
                    <td className="icon-cell">
                      <MdLayers title="Stacking Page" onClick={() => navigate(`/stackingPage/${b._id}`)} />
                      <MdPeople title="Tenancy Page" onClick={() => navigate(`/tenant/${b._id}`)} />
                    </td>
                    <td>{b.address}</td>
                    <td>{b.subMarket}</td>
                    <td>{b.yoc || "UNK"}</td>
                    <td>{b.currentOwner || "N/A"}</td>
                    <td>{b.previousOwner || "N/A"}</td>
                    <td>{b.leaseRate ? `$${b.leaseRate}/SF` : "UNK"}</td>
                    <td className="dbi-td dbi-td-occupancy">
                      {occupancy != null ? (
                        <CircularChart
                          percentage={occupancy}
                          colorClass={
                            occupancy > 80 ? "green"
                              : occupancy > 40 ? "orange"
                              : "blue"
                          }
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{b.lsf ? `$${currencyFormatter.format(b.lsf)}` : "UNK"}</td>
                    <td>{b.on}</td>
                    {isEmployee && (
                      <td>
                        <div className="btn-layout">
                          <button className="btn-del" onClick={() => handleDelete(b._id)}>Delete</button>
                          <Link className="btn-upd" to={`/edit/${b._id}`}>Edit</Link>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisplayBldgInfo;
