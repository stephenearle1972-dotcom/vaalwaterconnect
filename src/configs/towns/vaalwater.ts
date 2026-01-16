import { TownConfig, DEFAULT_PRICING } from '../types';
import {
  VAALWATER_SECTORS,
  VAALWATER_BUSINESSES,
  VAALWATER_JOBS,
  VAALWATER_EVENTS,
  VAALWATER_CLASSIFIEDS,
  VAALWATER_PROPERTIES,
  VAALWATER_ANNOUNCEMENTS
} from '../../data';

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
  },
};
