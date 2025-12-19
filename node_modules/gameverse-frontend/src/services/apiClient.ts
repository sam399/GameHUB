import axios from 'axios';

/**
 * API Client Configuration for Netlify
 * This file shows how to configure axios for Netlify deployment
 * 
 * Usage:
 * import apiClient from './apiClient';
 * apiClient.get('/games').then(res => console.log(res.data));
 */

const API_URL = import.meta.env.VITE_API_URL || '/.netlify/functions/api';

console.log('API URL:', API_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * API Routes Mapping
 * 
 * All routes are now under /.netlify/functions/api
 * 
 * Examples:
 * - GET /.netlify/functions/api/games
 * - POST /.netlify/functions/api/auth/login
 * - GET /.netlify/functions/api/users/profile
 * - PUT /.netlify/functions/api/users/profile
 */

// Usage examples in components:

/*
import apiClient from '@/services/apiClient';

// Get all games
const fetchGames = async () => {
  try {
    const response = await apiClient.get('/games');
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching games:', error);
  }
};

// Get single game
const fetchGame = async (gameId) => {
  try {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game:', error);
  }
};

// Login
const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Create review
const createReview = async (gameId, rating, content) => {
  try {
    const response = await apiClient.post('/reviews', {
      gameId,
      rating,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
  }
};

// Update user profile
const updateProfile = async (userData) => {
  try {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
*/
