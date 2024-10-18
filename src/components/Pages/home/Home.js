import React from "react"
import "../../../App"
import Navbar from "../../nav/Navbar"
import HomeContent from "./HomeContent"
import Footer from "../../footer/Footer"
function Home() {
  return (
    <>
      <Navbar />
      <HomeContent />
      <Footer />
    </>
  );
}

export default Home;
