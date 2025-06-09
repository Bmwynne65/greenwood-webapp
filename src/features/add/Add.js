import React, { useState } from "react";
import Papa from "papaparse";
import "../editBuilding/Edit.css";
import "./Add.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/nav/Navbar";
import EmployeeProtectedPage from "../../components/Pages/userAccess/EmployeeProtectedPage";

function Add() {
  const [imageBuffer, setImageBuffer] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [values, setValues] = useState({
    address: "",
    subMarket: "",
    yoc: "",
    rnv: "",
    currentOwner: "",
    previousOwner: "",
    leaseRate: "",
    vacancyRate: "",
    rsf: "",
    lsf: "",
    on: "",
    link: "",
  });

  const navigate = useNavigate();

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setCsvFile(file);
      // Parse metadata and stacking data separately
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          const headerIdx = rows.findIndex(
            (row) => row[0] && row[0].toString().trim() === 'Tenant'
          );
          const metaRows = rows.slice(0, headerIdx);

          let address = "";
          let yoc = "";
          let rnv = "";
          let currentOwner = "";
          let previousOwner = "";
          let leaseRate = "";
          let vacancyRate = "";

          metaRows.forEach((row) => {
            const cell = row[0] ? row[0].toString().trim() : "";
            // Address line: skip header label and look for first cell with 2+ commas
            if (
              !address &&
              cell &&
              cell.includes(',') &&
              cell.split(',').length >= 3 &&
              !cell.toLowerCase().includes('building name')
            ) {
              address = cell.replace(/"/g, '').trim();
            } else if (cell.startsWith('YOC')) {
              const parts = cell.split('|');
              const yocMatch = parts[0].match(/YOC\s*-\s*(\d{4})/);
              const rnvMatch = parts[1] && parts[1].match(/RNV\s*-\s*(\d{4})/);
              if (yocMatch) yoc = yocMatch[1];
              if (rnvMatch) rnv = rnvMatch[1];
            } else if (cell.startsWith('Current Owner')) {
              const match = cell.match(/Current Owner\s*-\s*(.+)/);
              if (match) currentOwner = match[1].trim();
            } else if (cell.startsWith('Previous Owner')) {
              const match = cell.match(/Previous Owner\s*-\s*(.+)/);
              if (match) previousOwner = match[1].trim();
            } else if (cell.startsWith('Asking Lease Rate')) {
              const match = cell.match(/Asking Lease Rate\s*-\s*(.+)/);
              if (match) leaseRate = match[1].trim();
            } else if (cell.startsWith('Vacancy Rate')) {
              const match = cell.match(/Vacancy Rate\s*-\s*(.+)/);
              if (match) vacancyRate = match[1].trim();
            }
          });

          // Derive Sub Market from address (city part)
          let subMarket = "";
          if (address.includes(',')) {
            const parts = address.split(',');
            if (parts[1]) subMarket = parts[1].trim();
          }

          setValues((prev) => ({
            ...prev,
            address,
            subMarket,
            yoc,
            rnv,
            currentOwner,
            previousOwner,
            leaseRate,
            vacancyRate,
          }));
        },
        error: (err) => console.error('Metadata parse error:', err),
      });

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          console.log('Parsed CSV stacking data:', results.data);
        },
        error: (err) => {
          console.error('Error parsing CSV:', err);
          alert('Failed to parse CSV file.');
        },
      });
    } else {
      alert('Please upload a valid CSV file.');
      setCsvFile(null);
      setCsvData([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const buffer = new Uint8Array(reader.result);
        setImageBuffer(buffer);
        const blob = new Blob([buffer], { type: file.type });
        setImagePreview(URL.createObjectURL(blob));
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...values,
      img: imageBuffer ? Array.from(imageBuffer) : null,
      csvStackingData: csvData.length ? csvData : null,
    };

    axios
      .post(process.env.REACT_APP_URI + '/buildings', data, { withCredentials: true })
      .then((res) => {
        console.log('Building added successfully:', res.data);
        navigate('/manager', { state: { reloadBuildings: true } });
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          alert('Address already exists');
        } else {
          console.error('There was an error adding the data!', error);
        }
      });
  };


  return (
    <>
      <EmployeeProtectedPage>
        <div>
          <Navbar />
          <div className="container2">
            <h2 className="title-update">Add</h2>

            {/* CSV import at top */}
            <div className="form-div">
              <label className="label">Import CSV Stacking Plan:</label>
              <input
                className="input"
                type="file"
                accept=".csv"
                onChange={handleCsvChange}
              />
              {csvFile && (
                <p className="file-name">
                  Parsed {csvData.length} stacking records from {csvFile.name}
                </p>
              )}
            </div>
          <form className="form-add" onSubmit={handleSubmit}>
            <div className="inner-content">
              <div className="input-values">
                <div className="address-input">
                  {/* 1 */}
                  <div className="form-div">
                    <label className="label">Address:</label>
                    <input
                      className="input"
                      type="text"
                      name="address"
                      placeholder="Enter Address"
                      value={values.address}
                      onChange={(e) =>
                        setValues({ ...values, address: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="other-inputs">
                  <div className="first-5">
                    {/* 2 */}
                    <div className="form-div">
                      <label className="label">Sub Market:</label>
                      <input
                        className="input"
                        type="text"
                        name="subMarket"
                        placeholder="Enter Sub Market"
                        value={values.subMarket}
                        onChange={(e) =>
                          setValues({ ...values, subMarket: e.target.value })
                        }
                      />
                    </div>
                    {/* 3 */}
                    <div className="form-div">
                      <label className="label">YOC:</label>
                      <input
                        className="input"
                        type="text"
                        name="yoc"
                        placeholder="Enter Year of Completion"
                        value={values.yoc}
                        onChange={(e) => setValues({ ...values, yoc: e.target.value })}
                      />
                    </div>
                    {/* 4 */}
                    <div className="form-div">
                      <label className="label">Current Owner:</label>
                      <input
                        className="input"
                        type="text"
                        name="current"
                        placeholder="Enter Current Owner"
                        value={values.currentOwner}
                        onChange={(e) =>
                          setValues({ ...values, currentOwner: e.target.value })
                        }
                      />
                    </div>
                    {/* 5 */}
                    <div className="form-div">
                      <label className="label">Previous Owner:</label>
                      <input
                        className="input"
                        type="text"
                        name="previous"
                        placeholder="Enter Previous Owner"
                        value={values.previousOwner}
                        onChange={(e) =>
                          setValues({ ...values, previousOwner: e.target.value })
                        }
                      />
                    </div>
                    {/* 5 */}
                    <div className="form-div">
                      <label className="label">RSF:</label>
                      <input
                        className="input"
                        type="text"
                        name="previous"
                        placeholder="Enter Building Size"
                        value={values.rsf}
                        onChange={(e) =>
                          setValues({ ...values, rsf: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="next-5">
                    {/* 6 */}
                    <div className="form-div">
                      <label className="label">Lease Rate:</label>
                      <input
                        className="input"
                        type="text"
                        name="lease"
                        placeholder="Enter Lease Rate"
                        value={values.leaseRate}
                        onChange={(e) =>
                          setValues({ ...values, leaseRate: e.target.value })
                        }
                      />
                    </div>
                    {/* 6 */}
                    <div className="form-div">
                      <label className="label">RNV:</label>
                      <input
                        className="input"
                        type="text"
                        name="rnv"
                        placeholder="Enter Renovation Year"
                        value={values.rnv}
                        onChange={(e) =>
                          setValues({ ...values, rnv: e.target.value })
                        }
                      />
                    </div>
                    {/* 7 */}
                    <div className="form-div">
                      <label className="label">Vacancy Rate:</label>
                      <input
                        className="input"
                        type="text"
                        name="vacancy"
                        placeholder="Enter Vacancy Rate"
                        value={values.vacancyRate}
                        onChange={(e) =>
                          setValues({ ...values, vacancyRate: e.target.value })
                        }
                      />
                    </div>
                    {/* 8 */}
                    <div className="form-div">
                      <label className="label">Last Sold For:</label>
                      <input
                        className="input"
                        type="text"
                        name="lsf"
                        placeholder="Enter Last Sold For Price"
                        value={values.lsf}
                        onChange={(e) => setValues({ ...values, lsf: e.target.value })}
                      />
                    </div>
                    {/* 9 */}
                    <div className="form-div">
                      <label className="label">On:</label>
                      <input
                        className="input"
                        type="text"
                        name="on"
                        placeholder="Enter Date Purchased"
                        value={values.on}
                        onChange={(e) => setValues({ ...values, on: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="img-upload-container">
                <div className="upload-container-add">
                  {/* Image uploader */}
                  <div className="form-div">
                    <label className="label">Upload New Image:</label>
                    <input
                      className="input-update"
                      type="file"
                      accept="image/*"
                      name="image"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* Preview of the uploaded image */}
                  {imagePreview && (
                    <div className="form-div">
                      <label className="label">Image Preview:</label>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: "300px", height: "auto" }}
                      />
                    </div>
                  )}

                </div>
              </div> 
            </div>
            <button className="add--add-btn" type="submit">Add</button>
          </form>
        </div>
        </div>
      </EmployeeProtectedPage>
    </>
  );
}

export default Add;
