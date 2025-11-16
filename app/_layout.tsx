import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "../contexts/AppContext";
import { trpc, trpcClient } from "../lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      if (user.role === 'partner') {
        router.replace('/(tabs)/partner-dashboard');
      } else if (user.role === 'courier') {
        router.replace('/(tabs)/courier-deliveries');
      } else if (user.role === 'cleaner') {
        router.replace('/(tabs)/orders');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isAuthenticated, segments, isLoading, router, user.role]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Назад" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="order/[id]" 
        options={{ 
          title: "Детали заказа",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="chat/[orderId]" 
        options={{ 
          title: "Чат",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="review/[orderId]" 
        options={{ 
          title: "Оставить отзыв",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="charity" 
        options={{ 
          title: "Чисто с добром",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="commission-calculator" 
        options={{ 
          title: "Калькулятор комиссии",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="cleaning/new" 
        options={{ 
          title: "Заказать уборку",
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="livestream/[orderId]" 
        options={{ 
          title: "Трансляция",
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="broadcast/[orderId]" 
        options={{ 
          title: "Трансляция работы",
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="cleaner/orders" 
        options={{ 
          title: "Доступные заказы",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="cleaner/order-details/[id]" 
        options={{ 
          title: "Детали заказа",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="cleaner/my-works" 
        options={{ 
          title: "Мои работы",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="cleaner-guide" 
        options={{ 
          title: "Гайд для химчисток",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="cleaner/profile-setup" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="delivery/[id]" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="partner/orders" 
        options={{ 
          title: "Заказы партнёра",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="partner/order/[id]" 
        options={{ 
          title: "Детали заказа",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="partner/services" 
        options={{ 
          title: "Мои услуги",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="partner/finances" 
        options={{ 
          title: "Финансы",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="courier/delivery/[id]" 
        options={{ 
          title: "Детали доставки",
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AppProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
