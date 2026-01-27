import { TownConfig, DEFAULT_PRICING } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Port Alfred Specials - will be populated from real businesses
const PORT_ALFRED_SPECIALS: Special[] = [];

export const portAlfredConfig: TownConfig = {
  id: 'port-alfred',
  slug: 'port-alfred',

  town: {
    name: 'Port Alfred',
    tagline: 'Sunshine Coast',
    region: 'Eastern Cape',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting the Sunshine Coast, one trusted business at a time.',
    paragraphs: [
      'Port Alfred Connect was created to serve our beautiful coastal community where the Kowie River meets the Indian Ocean.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the businesses, services, and experiences that make Port Alfred and the Sunshine Coast special.',
      'Whether you\'re a local resident seeking trusted services or a visitor exploring our pristine beaches and river activities, Port Alfred Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#1e6091',    // Navy blue (ocean deep)
      secondary: '#48cae4',  // Light blue (coastal sky)
      accent: '#caf0f8',     // Pale blue (sea foam)
    },
    heroImage: '', // Will use CSS gradient as placeholder
    faviconEmoji: 'P',
    faviconColor: '#1e6091', // Navy blue for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@portalfredconnect.co.za',
    phone: '',
    botWhatsApp: '27836669298', // Shared WhatsApp bot for directory search
  },

  location: {
    center: { lat: -33.5906, lng: 26.8850 },
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
    specials: PORT_ALFRED_SPECIALS,
  },
};
