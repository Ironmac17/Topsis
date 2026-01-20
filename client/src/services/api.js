import axios from "axios";

const api = axios.create({
  baseURL: "https://topsis-backend.vercel.app/api",
});

export default api;
