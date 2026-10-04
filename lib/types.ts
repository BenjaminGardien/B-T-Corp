export type Sport =
  | "Padel"
  | "Tennis"
  | "Football"
  | "Five"
  | "Squash"
  | "Basket-ball"
  | "Volley-ball"
  | "Golf"
  | "Natation";
export type Role = "sportif" | "pro" | "admin";
export type OfferKind = "classique" | "bon-plan";
export type Level = "Débutant" | "Intermédiaire" | "Confirmé" | "Expert";
export interface Establishment {
  id: string;
  name: string;
  sports: Sport[];
  distance: number;
  rating: number;
  reviewCount: number;
  address: string;
  description: string;
  amenities: string[];
  image: string;
  x: number;
  y: number;
  equipment: string[];
  owner: string;
  active: boolean;
  contact?: string;
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  exceptions?: ScheduleException[];
}
export interface ScheduleException {
  id: string;
  date: string;
  kind: "closed" | "shortened" | "extended" | "equipment-unavailable";
  label: string;
  open?: string;
  close?: string;
  equipment?: string;
}
export interface Offer {
  id: string;
  establishmentId: string;
  sport: Sport;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  occupied: number;
  normalPrice: number;
  price: number;
  unit: "terrain" | "place";
  equipment: string;
  interested: string[];
  missingPlayers: number;
  status: "available" | "cancelled" | "full";
  kind: OfferKind;
}
export interface DemoEvent {
  id: string;
  establishmentId: string;
  title: string;
  sport: Sport;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registered: number;
  price?: number;
  status: "open" | "full" | "cancelled";
  image: string;
  practicalInfo: string;
}
export interface Booking {
  id: string;
  offerId: string;
  participants: number;
  amount: number;
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "club-cancelled"
    | "past"
    | "no-show";
  createdAt: string;
  refundLabel?: string;
  missingPlayers: number;
}
export interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  level: Level;
  role: Role;
  active: boolean;
}
export interface Review {
  id: string;
  establishmentId: string;
  user: string;
  rating: number;
  text: string;
  response?: string;
}
export interface Profile {
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: string;
  sports: Sport[];
  levels: Partial<Record<Sport, Level>>;
  radius: number;
  notifications: Record<string, boolean>;
}
export interface AppNotification {
  id: string;
  category: string;
  title: string;
  text: string;
  read: boolean;
  href: string;
}
export interface DemoState {
  version: 1;
  role: Role;
  proClubId?: string;
  favorites: string[];
  offers: Offer[];
  bookings: Booking[];
  establishments: Establishment[];
  users: DemoUser[];
  reviews: Review[];
  profile: Profile;
  notifications: AppNotification[];
  events: DemoEvent[];
}
export interface SearchFilters {
  sports: Sport[];
  date: string;
  from: string;
  to: string;
  participants: number;
  radius: number;
  query: string;
  dateMode: "single" | "range";
  startDate: string;
  endDate: string;
  dealsOnly: boolean;
}
