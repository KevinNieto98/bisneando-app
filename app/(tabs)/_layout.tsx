// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // 👈 oculta los títulos
        tabBarActiveTintColor: "#DAA520", // amarillo vivo
        tabBarInactiveTintColor: "#6b7280", // grisecito
        tabBarHideOnKeyboard: Platform.OS === "android",
        tabBarStyle: {
          height: 60,          // 👈 más bajita (ajústalo a tu gusto)
          paddingBottom: 8,    // centra los íconos verticalmente
          paddingTop: 8,
        },
        tabBarIconStyle: {
          marginBottom: 0,     // elimina espacio extra reservado al texto
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"} 
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
