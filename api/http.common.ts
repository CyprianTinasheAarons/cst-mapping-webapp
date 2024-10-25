import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://middleware-cst-api.onrender.com"
    : "http://127.0.0.1:8000";

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-type": "application/json",
  },
});

export default instance;
