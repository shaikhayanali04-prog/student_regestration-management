import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/coaching-project/backend/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api;
