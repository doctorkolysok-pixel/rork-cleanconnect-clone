# 🗄️ База данных TazaGo

## Установка и настройка

Backend уже включен в проекте. База данных SQLite + Drizzle ORM готова к работе.

### 1. Генерация миграций

```bash
bun drizzle-kit generate
```

### 2. Применение миграций

```bash
bun drizzle-kit migrate
```

### 3. Заполнение демо-данными

```bash
bun backend/db/seed.ts
```

Это создаст:
- 5 демо-химчисток с разными уровнями
- 1 демо-клиента (телефон: +77771111111)

---

## 📊 Структура базы данных

### Таблицы:

#### `users` - Пользователи
- `id` - Уникальный ID
- `role` - Роль: client | cleaner | courier | admin
- `name` - Имя
- `phone` - Телефон (уникальный)
- `email` - Email (опционально)
- `rating` - Рейтинг (по умолчанию 5.0)
- `balance` - Баланс
- `cleanPoints` - Баллы чистоты
- `level` - Уровень
- `completedOrders` - Количество завершенных заказов
- `createdAt` - Дата регистрации

#### `cleaner_profiles` - Профили химчисток
- `id` - ID профиля
- `userId` - Связь с users
- `businessName` - Название бизнеса
- `address` - Адрес
- `description` - Описание
- `isEco` - Эко-метка
- `tier` - Уровень: novice | verified | premium | corporate

#### `orders` - Заказы
- `id` - ID заказа
- `userId` - ID клиента
- `category` - Категория: clothes | furniture | shoes | carpets
- `photos` - Массив фото (JSON)
- `comment` - Комментарий
- `address` - Адрес
- `priceOffer` - Предложенная цена
- `urgency` - Срочность: standard | fast | urgent | express
- `status` - Статус: new | offers_received | in_progress | completed | cancelled
- `chosenCleanerId` - Выбранная химчистка
- `aiAnalysis` - AI-анализ (JSON)
- `commission` - Комиссия (JSON)
- `createdAt` - Дата создания
- `completedAt` - Дата завершения

#### `offers` - Предложения
- `id` - ID предложения
- `orderId` - ID заказа
- `cleanerId` - ID химчистки
- `proposedPrice` - Предложенная цена
- `comment` - Комментарий
- `eta` - Примерное время выполнения
- `createdAt` - Дата создания

#### `messages` - Сообщения
- `id` - ID сообщения
- `orderId` - ID заказа
- `fromId` - От кого
- `toId` - Кому
- `message` - Текст сообщения
- `read` - Прочитано
- `createdAt` - Дата отправки

#### `reviews` - Отзывы
- `id` - ID отзыва
- `orderId` - ID заказа
- `userId` - ID клиента
- `cleanerId` - ID химчистки
- `rating` - Оценка (1-5)
- `comment` - Комментарий
- `photos` - Фото результата (JSON)
- `createdAt` - Дата создания

#### `charity_orders` - Благотворительные заказы
- `id` - ID заказа
- `donorId` - ID донора
- `recipientName` - Имя получателя
- `category` - Категория
- `description` - Описание
- `status` - Статус: pending | approved | in_progress | completed
- `createdAt` - Дата создания

---

## 🔌 API Endpoints (tRPC)

Все запросы через tRPC: `{baseUrl}/api/trpc/...`

### 🔐 Авторизация

#### `auth.register`
Регистрация нового пользователя
```typescript
trpc.auth.register.mutate({
  role: "client",
  name: "Иван Иванов",
  phone: "+77771234567",
  email: "ivan@example.com", // опционально
})
```

#### `auth.login`
Вход в систему
```typescript
trpc.auth.login.mutate({
  phone: "+77771234567"
})
```

---

### 📦 Заказы

#### `orders.create`
Создание заказа
```typescript
trpc.orders.create.mutate({
  userId: "user_id",
  category: "clothes",
  photos: ["photo_url_1", "photo_url_2"],
  comment: "Пятно на рубашке",
  address: "ул. Абая 45",
  priceOffer: 2000,
  urgency: "standard",
  aiAnalysis: { /* AI результат */ },
  commission: { /* комиссия */ }
})
```

#### `orders.getUserOrders`
Получить заказы пользователя
```typescript
const { data } = trpc.orders.getUserOrders.useQuery({
  userId: "user_id"
})
```

