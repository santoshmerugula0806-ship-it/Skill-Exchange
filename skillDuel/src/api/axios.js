import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api"),
  withCredentials: true, // sends the httpOnly JWT cookie set by the backend
});

export default api;
