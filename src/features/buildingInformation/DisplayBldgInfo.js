import React, { useState, useEffect, useCallback } from "react";
import { useHasRole, useIsActive } from "../../utils/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./DisplayBldgInfo.css";

const MIN_LOADING_TIME = 1000; // Minimum loading time in milliseconds

const DisplayBldgInfo = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const reloadBuildings = location.state?.reloadBuildings || false; // Check if reload is required

  const [subMarket, setSubMarket] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortColumn, setSortColumn] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(false); // Local loading state for table

  const active = useIsActive();
  const isGuest = useHasRole("Guest") && active;
  const isEmployee = useHasRole("Employee") && active;

  // Fetch buildings with filters applied
  const fetchBuildings = useCallback(async () => {
    const response = await axios.get(`${process.env.REACT_APP_URI}/buildings`, {
      params: { search, subMarket, sortColumn, sortOrder },
      withCredentials: true,
    });
    return response.data;
  }, [search, subMarket, sortColumn, sortOrder]);

  const { data: buildings = [], isLoading: isGlobalLoading, refetch } = useQuery({
    queryKey: ["buildings", { search, subMarket, sortColumn, sortOrder }],
    queryFn: fetchBuildings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (reloadBuildings) {
      refetch(); // Reload data if triggered by Add component
      navigate("/manager", { replace: true, state: {} }); // Clear reload state
    }
  }, [reloadBuildings, refetch, navigate]);

  const enforceMinimumLoadingTime = async (action) => {
    setIsTableLoading(true);
    const startTime = Date.now();
    await action(); // Perform the action (e.g., refetch)
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MIN_LOADING_TIME) {
      setTimeout(() => setIsTableLoading(false), MIN_LOADING_TIME - elapsedTime);
    } else {
      setIsTableLoading(false);
    }
  };

  const handleSort = (column) => {
    setSortColumn(column);
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
    enforceMinimumLoadingTime(refetch); // Use minimum loading time logic
  };

  const handleFilterChange = (e) => {
    const { value, name } = e.target;
    if (name === "subMarket") setSubMarket(value);
    if (name === "search") setSearch(value);
    // enforceMinimumLoadingTime(refetch); // Use minimum loading time logic
  };

  const handleDelete = async (Id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this building?");
    if (confirmDelete) {
      try {
        await axios.delete(`${process.env.REACT_APP_URI}/buildings/${Id}`, { withCredentials: true });
        enforceMinimumLoadingTime(refetch); // Use minimum loading time logic
      } catch (error) {
        console.error("There was an error deleting the building!", error);
      }
    }
  };

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
                name="search"
                onChange={handleFilterChange}
              />
              <div className="dropdown">
                <button className="dropbtn">Sub-markets</button>
                <div className="dropdown-content">
                  <button
                    className="subMarket-filter-btn"
                    name="subMarket"
                    value="DTC"
                    onClick={handleFilterChange}
                  >
                    DTC
                  </button>
                  <button
                    className="subMarket-filter-btn"
                    name="subMarket"
                    value="Centennial"
                    onClick={handleFilterChange}
                  >
                    Centennial
                  </button>
                </div>
              </div>
              <button
                className="clearbtn"
                onClick={() => {
                  setSubMarket("");
                  setSearch("");
                  setSortColumn(null);
                  setSortOrder("asc");
                  enforceMinimumLoadingTime(refetch); // Use minimum loading time logic
                }}
              >
                Clear
              </button>
            </div>
            {isEmployee && (
              <div className="button-nav-container">
                <button className="btn-add">
                  <Link className="link-dec" to={`/add`}>
                    Add +
                  </Link>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="table-responsive">
          {isGlobalLoading || isTableLoading ? (
            <div className="loading-indicator">Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("address")}>
                    Address {sortColumn === "address" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("subMarket")}>
                    Sub-Market {sortColumn === "subMarket" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("yoc")}>
                    YOC {sortColumn === "yoc" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Current Owner</th>
                  <th>Previous Owner</th>
                  <th onClick={() => handleSort("leaseRate")}>
                    Lease Rate {sortColumn === "leaseRate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("vacancyRate")}>
                    Vacancy Rate {sortColumn === "vacancyRate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("lsf")}>
                    Last Sold For {sortColumn === "lsf" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>On</th>
                  {isEmployee && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr
                    key={building._id}
                    onDoubleClick={() => navigate(`/tenant/${building._id}`)}
                  >
                    <td>{building.address}</td>
                    <td>{building.subMarket}</td>
                    <td>{building.yoc || "UNK"}</td>
                    <td>{building.currentOwner || "N/A"}</td>
                    <td>{building.previousOwner || "N/A"}</td>
                    <td>{building.leaseRate ? `$${building.leaseRate}/SF` : "UNK"}</td>
                    <td>{building.vacancyRate ? `${building.vacancyRate}%` : "UNK"}</td>
                    <td>{building.lsf ? `$${building.lsf}` : "UNK"}</td>
                    <td>{building.on}</td>
                    {isEmployee && (
                      <td>
                        <div className="btn-layout">
                          <button
                            className="btn-del"
                            onClick={() => handleDelete(building._id)}
                          >
                            Delete
                          </button>
                          <Link className="btn-upd" to={`/edit/${building._id}`}>
                            Edit
                          </Link>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayBldgInfo;
