import axios from 'axios';
import { API_URL } from '../../config';
import { lockInSession, removeFromSession } from './../common/session';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const data = (lockInSession('user')? JSON.parse(lockInSession('user')) : null)
    if (data && data.token) {
      config.headers.Authorization = `Bearer ${data.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  },
  (error) => {
    const errorResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: null,
    };

    // Handle specific error cases
    if (error.response?.status === 401) {
      removeFromSession('user');
      window.location.href = '/';
    }

    return Promise.resolve(errorResponse);
  }
);

export default apiClient;