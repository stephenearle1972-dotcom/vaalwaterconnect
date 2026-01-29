import { TownConfig, DEFAULT_PRICING } from './types';
import { vaalwaterConfig } from './towns/vaalwater';
import { menlynConfig } from './towns/menlyn';
import { portAlfredConfig } from './towns/port-alfred';
import { modimolleConfig } from './towns/modimolle';
import { bloubergConfig } from './towns/blouberg';
import { parklandsConfig } from './towns/parklands';
import { garsfonteinConfig } from './towns/garsfontein';
import { lephalaleConfig } from './towns/lephalale';

// Registry of all available town configs
const townConfigs: Record<string, TownConfig> = {
  vaalwater: vaalwaterConfig,
  menlyn: menlynConfig,
  'port-alfred': portAlfredConfig,
  modimolle: modimolleConfig,
  blouberg: bloubergConfig,
  parklands: parklandsConfig,
  garsfontein: garsfonteinConfig,
  lephalale: lephalaleConfig,
};

// Domain to town mapping
const domainMap: Record<string, string> = {
  // Production domains
  'vaalwaterconnect.co.za': 'vaalwater',
  'www.vaalwaterconnect.co.za': 'vaalwater',
  'menlynconnect.co.za': 'menlyn',
  'www.menlynconnect.co.za': 'menlyn',
  'portalfredconnect.co.za': 'port-alfred',
  'www.portalfredconnect.co.za': 'port-alfred',
  'modimolleconnect.co.za': 'modimolle',
  'www.modimolleconnect.co.za': 'modimolle',
  'bloubergconnect.co.za': 'blouberg',
  'www.bloubergconnect.co.za': 'blouberg',
  'parklandsconnect.co.za': 'parklands',
  'www.parklandsconnect.co.za': 'parklands',
  'garsfonteinconnect.co.za': 'garsfontein',
  'www.garsfonteinconnect.co.za': 'garsfontein',
  'lephalaleconnect.co.za': 'lephalale',
  'www.lephalaleconnect.co.za': 'lephalale',
  // Netlify preview domains
  'vaalwaterconnect.netlify.app': 'vaalwater',
  'menlynconnect.netlify.app': 'menlyn',
  'portalfredconnect.netlify.app': 'port-alfred',
  'modimolleconnect.netlify.app': 'modimolle',
  'bloubergconnect.netlify.app': 'blouberg',
  'parklandsconnect.netlify.app': 'parklands',
  'garsfonteinconnect.netlify.app': 'garsfontein',
  'lephalaleconnect.netlify.app': 'lephalale',
};

/**
 * Creates a dynamic config for towns without predefined configs.
 * Uses VITE_TOWN for the town name and applies sensible defaults.
 */
function createDynamicConfig(townName: string): TownConfig {
  const slug = townName.toLowerCase().replace(/\s+/g, '-');
  const firstLetter = townName.charAt(0).toUpperCase();

  return {
    id: slug,
    slug: slug,
    town: {
      name: townName,
      tagline: 'Local Business Directory',
      region: 'South Africa',
    },
    about: {
      headline: `Welcome to ${townName} Connect`,
      subheadline: 'Your local business directory',
      paragraphs: [
        `${townName} Connect is your hyperlocal directory for businesses and services in ${townName}.`,
        'We connect residents with trusted local providers.',
      ],
      images: [],
    },
    branding: {
      colors: {
        primary: '#2d4a3e',   // Forest green (default)
        secondary: '#b87352', // Clay
        accent: '#e8e2d6',    // Sand
      },
      heroImage: '',
      faviconEmoji: firstLetter,
      faviconColor: '#2d4a3e', // Default to primary green
    },
    contact: {
      whatsapp: '',
      email: `hello@${slug}connect.co.za`,
      phone: '',
    },
    location: {
      center: { lat: -29.0, lng: 24.0 }, // Rough center of South Africa
      zoom: 10,
    },
    pricing: DEFAULT_PRICING,
    data: {
      sectors: vaalwaterConfig.data.sectors, // Reuse sector definitions
      businesses: [],
      jobs: [],
      events: [],
      classifieds: [],
      properties: [],
      announcements: [],
      specials: [],
    },
  };
}

/**
 * Get the current town's configuration based on:
 * 1. VITE_TOWN environment variable (highest priority - supports ANY town name)
 * 2. Current domain (for production)
 * 3. Falls back to 'vaalwater' (default)
 */
export function getTownConfig(): TownConfig {
  // 1. Check environment variable (useful for development and build-time config)
  const envTown = import.meta.env.VITE_TOWN as string | undefined;
  if (envTown) {
    // Check if there's a predefined config for this town
    const normalizedEnvTown = envTown.toLowerCase().replace(/\s+/g, '-');
    if (townConfigs[normalizedEnvTown]) {
      return townConfigs[normalizedEnvTown];
    }
    // No predefined config - create a dynamic one using the town name
    return createDynamicConfig(envTown);
  }

  // 2. Check domain (for production multi-tenant)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Check exact domain match
    if (domainMap[hostname]) {
      return townConfigs[domainMap[hostname]];
    }

    // Check subdomain patterns (e.g., vaalwater.townconnect.co.za)
    const subdomain = hostname.split('.')[0];
    if (townConfigs[subdomain]) {
      return townConfigs[subdomain];
    }
  }

  // 3. Default to Vaalwater
  return vaalwaterConfig;
}

/**
 * Get a specific town's configuration by ID
 */
export function getTownConfigById(townId: string): TownConfig | undefined {
  return townConfigs[townId];
}

/**
 * Get list of all available town IDs
 */
export function getAvailableTowns(): string[] {
  return Object.keys(townConfigs);
}

// Export the current town's config as the default
// This allows easy import: import config from './configs'
const config = getTownConfig();
export default config;

// Re-export types for convenience
export type { TownConfig } from './types';
export { DEFAULT_PRICING } from './types';
