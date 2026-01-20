import axios from "axios";

const api = axios.create({
  baseURL: "https://topsis-3s7c.vercel.app/api",
});

export default api;
