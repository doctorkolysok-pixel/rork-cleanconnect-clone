import { OrderCategory } from '@/types';

export interface SubcategoryInfo {
  id: string;
  parentCategory: OrderCategory;
  title: string;
  icon: string;
}

export const SUBCATEGORIES: Record<OrderCategory, SubcategoryInfo[]> = {
  clothing: [
    { id: 'jackets', parentCategory: 'clothing', title: 'Куртки', icon: '🧥' },
    { id: 'blouses', parentCategory: 'clothing', title: 'Блузки', icon: '👚' },
    { id: 'pants', parentCategory: 'clothing', title: 'Брюки', icon: '👖' },
    { id: 'dresses', parentCategory: 'clothing', title: 'Платья', icon: '👗' },
    { id: 'shirts', parentCategory: 'clothing', title: 'Рубашки', icon: '👔' },
    { id: 'suits', parentCategory: 'clothing', title: 'Костюмы', icon: '🤵' },
    { id: 'coats', parentCategory: 'clothing', title: 'Пальто', icon: '🧥' },
  ],
  furniture: [
    { id: 'sofa', parentCategory: 'furniture', title: 'Диван', icon: '🛋️' },
    { id: 'armchair', parentCategory: 'furniture', title: 'Кресло', icon: '💺' },
    { id: 'chair', parentCategory: 'furniture', title: 'Стул', icon: '🪑' },
    { id: 'mattress', parentCategory: 'furniture', title: 'Матрас', icon: '🛏️' },
    { id: 'ottoman', parentCategory: 'furniture', title: 'Пуфик', icon: '🪑' },
  ],
  shoes: [
    { id: 'sneakers', parentCategory: 'shoes', title: 'Кроссовки', icon: '👟' },
    { id: 'boots', parentCategory: 'shoes', title: 'Ботинки', icon: '🥾' },
    { id: 'heels', parentCategory: 'shoes', title: 'Туфли', icon: '👠' },
    { id: 'sandals', parentCategory: 'shoes', title: 'Сандали', icon: '👡' },
  ],
  carpets: [
    { id: 'small_carpet', parentCategory: 'carpets', title: 'Маленький ковер (до 2м²)', icon: '📐' },
    { id: 'medium_carpet', parentCategory: 'carpets', title: 'Средний ковер (2-6м²)', icon: '📏' },
    { id: 'large_carpet', parentCategory: 'carpets', title: 'Большой ковер (6-12м²)', icon: '📐' },
    { id: 'xlarge_carpet', parentCategory: 'carpets', title: 'Очень большой ковер (12м²+)', icon: '📏' },
  ],
  cleaning: [
    { id: 'apartment_light', parentCategory: 'cleaning', title: 'Квартира - легкая уборка', icon: '🏠' },
    { id: 'apartment_deep', parentCategory: 'cleaning', title: 'Квартира - генеральная уборка', icon: '🏘️' },
    { id: 'office_light', parentCategory: 'cleaning', title: 'Офис - легкая уборка', icon: '🏢' },
    { id: 'office_deep', parentCategory: 'cleaning', title: 'Офис - генеральная уборка', icon: '🏗️' },
    { id: 'after_construction', parentCategory: 'cleaning', title: 'После ремонта', icon: '🔨' },
    { id: 'windows', parentCategory: 'cleaning', title: 'Мытье окон', icon: '🪟' },
  ],
  strollers: [
    { id: 'stroller_standard', parentCategory: 'strollers', title: 'Стандартная коляска', icon: '🚼' },
    { id: 'stroller_double', parentCategory: 'strollers', title: 'Двойная коляска', icon: '👶👶' },
    { id: 'stroller_sport', parentCategory: 'strollers', title: 'Спортивная коляска', icon: '🏃' },
  ],
};

export const DEFAULT_SUBCATEGORY_PRICES = {
  jackets: 2500,
  blouses: 1500,
  pants: 1800,
  dresses: 2000,
  shirts: 1200,
  suits: 4000,
  coats: 3000,
  sofa: 6000,
  armchair: 3500,
  chair: 1500,
  mattress: 5000,
  ottoman: 2000,
  sneakers: 1500,
  boots: 2000,
  heels: 1800,
  sandals: 1200,
  small_carpet: 2000,
  medium_carpet: 4000,
  large_carpet: 7000,
  xlarge_carpet: 12000,
  apartment_light: 8000,
  apartment_deep: 15000,
  office_light: 10000,
  office_deep: 20000,
  after_construction: 25000,
  windows: 3000,
  stroller_standard: 2500,
  stroller_double: 4000,
  stroller_sport: 3000,
} as const;

export type SubcategoryId = keyof typeof DEFAULT_SUBCATEGORY_PRICES;
