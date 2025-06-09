import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { useHasRole, useIsActive } from "../../utils/auth";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaSave, FaTimes, FaTrash, FaPlus, FaCheck } from "react-icons/fa";
import BuildingNavBar from "../buildingNavBar/buildingnavBar";
import "./BuildingTenant.css";


function BuildingTenants() {
  const { id } = useParams();
  const [tenants, setTenants] = useState([]);
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editedTenant, setEditedTenant] = useState({});
  const [active, setActive] = useState(false)
  const [values, setValues] = useState([]);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortColumn, setSortColumn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For CSV preview and confirmation modal
  const [uploadedTenants, setUploadedTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const buttonRef = useRef(null);
  const isActive = useIsActive();
  const isGuest = useHasRole("Guest") && isActive;
  const isEmployee = useHasRole("Employee") && isActive;

  const fetchTenants = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_URI}/tenants/${id}`);
    const sortedData = res.data.sort((a, b) => {
      if (isNaN(a.suite) || isNaN(b.suite)) {
        return a.suite.localeCompare(b.suite);
      }
      return a.suite - b.suite;
    });
    setTenants(sortedData);
  } catch (error) {
    console.error("Error fetching tenant data", error);
    setError(error)
  } finally {
    setLoading(false);
  }
};


  const fetchBuildingInfo = () => {
    axios
      .get(`${process.env.REACT_APP_URI}/buildings/${id}`)
      .then((res) => setValues(res.data))
      .catch((error) => console.error("Error fetching building info", error));
  };

  useEffect(() => {
    fetchTenants();
    fetchBuildingInfo();
  }, [id]);

  useEffect(() => {
    const btn = buttonRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setIsButtonVisible(entry.isIntersecting),
      { threshold: 1 }
    );
    if (btn) observer.observe(btn);
    return () => btn && observer.unobserve(btn);
  }, []);

  // const handleSort = (column) => {
  //   const newOrder = sortOrder === "asc" ? "desc" : "asc";
  //   const sorted = [...tenants].sort((a, b) => {
  //     const aVal = a[column], bVal = b[column];
  //     if (!isNaN(aVal) && !isNaN(bVal)) return newOrder === "asc" ? aVal - bVal : bVal - aVal;
  //     if (aVal < bVal) return newOrder === "asc" ? -1 : 1;
  //     if (aVal > bVal) return newOrder === "asc" ? 1 : -1;
  //     return 0;
  //   });
  //   setTenants(sorted);
  //   setSortOrder(newOrder);
  //   setSortColumn(column);
  // };

  // Handle edits in the modal table
  const handleModalInputChange = (e, idx) => {
    const { name, value } = e.target;
    setUploadedTenants(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [name]: value };
      return updated;
    });
  };

  // CSV Upload Handler: parse then preview
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const csvText = target.result;
      const lines = csvText.split(/\r?\n/);
      const headerIdx = lines.findIndex((l) => l.startsWith("Tenant,Suite"));
      if (headerIdx !== -1) {
        const relevant = lines.slice(headerIdx).join("\n");
        Papa.parse(relevant, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map((row) => ({
              tenantName: row["Tenant"],
              suite: row["Suite"],
              areaOccupied: row["Square Ft. Occupied"],
              floor: row["Floor"],
              leaseStart: row["Lease  Began"],
              leaseEnd: row["Expiration Date"],
              notes: row["Notes"],
            }));
            setUploadedTenants(parsed);
            setShowModal(true);
          },
        });
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // Confirm import: submit each parsed tenant
  const handleConfirmUpload = () => {
    console.log("Confirming Building ID:", values._id);
    const promises = uploadedTenants.map((t) =>
      axios.post(`${process.env.REACT_APP_URI}/tenants/${values._id}`, {
        tenantName: t.tenantName,
        suite: t.suite,
        areaOccupied: t.areaOccupied,
        floor: t.floor,
        leaseStart: t.leaseStart,
        leaseEnd: t.leaseEnd,
        notes: t.notes,
      })
    );
    Promise.all(promises)
      .then(() => {
        fetchTenants();
        setShowModal(false);
        setUploadedTenants([]);
      })
      .catch((error) => console.error("Error importing tenants", error));
  };

  const handleCancelUpload = () => {
    setShowModal(false);
    setUploadedTenants([]);
  };

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

    // console.log("Edited Tenant: ", editedTenant)
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

  if (loading)  return <div className="loading-container"><div className="loading-spinner"/></div>;
  // if (error) return <div>Error loading building info.</div>;

  return (
    <>
      <BuildingNavBar buildingId={id} />

      <div className="tenant-main-container">
        {/* Confirmation Modal */}
        {showModal && (
          <div className="tenant-modal-overlay">
            <div className="tenant-modal-content">
              <h2>Confirm Tenant Import</h2>
              <div className="tenant-modal-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tenant Name</th>
                      <th>Suite</th>
                      <th>Area Occupied</th>
                      <th>Floor</th>
                      <th>Lease Start</th>
                      <th>Lease End</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedTenants.map((t, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            className="tenant-modal-input-tenantName"
                            type="text"
                            name="tenantName"
                            value={t.tenantName}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="suite"
                            value={t.suite}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="areaOccupied"
                            value={t.areaOccupied}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="floor"
                            value={t.floor}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="leaseStart"
                            placeholder="YYYY-MM-DD"
                            value={t.leaseStart}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="leaseEnd"
                            placeholder="YYYY-MM-DD"
                            value={t.leaseEnd}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                        <td>
                          <textarea
                            name="notes"
                            value={t.notes}
                            onChange={(e) => handleModalInputChange(e, idx)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="tenant-modal-actions">
                {/* Confirm (check-icon) */}
                <button
                  className="icon-button tenant-confirm-button"
                  onClick={handleConfirmUpload}
                  title="Confirm Import"
                >
                  <FaCheck />
                </button>
                {/* Cancel (×-icon) */}
                <button
                  className="icon-button tenant-cancel-button"
                  onClick={() => {
                    setShowModal(false);
                    setUploadedTenants([]);
                  }}
                  title="Cancel Import"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className="tenant-building-container"
          style={{
            backgroundImage: `url(data:image/jpeg;base64,${values.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="tenant-building-name">{values.address}</h1>
        </div>

        {isEmployee && (
          <div className="create-tenant-container">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="csv-upload-input"
            />

            {/* Add New Tenant (plus-icon only) */}
            <button
              className="icon-button create-button"
              onClick={handleCreateTenant}
              ref={buttonRef}
              title="Add New Tenant"
            >
              <FaPlus />
            </button>

            {!isButtonVisible && (
              <button
                className="icon-button small-create-button"
                onClick={handleCreateTenant}
                title="Add New Tenant"
              >
                <FaPlus />
              </button>
            )}
          </div>
        )}

        <div className="tenant-center-container">
          <div className="tenant-container">
            {tenants.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("tenantName")}
                      className="sortable-header"
                    >
                      Tenant Name{" "}
                      {sortColumn === "tenantName" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("suite")}
                      className="sortable-header"
                    >
                      Suite{" "}
                      {sortColumn === "suite" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("areaOccupied")}
                      className="sortable-header"
                    >
                      Area Occupied{" "}
                      {sortColumn === "areaOccupied" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("floor")}
                      className="sortable-header"
                    >
                      Floor{" "}
                      {sortColumn === "floor" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Lease Start</th>
                    <th>Lease End</th>
                    <th>Notes</th>
                    {isEmployee && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant._id}
                      className={
                        tenant.tenantName === "Vacant"
                          ? "vacant-row"
                          : "table-content"
                      }
                    >
                      {editingTenantId === tenant._id ? (
                        /* ── Edit Mode ── */
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
                              {/* Save (check-icon) */}
                              <button
                                className="icon-button save-button"
                                onClick={
                                  active === true
                                    ? handleNewTenant
                                    : handleSave
                                }
                                title="Save"
                              >
                                <FaSave />
                              </button>
                              {/* Cancel (×-icon) */}
                              <button
                                className="icon-button cancel-button"
                                onClick={handleCancel}
                                title="Cancel Edit"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        /* ── View Mode ── */
                        <>
                          <td>{tenant.tenantName}</td>
                          <td>{tenant.suite}</td>
                          <td>{tenant.areaOccupied}</td>
                          <td>{tenant.floor}</td>
                          <td>{tenant.leaseStart}</td>
                          <td>{tenant.leaseEnd}</td>
                          <td>{tenant.notes}</td>
                          {isEmployee && (
                            <td>
                              <div className="co-vm-buttons">
                                {/* Edit (pencil-icon) */}
                                <button
                                  className="icon-button edit-button"
                                  onClick={() => handleEdit(tenant)}
                                  title="Edit Tenant"
                                >
                                  <FaEdit />
                                </button>
                                {/* Delete (trash-can icon) */}
                                <button
                                  className="icon-button delete-button"
                                  onClick={() => handleDelete(tenant._id)}
                                  title="Delete Tenant"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          )}
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
    </>
  );
}

export default BuildingTenants;
