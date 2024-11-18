import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaSave, FaTimes, FaTrash, FaPlus } from "react-icons/fa"; // Import icons
import "./BuildingTenant.css";



function BuildingTenants() {
  const { id } = useParams()
  const [tenants, setTenants] = useState([])
  const [editingTenantId, setEditingTenantId] = useState(null) // Holds the ID of the tenant being edited
  const [editedTenant, setEditedTenant] = useState({}) // Holds the data for the tenant currently being edited
  const [values, setValues] = useState([])
  const [active, setActive] = useState(false)
  const [isButtonVisible, setIsButtonVisible] = useState(true)
  const [sortOrder, setSortOrder] = useState("asc") // "asc" for ascending, "desc" for descending
  const [sortColumn, setSortColumn] = useState(null) // Column currently being sorted
  const buttonRef = useRef(null);

  const fetchTenants = () => {
    axios
      .get(process.env.REACT_APP_URI + "/tenants/" + id)
      .then((res) => {
        const sortedData = res.data.sort((a, b) => {
            if (isNaN(a.suite) || isNaN(b.suite)) {
              return a.suite.localeCompare(b.suite); // Alphabetical order if suite is not numeric
            }
            return a.suite - b.suite; // Numeric ascending order if suite is numeric
          });
          setTenants(sortedData);
      })
      .catch((error) => {
        console.error("There was an error fetching the tenant data!", error)
      })
      
  }

  const fetchBuildingInfo = () => {
    axios
      .get(`${process.env.REACT_APP_URI}/buildings/${id}`) // Use the correct API endpoint for a single building
      .then((res) => {
        setValues(res.data)
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error)
      })
  }

  useEffect(() => {
    fetchTenants() // Initial fetch of tenant data when component mounts
    fetchBuildingInfo() // Initial fetch of Building Information when component mounts
  }, [id])

  useEffect(() => {
    // console.log("editingTenantId after update: ", editingTenantId);
  }, [editingTenantId])

  useEffect(() => {
    // handleSort("suite")
    const buttonElement = buttonRef.current // Store the ref in a local variable
  
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsButtonVisible(entry.isIntersecting)
      },
      { threshold: 1 }
    )
  
    if (buttonElement) {
      observer.observe(buttonElement)
    }
  
    // Cleanup function uses the stored reference
    return () => {
      if (buttonElement) {
        observer.unobserve(buttonElement)
      }
    }
  }, [])
  

  const handleDelete = (tenantId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tenant?");

    if (confirmDelete) {
      axios
        .delete(process.env.REACT_APP_URI + "/tenants/" + tenantId)
        .then((res) => {
          console.log("Tenant deleted successfully:", res.data)
          // Update the state to remove the deleted tenant
          setTenants((prevTenants) => prevTenants.filter((tenant) => tenant._id !== tenantId))
        })
        .catch((error) => {
          console.error("There was an error deleting the tenant!", error)
        });
    }
  };

  // Enable edit mode for a tenant
  const handleEdit = (tenant) => {
    setEditingTenantId(tenant._id)
    setEditedTenant(tenant) // Set the current tenant details into the editable state
  };

  // Handle changes in the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedTenant((prevTenant) => ({ ...prevTenant, [name]: value }))
  };

  // Save existing edited tenant details
  const handleSave = () => {
    // console.log("Entered Handle Save")
    axios
      .patch(process.env.REACT_APP_URI + "/tenants/" + editingTenantId, editedTenant)
      .then((res) => {
        // Update tenants in state with the updated tenant data

        setTenants((prevTenants) =>
          prevTenants.map((tenant) =>
            tenant._id === editingTenantId ? res.data.updatedTenant : tenant
          )
        )
        setEditingTenantId(null); // Exit edit mode
      })
      .catch((error) => {
        console.error("There was an error saving the tenant data!", error)
      })
  }

  // Handle saving a new tenant to the server
  const handleNewTenant = () => {
    // console.log("Entered Handle New Tenant")
    axios
      .post(
        `${process.env.REACT_APP_URI}/tenants/${editedTenant.building}`,
        {
          tenantName: editedTenant.tenantName,
          suite: editedTenant.suite,
          areaOccupied: editedTenant.areaOccupied,
          floor: editedTenant.floor,
          leaseStart: editedTenant.leaseStart,
          leaseEnd: editedTenant.leaseEnd,
          notes: editedTenant.notes,
        }
      )
      .then((res) => {
        // Replace temporary tenant with the server response that has a real _id
        // setTenants((prevTenants) =>
        //   prevTenants.map((tenant) =>
        //     tenant._id === editedTenant._id ? res.data.newTenant : tenant
        //   )
        // );
        fetchTenants()
        setEditingTenantId(null) // Exit edit mode
      })
      .catch((error) => {
        console.error("There was an error creating the new tenant!", error);
      })

    setActive(!active) // Toggling active state
  };

  // Cancel the editing
  const handleCancel = () => {
    setEditingTenantId(null) // Exit edit mode
    setEditedTenant({}) // Reset edited tenant data
  };

  // Create a new tenant in edit mode
  const handleCreateTenant = () => {
    const newTenant = {
      _id: Date.now().toString(),
      building: values._id,
      tenantName: "",
      suite: "",
      areaOccupied: "",
      floor: "",
      leaseStart: "",
      leaseEnd: "",
      notes: "",
    }
    // console.log("newTenant._id: ", newTenant._id)
    setActive(!active)
    setTenants((prevTenants) => [...prevTenants, newTenant])
    setEditingTenantId(newTenant._id) // Immediately set to edit mode
    setEditedTenant(newTenant) // Start with the new tenant in edit mode
  }

  // Handle sorting
  const handleSort = (column) => {
      const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
  
      const sortedTenants = [...tenants].sort((a, b) => {
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
  
      setTenants(sortedTenants)
      setSortOrder(newSortOrder)
      setSortColumn(column)
  }
  

  return (
    <div className="tenant-main-container">
        <div
            className="tenant-building-container"
            style={{
            backgroundImage: `url(data:image/jpeg;base64,${values.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            }}
        >
            <h1 className="tenant-building-name">{values.address}</h1>
        </div>
        <div className="create-tenant-container">
            <button className="create-button" onClick={handleCreateTenant} ref={buttonRef}>
            <FaPlus /> Add New Tenant
            </button>
            {!isButtonVisible && (
            <button className="small-create-button" onClick={handleCreateTenant}>
                <FaPlus className="fa-2x custom-icon"/>
            </button>
            )}  
        </div>
        <div className="tenant-center-container">
            <div className="tenant-container">
                {tenants.length > 0 ? (
                    <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("tenantName")}>
                                Tenant Name {sortColumn === "tenantName" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th onClick={() => handleSort("suite")}>
                                Suite {sortColumn === "suite" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th onClick={() => handleSort("areaOccupied")}>
                                Area Occupied {sortColumn === "areaOccupied" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th onClick={() => handleSort("floor")}>
                                Floor {sortColumn === "floor" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th>
                                Lease Start
                            </th>
                            <th>
                                Lease End 
                            </th>
                            <th>
                                Notes
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {tenants.map((tenant) => (
                        <tr key={tenant._id} className={tenant.tenantName === "Vacant" ? "vacant-row" : "table-content"}>
                        {editingTenantId === tenant._id ? (
                            <>
                            <td>
                                <input
                                className="tenant-em-tenantName"
                                type="text"
                                name="tenantName"
                                value={editedTenant.tenantName}
                                onChange={handleInputChange}
                                placeholder="Tenant Name"
                                />
                            </td>
                            <td>
                                <input
                                className="tenant-em-suite"
                                type="text"
                                name="suite"
                                value={editedTenant.suite}
                                onChange={handleInputChange}
                                placeholder="Suite"
                                />
                            </td>
                            <td>
                                <input
                                className="tenant-em-areaOccupied"
                                type="text"
                                name="areaOccupied"
                                value={editedTenant.areaOccupied}
                                onChange={handleInputChange}
                                placeholder="Area Occupied"
                                />
                            </td>
                            <td>
                                <input
                                className="tenant-em-floor"
                                type="text"
                                name="floor"
                                value={editedTenant.floor}
                                onChange={handleInputChange}
                                placeholder="Floor"
                                />
                            </td>
                            <td>
                                <input
                                className="tenant-em-leaseStart"
                                type="text"
                                name="leaseStart"
                                value={editedTenant.leaseStart}
                                onChange={handleInputChange}
                                placeholder="Lease Start"
                                />
                            </td>
                            <td>
                                <input
                                className="tenant-em-leaseEnd"
                                type="text"
                                name="leaseEnd"
                                value={editedTenant.leaseEnd}
                                onChange={handleInputChange}
                                placeholder="Lease End"
                                />
                            </td>
                            <td>
                                <textarea
                                className="tenant-em-notes"
                                name="notes"
                                value={editedTenant.notes}
                                onChange={handleInputChange}
                                placeholder="Notes"
                                />
                            </td>
                            <td>
                                <div className="co-em-buttons">
                                    {active === true ? (
                                        <button className="save-button" onClick={handleNewTenant}>
                                            <FaSave className="fa-2x custom-icon" />
                                        </button>
                                        ) : (
                                        <button className="save-button" onClick={handleSave}>
                                            <FaSave className="fa-2x custom-icon" />
                                        </button>
                                    )}
                                    <button className="cancel-button" onClick={handleCancel}>
                                        <FaTimes className="fa-2x custom-icon" />
                                    </button>
                                </div>
                            </td>
                            </>
                        ) : (
                            <>
                            <td>{tenant.tenantName}</td>
                            <td>{tenant.suite}</td>
                            <td>{tenant.areaOccupied}</td>
                            <td>{tenant.floor}</td>
                            <td>{tenant.leaseStart}</td>
                            <td>{tenant.leaseEnd}</td>
                            <td>{tenant.notes}</td>
                            <td>
                                <div className="co-vm-buttons">
                                    <button className="edit-button" onClick={() => handleEdit(tenant)}>
                                    <FaEdit />
                                    </button>
                                    <button className="delete-button" onClick={() => handleDelete(tenant._id)}>
                                    <FaTrash />
                                    </button>
                                </div>
                            </td>
                            </>
                        )}
                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : (
                <p>No tenants found for this building.</p>
                )}
            </div>
        </div>
    </div>
  );
}

export default BuildingTenants;
