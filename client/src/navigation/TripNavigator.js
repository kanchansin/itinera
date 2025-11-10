import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
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
        headerShown: true,
        tabBarActiveTintColor: "#1e3a8a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#f3f4f6",
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: "#ffffff",
          borderBottomColor: "#f3f4f6",
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = "home"
          } else if (route.name === "Explore") {
            iconName = "compass"
          } else if (route.name === "CreateTrip") {
            iconName = "add-circle"
          } else if (route.name === "Discover") {
            iconName = "search"
          } else if (route.name === "Profile") {
            iconName = "person"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "My Trips",
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explore Trips",
          tabBarLabel: "Explore",
        }}
      />
      <Tab.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          title: "Create Trip",
          tabBarLabel: "Create",
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: "Discover",
          tabBarLabel: "Discover",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  )
}
