import { TownConfig, DEFAULT_PRICING } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Lephalale Specials - will be populated from real businesses
const LEPHALALE_SPECIALS: Special[] = [];

export const lephalaleConfig: TownConfig = {
  id: 'lephalale',
  slug: 'lephalale',

  town: {
    name: 'Lephalale',
    tagline: 'Powerhouse of the Waterberg',
    region: 'Limpopo',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting the Powerhouse of the Waterberg, one trusted business at a time.',
    paragraphs: [
      'Lephalale Connect was created to serve our dynamic community at the heart of the Waterberg coal mining region.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the businesses and services that power Lephalale and keep our community thriving.',
      'Whether you\'re a local resident seeking trusted services or a professional working in the energy sector, Lephalale Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#1e3a5f',    // Navy blue
      secondary: '#f59e0b',  // Amber
      accent: '#fef3c7',     // Light amber/cream
    },
    heroImage: '', // Will use CSS gradient as placeholder
    faviconEmoji: 'L',
    faviconColor: '#1e3a5f', // Navy for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@lephalaleconnect.co.za',
    phone: '',
  },

  location: {
    center: { lat: -23.6667, lng: 27.7500 },
    zoom: 13,
  },

  pricing: DEFAULT_PRICING,

  data: {
    sectors: VAALWATER_SECTORS, // Reuse sector definitions
    businesses: [],
    jobs: [],
    events: [],
    classifieds: [],
    properties: [],
    announcements: [],
    specials: LEPHALALE_SPECIALS,
  },
};
