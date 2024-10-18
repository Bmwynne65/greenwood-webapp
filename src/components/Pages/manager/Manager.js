import React from "react";
import "../../../App";
import Footer from "../../footer/Footer";
import DisplayBldgInfo from "../../../features/buildingInformation/DisplayBldgInfo";
import Navbar from "../../nav/Navbar";

function AddEditRemove() {
  return (
    <>
      <Navbar />
      <DisplayBldgInfo />
      <Footer />
    </>
  );
}

export default AddEditRemove;
