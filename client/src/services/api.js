import axios from "axios";

const api = axios.create({
  baseURL: "https://topsis.up.railway.app/api",
});

export default api;
