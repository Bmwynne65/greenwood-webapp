// axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_URI, // Backend URL
  withCredentials: true, // Send cookies with requests
});

export default api;
