// utils/api.js
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Adjust the base URL as needed
});
export default api;