import { OrderCategory } from '@/types';

export interface AvgPriceData {
  category: OrderCategory;
  avgPrice: number;
  description: string;
}

export const AVG_PRICES: Record<OrderCategory, number> = {
  clothing: 2000,
  furniture: 5000,
  shoes: 1500,
  carpets: 3500,
  cleaning: 8000,
  strollers: 2500,
};

export const AVG_PRICES_DATA: AvgPriceData[] = [
  {
    category: 'clothing',
    avgPrice: 2000,
    description: 'Средняя цена за химчистку одежды',
  },
  {
    category: 'furniture',
    avgPrice: 5000,
    description: 'Средняя цена за химчистку мебели',
  },
  {
    category: 'shoes',
    avgPrice: 1500,
    description: 'Средняя цена за чистку обуви',
  },
  {
    category: 'carpets',
    avgPrice: 3500,
    description: 'Средняя цена за чистку ковров',
  },
  {
    category: 'cleaning',
    avgPrice: 8000,
    description: 'Средняя цена за уборку помещения',
  },
  {
    category: 'strollers',
    avgPrice: 2500,
    description: 'Средняя цена за чистку колясок',
  },
];
