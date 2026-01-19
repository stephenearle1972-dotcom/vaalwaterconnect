import { Business, Sector, Job, Event, Classified, Property, Announcement } from './types';

// ============================================
// SECTORS - Real category definitions (keep)
// ============================================
export const SECTORS: Sector[] = [
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

// Businesses are loaded from Google Sheets CSV at runtime
export const BUSINESSES: Business[] = [];

// Jobs, Events, Classifieds, Properties, Announcements
// These can be populated from Google Sheets or kept as community-submitted
export const JOBS: Job[] = [];
export const EVENTS: Event[] = [];
export const CLASSIFIEDS: Classified[] = [];
export const PROPERTIES: Property[] = [];
export const ANNOUNCEMENTS: Announcement[] = [];

// Vaalwater-specific exports for multi-tenant config system
export const VAALWATER_SECTORS = SECTORS;
export const VAALWATER_BUSINESSES = BUSINESSES;
export const VAALWATER_JOBS = JOBS;
export const VAALWATER_EVENTS = EVENTS;
export const VAALWATER_CLASSIFIEDS = CLASSIFIEDS;
export const VAALWATER_PROPERTIES = PROPERTIES;
export const VAALWATER_ANNOUNCEMENTS = ANNOUNCEMENTS;
