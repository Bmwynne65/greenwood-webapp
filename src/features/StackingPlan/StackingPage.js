import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BuildingNavBar from "../buildingNavBar/buildingnavBar";
import "./StackingPage.css";

const StackingPlan = () => {
  const { id } = useParams();
  const [tenants, setTenants] = useState([]);
  const [building, setBuilding] = useState(null);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingBuilding, setLoadingBuilding] = useState(true);
  const [errorTenants, setErrorTenants] = useState(null);
  const [errorBuilding, setErrorBuilding] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    const fetchBuildingInfo = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_URI}/buildings/${id}`);
        setBuilding(res.data);
      } catch (err) {
        console.error("Error fetching building info:", err);
        setErrorBuilding(err);
      } finally {
        setLoadingBuilding(false);
      }
    };

    const fetchTenants = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_URI}/tenants/${id}`);
        const sorted = res.data.sort((a, b) => {
          const aNum = parseInt(a.suite, 10);
          const bNum = parseInt(b.suite, 10);
          if (isNaN(aNum) || isNaN(bNum)) return a.suite.localeCompare(b.suite);
          return aNum - bNum;
        });
        setTenants(sorted);
      } catch (err) {
        console.error("Error fetching tenant data:", err);
        setErrorTenants(err);
      } finally {
        setLoadingTenants(false);
      }
    };

    fetchBuildingInfo();
    fetchTenants();
  }, [id]);

  const stackingData = React.useMemo(() => {
    const groups = {};
    tenants.forEach((t) => {
      const floorStr = t.floor || "";
      const sqft = t.areaOccupied ? Number(t.areaOccupied.replace(/,/g, "")) : null;
      let floorList = [];
      const rangeMatch = floorStr.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let f = start; f <= end; f++) floorList.push(f.toString());
      } else if (/^\d+$/.test(floorStr.trim())) {
        floorList = [floorStr.trim()];
      } else {
        floorList = [floorStr.trim()];
      }
      const count = floorList.length;
      const sqftPerFloor = sqft && count > 0 ? sqft / count : sqft;

      floorList.forEach((floorKey) => {
        let suiteCode = t.suite;
        const suiteRange = t.suite.match(/^(\d+)\s*-\s*(\d+)$/);
        if (suiteRange) {
          const suffix = suiteRange[1].slice(1);
          suiteCode = `${floorKey}${suffix}`;
        }
        if (!groups[floorKey]) groups[floorKey] = { floor: floorKey, totalSqft: 0, tenants: [] };
        groups[floorKey].tenants.push({
          data: t,
          name: t.tenantName,
          suite: suiteCode,
          sqft: sqftPerFloor,
        });
        if (sqftPerFloor) groups[floorKey].totalSqft += sqftPerFloor;
      });
    });
    return Object.values(groups).sort((a, b) => {
      const aNum = parseInt(a.floor, 10);
      const bNum = parseInt(b.floor, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return bNum - aNum;
      return a.floor.localeCompare(b.floor);
    });
  }, [tenants]);

  if (loadingBuilding)  return <div className="loading-container"><div className="loading-spinner"/></div>;
  if (errorBuilding) return <div>Error loading building info.</div>;

  return (
    <>
      <BuildingNavBar buildingId={id} />
      <div className="stacking-plan">
        <header className="building-header">
          <h1>{building.address}</h1>
        </header>

        {loadingTenants ? (
          <div>Loading tenants...</div>
        ) : errorTenants ? (
          <div>Error loading tenants.</div>
        ) : (
          stackingData.map(({ floor, totalSqft, tenants }) => (
            <div key={floor} className="floor">
              <div className="floor-header">Floor {floor}</div>
              <div className="tenant-row">
                {tenants.map((tenant, idx) => {
                  // Use proportional flex so boxes shrink as needed
                  const flexValue = tenant.sqft || 1;
                  return (
                    <div
                      key={idx}
                      className={`tenant-box${!tenant.name || tenant.name.toLowerCase().includes("vacant") ? " vacant" : ""}`}
                      style={{ flex: `${flexValue} 1 0%` }}
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <div className="tenant-name">
                        {tenant.name || "Vacant"}
                      </div>
                      <div className="tenant-info">
                        Suite {tenant.suite}
                        {tenant.sqft && ` • ${Math.round(tenant.sqft).toLocaleString()} sqft`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {selectedTenant && (
          <div className="modal-overlay" onClick={() => setSelectedTenant(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setSelectedTenant(null)}>
                &times;
              </button>
              <h2>{selectedTenant.name}</h2>
              <p><strong>Suite:</strong> {selectedTenant.suite}</p>
              <p><strong>Sqft:</strong> {selectedTenant.sqft ? Math.round(selectedTenant.sqft).toLocaleString() : 'N/A'}</p>
              <p><strong>Lease Start:</strong> {selectedTenant.data.leaseStart}</p>
              <p><strong>Lease End:</strong> {selectedTenant.data.leaseEnd}</p>
              <p><strong>Floor Range:</strong> {selectedTenant.data.floor}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StackingPlan;