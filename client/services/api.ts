const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

const apiCall = async (endpoint: string, options: RequestOptions = {}) => {
  const { method = 'GET', headers = {}, body } = options;

  const requestOptions: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    console.log('[API] Making request:', method, `${API_URL}${endpoint}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      console.log('[API] Response not ok, attempting to parse error');
      let errorData;
      try {
        errorData = await response.json();
        console.log('[API] Error response:', errorData);
      } catch (parseErr) {
        console.log('[API] Could not parse error response as JSON');
        errorData = { error: response.statusText || 'Request failed' };
      }
      throw new Error(errorData.error || 'Request failed');
    }

    const responseData = await response.json();
    console.log('[API] Success response received');
    return responseData;
  } catch (error: any) {
    console.error('[API] Error:', error.message);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server not responding');
    }
    throw error;
  }
};

export const authAPI = {
  verifyFirebaseToken: (idToken: string) =>
    apiCall('/auth/firebase', {
      method: 'POST',
      body: { idToken },
    }),

  refreshToken: (refreshToken: string) =>
    apiCall('/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken },
    }),
};

export const tripsAPI = {
  createTrip: (data: any, token: string) =>
    apiCall('/trips', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    }),

  getTrips: (token: string) =>
    apiCall('/trips', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getTripById: (id: string, token: string) =>
    apiCall(`/trips/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateTrip: (id: string, data: any, token: string) =>
    apiCall(`/trips/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    }),

  deleteTrip: (id: string, token: string) =>
    apiCall(`/trips/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPublicTrips: (destination?: string, limit?: number, offset?: number) => {
    let endpoint = '/trips/explore/feed';
    const params = new URLSearchParams();
    if (destination) params.append('destination', destination);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;
    return apiCall(endpoint, { method: 'GET' });
  },

  calculateDuration: (stops: any[], transport: string = 'driving') =>
    apiCall('/trips/calculate-duration', {
      method: 'POST',
      body: { stops, transport },
    }),
};

export const destinationsAPI = {
  getDestinations: (limit: number = 20, offset: number = 0) =>
    apiCall(`/destinations?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    }),

  getDestinationById: (id: string) =>
    apiCall(`/destinations/${id}`, {
      method: 'GET',
    }),

  searchDestinations: (query: string, latitude?: number, longitude?: number) => {
    let endpoint = `/destinations/search?query=${encodeURIComponent(query)}`;
    if (latitude && longitude) {
      endpoint += `&latitude=${latitude}&longitude=${longitude}`;
    }
    return apiCall(endpoint, { method: 'GET' });
  },

  getReviews: (destinationId: string, limit: number = 10) =>
    apiCall(`/destinations/${destinationId}/reviews?limit=${limit}`, {
      method: 'GET',
    }),

  addReview: (destinationId: string, data: any, token: string) =>
    apiCall(`/destinations/${destinationId}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    }),
};

export const usersAPI = {
  getProfile: (token: string) =>
    apiCall('/users/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (data: any, token: string) =>
    apiCall('/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    }),
};

export const tripInteractionAPI = {
  likeTrip: (tripId: string, token: string) =>
    apiCall(`/interactions/${tripId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  unlikeTrip: (tripId: string, token: string) =>
    apiCall(`/interactions/${tripId}/like`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  saveTrip: (tripId: string, token: string) =>
    apiCall(`/interactions/${tripId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  unsaveTrip: (tripId: string, token: string) =>
    apiCall(`/interactions/${tripId}/save`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getSavedTrips: (token: string, limit: number = 20, offset: number = 0) =>
    apiCall(`/interactions/saved?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  addComment: (tripId: string, comment: string, token: string) =>
    apiCall(`/interactions/${tripId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { comment },
    }),

  getComments: (tripId: string, limit: number = 10) =>
    apiCall(`/interactions/${tripId}/comments?limit=${limit}`, {
      method: 'GET',
    }),
};

export const aiAPI = {
  generateTripSummary: (tripData: any) =>
    apiCall('/ai/generate-summary', {
      method: 'POST',
      body: tripData,
    }),

  estimateVisitDuration: (placeName: string, reviews?: string[]) =>
    apiCall('/ai/estimate-duration', {
      method: 'POST',
      body: { placeName, reviews: reviews || [] },
    }),

  analyzeSentiment: (text: string) =>
    apiCall('/ai/analyze-sentiment', {
      method: 'POST',
      body: { text },
    }),
};