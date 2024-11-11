import React from "react";
import "../../../App";
import Footer from "../../footer/Footer";
import UserInformation from "../../../features/userInformation/userInformation";
import Navbar from "../../nav/Navbar";
import AdminProtectedPage from "../userAccess/AdminProtectedPage";

function UserManagement() {
  return (
    <AdminProtectedPage>
      <Navbar />
      <UserInformation />
      <Footer />
    </AdminProtectedPage>
  );
}

export default UserManagement;
