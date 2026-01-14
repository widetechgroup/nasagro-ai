
export type Language = 'sw' | 'en';
export type Theme = 'light' | 'dark';
export type AppState = 'landing' | 'auth' | 'app' | 'admin';

export interface Crop {
  id: string;
  name: string;
  plantingDate: string;
  size: number;
  type: string;
  status: 'Growing' | 'Harvesting' | 'Planted';
}

export interface MarketPrice {
  commodity: string;
  price: string;
  trend: 'up' | 'down' | 'stable';
  location: string;
}

export interface UserProfile {
  name: string;
  email: string;
  region: string;
  role: 'user' | 'admin';
  experience: 'Beginner' | 'Intermediate' | 'Expert';
  isAuthenticated: boolean;
  subscription: 'Free' | 'Pro' | 'Enterprise';
}

export interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
}

export interface ForumPost {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  replies: number;
}
