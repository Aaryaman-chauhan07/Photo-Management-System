import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const uploadPhoto = (formData) => API.post('/photos/upload', formData);
export const getIdentities = () => API.get('/photos/identities');
export const updateIdentity = (id, name) => API.put(`/photos/identities/${id}`, { name });
export const getDeliveryHistory = () => API.get('/photos/delivery/history');
export const getChatResponse = (query) => API.post('/chat/ask', { query });

export default API;