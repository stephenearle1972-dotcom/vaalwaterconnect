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

// Vaalwater Specials - Production ready (empty, will be populated from real businesses)
const VAALWATER_SPECIALS: Special[] = [];

export const vaalwaterConfig: TownConfig = {
  id: 'vaalwater',
  slug: 'vaalwater',

  town: {
    name: 'Vaalwater',
    tagline: 'Waterberg Biosphere District',
    region: 'Limpopo',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting the Waterberg Biosphere, one trusted business at a time.',
    paragraphs: [
      'Vaalwater Connect was born from a simple observation: in our vast and beautiful Waterberg region, finding reliable services shouldn\'t feel like navigating the bush without a compass.',
      'We are more than a directory; we are a digital bridge. Our mission is to provide boutique visibility to the master artisans, world-class lodges, and essential services that form the heartbeat of Vaalwater and its surrounds.',
      'Whether you\'re a local resident looking for a plumber or a traveler seeking the perfect safari escape, Vaalwater Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    ],
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
