import React, { useState, useContext } from "react";
import { AuthContext } from "../../../utils/AuthContext";
import { CiUser, CiLock } from "react-icons/ci";
import { NavLink, useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import axios from "axios";
import "./SignUp.css";

function SignUp({ FormHandle }) {
  const { checkAuthStatus } = useContext(AuthContext); // Access Auth context
  const [User, setUser] = useState("");
  const [Password, setPassword] = useState("");
  const navigate = useNavigate();

  const AuthCheck = async (e) => {
    e.preventDefault();

    if (!User || !Password) {
      alert("Please Fill All the Fields");
      return;
    }

    try {
      const response = await axios.post(process.env.REACT_APP_URI + "/auth/login", {
        username: User,
        password: Password,
      }, { withCredentials: true }); // Send cookies with request

      console.log("Login response:", response);


      if (response.status === 200) {
        alert("Login Successful!");
        
        // Ensure authentication status is updated before navigating
        await checkAuthStatus(); // Wait for auth status update
        setUser("");
        setPassword("");

        navigate(`/map`); // Navigate to Manager page after auth update
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("User not found.");
      } else if (error.response && error.response.status === 401) {
        alert("Incorrect password.");
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="signin-container">
      <div className="form-container">
        <NavLink to="/" className="back-button">
          <FaArrowLeft style={{ color: 'black', fontSize: '24px', marginRight: '8px', transform: 'translateY(3px)' }} /> Back
        </NavLink>
        <h2>Sign In</h2>
        <form onSubmit={AuthCheck}>
          <div className="form-control">
            <input
              type="text"
              placeholder="Enter Username"
              onChange={(e) => setUser(e.target.value)}
              value={User}
            />
            <CiUser className="icon email" />
          </div>
          <div className="form-control">
            <input
              type="password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              value={Password}
            />
            <CiLock className="icon password" />
          </div>
          <button type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
