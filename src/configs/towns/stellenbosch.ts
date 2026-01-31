import { TownConfig } from '../types';
import { Special } from '../../types';
import { VAALWATER_SECTORS } from '../../data';

// Stellenbosch Specials - will be populated from real businesses
const STELLENBOSCH_SPECIALS: Special[] = [];

export const stellenboschConfig: TownConfig = {
  id: 'stellenbosch',
  slug: 'stellenbosch',

  town: {
    name: 'Stellenbosch',
    tagline: 'City of Oaks',
    region: 'Western Cape',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting the Stellenbosch community, one trusted business at a time.',
    paragraphs: [
      'Stellenbosch Connect was created to serve our historic university town, renowned for its oak-lined streets, world-class wine estates, and vibrant culture.',
      'We are your digital bridge to local excellence. Our mission is to provide boutique visibility to the businesses, services, and experiences that define the Stellenbosch lifestyle.',
      'Whether you\'re a student, a local resident, or a visitor exploring our beautiful wine country, Stellenbosch Connect ensures you find verified excellence with a hyper-local touch.',
    ],
    images: [],
  },

  branding: {
    colors: {
      primary: '#722f37',    // Burgundy (wine)
      secondary: '#c9a962',  // Gold
      accent: '#f5f0e6',     // Cream
    },
    heroImage: 'https://res.cloudinary.com/dkn6tnxao/image/upload/v1769857174/nenad-gataric-2GZvGZh4dJc-unsplash_nvblen.jpg',
    faviconEmoji: 'S',
    faviconColor: '#722f37', // Burgundy for favicon
  },

  contact: {
    whatsapp: '',
    email: 'hello@stellenboschconnect.co.za',
    phone: '',
    botWhatsApp: '', // WhatsApp bot for directory search - to be configured
  },

  features: {
    hasAssistant: false, // No AI assistant yet
    assistantUrl: '',
  },

  location: {
    center: { lat: -33.9366, lng: 18.8663 },
    zoom: 14,
  },

  // Stellenbosch pricing (premium market like Blouberg)
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
    specials: STELLENBOSCH_SPECIALS,
  },
};
