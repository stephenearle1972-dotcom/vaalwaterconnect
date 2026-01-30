import { TownConfig } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Blouberg Specials - will be populated from real businesses
const BLOUBERG_SPECIALS: Special[] = [];

export const bloubergConfig: TownConfig = {
  id: 'blouberg',
  slug: 'blouberg',

  town: {
    name: 'Blouberg',
    tagline: 'West Coast Lifestyle Hub',
    region: 'Western Cape',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting the West Coast lifestyle community, one trusted business at a time.',
    paragraphs: [
      'Blouberg Connect was created to serve our vibrant coastal community with its iconic Table Mountain views and world-class kitesurfing beaches.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the businesses, services, and experiences that define the Blouberg lifestyle.',
      'Whether you\'re a local resident seeking trusted services or a visitor drawn to our golden beaches and outdoor lifestyle, Blouberg Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#0077b6',    // Ocean blue
      secondary: '#f4a261',  // Sandy gold
      accent: '#caf0f8',     // Pale blue (sea foam)
    },
    heroImage: 'https://res.cloudinary.com/dkn6tnxao/image/upload/v1768154086/EF8A1553-2_y0i9rc.jpg',
    faviconEmoji: 'B',
    faviconColor: '#0077b6', // Ocean blue for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@bloubergconnect.co.za',
    phone: '',
    botWhatsApp: '27632740406', // WhatsApp bot for directory search
  },

  features: {
    hasAssistant: true, // Blouberg has the AI chat assistant deployed
    assistantUrl: 'https://blouberg-assistant.netlify.app',
  },

  location: {
    center: { lat: -33.7972, lng: 18.4620 },
    zoom: 13,
  },

  // Blouberg custom pricing (higher than Vaalwater)
  pricing: {
    micro: { monthly: 'R50', annual: 'R500' },
    standard: { monthly: 'R299', annual: 'R3,289' },   // 11 months
    premium: { monthly: 'R449', annual: 'R4,939' },    // 11 months
    enterprise: { monthly: 'R699', annual: 'R7,689' }, // 11 months
  },

  data: {
    sectors: VAALWATER_SECTORS, // Reuse sector definitions
    businesses: [],
    jobs: [],
    events: [],
    classifieds: [],
    properties: [],
    announcements: [],
    specials: BLOUBERG_SPECIALS,
  },
};
