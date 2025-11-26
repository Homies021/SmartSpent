import { Tabs } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons, Ionicons, Entypo } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
