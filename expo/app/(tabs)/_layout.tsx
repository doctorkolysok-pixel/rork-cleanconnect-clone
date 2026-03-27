import { Tabs } from "expo-router";
import { Home, List, User, Briefcase, Package, DollarSign, Truck } from "lucide-react-native";
import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";

export default function TabLayout() {
  const { user } = useApp();

  const tabScreenOptions = useMemo(() => ({
    tabBarActiveTintColor: '#00BFA6',
    tabBarInactiveTintColor: '#999',
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
  }), []);

  return (
    <Tabs screenOptions={tabScreenOptions}>
      {user.role === 'client' && (
        <Tabs.Screen
          name="home"
          options={{
            title: "Главная",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
      )}
      {(user.role === 'cleaner' || user.role === 'courier' || user.role === 'partner') && (
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
      )}

      {user.role === 'partner' && (
        <Tabs.Screen
          name="partner-dashboard"
          options={{
            title: "Главная",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
      )}
      {user.role !== 'partner' && (
        <Tabs.Screen
          name="partner-dashboard"
          options={{
            href: null,
          }}
        />
      )}

      {user.role === 'courier' && (
        <Tabs.Screen
          name="courier-deliveries"
          options={{
            title: "Доставки",
            tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
          }}
        />
      )}
      {user.role !== 'courier' && (
        <Tabs.Screen
          name="courier-deliveries"
          options={{
            href: null,
          }}
        />
      )}

      <Tabs.Screen
        name="orders"
        options={{
          title: user.role === 'courier' ? "Доставки" : user.role === 'cleaner' ? "Заказы" : "Мои заказы",
          href: user.role === 'partner' || user.role === 'courier' ? null : undefined,
          tabBarIcon: ({ color, size }) => {
            const Icon = user.role === 'courier' ? Package : List;
            return <Icon color={color} size={size} />;
          },
        }}
      />

      {user.role === 'cleaner' && (
        <Tabs.Screen
          name="cleaner-works"
          options={{
            title: "Мои работы",
            tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
          }}
        />
      )}
      {user.role !== 'cleaner' && (
        <Tabs.Screen
          name="cleaner-works"
          options={{
            href: null,
          }}
        />
      )}

      {user.role === 'client' && (
        <Tabs.Screen
          name="profile"
          options={{
            title: "Профиль",
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      )}
      {user.role !== 'client' && (
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      )}

      {(user.role === 'cleaner' || user.role === 'courier' || user.role === 'partner') && (
        <Tabs.Screen
          name="cleaner-profile"
          options={{
            title: "Профиль",
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      )}
      {user.role === 'client' && (
        <Tabs.Screen
          name="cleaner-profile"
          options={{
            href: null,
          }}
        />
      )}
    </Tabs>
  );
}
