import { TownConfig } from '../types';
import { Business, Sector, Job, Event, Classified, Property, Announcement, Special } from '../../types';

// ============================================
// SECTORS - Real category definitions (keep)
// ============================================
const MENLYN_SECTORS: Sector[] = [
  { id: 'home-services', name: 'Home Services', icon: '🏠' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'health-wellness', name: 'Health & Wellness', icon: '🌿' },
  { id: 'food-drinks', name: 'Food & Drinks', icon: '🍴' },
  { id: 'shopping-retail', name: 'Shopping & Retail', icon: '🛍️' },
  { id: 'professional-services', name: 'Professional Services', icon: '⚖️' },
  { id: 'construction-industrial', name: 'Construction & Industrial', icon: '🏗️' },
  { id: 'education-community', name: 'Education & Community', icon: '🎓' },
  { id: 'tourism-hospitality', name: 'Tourism & Hospitality', icon: '🏨' },
  { id: 'pets-animals', name: 'Pets & Animals', icon: '🐾' },
  { id: 'wildlife-agriculture', name: 'Wildlife & Agriculture', icon: '🚜' },
  { id: 'daily-activities', name: 'Daily activities', icon: '🚵' },
  { id: 'emergency-services', name: 'Emergency Services', icon: '🚨' },
  { id: 'informal-services', name: 'Informal Services', icon: '🧹' },
];

// ============================================
// PRODUCTION-READY: Empty arrays
// Real data comes from Google Sheets
// ============================================
const MENLYN_BUSINESSES: Business[] = [];
const MENLYN_JOBS: Job[] = [];
const MENLYN_EVENTS: Event[] = [];
const MENLYN_CLASSIFIEDS: Classified[] = [];
const MENLYN_PROPERTIES: Property[] = [];
const MENLYN_ANNOUNCEMENTS: Announcement[] = [];
const MENLYN_SPECIALS: Special[] = [];

export const menlynConfig: TownConfig = {
  id: 'menlyn',
  slug: 'menlyn',

  town: {
    name: 'Menlyn',
    tagline: 'Pretoria East Business Hub',
    region: 'Gauteng',
  },

  about: {
    headline: 'Our Story.',
    subheadline: 'Connecting Pretoria East\'s thriving business community.',
    paragraphs: [
      'Menlyn Connect was created to serve one of South Africa\'s most dynamic urban centres. In the heart of Pretoria East, where business meets lifestyle, we bridge the gap between exceptional services and the people who need them.',
      'We are the digital hub for Menlyn and surrounding areas - from Faerie Glen to Garsfontein, Waterkloof to Moreleta Park. Our mission is to showcase the premium businesses, professional services, and hidden gems that make this area thrive.',
      'Whether you\'re searching for a trusted attorney, the perfect restaurant for a business lunch, or a reliable service provider, Menlyn Connect ensures you find verified quality with true local expertise.',
    ],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    ],
  },

  branding: {
    colors: {
      primary: '#1e3a8a',    // Navy blue
      secondary: '#f59e0b',   // Amber gold
      accent: '#dbeafe',      // Light blue
    },
    heroImage: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&q=80&w=1920',
    faviconEmoji: 'M',
    faviconColor: '#0d9488', // Teal for favicon
  },

  contact: {
    whatsapp: '27688986081',
    email: 'hello@menlynconnect.co.za',
    phone: '068 898 6081',
    botWhatsApp: '27836669298', // Shared WhatsApp bot for directory search
  },

  location: {
    center: { lat: -25.7823, lng: 28.2768 }, // Menlyn, Pretoria
    zoom: 13,
  },

  // Slightly higher pricing for urban market
  pricing: {
    micro: { monthly: 'R75', annual: 'R750' },
    standard: { monthly: 'R249', annual: 'R2,739' },
    premium: { monthly: 'R449', annual: 'R4,939' },
    enterprise: { monthly: 'R799', annual: 'R8,789' },
  },

  data: {
    sectors: MENLYN_SECTORS,
    businesses: MENLYN_BUSINESSES,
    jobs: MENLYN_JOBS,
    events: MENLYN_EVENTS,
    classifieds: MENLYN_CLASSIFIEDS,
    properties: MENLYN_PROPERTIES,
    announcements: MENLYN_ANNOUNCEMENTS,
    specials: MENLYN_SPECIALS,
  },
};
