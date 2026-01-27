import { TownConfig, DEFAULT_PRICING } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Modimolle Specials - will be populated from real businesses
const MODIMOLLE_SPECIALS: Special[] = [];

export const modimolleConfig: TownConfig = {
  id: 'modimolle',
  slug: 'modimolle',

  town: {
    name: 'Modimolle',
    tagline: 'Heart of the Waterberg',
    region: 'Limpopo',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting the Heart of the Waterberg, one trusted business at a time.',
    paragraphs: [
      'Modimolle Connect was created to serve our thriving agricultural community at the gateway to the Waterberg.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the farms, businesses, and services that make Modimolle the beating heart of the region.',
      'Whether you\'re a local resident seeking trusted services or a traveler passing through on the N1, Modimolle Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#b8860b',    // Warm amber/gold (DarkGoldenrod)
      secondary: '#8b5a2b',  // Earthy brown (SaddleBrown variant)
      accent: '#f5deb3',     // Wheat/cream
    },
    heroImage: '', // Will use CSS gradient as placeholder
    faviconEmoji: 'M',
    faviconColor: '#8B7355', // Waterberg brown for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@modimolleconnect.co.za',
    phone: '',
    botWhatsApp: '27836669298', // Shared WhatsApp bot for directory search
  },

  location: {
    center: { lat: -24.7000, lng: 28.4000 },
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
    specials: MODIMOLLE_SPECIALS,
  },
};
