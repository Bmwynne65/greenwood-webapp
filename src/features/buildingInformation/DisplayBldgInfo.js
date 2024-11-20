import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DisplayBldgInfo.css";

const fetchBuildings = async ({ queryKey }) => {
  const [_key, { search, subMarket, sortColumn, sortOrder }] = queryKey;
  const response = await axios.get(`${process.env.REACT_APP_URI}/buildings`, {
    params: {
      search,
      subMarket,
      sortColumn,
      sortOrder,
    },
    withCredentials: true,
  });
  console.log("Fetched Data: ", response.data);
  return response.data;
};


const DisplayBldgInfo = () => {
  const [subMarket, setSubMarket] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortColumn, setSortColumn] = useState(null);

  const { data: buildings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["buildings", { search, subMarket, sortColumn, sortOrder }],
    queryFn: fetchBuildings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleSort = (column) => {
    setSortColumn(column);
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  const navigate = useNavigate();

  const handleDelete = async (Id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this building?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_URI}/buildings/${Id}`,
          { withCredentials: true }
        );
        refetch();
      } catch (error) {
        console.error("There was an error deleting the building!", error);
      }
    }
  };

  // const handleSort = (column) => {
  //   const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
  //   setSortOrder(newSortOrder);
  //   setSortColumn(column);
  // };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Something went wrong. Please try again later.</div>;

  console.log("Entering Api")
  const filteredAndSortedBuildings = [...buildings]
    .filter((building) => {
      if (search) {
        return building.address
          .toLowerCase()
          .includes(search.toLowerCase());
      }
      if (subMarket) {
        return building.subMarket
          .toLowerCase()
          .includes(subMarket.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    console.log("Data: ", filteredAndSortedBuildings)
  return (
    <div className="container">
      <h2>Building Manager</h2>
      {/* <PropertyUploader refreshBuildings={fetchBuildings} /> */}
      <div className="table">
        <div className="filter-container">
          <div className="search-container">
            <div className="left-side-btns">
              <input
                className="search-input"
                type="text"
                placeholder="Search by address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div class="dropdown">
                <button class="dropbtn">Sub-markets</button>
                <div class="dropdown-content">
                  <button
                    className="subMarket-filter-btn"
                    value="DTC"
                    onClick={(e) => setSubMarket(e.target.value)}
                  >
                    {" "}
                    DTC{" "}
                  </button>
                  <button
                    className="subMarket-filter-btn"
                    value="Centennial"
                    onClick={(e) => setSubMarket(e.target.value)}
                  >
                    {" "}
                    Centennial{" "}
                  </button>
                </div>
              </div>
              <div class="cleardropdown">
                <button
                  class="clearbtn"
                  value=""
                  onClick={() => {
                    setSubMarket("");
                    setSearch("");
                    setSortColumn(null);
                    setSortOrder("asc");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="button-nav-container">
              <button className="btn-add">
                <Link className="link-dec" to={`/add`}>
                  Add +
                </Link>
              </button>
            </div>
          </div>
        </div>
        <div className="table-responsive">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBuildings.map((building) => (
                <tr
                  key={building._Id}
                  // onDoubleClick={() => handleDoubleClick(building.link)}
                  onDoubleClick={() => navigate(`/tenant/${building._id}`)}
                >
                  <td
                    className="link"
                    // onDoubleClick={() => handleDoubleClick(building.link)}
                    onDoubleClick={() => navigate(`/tenant/${building._id}`)}
                  >
                    {building.address}
                  </td>
                  <td>{building.subMarket}</td>
                  <td className={building.yoc ? "" || " " : "text-red"}>
                    {building.yoc ? building.yoc : "UNK"}
                  </td>
                  <td>
                    {building.currentOwner ? building.currentOwner : "N/A"}
                  </td>
                  <td className={building.previousOwner ? "" || " " : "text-red"}>
                    {building.previousOwner ? building.previousOwner : "N/A"}
                  </td>
                  <td className={building.leaseRate ? "" || " " : "text-red"}>
                    {building.leaseRate ? "$" + building.leaseRate + "/SF" : "UNK"}
                  </td>
                  <td className={building.vacancyRate ? "" || " " : "text-red"}>
                    {building.vacancyRate ? building.vacancyRate + "%": "UNK"}
                  </td>
                  <td className={building.lsf ? "" || " " : "text-red"}>
                    {building.lsf ? "$" + building.lsf : "UNK"}
                  </td>
                  <td>{building.on}</td>
                  <td>
                    <div className="btn-layout">
                      <button
                        className="btn-del"
                        onClick={() => handleDelete(building._id)}
                      >
                        Delete
                      </button>
                      <Link
                        className="btn-upd"
                        to={`/edit/${building._id}`}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
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
