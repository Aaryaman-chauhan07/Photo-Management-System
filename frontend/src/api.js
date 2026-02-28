import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Activity 2.5: Secure Token Integration
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Activity 2.1 & 2.4: Core Service Routes
export const uploadPhoto = (formData) => API.post('/photos/upload', formData);
export const getPhotos = () => API.get('/photos/list');

// Activity 4.4: Identity Management Center
export const getIdentities = () => API.get('/photos/identities');
export const updateIdentity = (id, name) => API.put(`/photos/identities/${id}`, { name });

// Activity 3.3 & 3.4: Delivery Services
export const getDeliveryHistory = () => API.get('/photos/delivery/history');

// Activity 4.3: AI Chat Assistant (Groq)
export const getChatResponse = (query) => API.post('/chat/ask', { query });

export default API;