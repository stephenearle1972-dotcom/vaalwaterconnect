import { TownConfig, DEFAULT_PRICING } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Garsfontein Specials - will be populated from real businesses
const GARSFONTEIN_SPECIALS: Special[] = [];

export const garsfonteinConfig: TownConfig = {
  id: 'garsfontein',
  slug: 'garsfontein',

  town: {
    name: 'Garsfontein',
    tagline: "Pretoria East's Family Suburb",
    region: 'Gauteng',
  },

  about: {
    headline: 'Our Story.',
    subheadline: "Connecting Pretoria East's premier family suburb, one trusted business at a time.",
    paragraphs: [
      'Garsfontein Connect was created to serve one of Pretoria East\'s most established and family-friendly suburbs.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the businesses, services, and professionals that make Garsfontein a wonderful place to live and work.',
      'Whether you\'re a local resident seeking trusted services or a business owner wanting to reach your community, Garsfontein Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#1e3a5f',    // Navy blue
      secondary: '#d4af37',  // Gold
      accent: '#e8e2d6',     // Cream
    },
    heroImage: '', // Will use CSS gradient as placeholder
    faviconEmoji: 'G',
    faviconColor: '#1e3a5f', // Navy blue for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@garsfonteinconnect.co.za',
    phone: '',
    // botWhatsApp not set - WhatsApp bot only available for Vaalwater currently
  },

  location: {
    center: { lat: -25.7959, lng: 28.3006 },
    zoom: 14,
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
    specials: GARSFONTEIN_SPECIALS,
  },
};
