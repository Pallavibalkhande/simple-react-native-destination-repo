import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

class ApiService {
  private static instance: ApiService;
  private client: AxiosInstance;

  private constructor() {
    const baseURL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.example.com';
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.client.interceptors.request.use(this.handleRequest);
    this.client.interceptors.response.use(this.handleResponse, this.handleError);
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async handleRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    config.headers = {
      ...config.headers,
      'X-Platform': Platform.OS,
    };
    return config;
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  private handleError(error: any): Promise<never> {
    return Promise.reject(error);
  }

  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, { params, ...config });
    return { data: response.data, status: response.status };
  }

  async post<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, body, config);
    return { data: response.data, status: response.status };
  }

  async put<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, body, config);
    return { data: response.data, status: response.status };
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return { data: response.data, status: response.status };
  }
}

export default ApiService.getInstance();