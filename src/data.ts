import { Business, Sector } from './types';

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

export const BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Test Business Port Alfred',
    sectorId: 'food-drinks',
    subcategory: 'Cafe',
    description: 'Test listing for Port Alfred Connect',
    phone: '+27 46 624 1234',
    email: 'test@example.com',
    address: 'Beach Road, Port Alfred',
    tier: 'standard',
  }
];
