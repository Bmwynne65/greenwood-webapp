import React from "react";
import "../../../App";
import Footer from "../../footer/Footer";
import DisplayBldgInfo from "../../../features/buildingInformation/DisplayBldgInfo";
import Navbar from "../../nav/Navbar";
import EmployeeProtectedPage from "../userAccess/EmployeeProtectedPage"

function Manager() {
  return (
    <EmployeeProtectedPage>
      <Navbar />
      <DisplayBldgInfo />
      <Footer />
    </EmployeeProtectedPage>
  );
}

export default Manager;
