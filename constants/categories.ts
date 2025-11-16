import { OrderCategory } from '@/types';

export interface CategoryInfo {
  id: OrderCategory;
  title: string;
  titleRu: string;
  icon: string;
  color: string;
  supportsLiveStream: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'clothing',
    title: 'Clothing',
    titleRu: 'Одежда',
    icon: '👕',
    color: '#00BFA6',
    supportsLiveStream: false,
  },
  {
    id: 'furniture',
    title: 'Furniture',
    titleRu: 'Мебель',
    icon: '🛋️',
    color: '#FF6B6B',
    supportsLiveStream: true,
  },
  {
    id: 'shoes',
    title: 'Shoes',
    titleRu: 'Обувь',
    icon: '👟',
    color: '#4ECDC4',
    supportsLiveStream: false,
  },
  {
    id: 'carpets',
    title: 'Carpets',
    titleRu: 'Ковры',
    icon: '🪴',
    color: '#FFD700',
    supportsLiveStream: true,
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    titleRu: 'Клининг',
    icon: '🧹',
    color: '#4CAF50',
    supportsLiveStream: true,
  },
  {
    id: 'strollers',
    title: 'Strollers',
    titleRu: 'Коляски',
    icon: '🍼',
    color: '#9C27B0',
    supportsLiveStream: false,
  },
];

export const DIFFICULTY_COLORS = {
  easy: '#4CAF50',
  medium: '#FFD700',
  hard: '#FF6B6B',
};

export const STATUS_LABELS = {
  new: 'Новый',
  offers_received: 'Получены предложения',
  in_progress: 'В работе',
  courier_to_partner: 'Курьер забирает',
  at_partner: 'Принято',
  partner_working: 'В цехе',
  partner_done: 'Готово',
  courier_to_client: 'В точке / Доставка',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const CLIENT_STATUS_DISPLAY = {
  new: { label: 'Новый', description: 'Ожидаем предложения от исполнителей', color: '#999' },
  offers_received: { label: 'Получены предложения', description: 'Выберите исполнителя', color: '#00BFA6' },
  in_progress: { label: 'Обработка', description: 'Готовим к передаче курьеру', color: '#00BFA6' },
  courier_to_partner: { label: 'Курьер в пути', description: 'Везём в точку приёма', color: '#FF9800' },
  at_partner: { label: 'Принято', description: 'Получено точкой приёма', color: '#00BFA6' },
  partner_working: { label: 'В цехе', description: 'Изделие в работе', color: '#2196F3' },
  partner_done: { label: 'Готово', description: 'Работа выполнена, ожидает доставки', color: '#4CAF50' },
  courier_to_client: { label: 'В точке', description: 'Готово к получению или в пути к вам', color: '#FF9800' },
  completed: { label: 'Завершён', description: 'Заказ выполнен', color: '#4CAF50' },
  cancelled: { label: 'Отменён', description: 'Заказ отменён', color: '#F44336' },
};
