import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/web';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Company', 'Geofence', 'Schema', 'Dashboard', 'ApiKey', 'Layout', 'Service'],
  endpoints: (builder) => ({
    // --- AUTH ---
    login: builder.mutation({
      queryFn: async ({ username, password }, _api, _extraOptions, fetchWithBQ) => {
        const response = await fetchWithBQ({
          url: '/auth/login',
          method: 'POST',
          body: { username, password },
        });

        if (response.error) return { error: response.error };

        // Salva token imediatamente para o restoreSession poder usá-lo
        const { token, user } = response.data.data;
        if (token) localStorage.setItem('token', token);

        return { data: { token, user } };
      },
    }),

    restoreSession: builder.mutation({
      queryFn: async (_, _api, _extraOptions, fetchWithBQ) => {
        const token = localStorage.getItem('token');

        if (!token) {
          return {
            error: {
              status: 401,
              data: { detail: { code: 'NO_TOKEN_FOUND', message: 'Token não encontrado' } },
            },
          };
        }

        const response = await fetchWithBQ({
          url: '/auth/session/restore',
          method: 'POST',
        });

        if (response.error) {
          if (response.error.status === 'FETCH_ERROR') {
            // Offline: mantém sessão local
            return { data: { user: null, token, isOffline: true } };
          }
          localStorage.removeItem('token');
          return { error: response.error };
        }

        return {
          data: {
            user: response.data.data.user, // inclui company_type
            token,
            isOffline: false,
          },
        };
      },
    }),

    devResetPassword: builder.mutation({
      query: ({ username, new_password }) => ({
        url: '/auth/dev/reset-password',
        method: 'POST',
        body: { username, new_password },
      }),
    }),

    // --- API KEYS ---
    generateApiKey: builder.mutation({
      query: () => ({ url: '/api-key/generate', method: 'POST' }),
      invalidatesTags: ['ApiKey'],
    }),

    validateApiKey: builder.query({
      query: () => '/api-key/validate',
      providesTags: ['ApiKey'],
    }),

    // --- GEOFENCE ---
    getGeofence: builder.query({
      query: () => '/config/geofence',
      providesTags: ['Geofence'],
    }),
    
    updateGeofence: builder.mutation({
      query: (body) => ({
        url: '/config/geofence',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Geofence'],
    }),

    // --- USERS ---
    getUsers: builder.query({
      query: () => '/users',
      transformResponse: (res) => res.data,
      providesTags: ['User'],
    }),
    
    createUser: builder.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // --- COMPANY ---
    getCompanyInfo: builder.query({
      query: () => '/config/company/info',
      transformResponse: (res) => res.data,
      providesTags: ['Company'],
    }),
    
    updateCompanyInfo: builder.mutation({
      query: (body) => ({ url: '/config/company/info', method: 'PUT', body }),
      invalidatesTags: ['Company'],
    }),

    // --- LAYOUTS ---
    getLayouts: builder.query({
      query: () => '/config/appointment/layouts',
      transformResponse: (res) => res.data,
      providesTags: ['Layout'],
    }),
    getLayoutByRef: builder.query({
      query: (ref) => `/config/appointment/layouts/${ref}`,
      transformResponse: (res) => res.data,
      providesTags: ['Layout'],
    }),
    upsertLayout: builder.mutation({
      query: (body) => ({ url: '/config/appointment/layouts', method: 'PUT', body }),
      invalidatesTags: ['Layout'],
    }),
    deleteLayout: builder.mutation({
      query: (ref) => ({ url: `/config/appointment/layouts/${ref}`, method: 'DELETE' }),
      invalidatesTags: ['Layout'],
    }),

    // --- SERVICES ---
    getServices: builder.query({
      query: () => '/services',
      transformResponse: (res) => res.data,
      providesTags: ['Service'],
    }),
    createService: builder.mutation({
      query: (body) => ({ url: '/services', method: 'POST', body }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/services/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Service'],
    }),
    updateServicesStatus: builder.mutation({
      query: (body) => ({ url: '/services/status', method: 'PATCH', body }),
      invalidatesTags: ['Service'],
    }),
    deleteServices: builder.mutation({
      query: (body) => ({ url: '/services', method: 'DELETE', body }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRestoreSessionMutation,
  useDevResetPasswordMutation,
  useGenerateApiKeyMutation,
  useValidateApiKeyQuery,
  useGetGeofenceQuery,
  useUpdateGeofenceMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCompanyInfoQuery,
  useUpdateCompanyInfoMutation,
  
  // --- LAYOUTS ---
  useGetLayoutsQuery,
  useGetLayoutByRefQuery,
  useUpsertLayoutMutation,
  useDeleteLayoutMutation,

  // --- SERVICES ---
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUpdateServicesStatusMutation,
  useDeleteServicesMutation,
} = api;