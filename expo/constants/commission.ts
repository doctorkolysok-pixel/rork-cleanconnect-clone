import { OrderUrgency, CleanerTier, CommissionBreakdown } from '@/types';

export const BASE_COMMISSION_RATE = 0.10;

export const URGENCY_FEES: Record<OrderUrgency, number> = {
  standard: 0,
  fast: 0.03,
  urgent: 0.05,
  express: 0.08,
};

export const TIER_DISCOUNTS: Record<CleanerTier, number> = {
  new: 0,
  standard: -0.01,
  verified: -0.02,
  premium: -0.03,
  enterprise: -0.05,
};

export const URGENCY_LABELS: Record<OrderUrgency, string> = {
  standard: 'Стандартный (1-3 дня)',
  fast: 'Быстрый (сегодня)',
  urgent: 'Срочный (2 часа)',
  express: 'Экспресс (1 час)',
};

export const TIER_LABELS: Record<CleanerTier, string> = {
  new: 'Новичок',
  standard: 'Проверенный',
  verified: 'Верифицированный',
  premium: 'Премиум',
  enterprise: 'Корпоративный',
};

export const TIER_REQUIREMENTS = {
  new: { minOrders: 0, minRating: 0 },
  standard: { minOrders: 10, minRating: 4.0 },
  verified: { minOrders: 50, minRating: 4.5 },
  premium: { minOrders: 200, minRating: 4.7 },
  enterprise: { minOrders: 1000, minRating: 4.8 },
};

export function calculateCommission(
  orderPrice: number,
  urgency: OrderUrgency,
  cleanerTier: CleanerTier
): CommissionBreakdown {
  const baseRate = BASE_COMMISSION_RATE;
  const urgencyFee = URGENCY_FEES[urgency];
  const tierDiscount = TIER_DISCOUNTS[cleanerTier];
  
  const totalCommissionRate = Math.max(0.05, baseRate + urgencyFee + tierDiscount);
  
  const platformReceives = orderPrice * totalCommissionRate;
  const cleanerReceives = orderPrice - platformReceives;
  
  return {
    baseRate,
    urgencyFee,
    cleanerTierDiscount: tierDiscount,
    totalCommission: totalCommissionRate,
    cleanerReceives: Math.round(cleanerReceives),
    platformReceives: Math.round(platformReceives),
  };
}

export function getCleanerTier(completedOrders: number, rating: number): CleanerTier {
  if (
    completedOrders >= TIER_REQUIREMENTS.enterprise.minOrders &&
    rating >= TIER_REQUIREMENTS.enterprise.minRating
  ) {
    return 'enterprise';
  }
  if (
    completedOrders >= TIER_REQUIREMENTS.premium.minOrders &&
    rating >= TIER_REQUIREMENTS.premium.minRating
  ) {
    return 'premium';
  }
  if (
    completedOrders >= TIER_REQUIREMENTS.verified.minOrders &&
    rating >= TIER_REQUIREMENTS.verified.minRating
  ) {
    return 'verified';
  }
  if (
    completedOrders >= TIER_REQUIREMENTS.standard.minOrders &&
    rating >= TIER_REQUIREMENTS.standard.minRating
  ) {
    return 'standard';
  }
  return 'new';
}

export function getUrgencyDeadline(urgency: OrderUrgency): string {
  const now = new Date();
  switch (urgency) {
    case 'express':
      now.setHours(now.getHours() + 1);
      break;
    case 'urgent':
      now.setHours(now.getHours() + 2);
      break;
    case 'fast':
      now.setHours(now.getHours() + 8);
      break;
    case 'standard':
    default:
      now.setDate(now.getDate() + 3);
      break;
  }
  return now.toISOString();
}
