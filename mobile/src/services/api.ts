import axios from 'axios';
import Constants from 'expo-constants';
const NEW_API_URL = "https://local-service-project.vercel.app";

const getBaseUrl = () => {
    return NEW_API_URL;  
};

const BASE_URL = getBaseUrl();

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
    resetPassword: (data: any) => api.post('/auth/reset-password', data),
    resetPasswordDirect: (data: any) => api.post('/auth/reset-password-direct', data),
    updateProfile: (data: any, token: string) => api.patch('/auth/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export const categoriesApi = {
    findAll: () => api.get('/categories'),
    findOne: (id: string) => api.get(`/categories/${id}`),
};

export const servicesApi = {
    findAll: (params?: any) => api.get('/services', { params }),
    findOne: (id: string) => api.get(`/services/${id}`),
    create: (data: any, token: string) => api.post('/services', data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    update: (id: string, data: any, token: string) => api.patch(`/services/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    remove: (id: string, token: string) => api.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export const bookingsApi = {
    create: (data: any, token: string) => api.post('/bookings', data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    findAll: (token: string) => api.get('/bookings', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    findOne: (id: string, token: string) => api.get(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    updateStatus: (id: string, status: string, token: string) => api.patch(`/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export const chatApi = {
    getMyChats: (token: string) => api.get('/chats', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getMessages: (chatId: string, token: string) => api.get(`/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    sendMessage: (chatId: string, content: string, token: string) => api.post(`/chats/${chatId}/messages`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    initiateChat: (participantId: string, token: string) => api.get(`/chats/initiate/${participantId}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
};