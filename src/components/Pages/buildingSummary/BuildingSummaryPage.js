import "../../../App";
import Footer from "../../footer/Footer";
import BuildingSummary from "../../../features/buildingSummary/buildingSummary";
import Navbar from "../../nav/Navbar";

function BuildingSummaryPage() {
  return (
    <>
      <Navbar />
      <BuildingSummary />
      <Footer />
    </>
  );
}

export default BuildingSummaryPage;
