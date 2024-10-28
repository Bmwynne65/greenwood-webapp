import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Home from "./components/Pages/home/Home"
import Manager from "./components/Pages/manager/Manager"
import Update from "./features/editBuilding/Update"
import Edit from "./features/editBuilding/Edit"
import Map from "./components/Pages/map/Map"
import Add from "./features/add/Add"
import Tenant from "./components/Pages/tenant/Tenant"
import "./App.css"


function App() {
  return (
    <>
      <div className="app-container">
        <Router basename="/">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/manager" element={<Manager />} />
            {/* <Route path="/update/:id" exact element={<Update />} /> */}
            <Route path="/edit/:id" exact element={<Edit />} />
            <Route path="/map" exact element={<Map />} />
            <Route path="/add" exact element={<Add />} />
            <Route path="/tenant/:id" exact element={<Tenant />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
