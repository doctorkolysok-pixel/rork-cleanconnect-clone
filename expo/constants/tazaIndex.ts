export type TazaIndexLevel = 'economy' | 'standard' | 'optimal' | 'premium';

export interface TazaIndexResult {
  index: number;
  level: TazaIndexLevel;
  color: string;
  emoji: string;
  title: string;
  description: string;
  protectionEnabled: boolean;
}

export const TAZA_INDEX_LEVELS = {
  economy: {
    range: [0, 49],
    color: '#FF6B6B',
    emoji: '🔴',
    title: 'Эконом',
    description: 'Цена ниже рыночной. Возможно низкое качество работы.',
    protectionEnabled: false,
  },
  standard: {
    range: [50, 79],
    color: '#FFD700',
    emoji: '🟡',
    title: 'Стандарт',
    description: 'Обычный режим. Базовая защита включена.',
    protectionEnabled: false,
  },
  optimal: {
    range: [80, 109],
    color: '#4CAF50',
    emoji: '🟢',
    title: 'Оптимум',
    description: 'Отличное соотношение цены и качества!',
    protectionEnabled: false,
  },
  premium: {
    range: [110, Infinity],
    color: '#FFD700',
    emoji: '💛',
    title: 'Премиум',
    description: 'Premium Protection активирована! Максимальная защита заказа.',
    protectionEnabled: true,
  },
} as const;

export function calculateTazaIndex(
  clientPrice: number,
  avgPrice: number
): TazaIndexResult {
  const index = Math.round((clientPrice / avgPrice) * 100);

  let level: TazaIndexLevel = 'economy';

  if (index >= TAZA_INDEX_LEVELS.premium.range[0]) {
    level = 'premium';
  } else if (index >= TAZA_INDEX_LEVELS.optimal.range[0]) {
    level = 'optimal';
  } else if (index >= TAZA_INDEX_LEVELS.standard.range[0]) {
    level = 'standard';
  } else {
    level = 'economy';
  }

  const levelData = TAZA_INDEX_LEVELS[level];

  return {
    index,
    level,
    color: levelData.color,
    emoji: levelData.emoji,
    title: levelData.title,
    description: levelData.description,
    protectionEnabled: levelData.protectionEnabled,
  };
}
