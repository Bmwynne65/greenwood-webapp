import React, { useEffect, useState } from "react";
import "../editBuilding/Edit.css";
import "./Add.css";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/nav/Navbar";
import EmployeeProtectedPage from "../../components/Pages/userAccess/EmployeeProtectedPage";

function Add() {
  const [imageBuffer, setImageBuffer] = useState(null); // To store the binary of the uploaded image
  const [imagePreview, setImagePreview] = useState(""); // To preview the uploaded image

  const [values, setValues] = useState({
    address: "",
    subMarket: "",
    yoc: "",
    rnv: "",
    currentOwner: "",
    previousOwner: "",
    leaseRate: "",
    rsf: "",
    lsf: "",
    on: "",
    link: "",
  });

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare the data object
    const data = {
      ...values,
      vacancyRate: values.vacancyRate ? values.vacancyRate : null, // Default to 0 if not provided
      img: imageBuffer ? Array.from(imageBuffer) : null, // Ensure we send the binary image as an array
    };
    console.log("Data to be sent:", data);
    axios
      .post(process.env.REACT_APP_URI + "/buildings", data)
      .then((res) => {
        console.log("Building added successful:", res.data);
        navigate("/manager");
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          alert("Address already exists"); // Display an alert or handle it however you like
        } else {
          console.error("There was an error adding the data!", error);
        }
      }, { withCredentials: true });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result; // This is an ArrayBuffer
        const buffer = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array
        setImageBuffer(buffer); // Set image buffer for binary storage

        // Optionally, you can display a preview
        const blob = new Blob([buffer], { type: file.type });
        const previewUrl = URL.createObjectURL(blob);
        setImagePreview(previewUrl);
      };
      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    } else {
      alert("Please upload a valid image file.");
    }
  };

  return (
    <>
      <EmployeeProtectedPage>
        <div>
        <Navbar />
        <div className="container2">
          <h2 className="title-update">Add</h2>
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
            <button className="add--add-btn">Add</button>
          </form>
        </div>
        </div>
      </EmployeeProtectedPage>
    </>
  );
}

export default Add;
