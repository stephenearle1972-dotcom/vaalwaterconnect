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
  | 'specials';
