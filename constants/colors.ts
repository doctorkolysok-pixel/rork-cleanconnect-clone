// TazaGo Design System 2025
// Философия: "Тихая роскошь" - минимализм с глубиной, биоморфные формы

export const Colors = {
  // Основные цвета
  primary: '#00BFA6',           // Тёплый бирюзовый - химчистка
  cleaning: '#3E9D47',          // Глубокий зелёный - клининг
  charity: '#FF4081',           // Розово-малиновый - благотворительность
  gold: '#D4AF37',              // Золотой - награды, ачивки
  
  // Текст
  textPrimary: '#1E1E1E',       // Тёмно-серый - основной текст
  textSecondary: '#6B7280',     // Серый - подсказки, метки
  textWhite: '#FFFFFF',         // Белый текст
  
  // Фон
  background: '#FFFFFF',        // Белый фон
  backgroundCard: '#F8F9FA',    // Очень светлый серый - карточки
  backgroundLight: '#F8F8F8',   // Легкий серый фон
  
  // Статусы
  success: '#4CAF50',           // Зелёный успех
  warning: '#FF9800',           // Оранжевое предупреждение
  error: '#E53935',             // Тёплый красный - ошибка
  info: '#00BFA6',              // Информация
  
  // Градиенты (для использования в будущем)
  gradientCleaningStart: '#4CAF50',
  gradientCleaningEnd: '#3E9D47',
  gradientPrimaryStart: '#00BFA6',
  gradientPrimaryEnd: '#008C7A',
  
  // Прозрачности
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  divider: '#E0E0E0',
  
  // Специальные
  ecoGreen: '#4CAF50',
  star: '#FFD700',
  ai: '#FFD700',
  shadow: '#000000',
};

// Цвета уровней загрязнения
export const DirtLevelColors = {
  light: '#4CAF50',
  medium: '#FFD700',
  heavy: '#FF9800',
  extreme: '#F44336',
};

// Тени для компонентов (iOS-like)
export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Радиусы закругления (биоморфизм)
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 999, // Полностью круглый
};

// Отступы (8pt система)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Типографика (Inter Variable)
export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  heading4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
};

export default Colors;
