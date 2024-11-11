import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./DisplayBldgInfo.css"
import PropertyUploader from "./PropertyUploader"

const DisplayBldgInfo = () => {
  const [buildings, setBuildings] = useState([]);
  // const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [subMarket, setSubMarket] = useState("");
  const [search, setSearch] = useState("");
  const [sortedBuildings, setsortedBuildings] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc") // "asc" for ascending, "desc" for descending
  const [sortColumn, setSortColumn] = useState(null) // Column currently being sorted

  //set markets to possible values
  // let markets = ["DTC", "Cenntenial", "Greenwood", "Inverness", "Meridian"];

  // Test
  // console.log(subMarket);

  // const [filters, setFilters] = useState({
  //   subMarket: "",
  //   vacancyRate: "",
  // });
  // Fetch data from the API
  const fetchBuildings = () => {
    axios
      .get(process.env.REACT_APP_URI + "/buildings")
      .then((response) => {
        setBuildings(response.data);
        // Display the data immediately
        // setFilteredBuildings(response.data); 
        
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
      });
  };

  useEffect(() => {
    fetchBuildings(); // Initial fetch when component mounts
  }, []);

  const navigate = useNavigate();

  // Deletes a building
  const handleDelete = (Id) => {
    // console.log("DELETE ID: ", Id)
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this building?"
    );

    if (confirmDelete) {
      axios
        .delete(process.env.REACT_APP_URI + "/buildings/" + Id)
        .then((res) => {
          console.log("Building deleted successfully:", res.data);
          // Update the state to remove the deleted building
          setBuildings((prevBuildings) =>
            prevBuildings.filter(
              (building) => building._id !== Id
            )
          );
          console.log("Updated buildings list:", buildings); // Check if the state is correctly updated
        })
        .catch((error) => {
          console.error("There was an error deleting the building!", error);
        });
    }
  };

  // Handle double-click to navigate to the building link
  const handleDoubleClick = (link) => {
    window.open(link, "_blank"); // Open in a new tab
  };

  // Handle sorting
  const handleSort = (column) => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc"

    const sortedBuildings = [...buildings].sort((a, b) => {
    const aValue = a[column]
    const bValue = b[column]

    // Check if the values are numbers; if so, compare numerically
    if (!isNaN(aValue) && !isNaN(bValue)) {
        return newSortOrder === "asc" ? aValue - bValue : bValue - aValue
    }

    // Otherwise, compare alphabetically
    if (aValue < bValue) return newSortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return newSortOrder === "asc" ? 1 : -1
    return 0;
    })

    setsortedBuildings(sortedBuildings)
    setSortOrder(newSortOrder)
    setSortColumn(column)
  }

  return (
    <div className="container">
      {/* <h2>Manager</h2> */}
      <PropertyUploader refreshBuildings={fetchBuildings} />
      <div className="table">
        <div className="filter-container">
          <div className="button-nav-container">
            {/* <button className="btn-add">
            <Link className="link-dec" to={`/add`}>
              Add +
            </Link>
          </button> */}
          </div>
          <div className="search-container">
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
              {(sortColumn === null ? buildings : sortedBuildings)
                .filter((building) => {
                  // If the search is not empty, check if the building address matches the search term
                  if (search.toLowerCase() !== "") {
                    if (
                      !building.address
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    ) {
                      return false;
                    }
                  }

                  // If the subMarket is not empty, check if the building subMarket matches the subMarket filter
                  if (subMarket.toLowerCase() !== "") {
                    if (
                      !building.subMarket
                        .toLowerCase()
                        .includes(subMarket.toLowerCase())
                    ) {
                      return false;
                    }
                  }

                  // If all conditions pass, return the building
                  return true;
                })
                .map((building) => (
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
                    <td>{building.yoc ? building.yoc : "UNK"}</td>
                    <td>{building.currentOwner ? building.currentOwner : "N/A"}</td>
                    <td>{building.previousOwner ? building.previousOwner : "N/A"}</td>
                    <td>{building.leaseRate ? "$" + building.leaseRate + "/SF" : "UNK"}</td>
                    <td>{building.vacancyRate ? building.vacancyRate + "%": "UNK"}</td>
                    <td>{building.lsf ? "$" + building.lsf : "UNK"}</td>
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
