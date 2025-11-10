"use client"
import { AuthProvider } from "./src/context/AuthContext"
import { TripProvider } from "./src/context/TripContext"
import { RootNavigator } from "./src/navigation/RootNavigator"

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <RootNavigator />
      </TripProvider>
    </AuthProvider>
  )
}
