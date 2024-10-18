import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PropertyUploader.css";
import Papa from "papaparse";

const PropertyUploader = ({ refreshBuildings }) => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  // Handle file change
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle form submit
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    // Parse CSV file using PapaParse
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const properties = results.data;

        for (const property of properties) {
          const {
            address,
            subMarket,
            yoc,
            currentOwner,
            previousOwner,
            leaseRate,
            vacancyRate,
            lsf,
            on,
            link,
          } = property;

          // Send each property to backend API
          try {
            const response = await fetch(
              `${process.env.REACT_APP_URI}/buildings`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  address,
                  subMarket,
                  yoc,
                  currentOwner,
                  previousOwner,
                  leaseRate,
                  vacancyRate,
                  lsf,
                  on,
                  link,
                }),
              }
            );

            const data = await response.json();

            if (response.ok) {
              setUploadMessage(`Property at ${address} saved successfully.`);
              refreshBuildings();
            } else {
              setUploadMessage(`Error for address ${address}: ${data.message}`);
            }
          } catch (error) {
            setUploadMessage(`Error for address ${address}: ${error.message}`);
          }
        }
      },
    });
  };
  
  return (
    <div className="import-container">
      <form onSubmit={handleSubmit}>
        <input
          className="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
        <button className="import-submit" type="submit">
          Upload
        </button>
        <p>or</p>
        <Link className="import-submit2" to={`/add`}>
          Add +
        </Link>
        {uploadMessage && (
          <div className="uploader-message">
            <p>{uploadMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default PropertyUploader;
