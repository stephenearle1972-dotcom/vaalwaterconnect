export type SectorId =
  | 'home-services'
  | 'automotive'
  | 'health-wellness'
  | 'food-drinks'
  | 'shopping-retail'
  | 'professional-services'
  | 'construction-industrial'
  | 'education-community'
  | 'tourism-hospitality'
  | 'pets-animals'
  | 'wildlife-agriculture'
  | 'daily-activities'
  | 'emergency-services'
  | 'informal-services';

export type Sector = {
  id: SectorId;
  name: string;
  description?: string;
  icon?: string;
};

export type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Business = {
  id: string;
  name: string;
  sectorId: SectorId;
  subcategory?: string;
  description: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  address?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  tier?: 'micro' | 'standard' | 'premium' | 'hospitality';
  isFeatured?: boolean;
  imageUrl?: string;
  reviews?: Review[];
};

export type Page =
  | 'home'
  | 'directory'
  | 'category'
  | 'business'
  | 'add-business'
  | 'about'
  | 'pricing'
  | 'recommend'
  | 'map'
  | 'tourism'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'disclaimer'
  | 'search'
  | 'specials'
  | 'jobs'
  | 'job-detail'
  | 'events'
  | 'event-detail'
  | 'classifieds'
  | 'classified-detail'
  | 'property'
  | 'property-detail'
  | 'announcements'
  | 'announcement-detail';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'casual';
export type ApplicationMethod = 'email' | 'phone' | 'whatsapp' | 'website';

export type Job = {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  jobType: JobType;
  sectorId: SectorId;
  description: string;
  requirements: string[];
  salaryRange?: string;
  location: string;
  postedDate: string;
  applicationMethod: ApplicationMethod;
  applicationContact: string;
  isActive: boolean;
};

export type EventType = 'market' | 'festival' | 'workshop' | 'community' | 'other';

export type Event = {
  id: string;
  title: string;
  organizerId: string | null;
  organizerName: string;
  eventType: EventType;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  ticketPrice?: string;
  bookingLink?: string;
  imageUrl: string;
  isFeatured: boolean;
};

export type ClassifiedCategory = 'for-sale' | 'wanted' | 'services' | 'other';
export type ClassifiedCondition = 'new' | 'used' | 'other';

export type Classified = {
  id: string;
  title: string;
  category: ClassifiedCategory;
  subcategory: string;
  description: string;
  price?: string;
  condition: ClassifiedCondition;
  sellerName: string;
  sellerContact: string;
  location: string;
  postedDate: string;
  imageUrl?: string;
  isActive: boolean;
};

export type ListingType = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'farm';

export type Property = {
  id: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  price: string;
  description: string;
  address: string;
  lat?: number;
  lng?: number;
  features: string[];
  agentName: string;
  agentContact: string;
  postedDate: string;
  imageUrls: string[];
  isFeatured: boolean;
};

export type AnnouncementCategory = 'lost-found' | 'community-notice' | 'alert' | 'other';

export type Announcement = {
  id: string;
  title: string;
  category: AnnouncementCategory;
  description: string;
  contactName: string;
  contactMethod: string;
  location: string;
  postedDate: string;
  expiryDate: string;
  imageUrl?: string;
  isActive: boolean;
};

export type Special = {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  offer: string;
  validUntil: string;
  description: string;
  icon: string;
  imageUrl: string;
};

export type EmergencyService = {
  id: string;
  town: string;
  province: string;
  category: string;
  service_name: string;
  primary_phone: string;
  secondary_phone?: string;
  whatsapp?: string;
  ussd?: string;
  email?: string;
  hours: string;
  coverage_area: string;
};