#### `orders.getOrder`
Получить конкретный заказ
```typescript
const { data } = trpc.orders.getOrder.useQuery({
  orderId: "order_id"
})
```

#### `orders.getAvailableOrders`
Получить доступные заказы (для химчисток)
```typescript
const { data } = trpc.orders.getAvailableOrders.useQuery()
```

#### `orders.updateStatus`
Обновить статус заказа
```typescript
trpc.orders.updateStatus.mutate({
  orderId: "order_id",
  status: "in_progress",
  chosenCleanerId: "cleaner_id" // опционально
})
```

---

### 💰 Предложения

#### `offers.create`
Создать предложение (химчистка откликается на заказ)
```typescript
trpc.offers.create.mutate({
  orderId: "order_id",
  cleanerId: "cleaner_id",
  proposedPrice: 1500,
  comment: "Выполним за 2 часа",
  eta: "2 часа"
})
```

#### `offers.getOrderOffers`
Получить предложения по заказу
```typescript
const { data } = trpc.offers.getOrderOffers.useQuery({
  orderId: "order_id"
})
```

---

### 💬 Сообщения

#### `messages.send`
Отправить сообщение
```typescript
trpc.messages.send.mutate({
  orderId: "order_id",
  fromId: "user_id",
  toId: "cleaner_id",
  message: "Когда будет готово?"
})
```

#### `messages.getOrderMessages`
Получить сообщения по заказу
```typescript
const { data } = trpc.messages.getOrderMessages.useQuery({
  orderId: "order_id"
})
```

---

### ⭐ Отзывы

#### `reviews.create`
Оставить отзыв
```typescript
trpc.reviews.create.mutate({
  orderId: "order_id",
  userId: "user_id",
  cleanerId: "cleaner_id",
  rating: 5,
  comment: "Отличная работа!",
  photos: ["photo_url_1"] // опционально
})
```

---

### 👤 Пользователи

#### `users.getUser`
Получить информацию о пользователе
```typescript
const { data } = trpc.users.getUser.useQuery({
  userId: "user_id"
})
```

---

## 🔄 Интеграция с приложением

### Пример использования в React компоненте:

```typescript
import { trpc } from '@/lib/trpc';

function OrdersScreen() {
  const user = useApp().user;
  
  // Получить заказы
  const ordersQuery = trpc.orders.getUserOrders.useQuery({
    userId: user.id
  });

  // Создать заказ
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      ordersQuery.refetch();
    }
  });

  const handleCreateOrder = () => {
    createOrderMutation.mutate({
      userId: user.id,
      category: "clothes",
      photos: [...],
      comment: "Пятно",
      address: "ул. Абая 45",
      priceOffer: 2000,
      urgency: "standard"
    });
  };

  if (ordersQuery.isLoading) return <Text>Загрузка...</Text>;
  if (ordersQuery.error) return <Text>Ошибка: {ordersQuery.error.message}</Text>;

  return (
    <FlatList
      data={ordersQuery.data}
      renderItem={({ item }) => <OrderCard order={item} />}
    />
  );
}
```

---

## 🚀 Следующие шаги

Теперь вам нужно:

1. ✅ Запустить миграции базы данных
2. ✅ Заполнить демо-данными
3. 🔄 Интегрировать API в существующие экраны приложения
4. 🔄 Заменить локальное хранение AsyncStorage на запросы к backend
5. 🔄 Добавить реал-тайм обновления (WebSocket) для чата

### Файлы, которые нужно обновить:
- `app/auth.tsx` - использовать `trpc.auth.register` и `trpc.auth.login`
- `app/(tabs)/home.tsx` - использовать `trpc.orders.create`
- `app/(tabs)/orders.tsx` - использовать `trpc.orders.getUserOrders`
- `app/order/[id].tsx` - использовать `trpc.orders.getOrder` и `trpc.offers.getOrderOffers`
- `app/chat/[orderId].tsx` - использовать `trpc.messages.send` и `trpc.messages.getOrderMessages`
- `app/review/[orderId].tsx` - использовать `trpc.reviews.create`
- `contexts/AppContext.tsx` - интегрировать с backend API

---

## 📝 Примечания

- База данных SQLite хранится в файле `tazago.db`
- Все JSON поля автоматически парсятся в responses
- Используйте React Query хуки для автоматического кеширования
- Для production рекомендуется PostgreSQL или MySQL
