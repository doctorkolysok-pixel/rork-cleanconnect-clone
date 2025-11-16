import { db } from "./index";
import {
  users,
  cleanerProfiles,
  partnerProfiles,
  partnerServices,
  courierProfiles,
  orders,
  courierDeliveries,
  orderPhotos,
  orderHistory,
  messages,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  const demoCleaners = [
    {
      id: "cleaner_1",
      name: "Чистый Мир",
      phone: "+77771234501",
      role: "cleaner" as const,
      rating: 4.8,
      cleanPoints: 1500,
      level: 15,
      completedOrders: 1247,
      businessName: "Чистый Мир",
      address: "ул. Абая 45, Алматы",
      isEco: true,
      tier: "corporate" as const,
    },
    {
      id: "cleaner_2",
      name: "Эко Химчистка",
      phone: "+77771234502",
      role: "cleaner" as const,
      rating: 4.9,
      cleanPoints: 1200,
      level: 12,
      completedOrders: 892,
      businessName: "Эко Химчистка",
      address: "пр. Достык 120, Алматы",
      isEco: true,
      tier: "premium" as const,
    },
    {
      id: "cleaner_3",
      name: "Быстрая Чистка",
      phone: "+77771234503",
      role: "cleaner" as const,
      rating: 4.6,
      cleanPoints: 2100,
      level: 20,
      completedOrders: 2156,
      businessName: "Быстрая Чистка",
      address: "ул. Сатпаева 90, Алматы",
      isEco: false,
      tier: "corporate" as const,
    },
    {
      id: "cleaner_4",
      name: "Премиум Клининг",
      phone: "+77771234504",
      role: "cleaner" as const,
      rating: 4.95,
      cleanPoints: 950,
      level: 10,
      completedOrders: 645,
      businessName: "Премиум Клининг",
      address: "ул. Фурманова 234, Алматы",
      isEco: true,
      tier: "premium" as const,
    },
    {
      id: "cleaner_5",
      name: "Химчистка 24/7",
      phone: "+77771234505",
      role: "cleaner" as const,
      rating: 4.7,
      cleanPoints: 3100,
      level: 25,
      completedOrders: 3421,
      businessName: "Химчистка 24/7",
      address: "пр. Аль-Фараби 77, Алматы",
      isEco: false,
      tier: "corporate" as const,
    },
  ];

  const demoClient = {
    id: "client_demo",
    name: "Демо Пользователь",
    phone: "+77771111111",
    role: "client" as const,
    rating: 5.0,
    cleanPoints: 150,
    level: 3,
    completedOrders: 5,
  };

  console.log("Adding demo client...");
  await db.insert(users).values(demoClient);

  console.log("Adding demo cleaners...");
  for (const cleaner of demoCleaners) {
    const { businessName, address, isEco, tier, ...userData } = cleaner;
    await db.insert(users).values(userData);

    await db.insert(cleanerProfiles).values({
      id: `profile_${cleaner.id}`,
      userId: cleaner.id,
      businessName,
      address,
      isEco,
      tier,
    });
  }

  const demoPartners = [
    {
      id: "partner_1",
      name: "Химчистка Люкс",
      phone: "+77772234501",
      role: "partner" as const,
      rating: 4.9,
      completedOrders: 567,
      businessName: "Химчистка Люкс",
      address: "ул. Жандосова 15, Алматы",
      city: "Алматы",
      description: "Профессиональная химчистка с 10-летним опытом",
      services: JSON.stringify(["химчистка одежды", "чистка ковров", "чистка мебели"]),
      workingHours: "Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00",
      isVerified: true,
      visibilityRating: 98.5,
      totalEarnings: 1250000,
      latitude: 43.2384,
      longitude: 76.9456,
    },
    {
      id: "partner_2",
      name: "Эко Прачечная",
      phone: "+77772234502",
      role: "partner" as const,
      rating: 4.7,
      completedOrders: 324,
      businessName: "Эко Прачечная",
      address: "ул. Розыбакиева 289, Алматы",
      city: "Алматы",
      description: "Экологичная химчистка с безопасными средствами",
      services: JSON.stringify(["химчистка", "стирка", "глажка"]),
      workingHours: "Ежедневно: 8:00-22:00",
      isVerified: true,
      visibilityRating: 95.2,
      totalEarnings: 780000,
      latitude: 43.2567,
      longitude: 76.9234,
    },
    {
      id: "partner_3",
      name: "Быстрая Химчистка",
      phone: "+77772234503",
      role: "partner" as const,
      rating: 4.5,
      completedOrders: 189,
      businessName: "Быстрая Химчистка",
      address: "ул. Тимирязева 42, Алматы",
      city: "Алматы",
      description: "Экспресс-химчистка за 2 часа",
      services: JSON.stringify(["экспресс химчистка", "чистка обуви"]),
      workingHours: "Пн-Сб: 9:00-20:00",
      isVerified: true,
      visibilityRating: 88.0,
      totalEarnings: 450000,
      latitude: 43.2145,
      longitude: 76.8876,
    },
  ];

  const demoCouriers = [
    {
      id: "courier_1",
      name: "Азамат Курьер",
      phone: "+77773334501",
      role: "courier" as const,
      rating: 4.8,
      completedOrders: 423,
      vehicleType: "car" as const,
      city: "Алматы",
      isOnline: true,
      isVerified: true,
      currentLatitude: 43.2220,
      currentLongitude: 76.9512,
      totalDeliveries: 423,
      totalEarnings: 210000,
    },
    {
      id: "courier_2",
      name: "Даурен Доставка",
      phone: "+77773334502",
      role: "courier" as const,
      rating: 4.9,
      completedOrders: 567,
      vehicleType: "scooter" as const,
      city: "Алматы",
      isOnline: true,
      isVerified: true,
      currentLatitude: 43.2567,
      currentLongitude: 76.9123,
      totalDeliveries: 567,
      totalEarnings: 280000,
    },
    {
      id: "courier_3",
      name: "Ерлан Экспресс",
      phone: "+77773334503",
      role: "courier" as const,
      rating: 4.6,
      completedOrders: 234,
      vehicleType: "bike" as const,
      city: "Алматы",
      isOnline: false,
      isVerified: true,
      currentLatitude: 43.2890,
      currentLongitude: 76.9345,
      totalDeliveries: 234,
      totalEarnings: 120000,
    },
  ];

  console.log("Adding demo partners...");
  for (const partner of demoPartners) {
    const {
      businessName,
      address,
      city,
      description,
      services,
      workingHours,
      isVerified,
      visibilityRating,
      totalEarnings,
      latitude,
      longitude,
      ...userData
    } = partner;
    await db.insert(users).values(userData);

    await db.insert(partnerProfiles).values({
      id: `profile_${partner.id}`,
      userId: partner.id,
      businessName,
      address,
      city,
      description,
      services,
      workingHours,
      isVerified,
      visibilityRating,
      totalEarnings,
      latitude,
      longitude,
    });
  }

  console.log("Adding partner services...");
  const partnerServicesList = [
    {
      id: "service_1",
      partnerId: "partner_1",
      serviceName: "Химчистка пальто",
      category: "clothing" as const,
      price: 3500,
      description: "Профессиональная чистка пальто любых тканей",
      estimatedTime: "2-3 дня",
      priceQualityIndicator: "optimal" as const,
      avgMarketPrice: 3800,
    },
    {
      id: "service_2",
      partnerId: "partner_1",
      serviceName: "Чистка ковра (1м²)",
      category: "carpets" as const,
      price: 1200,
      description: "Глубокая чистка ковров с удалением пятен",
      estimatedTime: "1-2 дня",
      priceQualityIndicator: "optimal" as const,
      avgMarketPrice: 1300,
    },
    {
      id: "service_3",
      partnerId: "partner_2",
      serviceName: "Химчистка куртки",
      category: "clothing" as const,
      price: 2500,
      description: "Эко-химчистка курток и пуховиков",
      estimatedTime: "1-2 дня",
      priceQualityIndicator: "optimal" as const,
      avgMarketPrice: 2700,
    },
    {
      id: "service_4",
      partnerId: "partner_2",
      serviceName: "Чистка обуви",
      category: "shoes" as const,
      price: 1500,
      description: "Профессиональная чистка любой обуви",
      estimatedTime: "1 день",
      priceQualityIndicator: "premium" as const,
      avgMarketPrice: 1200,
    },
    {
      id: "service_5",
      partnerId: "partner_3",
      serviceName: "Экспресс химчистка рубашки",
      category: "clothing" as const,
      price: 800,
      description: "Быстрая химчистка за 2 часа",
      estimatedTime: "2 часа",
      priceQualityIndicator: "low" as const,
      avgMarketPrice: 1200,
    },
  ];

  for (const service of partnerServicesList) {
    await db.insert(partnerServices).values(service);
  }

  console.log("Adding demo couriers...");
  for (const courier of demoCouriers) {
    const {
      vehicleType,
      city,
      isOnline,
      isVerified,
      currentLatitude,
      currentLongitude,
      totalDeliveries,
      totalEarnings,
      ...userData
    } = courier;
    await db.insert(users).values(userData);

    await db.insert(courierProfiles).values({
      id: `profile_${courier.id}`,
      userId: courier.id,
      vehicleType,
      city,
      isOnline,
      isVerified,
      currentLatitude,
      currentLongitude,
      totalDeliveries,
      totalEarnings,
    });
  }

  console.log("Adding demo orders...");
  const demoOrders = [
    {
      id: "order_1",
      userId: "client_demo",
      category: "clothing" as const,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
      ]),
      comment: "Пальто с пятном от кофе, нужна химчистка",
      address: "ул. Байзакова 280, Алматы",
      priceOffer: 4000,
      urgency: "standard" as const,
      status: "new" as const,
    },
    {
      id: "order_2",
      userId: "client_demo",
      category: "clothing" as const,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      ]),
      comment: "Куртка требует химчистки перед сезоном",
      address: "ул. Байзакова 280, Алматы",
      priceOffer: 2800,
      urgency: "fast" as const,
      status: "courier_to_partner" as const,
      partnerId: "partner_2",
      courierId: "courier_1",
    },
    {
      id: "order_3",
      userId: "client_demo",
      category: "carpets" as const,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400",
      ]),
      comment: "Ковер 2x3м, глубокая чистка",
      address: "ул. Байзакова 280, Алматы",
      priceOffer: 7500,
      urgency: "standard" as const,
      status: "at_partner" as const,
      partnerId: "partner_1",
      courierId: "courier_1",
    },
    {
      id: "order_4",
      userId: "client_demo",
      category: "clothing" as const,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
      ]),
      comment: "Костюм нужен срочно на мероприятие",
      address: "ул. Байзакова 280, Алматы",
      priceOffer: 5000,
      urgency: "express" as const,
      status: "partner_working" as const,
      partnerId: "partner_1",
      courierId: "courier_2",
    },
    {
      id: "order_5",
      userId: "client_demo",
      category: "shoes" as const,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      ]),
      comment: "Чистка замшевых туфель",
      address: "ул. Байзакова 280, Алматы",
      priceOffer: 1800,
      urgency: "standard" as const,
      status: "partner_done" as const,
      partnerId: "partner_2",
      courierId: "courier_2",
    },
    {
      id: "order_6",
      userId: "client_demo",
      category: "clothing" as const,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
      ]),
      comment: "Платье после праздника",
      address: "ул. Байзакова 280, Алматы",
      priceOffer: 2200,
      urgency: "fast" as const,
      status: "courier_to_client" as const,
      partnerId: "partner_3",
      courierId: "courier_3",
    },
  ];

  for (const order of demoOrders) {
    await db.insert(orders).values(order);
  }

  console.log("Adding courier deliveries...");
  const deliveries = [
    {
      id: "delivery_1",
      orderId: "order_2",
      courierId: "courier_1",
      type: "to_partner" as const,
      status: "in_transit" as const,
      pickupAddress: "ул. Байзакова 280, Алматы",
      deliveryAddress: "ул. Розыбакиева 289, Алматы",
      pickupLatitude: 43.2220,
      pickupLongitude: 76.8890,
      deliveryLatitude: 43.2567,
      deliveryLongitude: 76.9234,
      estimatedTime: "30 минут",
      price: 1500,
    },
    {
      id: "delivery_2",
      orderId: "order_3",
      courierId: "courier_1",
      type: "to_partner" as const,
      status: "delivered" as const,
      pickupAddress: "ул. Байзакова 280, Алматы",
      deliveryAddress: "ул. Жандосова 15, Алматы",
      pickupLatitude: 43.2220,
      pickupLongitude: 76.8890,
      deliveryLatitude: 43.2384,
      deliveryLongitude: 76.9456,
      estimatedTime: "25 минут",
      actualPickupTime: new Date(Date.now() - 3600000).toISOString(),
      actualDeliveryTime: new Date(Date.now() - 1800000).toISOString(),
      price: 1500,
    },
    {
      id: "delivery_3",
      orderId: "order_4",
      courierId: "courier_2",
      type: "to_partner" as const,
      status: "delivered" as const,
      pickupAddress: "ул. Байзакова 280, Алматы",
      deliveryAddress: "ул. Жандосова 15, Алматы",
      pickupLatitude: 43.2220,
      pickupLongitude: 76.8890,
      deliveryLatitude: 43.2384,
      deliveryLongitude: 76.9456,
      estimatedTime: "20 минут",
      actualPickupTime: new Date(Date.now() - 7200000).toISOString(),
      actualDeliveryTime: new Date(Date.now() - 5400000).toISOString(),
      price: 1500,
    },
    {
      id: "delivery_4",
      orderId: "order_5",
      courierId: "courier_2",
      type: "to_partner" as const,
      status: "delivered" as const,
      pickupAddress: "ул. Байзакова 280, Алматы",
      deliveryAddress: "ул. Розыбакиева 289, Алматы",
      pickupLatitude: 43.2220,
      pickupLongitude: 76.8890,
      deliveryLatitude: 43.2567,
      deliveryLongitude: 76.9234,
      estimatedTime: "30 минут",
      actualPickupTime: new Date(Date.now() - 14400000).toISOString(),
      actualDeliveryTime: new Date(Date.now() - 12600000).toISOString(),
      price: 1500,
    },
    {
      id: "delivery_5",
      orderId: "order_6",
      courierId: "courier_3",
      type: "to_client" as const,
      status: "in_transit" as const,
      pickupAddress: "ул. Тимирязева 42, Алматы",
      deliveryAddress: "ул. Байзакова 280, Алматы",
      pickupLatitude: 43.2145,
      pickupLongitude: 76.8876,
      deliveryLatitude: 43.2220,
      deliveryLongitude: 76.8890,
      estimatedTime: "35 минут",
      actualPickupTime: new Date(Date.now() - 600000).toISOString(),
      price: 1500,
    },
  ];

  for (const delivery of deliveries) {
    await db.insert(courierDeliveries).values(delivery);
  }

  console.log("Adding order photos...");
  const photos = [
    {
      id: "photo_1",
      orderId: "order_4",
      partnerId: "partner_1",
      type: "before" as const,
      photoUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
      comment: "Костюм до чистки - видны пятна",
    },
    {
      id: "photo_2",
      orderId: "order_5",
      partnerId: "partner_2",
      type: "before" as const,
      photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
      comment: "Замшевые туфли до чистки",
    },
    {
      id: "photo_3",
      orderId: "order_5",
      partnerId: "partner_2",
      type: "after" as const,
      photoUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
      comment: "Туфли после профессиональной чистки",
    },
    {
      id: "photo_4",
      orderId: "order_6",
      partnerId: "partner_3",
      type: "before" as const,
      photoUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
      comment: "Платье до чистки",
    },
    {
      id: "photo_5",
      orderId: "order_6",
      partnerId: "partner_3",
      type: "after" as const,
      photoUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
      comment: "Платье после химчистки - как новое",
    },
  ];

  for (const photo of photos) {
    await db.insert(orderPhotos).values(photo);
  }

  console.log("Adding order history...");
  const history = [
    {
      id: "history_1",
      orderId: "order_2",
      action: "Заказ создан",
      performedBy: "client_demo",
      details: "Клиент создал новый заказ",
    },
    {
      id: "history_2",
      orderId: "order_2",
      action: "Назначен курьер",
      performedBy: "courier_1",
      details: "Курьер принял заказ на доставку",
    },
    {
      id: "history_3",
      orderId: "order_3",
      action: "Заказ доставлен партнеру",
      performedBy: "courier_1",
      details: "Изделие доставлено в точку приёма",
    },
    {
      id: "history_4",
      orderId: "order_3",
      action: "Партнер получил заказ",
      performedBy: "partner_1",
      details: "Партнер подтвердил получение изделия",
    },
    {
      id: "history_5",
      orderId: "order_4",
      action: "Работа начата",
      performedBy: "partner_1",
      details: "Химчистка начала работу над заказом",
    },
    {
      id: "history_6",
      orderId: "order_5",
      action: "Работа завершена",
      performedBy: "partner_2",
      details: "Чистка обуви завершена, загружены фото",
    },
    {
      id: "history_7",
      orderId: "order_6",
      action: "Курьер везёт клиенту",
      performedBy: "courier_3",
      details: "Изделие в пути к клиенту",
    },
  ];

  for (const item of history) {
    await db.insert(orderHistory).values(item);
  }

  console.log("Adding demo messages...");
  const demoMessages = [
    {
      id: "msg_1",
      orderId: "order_2",
      fromId: "courier_1",
      toId: "client_demo",
      message: "Здравствуйте! Я уже еду к вам, буду через 10 минут.",
      read: true,
    },
    {
      id: "msg_2",
      orderId: "order_2",
      fromId: "client_demo",
      toId: "courier_1",
      message: "Хорошо, жду. Квартира 45.",
      read: true,
    },
    {
      id: "msg_3",
      orderId: "order_4",
      fromId: "partner_1",
      toId: "client_demo",
      message: "Ваш заказ в работе. Ожидайте завершения завтра к обеду.",
      read: false,
    },
    {
      id: "msg_4",
      orderId: "order_5",
      fromId: "partner_2",
      toId: "client_demo",
      message: "Работа завершена! Туфли готовы к отправке.",
      read: false,
    },
  ];

  for (const message of demoMessages) {
    await db.insert(messages).values(message);
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📊 Created:");
  console.log(`  - ${demoCleaners.length} cleaners`);
  console.log(`  - ${demoPartners.length} partners`);
  console.log(`  - ${partnerServicesList.length} partner services`);
  console.log(`  - ${demoCouriers.length} couriers`);
  console.log(`  - 1 client`);
  console.log(`  - ${demoOrders.length} orders`);
  console.log(`  - ${deliveries.length} deliveries`);
  console.log(`  - ${photos.length} order photos`);
  console.log(`  - ${history.length} history records`);
  console.log(`  - ${demoMessages.length} messages`);
}

seed()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  });
