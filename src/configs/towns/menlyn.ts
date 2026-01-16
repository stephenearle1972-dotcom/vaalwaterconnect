import { TownConfig, DEFAULT_PRICING } from '../types';

// Menlyn (Pretoria) configuration - TEMPLATE
// This is a placeholder config for future implementation
// Data arrays are empty and will be populated when Menlyn launches

export const menlynConfig: TownConfig = {
  id: 'menlyn',
  slug: 'menlyn',

  town: {
    name: 'Menlyn',
    tagline: 'Pretoria East Business Hub',
    region: 'Gauteng',
  },

  branding: {
    colors: {
      primary: '#1e3a5f',    // Deep blue
      secondary: '#c9a227',   // Gold
      accent: '#f5f5f5',      // Light gray
    },
    heroImage: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&q=80&w=1920',
    faviconEmoji: 'M',
  },

  contact: {
    whatsapp: '27000000000', // TODO: Update with actual number
    email: 'hello@menlynconnect.co.za',
    phone: '000 000 0000',
  },

  location: {
    center: { lat: -25.7823, lng: 28.2768 }, // Menlyn, Pretoria
    zoom: 13,
  },

  pricing: DEFAULT_PRICING, // Can be customized for Menlyn market

  data: {
    sectors: [], // Will be populated with Menlyn-specific sectors
    businesses: [],
    jobs: [],
    events: [],
    classifieds: [],
    properties: [],
    announcements: [],
  },
};
