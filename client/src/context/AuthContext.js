"use client"

import React, { createContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../utils/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialState)

  useEffect(() => {
    bootstrapAsync()
  }, [])

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      if (token) {
        const response = await api.get("/users/profile")
        dispatch({ type: "RESTORE_TOKEN", payload: { token, user: response.data } })
      } else {
        dispatch({ type: "RESTORE_TOKEN", payload: { token: null } })
      }
    } catch (e) {
      dispatch({ type: "RESTORE_TOKEN", payload: { token: null } })
    }
  }

  const authContext = {
    state,
    signIn: async (email, password) => {
      try {
        const response = await api.post("/auth/login", { email, password })
        const { accessToken, refreshToken, user } = response.data
        await AsyncStorage.setItem("accessToken", accessToken)
        await AsyncStorage.setItem("refreshToken", refreshToken)
        dispatch({ type: "SIGN_IN", payload: { user } })
      } catch (error) {
        throw error
      }
    },
    signUp: async (name, email, password) => {
      try {
        const response = await api.post("/auth/register", { name, email, password })
        const { accessToken, refreshToken, user } = response.data
        await AsyncStorage.setItem("accessToken", accessToken)
        await AsyncStorage.setItem("refreshToken", refreshToken)
        dispatch({ type: "SIGN_UP", payload: { user } })
      } catch (error) {
        throw error
      }
    },
    signOut: async () => {
      await AsyncStorage.removeItem("accessToken")
      await AsyncStorage.removeItem("refreshToken")
      dispatch({ type: "SIGN_OUT" })
    },
  }

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
}

const initialState = {
  isLoading: true,
  isSignout: false,
  user: null,
}

const authReducer = (prevState, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...prevState,
        userToken: action.payload.token,
        user: action.payload.user,
        isLoading: false,
      }
    case "SIGN_IN":
      return {
        ...prevState,
        isSignout: false,
        user: action.payload.user,
        userToken: action.payload.token,
      }
    case "SIGN_UP":
      return {
        ...prevState,
        isSignout: false,
        user: action.payload.user,
        userToken: action.payload.token,
      }
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignout: true,
        user: null,
        userToken: null,
      }
    default:
      return prevState
  }
}
