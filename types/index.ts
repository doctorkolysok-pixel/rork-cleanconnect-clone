export type UserRole = 'client' | 'cleaner' | 'courier' | 'admin' | 'partner';

export type OrderCategory = 'clothing' | 'furniture' | 'shoes' | 'carpets' | 'cleaning' | 'strollers';

export type OrderStatus = 'new' | 'offers_received' | 'in_progress' | 'courier_to_partner' | 'at_partner' | 'partner_working' | 'partner_done' | 'courier_to_client' | 'completed' | 'cancelled';

export type OrderUrgency = 'standard' | 'fast' | 'urgent' | 'express';

export type CleanerTier = 'new' | 'standard' | 'verified' | 'premium' | 'enterprise';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  rating: number;
  address?: string;
  balance: number;
  cleanPoints: number;
  level: number;
  createdAt: string;
  companyName?: string;
  description?: string;
  workingHours?: string;
  servicePrices?: Record<string, number>;
  isProfileComplete?: boolean;
  staffCount?: number;
  monthlyRevenueGoal?: number;
  monthlyExpenseBudget?: number;
}

export interface TazaIndexData {
  index: number;
  level: 'economy' | 'standard' | 'optimal' | 'premium';
  avgPrice: number;
  protectionEnabled: boolean;
}

export interface Order {
  id: string;
  userId: string;
  category: OrderCategory;
  photos: string[];
  comment: string;
  address: string;
  priceOffer: number;
  urgency: OrderUrgency;
  deadline?: string;
  status: OrderStatus;
  chosenCleanerId?: string;
  aiAnalysis?: AIAnalysis | CleaningAIAnalysis;
  cleaningDetails?: CleaningOrderDetails;
  commission?: CommissionBreakdown;
  tazaIndex?: TazaIndexData;
  createdAt: string;
  completedAt?: string;
}

export interface AIAnalysis {
  stainType: string;
  fabricType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedPrice: number;
  recommendations: string[];
  confidence: number;
}

export interface CleaningAIAnalysis {
  roomType: 'apartment' | 'office';
  dirtLevel: 'light' | 'medium' | 'heavy' | 'extreme';
  estimatedTimeHours: number;
  recommendedCleaners: number;
  specialZones: string[];
  recommendations: string[];
  estimatedPrice: number;
  confidence: number;
}

export type CleaningType = 'apartment' | 'office' | 'general' | 'after_construction' | 'event' | 'windows';
export type AccessType = 'present' | 'leave_keys' | 'door_code';

export interface CleaningOrderDetails {
  type: CleaningType;
  area: number;
  rooms: number;
  bathrooms: number;
  hasPets: boolean;
  needsSupplies: boolean;
  suppliesCost: number;
  preferredDateTime: string;
  access: AccessType;
  doorCode?: string;
  notes: string;
}

export interface Offer {
  id: string;
  orderId: string;
  cleanerId: string;
  cleanerName: string;
  cleanerRating: number;
  cleanerPhoto?: string;
  proposedPrice: number;
  comment: string;
  eta: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  cleanerId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  fromId: string;
  toId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CharityOrder {
  id: string;
  donorId: string;
  recipientName: string;
  category: OrderCategory;
  description: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface CleanerProfile {
  id: string;
  name: string;
  rating: number;
  photo?: string;
  specialties: OrderCategory[];
  completedOrders: number;
  responseTime: string;
  ecoFriendly: boolean;
  tier: CleanerTier;
  verifiedAt?: string;
  subscriptionType?: 'free' | 'pro' | 'enterprise';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface CommissionBreakdown {
  baseRate: number;
  urgencyFee: number;
  cleanerTierDiscount: number;
  totalCommission: number;
  cleanerReceives: number;
  platformReceives: number;
}

export interface LiveStream {
  id: string;
  orderId: string;
  cleanerId: string;
  isActive: boolean;
  currentFrame?: string;
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
}

export type DeliveryType = 'pickup_to_cleaner' | 'cleaner_to_client';
export type DeliveryStatus = 'new' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface Delivery {
  id: string;
  orderId: string;
  type: DeliveryType;
  courierId?: string;
  courierName?: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  clientPhone: string;
  cleanerPhone?: string;
  estimatedPrice: number;
  actualPrice?: number;
  notes?: string;
  pickupTime?: string;
  deliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type PartnerOrderStatus = 'pending' | 'accepted' | 'rejected' | 'working' | 'completed';
export type PriceQualityIndicator = 'low' | 'optimal' | 'premium';
export type VehicleType = 'bike' | 'scooter' | 'car' | 'van';
export type CourierDeliveryStatus = 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
export type CourierDeliveryType = 'to_partner' | 'to_client';

export interface PartnerProfile {
  id: string;
  userId: string;
  businessName: string;
  address: string;
  city: string;
  description?: string;
  services: string[];
  workingHours?: string;
  isVerified: boolean;
  isActive: boolean;
  visibilityRating: number;
  totalEarnings: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface PartnerService {
  id: string;
  partnerId: string;
  serviceName: string;
  category: OrderCategory;
  price: number;
  description?: string;
  estimatedTime: string;
  isActive: boolean;
  priceQualityIndicator: PriceQualityIndicator;
  avgMarketPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourierProfile {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  city: string;
  isOnline: boolean;
  isVerified: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  totalDeliveries: number;
  totalEarnings: number;
  createdAt: string;
}

export interface CourierDelivery {
  id: string;
  orderId: string;
  courierId: string;
  type: CourierDeliveryType;
  status: CourierDeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  estimatedTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  price: number;
  createdAt: string;
}

export interface OrderPhoto {
  id: string;
  orderId: string;
  partnerId: string;
  type: 'before' | 'after';
  photoUrl: string;
  comment?: string;
  createdAt: string;
}

export interface OrderHistoryItem {
  id: string;
  orderId: string;
  action: string;
  performedBy: string;
  performedByName?: string;
  details?: string;
  createdAt: string;
}

export interface PartnerFinance {
  id: string;
  partnerId: string;
  orderId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  createdAt: string;
}

export interface CourierFinance {
  id: string;
  courierId: string;
  deliveryId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  createdAt: string;
}
