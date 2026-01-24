import { TownConfig, DEFAULT_PRICING } from './types';
import { vaalwaterConfig } from './towns/vaalwater';
import { menlynConfig } from './towns/menlyn';

// Registry of all available town configs
const townConfigs: Record<string, TownConfig> = {
  vaalwater: vaalwaterConfig,
  menlyn: menlynConfig,
};

// Domain to town mapping
const domainMap: Record<string, string> = {
  'vaalwaterconnect.co.za': 'vaalwater',
  'www.vaalwaterconnect.co.za': 'vaalwater',
  'menlynconnect.co.za': 'menlyn',
  'www.menlynconnect.co.za': 'menlyn',
  // Netlify preview domains
  'vaalwaterconnect.netlify.app': 'vaalwater',
  'menlynconnect.netlify.app': 'menlyn',
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
 * Detects which town config to use based on:
 * 1. VITE_TOWN environment variable (highest priority - supports ANY town name)
 * 2. Current domain (for production)
 * 3. Falls back to 'vaalwater' (default)
 */
function detectTown(): string | { dynamic: true; name: string } {
  // 1. Check environment variable (useful for development and build-time config)
  const envTown = import.meta.env.VITE_TOWN;
  if (envTown) {
    // If there's a predefined config for this town, use it
    const normalizedEnvTown = envTown.toLowerCase().replace(/\s+/g, '-');
    if (townConfigs[normalizedEnvTown]) {
      return normalizedEnvTown;
    }
    // Otherwise, return the town name for dynamic config creation
    return { dynamic: true, name: envTown };
  }

  // 2. Check domain (for production multi-tenant)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Check exact domain match
    if (domainMap[hostname]) {
      return domainMap[hostname];
    }

    // Check subdomain patterns (e.g., vaalwater.townconnect.co.za)
    const subdomain = hostname.split('.')[0];
    if (townConfigs[subdomain]) {
      return subdomain;
    }
  }

  // 3. Default to Vaalwater
  return 'vaalwater';
}

/**
 * Get the current town's configuration
 */
export function getTownConfig(): TownConfig {
  const townResult = detectTown();

  // Handle dynamic town (from VITE_TOWN env var without predefined config)
  if (typeof townResult === 'object' && townResult.dynamic) {
    return createDynamicConfig(townResult.name);
  }

  return townConfigs[townResult] || vaalwaterConfig;
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
