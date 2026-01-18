import axios from "axios";

const api = axios.create({
  baseURL: "topsis-production-ca26.up.railway.app/api",
});

export default api;
