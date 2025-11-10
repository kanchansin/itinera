import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAuth } from "../hooks/useAuth"
import AuthNavigator from "./AuthNavigator"
import TripNavigator from "./TripNavigator"
import SplashScreen from "../screens/Auth/SplashScreen"

const Stack = createNativeStackNavigator()

export const RootNavigator = () => {
  const { state } = useAuth()

  if (state.isLoading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.userToken == null ? (
          <Stack.Group>
            <Stack.Screen name="Auth" component={AuthNavigator} options={{ animationEnabled: false }} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Trips" component={TripNavigator} options={{ animationEnabled: false }} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
