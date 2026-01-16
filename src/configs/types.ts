import { Business, Sector, Job, Event, Classified, Property, Announcement } from '../types';

export interface TownConfig {
  // Town identification
  id: string;
  slug: string; // Used in URLs and domain detection

  // Town information
  town: {
    name: string;
    tagline: string;
    region: string;
  };

  // Branding
  branding: {
    colors: {
      primary: string;   // Forest green for Vaalwater
      secondary: string; // Clay/terracotta
      accent: string;    // Sand/cream
    };
    logo?: string;
    heroImage: string;
    faviconEmoji: string; // Used for the "V" logo letter
  };

  // Contact information
  contact: {
    whatsapp: string;  // Without + prefix, e.g., "27688986081"
    email: string;
    phone: string;     // Display format
  };

  // Map settings
  location: {
    center: { lat: number; lng: number };
    zoom: number;
  };

  // Pricing (can vary per town)
  pricing: {
    micro: { monthly: string; annual: string };
    standard: { monthly: string; annual: string };
    premium: { monthly: string; annual: string };
    enterprise: { monthly: string; annual: string };
  };

  // Town-specific data
  data: {
    sectors: Sector[];
    businesses: Business[];
    jobs: Job[];
    events: Event[];
    classifieds: Classified[];
    properties: Property[];
    announcements: Announcement[];
  };
}

// Default pricing that can be used as a base
export const DEFAULT_PRICING: TownConfig['pricing'] = {
  micro: { monthly: 'R50', annual: 'R500' },
  standard: { monthly: 'R199', annual: 'R2,189' },
  premium: { monthly: 'R349', annual: 'R3,839' },
  enterprise: { monthly: 'R599', annual: 'R6,589' },
};
