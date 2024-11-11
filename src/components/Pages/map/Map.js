import React from "react"
import Footer from "../../footer/Footer"
import MapWithMarkers from "../../../features/map/MapWithMarkers"
import Navbar from "../../nav/Navbar"
import EmployeeProtectedPage from "../userAccess/EmployeeProtectedPage"

function Map() {
  return (
    <EmployeeProtectedPage>
      <div style={{ width: "100%", height: "100vh" }}>
        {/* <BuildingMap /> */}
        <Navbar />
        <MapWithMarkers />
        <Footer />
      </div>
    </EmployeeProtectedPage> 
  );
}

export default Map;
