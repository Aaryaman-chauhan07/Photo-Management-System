import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
export const uploadPhoto = (fd) => api.post('/photos/upload', fd);
export const sendMessage = (m) => api.post('/chat/message', { message: m });
export default api;