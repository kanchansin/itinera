import { AuthProvider } from "./src/context/AuthContext"
import { TripProvider } from "./src/context/TripContext"
import { RootNavigator } from "./src/navigation/RootNavigator"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { registerRootComponent } from "expo"

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <TripProvider>
            <RootNavigator />
          </TripProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

registerRootComponent(App)
