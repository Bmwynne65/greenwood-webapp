import React from "react"
import Footer from "../../footer/Footer"
import MapWithMarkers from "../../../features/map/MapWithMarkers"
import Navbar from "../../nav/Navbar"

function Map() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* <BuildingMap /> */}
      <Navbar />
      <MapWithMarkers />
      <Footer />
    </div>
  );
}

export default Map;
