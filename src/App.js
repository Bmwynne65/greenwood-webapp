import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute"
import { AuthProvider } from "./utils/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from 'axios'

import Home from "./components/Pages/home/Home"
import Manager from "./components/Pages/manager/Manager"
import Update from "./features/editBuilding/Update"
import Edit from "./features/editBuilding/Edit"
import Map from "./components/Pages/map/Map"
import Add from "./features/add/Add"
import Tenant from "./components/Pages/tenantPage/Tenant"
import SignIn from "./components/Pages/sign-in/Signup"
import UserManagement from "./components/Pages/userManagement/userManagement"
import StackingPage from "./components/Pages/stacking plan/StackingPlan";

import Unauthorized from "./components/Pages/unauthorized/unauthorized"
import AdminProtectedPage from "./components/Pages/userAccess/AdminProtectedPage"

import "./App.css"

axios.defaults.withCredentials = true;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        {/* <Router basename="/">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/edit/:id" exact element={<Edit />} />
            <Route path="/map" exact element={<Map />} />
            <Route path="/add" exact element={<Add />} />
            <Route path="/tenant/:id" exact element={<Tenant />} />
          </Routes>
        </Router> */}

        {/* <Router basename="/">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/manager"
              element={
                <AdminProtectedPage>
                  <Manager />
                </AdminProtectedPage>
              }
            />
          </Routes>
        </Router> */}

        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/manager" element={<Manager />} />
              <Route path="/map" exact element={<Map />} />
              <Route path="/user-management" exact element={<UserManagement />} />
              <Route path="/unauthorized" element={<SignIn />} />
              <Route path="/add" exact element={<Add />} /> 
              <Route path="/tenant/:id" exact element={<Tenant />} />
              <Route path="/edit/:id" exact element={<Edit />} />
              <Route path="/stackingPage/:id" exact element={<StackingPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
