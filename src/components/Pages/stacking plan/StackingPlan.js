import React from "react";
import "../../../App";
import Footer from "../../footer/Footer";
import StackingPlan from "../../../features/StackingPlan/StackingPage";
import Navbar from "../../nav/Navbar";

function StackingPage() {
  return (
    <>
      <Navbar />
      <StackingPlan />
      <Footer />
    </>
  );
}

export default StackingPage;
