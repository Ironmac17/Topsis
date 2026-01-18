import axios from "axios";

const api = axios.create({
  baseURL: "https://topsis-production-ca26.up.railway.app/api",
});

export default api;
