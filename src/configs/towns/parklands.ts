import { TownConfig, DEFAULT_PRICING } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Parklands Specials - will be populated from real businesses
const PARKLANDS_SPECIALS: Special[] = [];

export const parklandsConfig: TownConfig = {
  id: 'parklands',
  slug: 'parklands',

  town: {
    name: 'Parklands',
    tagline: 'Family & Services Hub',
    region: 'Western Cape',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting families and services in Parklands, one trusted business at a time.',
    paragraphs: [
      'Parklands Connect was created to serve our thriving suburban community known for its family-friendly neighborhoods and convenient lifestyle.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the businesses, services, and professionals that keep Parklands families connected and supported.',
      'Whether you\'re a local resident seeking trusted home services or a business owner wanting to reach your community, Parklands Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#2d6a4f',    // Fresh green
      secondary: '#40c4ff',  // Light blue
      accent: '#d8f3dc',     // Pale green
    },
    heroImage: '', // Will use CSS gradient as placeholder
    faviconEmoji: 'P',
    faviconColor: '#2d6a4f', // Fresh green for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@parklandsconnect.co.za',
    phone: '',
  },

  location: {
    center: { lat: -33.8078, lng: 18.5033 },
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
    specials: PARKLANDS_SPECIALS,
  },
};
