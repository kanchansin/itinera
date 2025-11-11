import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"
import HomeScreen from "../screens/Home/HomeScreen"
import ExploreScreen from "../screens/Explore/ExploreScreen"
import CreateTripScreen from "../screens/CreateTrip/CreateTripScreen"
import DiscoverScreen from "../screens/Discover/DiscoverScreen"
import ProfileScreen from "../screens/Profile/ProfileScreen"

const Tab = createBottomTabNavigator()

export default function TripNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Explore") {
            iconName = focused ? "compass" : "compass-outline"
          } else if (route.name === "CreateTrip") {
            iconName = "add-circle"
          } else if (route.name === "Discover") {
            iconName = focused ? "search" : "search-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          if (route.name === "CreateTrip") {
            return (
              <View
                style={{
                  position: "absolute",
                  top: -20,
                  backgroundColor: "#3b82f6",
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons name={iconName} size={32} color="#ffffff" />
              </View>
            )
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: "Explore",
        }}
      />
      <Tab.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: "Discover",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  )
}