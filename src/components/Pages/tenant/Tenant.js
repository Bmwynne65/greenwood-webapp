import React from "react";
import "../../../App";
import Footer from "../../footer/Footer";
import BuildingTenants from "../../../features/tenant/BuildingTenants"
import Navbar from "../../nav/Navbar";

function Tenant() {
  return (
    <>
      <Navbar />
      <BuildingTenants />
      <Footer />
    </>
  );
}

export default Tenant;
