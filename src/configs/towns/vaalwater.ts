import { TownConfig, DEFAULT_PRICING } from '../types';
import { Special } from '../../types';
import {
  VAALWATER_SECTORS,
  VAALWATER_BUSINESSES,
  VAALWATER_JOBS,
  VAALWATER_EVENTS,
  VAALWATER_CLASSIFIEDS,
  VAALWATER_PROPERTIES,
  VAALWATER_ANNOUNCEMENTS
} from '../../data';

// Vaalwater Specials - Bushveld/Safari focus
const VAALWATER_SPECIALS: Special[] = [
  {
    id: 's1',
    businessId: '1',
    businessName: 'Waterberg Game Reserve',
    title: 'Mid-Week Wilderness Escape',
    offer: '30% Discount on Luxury Safari Suites',
    validUntil: '30 September 2025',
    description: 'Book a mid-week stay (Mon-Thu) and enjoy deep discounts on our premium suites. Includes 2 guided game drives per day.',
    icon: '🦓',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's2',
    businessId: '11',
    businessName: 'The Stoep Cafe',
    title: 'Farmers Breakfast Special',
    offer: 'Buy One, Get One Half Price',
    validUntil: 'Every Saturday Morning',
    description: 'The perfect start to your weekend. Bring a friend and enjoy our famous traditional breakfast platter. Valid 08:00 - 11:00.',
    icon: '🍳',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's3',
    businessId: '20',
    businessName: 'Sunset Ridge Lodge',
    title: 'Waterberg Stargazing Long Stay',
    offer: 'Stay 4 Nights, Pay for 3',
    validUntil: 'End of Year 2025',
    description: 'Experience the pristine night skies of the Waterberg. Book a 4-night stay and the final night is on us. Perfect for family retreats.',
    icon: '✨',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800'
  }
];

export const vaalwaterConfig: TownConfig = {
  id: 'vaalwater',
  slug: 'vaalwater',

  town: {
    name: 'Vaalwater',
    tagline: 'Waterberg Biosphere District',
    region: 'Limpopo',
  },

  branding: {
    colors: {
      primary: '#2d4a3e',    // Forest green
      secondary: '#b87352',   // Clay/terracotta
      accent: '#e8e2d6',      // Sand/cream
    },
    heroImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1920',
    faviconEmoji: 'V',
  },

  contact: {
    whatsapp: '27688986081',
    email: 'hello@vaalwaterconnect.co.za',
    phone: '068 898 6081',
  },

  location: {
    center: { lat: -24.296, lng: 28.113 },
    zoom: 12,
  },

  pricing: DEFAULT_PRICING,

  data: {
    sectors: VAALWATER_SECTORS,
    businesses: VAALWATER_BUSINESSES,
    jobs: VAALWATER_JOBS,
    events: VAALWATER_EVENTS,
    classifieds: VAALWATER_CLASSIFIEDS,
    properties: VAALWATER_PROPERTIES,
    announcements: VAALWATER_ANNOUNCEMENTS,
    specials: VAALWATER_SPECIALS,
  },
};
