import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./testing.css";
import BuildingNavBar from "../buildingNavBar/buildingnavBar";
// import "../buildingNavBar/buildingNavBar.css";

// Renders a circular progress chart, with `percentage` 0–100
const CircularChart = ({ percentage, colorClass = "" }) => {
  const dash = `${percentage}, 100`;
  return (
    <svg viewBox="0 0 36 36" className={`circular-chart ${colorClass}`}>      
      <path
        className="circle-bg"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="circle"
        strokeDasharray={dash}
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.35" className="percentage">
        {`${percentage}%`}
      </text>
    </svg>
  );
};

const Test = () => {
  const { id } = useParams();
  const buildingId = id || "670d942b0c952bcc89d74c53";

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_URI}/buildings/${buildingId}`);
        setBuilding(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch building information.");
      } finally {
        setLoading(false);
      }
    };
    fetchBuilding();
  }, [buildingId]);

  if (loading) return <div className="loading">Loading building information...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!building) return <div className="no-data">No building data available.</div>;

  // Extract numeric part and rest of the address (first segment)
  const addressString = building.address || building.Address || "";
  const firstSeg = addressString.split(",")[0] || "";
  const parts = firstSeg.trim().split(" ");
  const numbersOnly = parts.shift() || "";
  const restSegment = parts.join(" ") || "";

  const fields = [
    { key: "address", label: "Address" },
    { key: "subMarket", label: "SubMarket" },
    { key: "yoc", label: "YOC" },
    { key: "currentOwner", label: "Current Owner" },
    { key: "previousOwner", label: "Previous Owner" },
    { key: "leaseRate", label: "Lease Rate" },
    { key: "vacancyRate", label: "Vacancy Rate" },
    { key: "lsf", label: "LSF" },
    { key: "on", label: "On" },
    { key: "rsf", label: "RSF" }
  ];

   return (
    <div className="building-details">
      <BuildingNavBar buildingId={buildingId} />
      <div className="header-section">
        <div
          className={`vertical-header ${building.imageBlob ? "with-image" : "no-image"}`}
          style={
            building.imageBlob
              ? {
                  "--header-bg": `linear-gradient(to bottom, #285e2b, transparent), url(${building.imageBlob})`,
                }
              : {}
          }
        >
          {numbersOnly.split("").map((char, i) => (
            <span key={i} className="digit">
              {char}
            </span>
          ))}
        </div>

        {restSegment && <h1 className="horizontal-header">{restSegment}</h1>}
      </div>
      <div className="content-section">
        <div className="building-info">
          {fields.map(({ key, label }) => {
            const value = building[key];

            // Vacancy Rate chart
            if (key === "vacancyRate" && value != null) {
              const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
              return (
                <div className="info-row" key={key}>
                  <span className="info-key">{label}:</span>
                  <div className="info-value chart-container">
                    <CircularChart
                            percentage={pct}
                            colorClass={
                              pct > 80 ? "green"
                                : pct > 40 ? "orange"
                                : "blue"
                            }
                          />
                  </div>
                </div>
              );
            }

            return (
              <div className="info-row" key={key}>
                <span className="info-key">{label}:</span>
                <span className="info-value">{value != null ? value : "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Test;
