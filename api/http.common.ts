import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://cst-api.onrender.com"
    : "http://localhost:8000";

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-type": "application/json",
  },
});

export default instance;
