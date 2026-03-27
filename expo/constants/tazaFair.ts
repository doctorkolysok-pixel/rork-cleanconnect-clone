import { OrderCategory } from '@/types';
import { DEFAULT_SUBCATEGORY_PRICES, SUBCATEGORIES, SubcategoryId, SubcategoryInfo } from './subcategories';

export type TazaFairBandId = 'too_low' | 'moderately_low' | 'market' | 'premium' | 'vip';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TazaFairBand {
  id: TazaFairBandId;
  min: number;
  max?: number;
  label: string;
  subtitle: string;
  color: string;
  background: string;
  icon: string;
  severityRank: number;
  recommendationHint: string;
  badgeTone: string;
}

export interface MarketPriceEntry {
  id: SubcategoryId;
  category: OrderCategory;
  avgPrice: number;
  recommendedFair: number;
  sampleSize: number;
  updatedAt: string;
  city: string;
  note: string;
  trend: TrendDirection;
}

export interface TazaFairEvaluation {
  index: number;
  band: TazaFairBand;
  delta: number;
  deltaPercent: number;
  recommendedPrice: number;
}

const UPDATED_AT = '2025-11-10T08:00:00.000Z';

const CATEGORY_MARKET_META: Record<OrderCategory, { sampleSize: number; trend: TrendDirection; city: string; note: string; multiplier: number; }>
  = {
    clothing: {
      sampleSize: 82,
      trend: 'stable',
      city: 'Алматы',
      note: 'Средняя по 28 сервисам одежды',
      multiplier: 1.02,
    },
    furniture: {
      sampleSize: 64,
      trend: 'up',
      city: 'Алматы',
      note: 'Спрос растет из-за осеннего сезона',
      multiplier: 1.06,
    },
    shoes: {
      sampleSize: 41,
      trend: 'stable',
      city: 'Астана',
      note: 'По данным 17 мастерских',
      multiplier: 1.01,
    },
    carpets: {
      sampleSize: 53,
      trend: 'down',
      city: 'Алматы',
      note: 'Конкуренция усилилась, цены легли вниз',
      multiplier: 0.97,
    },
    cleaning: {
      sampleSize: 37,
      trend: 'up',
      city: 'Алматы',
      note: 'Рост заказов на глубокую уборку',
      multiplier: 1.08,
    },
    strollers: {
      sampleSize: 24,
      trend: 'stable',
      city: 'Астана',
      note: 'Устойчивый спрос на семейных площадках',
      multiplier: 1.03,
    },
  };

const SUBCATEGORY_LOOKUP: Record<SubcategoryId, SubcategoryInfo> = Object.values(SUBCATEGORIES)
  .flat()
  .reduce((acc, item) => {
    acc[item.id as SubcategoryId] = item;
    return acc;
  }, {} as Record<SubcategoryId, SubcategoryInfo>);

const TREND_MULTIPLIER_ADJUSTMENT: Record<TrendDirection, number> = {
  up: 1.04,
  down: 0.94,
  stable: 1.0,
};

const BASE_MARKET_MAP = Object.keys(DEFAULT_SUBCATEGORY_PRICES).reduce((acc, key) => {
  const subcategoryId = key as SubcategoryId;
  const lookup = SUBCATEGORY_LOOKUP[subcategoryId];
  const basePrice = DEFAULT_SUBCATEGORY_PRICES[subcategoryId];
  const categoryMeta = CATEGORY_MARKET_META[lookup.parentCategory];
  const categoryAdjustedPrice = Math.round(basePrice * categoryMeta.multiplier);
  const trendMultiplier = TREND_MULTIPLIER_ADJUSTMENT[categoryMeta.trend];
  const avgPrice = Math.max(500, Math.round(categoryAdjustedPrice * trendMultiplier));
  acc[subcategoryId] = {
    id: subcategoryId,
    category: lookup.parentCategory,
    avgPrice,
    recommendedFair: avgPrice,
    sampleSize: categoryMeta.sampleSize,
    updatedAt: UPDATED_AT,
    city: categoryMeta.city,
    note: categoryMeta.note,
    trend: categoryMeta.trend,
  };
  return acc;
}, {} as Record<SubcategoryId, MarketPriceEntry>);

export const SUBCATEGORY_MARKET_PRICES: Record<SubcategoryId, MarketPriceEntry> = BASE_MARKET_MAP;

export const TAZA_FAIR_BANDS: TazaFairBand[] = [
  {
    id: 'too_low',
    min: 0,
    max: 60,
    label: 'Слишком низкая цена',
    subtitle: 'Цена значительно ниже рынка, клиенты сомневаются в качестве',
    color: '#FF5A64',
    background: '#FFE5E7',
    icon: '⚠️',
    severityRank: 4,
    recommendationHint: 'Поднимите цену ближе к среднему значению, чтобы сохранить доверие',
    badgeTone: '#FF8A92',
  },
  {
    id: 'moderately_low',
    min: 61,
    max: 90,
    label: 'Умеренно низкая',
    subtitle: 'Чуть ниже рынка, есть риск потери приоритета в выдаче',
    color: '#FFB347',
    background: '#FFF3E0',
    icon: '🔶',
    severityRank: 3,
    recommendationHint: 'Сбалансируйте скидку, чтобы не терять рейтинг доверия',
    badgeTone: '#FFC46B',
  },
  {
    id: 'market',
    min: 91,
    max: 110,
    label: 'Рыночная цена',
    subtitle: 'Идеальный баланс: вы попадаете в топ выдачи и сохраняете доверие',
    color: '#2EC796',
    background: '#E4FBF3',
    icon: '🟢',
    severityRank: 0,
    recommendationHint: 'Продолжайте держать цены в этом диапазоне, чтобы зарабатывать Clean Points',
    badgeTone: '#52D7AA',
  },
  {
    id: 'premium',
    min: 111,
    max: 130,
    label: 'Премиум',
    subtitle: 'Выше рынка, подчеркните преимущества и сервис',
    color: '#4D7CFF',
    background: '#E5EDFF',
    icon: '💙',
    severityRank: 1,
    recommendationHint: 'Добавьте аргументы и фото, чтобы удержать клиентов',
    badgeTone: '#6C8EFF',
  },
  {
    id: 'vip',
    min: 131,
    label: 'VIP-цена',
    subtitle: 'Выставлен высокий прайс, объясните премиальные условия',
    color: '#AF7BFF',
    background: '#F2E8FF',
    icon: '⚪',
    severityRank: 2,
    recommendationHint: 'Расскажите о эксклюзивных бонусах или гарантиях качества',
    badgeTone: '#C59BFF',
  },
];

export function getTazaFairBand(index: number): TazaFairBand {
  const found = TAZA_FAIR_BANDS.find((band) => {
    if (typeof band.max === 'number') {
      return index >= band.min && index <= band.max;
    }
    return index >= band.min;
  });
  return found ?? TAZA_FAIR_BANDS[0];
}

export function evaluateTazaFair(price: number, avgPrice: number): TazaFairEvaluation {
  const safeAvg = avgPrice > 0 ? avgPrice : 1;
  const rawIndex = (price / safeAvg) * 100;
  const index = Math.max(0, Math.round(rawIndex));
  const band = getTazaFairBand(index);
  const delta = price - avgPrice;
  const deltaPercent = Math.round(((price - avgPrice) / safeAvg) * 100);
  return {
    index,
    band,
    delta,
    deltaPercent,
    recommendedPrice: avgPrice,
  };
}
