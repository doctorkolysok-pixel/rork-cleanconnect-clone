# ✅ Чек-лист интеграции базы данных

## Что было сделано:

✅ **Backend включен**
- Hono сервер настроен
- tRPC роутер работает
- Подключен CORS

✅ **База данных создана**
- SQLite + Drizzle ORM
- 7 таблиц: users, cleaner_profiles, orders, offers, messages, reviews, charity_orders
- Схема полностью типизирована

✅ **API endpoints готовы**
- 🔐 Авторизация: register, login
- 📦 Заказы: create, getUserOrders, getOrder, getAvailableOrders, updateStatus
- 💰 Предложения: create, getOrderOffers
- 💬 Сообщения: send, getOrderMessages
- ⭐ Отзывы: create
- 👤 Пользователи: getUser

✅ **Демо-данные**
- Скрипт для заполнения БД готов
- 5 химчисток + 1 клиент

✅ **Документация**
- DATABASE_GUIDE.md - полная документация
- QUICK_START_DB.md - быстрый старт

---

## 🚀 Что нужно сделать СЕЙЧАС:

### 1. Инициализировать базу данных

```bash
# Шаг 1: Сгенерировать миграции
bun drizzle-kit generate

# Шаг 2: Применить миграции
bun drizzle-kit migrate

# Шаг 3: Заполнить демо-данными
bun backend/db/seed.ts
```

### 2. Проверить работу API

Запустите приложение и проверьте эндпоинт:
```
http://localhost:8081/api
```

Должен вернуть: `{"status":"ok","message":"API is running"}`

---

## 🔄 Что нужно сделать ПОТОМ (интеграция):

### Обновить следующие файлы:

#### 1. `app/auth.tsx`
**Заменить:** Локальное сохранение в AsyncStorage  
**На:** Использование `trpc.auth.register.mutate()` и `trpc.auth.login.mutate()`

```typescript
// Было:
await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

// Стало:
const user = await trpc.auth.register.mutate({
  role: selectedRole,
  name: formData.name,
  phone: formData.phone,
  email: formData.email,
});
```

#### 2. `contexts/AppContext.tsx`
**Заменить:** AsyncStorage для хранения  
**На:** React Query + backend API

```typescript
// Было:
const stored = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);

// Стало:
const ordersQuery = trpc.orders.getUserOrders.useQuery({ userId: user.id });
```

#### 3. `app/(tabs)/home.tsx`
**Обновить:** Создание заказа

```typescript
// Было:
const newOrder = { id: Date.now().toString(), ... };
addOrder(newOrder);

// Стало:
await trpc.orders.create.mutate({
  userId: user.id,
  category: selectedCategory,
  photos: [imageUri],
  ...
});
```

#### 4. `app/(tabs)/orders.tsx`
**Обновить:** Загрузка заказов

```typescript
const { data: orders } = trpc.orders.getUserOrders.useQuery({
  userId: user.id
});
```

#### 5. `app/order/[id].tsx`
**Обновить:** Загрузка заказа и предложений

```typescript
const { data: order } = trpc.orders.getOrder.useQuery({ orderId: id });
const { data: offers } = trpc.offers.getOrderOffers.useQuery({ orderId: id });
```

#### 6. `app/chat/[orderId].tsx`
**Обновить:** Отправка и загрузка сообщений

```typescript
const { data: messages } = trpc.messages.getOrderMessages.useQuery({ orderId });
const sendMutation = trpc.messages.send.useMutation();
```

#### 7. `app/review/[orderId].tsx`
**Обновить:** Создание отзыва

```typescript
await trpc.reviews.create.mutate({
  orderId,
  userId: user.id,
  cleanerId: order.chosenCleanerId,
  rating,
  comment,
  photos,
});
```

#### 8. `app/cleaner/orders.tsx`
**Обновить:** Загрузка доступных заказов

```typescript
const { data: orders } = trpc.orders.getAvailableOrders.useQuery();
```

---

## 📝 Дополнительные улучшения (опционально):

### WebSocket для реал-тайм чата
Сейчас чат работает через polling. Можно добавить WebSocket для мгновенных обновлений.

### Push-уведомления
Интегрировать expo-notifications для уведомлений о новых заказах, предложениях, сообщениях.

### Платёжная система
Добавить интеграцию с Kaspi Pay или другими платёжными системами.

### Геолокация
Добавить карту с химчистками и расчёт расстояния.

---

## 🎯 Приоритеты:

1. ✅ **ВЫСОКИЙ**: Инициализировать БД (3 команды)
2. 🔄 **СРЕДНИЙ**: Интегрировать авторизацию (app/auth.tsx)
3. 🔄 **СРЕДНИЙ**: Интегрировать заказы (app/(tabs)/home.tsx, orders.tsx)
4. 🔄 **НИЗКИЙ**: Интегрировать чат и отзывы
5. 🔄 **НИЗКИЙ**: Убрать AsyncStorage из AppContext

---

## 💡 Подсказки:

- Используйте `trpc.xxx.useQuery()` для чтения данных
- Используйте `trpc.xxx.useMutation()` для записи/обновления
- После мутации вызывайте `refetch()` на связанных query
- Обрабатывайте `isLoading` и `error` состояния
- React Query автоматически кеширует данные

---

## 📚 Документация:

- `DATABASE_GUIDE.md` - Полная документация по БД и API
- `QUICK_START_DB.md` - Быстрый старт
- `PROJECT_SUMMARY.md` - Обзор проекта

---

**Начните с инициализации БД (3 команды выше), затем постепенно интегрируйте API в экраны!**
