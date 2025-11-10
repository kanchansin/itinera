import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken")
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        })

        const { accessToken } = response.data
        await AsyncStorage.setItem("accessToken", accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (err) {
        await AsyncStorage.removeItem("accessToken")
        await AsyncStorage.removeItem("refreshToken")
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export default api
