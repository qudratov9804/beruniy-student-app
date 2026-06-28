import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);
