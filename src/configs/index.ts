import { TownConfig } from './types';
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
 * Detects which town config to use based on:
 * 1. VITE_TOWN environment variable (highest priority)
 * 2. Current domain (for production)
 * 3. Falls back to 'vaalwater' (default)
 */
function detectTown(): string {
  // 1. Check environment variable (useful for development and build-time config)
  const envTown = import.meta.env.VITE_TOWN;
  if (envTown && townConfigs[envTown]) {
    return envTown;
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
  const townId = detectTown();
  return townConfigs[townId] || vaalwaterConfig;
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
