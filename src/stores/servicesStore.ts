import { create } from 'zustand';
import { Service, ServiceFormData, ServiceResponse, PaginationInfo } from '../types/services';
import { v4 as uuidv4 } from 'uuid';

interface ServicesState {
  // Services data
  services: Service[];
  currentService: Service | null;
  isLoading: boolean;
  
  // UI state
  showServiceEditor: boolean;
  viewMode: 'card' | 'table';
  searchTerm: string;
  pagination: PaginationInfo;
  
  // Editor state
  isExecuting: boolean;
  lastResponse: ServiceResponse | null;
  
  // Actions
  loadServices: () => Promise<void>;
  createService: (serviceData: ServiceFormData) => Promise<void>;
  updateService: (id: string, serviceData: ServiceFormData) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  executeService: (service: Service) => Promise<ServiceResponse>;
  
  // UI actions
  setCurrentService: (service: Service | null) => void;
  toggleServiceEditor: () => void;
  setViewMode: (mode: 'card' | 'table') => void;
  setSearchTerm: (term: string) => void;
  setPagination: (pagination: Partial<PaginationInfo>) => void;
}

// Mock data for demonstration
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Get User Profile',
    description: 'Fetch user profile information',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: { 'Content-Type': 'application/json' },
    queryParams: {},
    body: '',
    bodyType: 'none',
    auth: { type: 'none', config: {} },
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: '{"id": 1, "name": "John Doe", "email": "john@example.com"}',
      responseTime: 245,
      size: 1024
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    tags: ['user', 'profile']
  },
  {
    id: '2',
    name: 'Create Post',
    description: 'Create a new blog post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: { 'Content-Type': 'application/json' },
    queryParams: {},
    body: '{"title": "New Post", "body": "Post content", "userId": 1}',
    bodyType: 'json',
    auth: { type: 'bearer', config: { token: 'your-token-here' } },
    response: {
      status: 201,
      statusText: 'Created',
      headers: { 'content-type': 'application/json' },
      body: '{"id": 101, "title": "New Post", "body": "Post content", "userId": 1}',
      responseTime: 312,
      size: 256
    },
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
    tags: ['post', 'create']
  }
];

export const useServicesStore = create<ServicesState>((set, get) => ({
  // Initial state
  services: [],
  currentService: null,
  isLoading: false,
  showServiceEditor: false,
  viewMode: 'card',
  searchTerm: '',
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },
  isExecuting: false,
  lastResponse: null,

  // Actions
  loadServices: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { searchTerm, pagination } = get();
      let filteredServices = mockServices;
      
      if (searchTerm) {
        filteredServices = mockServices.filter(service =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      const total = filteredServices.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedServices = filteredServices.slice(startIndex, endIndex);
      
      set({
        services: paginatedServices,
        pagination: { ...pagination, total, totalPages },
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createService: async (serviceData) => {
    try {
      const newService: Service = {
        id: uuidv4(),
        ...serviceData,
        headers: serviceData.headers.reduce((acc, header) => {
          if (header.enabled && header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {} as Record<string, string>),
        queryParams: serviceData.queryParams.reduce((acc, param) => {
          if (param.enabled && param.key && param.value) {
            acc[param.key] = param.value;
          }
          return acc;
        }, {} as Record<string, string>),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockServices.push(newService);
      await get().loadServices();
      set({ showServiceEditor: false, currentService: null });
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  },

  updateService: async (id, serviceData) => {
    try {
      const index = mockServices.findIndex(s => s.id === id);
      if (index !== -1) {
        mockServices[index] = {
          ...mockServices[index],
          ...serviceData,
          headers: serviceData.headers.reduce((acc, header) => {
            if (header.enabled && header.key && header.value) {
              acc[header.key] = header.value;
            }
            return acc;
          }, {} as Record<string, string>),
          queryParams: serviceData.queryParams.reduce((acc, param) => {
            if (param.enabled && param.key && param.value) {
              acc[param.key] = param.value;
            }
            return acc;
          }, {} as Record<string, string>),
          updatedAt: new Date().toISOString()
        };
      }
      
      await get().loadServices();
      set({ showServiceEditor: false, currentService: null });
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  },

  deleteService: async (id) => {
    try {
      const index = mockServices.findIndex(s => s.id === id);
      if (index !== -1) {
        mockServices.splice(index, 1);
      }
      await get().loadServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  },

  executeService: async (service) => {
    set({ isExecuting: true });
    try {
      // Build URL with query parameters
      const url = new URL(service.url);
      Object.entries(service.queryParams).forEach(([key, value]) => {
        if (key && value) {
          url.searchParams.append(key, value);
        }
      });

      const startTime = Date.now();
      
      // Prepare request options
      const requestOptions: RequestInit = {
        method: service.method,
        headers: { ...service.headers },
        mode: 'cors'
      };

      // Add authentication
      if (service.auth.type === 'bearer' && service.auth.config.token) {
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Bearer ${service.auth.config.token}`
        };
      } else if (service.auth.type === 'basic' && service.auth.config.username && service.auth.config.password) {
        const credentials = btoa(`${service.auth.config.username}:${service.auth.config.password}`);
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Basic ${credentials}`
        };
      } else if (service.auth.type === 'api-key' && service.auth.config.key && service.auth.config.value) {
        requestOptions.headers = {
          ...requestOptions.headers,
          [service.auth.config.key]: service.auth.config.value
        };
      }

      // Add body for non-GET requests
      if (service.method !== 'GET' && service.body) {
        requestOptions.body = service.body;
      }

      const response = await fetch(url.toString(), requestOptions);
      const responseTime = Date.now() - startTime;
      const responseText = await response.text();
      
      const serviceResponse: ServiceResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        responseTime,
        size: new Blob([responseText]).size
      };

      // Update the service with the response
      const serviceIndex = mockServices.findIndex(s => s.id === service.id);
      if (serviceIndex !== -1) {
        mockServices[serviceIndex].response = serviceResponse;
        mockServices[serviceIndex].updatedAt = new Date().toISOString();
      }

      set({ lastResponse: serviceResponse, isExecuting: false });
      await get().loadServices();
      
      return serviceResponse;
    } catch (error) {
      const errorResponse: ServiceResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 0,
        size: 0
      };
      
      set({ lastResponse: errorResponse, isExecuting: false });
      return errorResponse;
    }
  },

  // UI actions
  setCurrentService: (service) => set({ currentService: service }),
  
  toggleServiceEditor: () => set((state) => ({ 
    showServiceEditor: !state.showServiceEditor,
    currentService: state.showServiceEditor ? null : state.currentService
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  }))
}));