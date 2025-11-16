import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User, Order, Offer, Message, Review, CharityOrder, LiveStream, Delivery } from '../types';

const STORAGE_KEYS = {
  USER: '@tazago_user',
  ORDERS: '@tazago_orders',
  MESSAGES: '@tazago_messages',
  REVIEWS: '@tazago_reviews',
  CHARITY_ORDERS: '@tazago_charity_orders',
  IS_AUTHENTICATED: '@tazago_is_authenticated',
  LIVE_STREAMS: '@tazago_live_streams',
  DELIVERIES: '@tazago_deliveries',
};

const DEFAULT_USER: User = {
  id: 'user-1',
  role: 'client',
  name: 'Александр',
  phone: '+7 777 123 4567',
  email: 'user@tazago.kz',
  rating: 5.0,
  balance: 0,
  cleanPoints: 0,
  level: 1,
  createdAt: new Date().toISOString(),
  monthlyRevenueGoal: 0,
  monthlyExpenseBudget: 0,
};



const sortOrdersByDateDesc = (list: Order[]) =>
  [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const mergeOrdersUnique = (current: Order[], incoming: Order[]) => {
  const map = new Map<string, Order>();
  current.forEach(order => {
    map.set(order.id, order);
  });
  incoming.forEach(order => {
    if (!map.has(order.id)) {
      map.set(order.id, order);
    }
  });
  return sortOrdersByDateDesc(Array.from(map.values()));
};

const normalizeOrders = (list: Order[]) => mergeOrdersUnique(list, []);

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [charityOrders, setCharityOrders] = useState<CharityOrder[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [userData, ordersData, messagesData, reviewsData, charityOrdersData, liveStreamsData, deliveriesData, authStatus] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.REVIEWS),
        AsyncStorage.getItem(STORAGE_KEYS.CHARITY_ORDERS),
        AsyncStorage.getItem(STORAGE_KEYS.LIVE_STREAMS),
        AsyncStorage.getItem(STORAGE_KEYS.DELIVERIES),
        AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED),
      ]);

      if (authStatus === 'true' && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      if (ordersData) {
        console.log('Loaded persisted orders');
        const persistedOrders: Order[] = JSON.parse(ordersData);
        setOrders(normalizeOrders(persistedOrders));
      } else {
        console.log('No persisted orders found');
        setOrders([]);
      }

      if (messagesData) {
        setMessages(JSON.parse(messagesData));
      }

      if (reviewsData) {
        setReviews(JSON.parse(reviewsData));
      }

      if (charityOrdersData) {
        setCharityOrders(JSON.parse(charityOrdersData));
      }

      if (liveStreamsData) {
        setLiveStreams(JSON.parse(liveStreamsData));
      }

      if (deliveriesData) {
        setDeliveries(JSON.parse(deliveriesData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveUser = useCallback(async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
      setUser(updatedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, []);

  const saveOrders = useCallback(async (updatedOrders: Order[]) => {
    try {
      const normalizedOrders = normalizeOrders(updatedOrders);
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(normalizedOrders));
      setOrders(normalizedOrders);
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    const updatedOrders = [order, ...orders];
    await saveOrders(updatedOrders);

    const pointsEarned = 10;
    const updatedUser = {
      ...user,
      cleanPoints: user.cleanPoints + pointsEarned,
      level: Math.floor((user.cleanPoints + pointsEarned) / 100) + 1,
    };
    await saveUser(updatedUser);
  }, [orders, saveOrders, user, saveUser]);

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    );
    await saveOrders(updatedOrders);
  }, [orders, saveOrders]);

  const completeOrder = useCallback(async (orderId: string) => {
    await updateOrder(orderId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    const pointsEarned = 50;
    const updatedUser = {
      ...user,
      cleanPoints: user.cleanPoints + pointsEarned,
      level: Math.floor((user.cleanPoints + pointsEarned) / 100) + 1,
    };
    await saveUser(updatedUser);
  }, [updateOrder, user, saveUser]);

  const addOffer = useCallback((offer: Offer) => {
    setOffers(prev => [...prev, offer]);

    const order = orders.find(o => o.id === offer.orderId);
    if (order && order.status === 'new') {
      updateOrder(order.id, { status: 'offers_received' });
    }
  }, [orders, updateOrder]);

  const acceptOffer = useCallback(async (offer: Offer) => {
    await updateOrder(offer.orderId, {
      status: 'in_progress',
      chosenCleanerId: offer.cleanerId,
    });
  }, [updateOrder]);

  const sendMessage = useCallback(async (message: Message) => {
    const updatedMessages = [...messages, message];
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  }, [messages]);

  const addReview = useCallback(async (review: Review) => {
    const updatedReviews = [...reviews, review];
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updatedReviews));
    setReviews(updatedReviews);

    const pointsEarned = 20;
    const updatedUser = {
      ...user,
      cleanPoints: user.cleanPoints + pointsEarned,
      level: Math.floor((user.cleanPoints + pointsEarned) / 100) + 1,
    };
    await saveUser(updatedUser);
  }, [reviews, user, saveUser]);

  const addCharityOrder = useCallback(async (charityOrder: CharityOrder) => {
    const updatedCharityOrders = [...charityOrders, charityOrder];
    await AsyncStorage.setItem(STORAGE_KEYS.CHARITY_ORDERS, JSON.stringify(updatedCharityOrders));
    setCharityOrders(updatedCharityOrders);

    const pointsEarned = 100;
    const updatedUser = {
      ...user,
      cleanPoints: user.cleanPoints + pointsEarned,
      level: Math.floor((user.cleanPoints + pointsEarned) / 100) + 1,
    };
    await saveUser(updatedUser);
  }, [charityOrders, user, saveUser]);



  const startLiveStream = useCallback(async (orderId: string, cleanerId: string) => {
    const newStream: LiveStream = {
      id: `stream-${Date.now()}`,
      orderId,
      cleanerId,
      isActive: true,
      startedAt: new Date().toISOString(),
      viewerCount: 0,
    };
    const updatedStreams = [...liveStreams.filter(s => s.orderId !== orderId), newStream];
    await AsyncStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(updatedStreams));
    setLiveStreams(updatedStreams);
    return newStream;
  }, [liveStreams]);

  const stopLiveStream = useCallback(async (streamId: string) => {
    const updatedStreams = liveStreams.map(stream =>
      stream.id === streamId
        ? { ...stream, isActive: false, endedAt: new Date().toISOString() }
        : stream
    );
    await AsyncStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(updatedStreams));
    setLiveStreams(updatedStreams);
  }, [liveStreams]);

  const updateStreamFrame = useCallback(async (streamId: string, frameData: string) => {
    const updatedStreams = liveStreams.map(stream =>
      stream.id === streamId ? { ...stream, currentFrame: frameData } : stream
    );
    await AsyncStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(updatedStreams));
    setLiveStreams(updatedStreams);
  }, [liveStreams]);

  const incrementViewerCount = useCallback(async (streamId: string) => {
    const updatedStreams = liveStreams.map(stream =>
      stream.id === streamId ? { ...stream, viewerCount: stream.viewerCount + 1 } : stream
    );
    await AsyncStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(updatedStreams));
    setLiveStreams(updatedStreams);
  }, [liveStreams]);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ORDERS,
        STORAGE_KEYS.MESSAGES,
        STORAGE_KEYS.REVIEWS,
        STORAGE_KEYS.CHARITY_ORDERS,
        STORAGE_KEYS.LIVE_STREAMS,
        STORAGE_KEYS.DELIVERIES,
      ]);
      setOrders([]);
      setOffers([]);
      setMessages([]);
      setReviews([]);
      setCharityOrders([]);
      setLiveStreams([]);
      setDeliveries([]);
      console.log('All data cleared');
    } catch (error) {
      console.error('Clear data error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.IS_AUTHENTICATED,
        STORAGE_KEYS.ORDERS,
        STORAGE_KEYS.MESSAGES,
        STORAGE_KEYS.REVIEWS,
        STORAGE_KEYS.CHARITY_ORDERS,
        STORAGE_KEYS.LIVE_STREAMS,
        STORAGE_KEYS.DELIVERIES,
      ]);
      setUser(DEFAULT_USER);
      setIsAuthenticated(false);
      setOrders([]);
      setOffers([]);
      setMessages([]);
      setReviews([]);
      setCharityOrders([]);
      setLiveStreams([]);
      setDeliveries([]);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);



  const saveDeliveries = useCallback(async (updatedDeliveries: Delivery[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(updatedDeliveries));
      setDeliveries(updatedDeliveries);
    } catch (error) {
      console.error('Error saving deliveries:', error);
    }
  }, []);



  const createDelivery = useCallback(async (orderId: string, type: 'pickup_to_cleaner' | 'cleaner_to_client') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newDelivery: Delivery = {
      id: `delivery-${Date.now()}`,
      orderId,
      type,
      status: 'new',
      pickupAddress: type === 'pickup_to_cleaner' ? order.address : 'Химчистка «Идеал», ул. Абая 150',
      deliveryAddress: type === 'pickup_to_cleaner' ? 'Химчистка «Идеал», ул. Абая 150' : order.address,
      clientPhone: '+7 777 123 4567',
      cleanerPhone: '+7 777 999 8888',
      estimatedPrice: type === 'pickup_to_cleaner' ? 800 : 1000,
      notes: order.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedDeliveries = [newDelivery, ...deliveries];
    await saveDeliveries(updatedDeliveries);
    return newDelivery;
  }, [orders, deliveries, saveDeliveries]);

  const acceptDelivery = useCallback(async (deliveryId: string) => {
    const updatedDeliveries = deliveries.map(d =>
      d.id === deliveryId
        ? { ...d, status: 'accepted' as const, courierId: user.id, courierName: user.name, updatedAt: new Date().toISOString() }
        : d
    );
    await saveDeliveries(updatedDeliveries);
  }, [deliveries, user, saveDeliveries]);

  const updateDeliveryStatus = useCallback(async (deliveryId: string, status: 'picked_up' | 'in_transit' | 'delivered') => {
    const updatedDeliveries = deliveries.map(d => {
      if (d.id === deliveryId) {
        const updates: Partial<Delivery> = { status, updatedAt: new Date().toISOString() };
        if (status === 'picked_up') {
          updates.pickupTime = new Date().toISOString();
        } else if (status === 'delivered') {
          updates.deliveryTime = new Date().toISOString();
          updates.actualPrice = d.estimatedPrice;
        }
        return { ...d, ...updates };
      }
      return d;
    });
    await saveDeliveries(updatedDeliveries);

    if (status === 'delivered') {
      const pointsEarned = 30;
      const updatedUser = {
        ...user,
        cleanPoints: user.cleanPoints + pointsEarned,
        level: Math.floor((user.cleanPoints + pointsEarned) / 100) + 1,
      };
      await saveUser(updatedUser);
    }
  }, [deliveries, user, saveDeliveries, saveUser]);

  return {
    user,
    orders,
    offers,
    messages,
    reviews,
    charityOrders,
    liveStreams,
    deliveries,
    isLoading,
    isAuthenticated,
    addOrder,
    updateOrder,
    completeOrder,
    addOffer,
    acceptOffer,
    saveUser,
    sendMessage,
    addReview,
    addCharityOrder,
    startLiveStream,
    stopLiveStream,
    updateStreamFrame,
    incrementViewerCount,
    clearAllData,
    logout,
    createDelivery,
    acceptDelivery,
    updateDeliveryStatus,
  };
});

export const useActiveOrders = () => {
  const { orders } = useApp();
  return useMemo(
    () => orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled'),
    [orders]
  );
};

export const useCompletedOrders = () => {
  const { orders } = useApp();
  return useMemo(
    () => orders.filter(o => o.status === 'completed'),
    [orders]
  );
};

export const useOrderOffers = (orderId: string) => {
  const { offers } = useApp();
  return useMemo(
    () => offers.filter(o => o.orderId === orderId),
    [offers, orderId]
  );
};

export const useOrderLiveStream = (orderId: string) => {
  const { liveStreams } = useApp();
  return useMemo(
    () => liveStreams.find(s => s.orderId === orderId && s.isActive),
    [liveStreams, orderId]
  );
};
