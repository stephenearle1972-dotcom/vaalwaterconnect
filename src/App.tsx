
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Business, SectorId, Page, Sector, Job, Event, Classified, Property, Announcement, JobType, EventType, ClassifiedCategory, ListingType, PropertyType, AnnouncementCategory } from './types';
import config from './configs';
import L from 'leaflet';

// Get data from the current town's config
const { sectors: SECTORS, businesses: BUSINESSES, jobs: JOBS, events: EVENTS, classifieds: CLASSIFIEDS, properties: PROPERTIES, announcements: ANNOUNCEMENTS } = config.data;

// Helper to format WhatsApp number for display (e.g., +27688986081 -> 068 898 6081)
const formatWhatsApp = (num: string) => {
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('27')) {
    const local = '0' + digits.slice(2);
    return local.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  return num;
};

// Helper to get WhatsApp link number (config stores without + prefix)
const waLinkNum = config.contact.whatsapp;

// Computed site name (e.g., "Vaalwater Connect")
const siteName = `${config.town.name} Connect`;

const Navbar: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => (
  <nav className="bg-white/90 backdrop-blur-md border-b border-[#e5e0d8] sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="flex justify-between h-20 items-center">
        <div 
          className="flex-shrink-0 flex items-center cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center mr-3 transition-all group-hover:bg-clay shadow-sm group-hover:rotate-12">
            <span className="text-white font-serif font-bold text-xl italic">{config.branding.faviconEmoji}</span>
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-forest">
            {config.town.name}<span className="text-clay">Connect</span>
          </span>
        </div>
        <div className="hidden md:flex space-x-4 lg:space-x-5 items-center">
          <button onClick={() => onNavigate('home')} className="nav-link">Home</button>
          <button onClick={() => onNavigate('directory')} className="nav-link">Directory</button>
          <button onClick={() => onNavigate('specials')} className="nav-link">Specials</button>
          <button onClick={() => onNavigate('map')} className="nav-link">Map</button>
          <button onClick={() => onNavigate('jobs')} className="nav-link">Jobs</button>
          <button onClick={() => onNavigate('events')} className="nav-link">Events</button>
          <button onClick={() => onNavigate('classifieds')} className="nav-link">Classifieds</button>
          <button onClick={() => onNavigate('property')} className="nav-link">Property</button>
          <button onClick={() => onNavigate('announcements')} className="nav-link">Notices</button>
          <button onClick={() => onNavigate('pricing')} className="nav-link">Pricing</button>
          <button onClick={() => onNavigate('contact')} className="nav-link">Contact</button>
          <button
            onClick={() => onNavigate('add-business')} 
            className="btn-primary px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ml-2"
          >
            Add Business
          </button>
        </div>
        <style>{`
          .nav-link {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #6b7280;
            transition: color 0.2s;
            white-space: nowrap;
          }
          .nav-link:hover { color: var(--color-forest); }
        `}</style>
      </div>
    </div>
  </nav>
);

const Footer: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <footer className="bg-forest text-sand py-20">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="md:col-span-2">
          <h4 className="text-white font-serif font-bold text-2xl mb-6 italic">{siteName}</h4>
          <p className="text-sm leading-relaxed max-w-sm text-sand/60 font-light">
            Hyperlocal excellence for the Waterberg district. Connecting our community with integrity and boutique visibility.
          </p>
          <div className="mt-8 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-clay">Contact Us</p>
            <a href={`https://wa.me/${waLinkNum}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white hover:text-[#25D366] transition-colors">
              <span>📱</span> WhatsApp: {formatWhatsApp(config.contact.whatsapp)}
            </a>
            <a href={`mailto:${config.contact.email}`} className="flex items-center gap-2 text-sm text-white hover:text-clay transition-colors">
              <span>✉️</span> {config.contact.email}
            </a>
          </div>
        </div>
        <div>
          <h5 className="text-white font-black text-[10px] uppercase tracking-widest mb-8 opacity-40">Information</h5>
          <ul className="space-y-4 text-[10px] font-bold tracking-widest uppercase text-sand/70">
            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">Our Story</button></li>
            <li><button onClick={() => onNavigate('directory')} className="hover:text-white transition-colors">Directory Hub</button></li>
            <li><button onClick={() => onNavigate('specials')} className="hover:text-white transition-colors">Current Specials</button></li>
            <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">Interactive Map</button></li>
            <li><button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">Partner Plans</button></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-black text-[10px] uppercase tracking-widest mb-8 opacity-40">Legal</h5>
          <ul className="space-y-4 text-[10px] font-bold tracking-widest uppercase text-sand/70">
            <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Use</button></li>
            <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy (POPIA)</button></li>
            <li><button onClick={() => onNavigate('disclaimer')} className="hover:text-white transition-colors">Disclaimer</button></li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-10 border-t border-white/10 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const SectorGrid: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
    {SECTORS.map(cat => (
      <button 
        key={cat.id} 
        onClick={() => onNavigate('category', { sector: cat.id })} 
        className="card-classy p-8 rounded-3xl flex flex-col items-center group transition-all"
      >
        <span className="text-4xl mb-4 transition-transform group-hover:scale-110">{cat.icon}</span>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{cat.name}</span>
      </button>
    ))}
  </div>
);

const SpecialsView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  // Read specials from config
  const specials = config.data.specials;

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-20 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-clay mb-4 block">Limited Time Offers</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Local Specials.</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Discover exclusive deals from our trusted partners in {config.town.name}.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {specials.map((special) => (
          <div key={special.id} className="card-classy rounded-[3rem] overflow-hidden flex flex-col group">
            <div className="h-64 relative overflow-hidden">
               <img src={special.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={special.businessName} />
               <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest text-forest">{special.icon} {special.businessName}</span>
               </div>
            </div>
            <div className="p-10 flex flex-col flex-grow">
               <h3 className="text-3xl font-serif font-bold text-forest mb-4 italic leading-tight">{special.title}</h3>
               <div className="mb-6 p-4 bg-clay/5 rounded-2xl border border-clay/10">
                  <p className="text-clay font-black text-lg uppercase tracking-tight">{special.offer}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Valid until: {special.validUntil}</p>
               </div>
               <p className="text-gray-500 font-light leading-relaxed mb-10 flex-grow">
                 {special.description}
               </p>
               <button 
                onClick={() => onNavigate('business', { id: special.businessId })}
                className="w-full bg-forest text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-clay transition-colors"
               >
                 View Deal Details
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-sand/30 rounded-[3rem] p-16 text-center border border-sand">
         <h2 className="text-4xl font-serif font-bold text-forest italic mb-6">Promote Your Specials</h2>
         <p className="text-gray-500 max-w-xl mx-auto mb-10 text-lg font-light">
           Are you a {config.town.name} business with a special offer? Listings on our Specials page are included in our Annual Essential and Lodge partner plans.
         </p>
         <button 
           onClick={() => onNavigate('pricing')}
           className="bg-forest text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105"
         >
           Upgrade Your Listing
         </button>
      </div>
    </div>
  );
};

const MapView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([config.location.center.lat, config.location.center.lng], config.location.zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);

      BUSINESSES.forEach(b => {
        if (b.lat && b.lng) {
          const marker = L.marker([b.lat, b.lng]).addTo(leafletMap.current!);
          
          const popupContent = document.createElement('div');
          popupContent.className = 'p-4 text-center';
          popupContent.innerHTML = `
            <h3 class="font-serif font-bold text-lg text-forest mb-2 italic">${b.name}</h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-clay mb-3">${b.subcategory || ''}</p>
            <button id="marker-btn-${b.id}" class="bg-forest text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">View Details</button>
          `;
          
          marker.bindPopup(popupContent);
          
          marker.on('popupopen', () => {
            document.getElementById(`marker-btn-${b.id}`)?.addEventListener('click', () => {
              onNavigate('business', { id: b.id });
            });
          });
        }
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [onNavigate]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade">
      <div className="mb-12">
        <h1 className="text-6xl font-serif font-bold text-forest mb-4 italic">Business Map</h1>
        <p className="text-xl text-gray-500 font-light">Explore the Waterberg registry geographically.</p>
      </div>
      <div className="h-[700px] w-full relative z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>
    </div>
  );
};

const PricingView: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = [
    {
      name: 'Micro',
      monthlyPrice: config.pricing.micro.monthly,
      annualPrice: config.pricing.micro.annual,
      period: isAnnual ? '/ year' : '/ month',
      badge: 'First Month Free!',
      features: [
        'Basic listing (name, phone, area)',
        'Visible in directory',
        'Perfect for gardeners, handymen, domestic workers'
      ],
      icon: '🌱',
      tierName: 'MICRO',
      savingsNote: isAnnual ? '(2 months free)' : null
    },
    {
      name: 'Standard',
      monthlyPrice: config.pricing.standard.monthly,
      annualPrice: config.pricing.standard.annual,
      period: isAnnual ? '/ year' : '/ month',
      badge: isAnnual ? '1 Month Free!' : null,
      features: [
        'Everything in Micro',
        'WhatsApp link',
        'Email link',
        'Website link',
        'Map pin location',
        'Up to 3 photos'
      ],
      icon: '🌿',
      tierName: 'STANDARD',
      savingsNote: isAnnual ? '(1 month free)' : null
    },
    {
      name: 'Premium',
      monthlyPrice: config.pricing.premium.monthly,
      annualPrice: config.pricing.premium.annual,
      period: isAnnual ? '/ year' : '/ month',
      badge: isAnnual ? '1 Month Free!' : null,
      highlighted: true,
      features: [
        'Everything in Standard',
        'Up to 10 photos',
        'Featured in search results',
        '1 Special offer per month',
        'Social media links (Facebook, Instagram)'
      ],
      icon: '🌳',
      tierName: 'PREMIUM',
      savingsNote: isAnnual ? '(1 month free)' : null
    },
    {
      name: 'Enterprise / Lodge',
      monthlyPrice: config.pricing.enterprise.monthly,
      annualPrice: config.pricing.enterprise.annual,
      period: isAnnual ? '/ year' : '/ month',
      badge: isAnnual ? '1 Month Free!' : 'Best for Lodges',
      features: [
        'Everything in Premium',
        'Unlimited photos',
        'Unlimited Specials posts',
        'Custom profile page',
        'Booking link integration',
        'Priority support'
      ],
      icon: '🏨',
      tierName: 'ENTERPRISE',
      savingsNote: isAnnual ? '(1 month free)' : null
    },
  ];

  const openWhatsApp = (tierName: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in the ${tierName} plan for my business.`);
    window.open(`https://wa.me/${waLinkNum}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="text-center mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-clay mb-4 block">Our Partner Plans</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Simple Pricing.</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto mb-10">Elevate your business visibility in the Waterberg district. Choose the plan that fits your growth.</p>

        <div className="inline-flex items-center bg-sand/50 rounded-full p-1.5 border border-sand">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isAnnual ? 'bg-forest text-white shadow-lg' : 'text-gray-500 hover:text-forest'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isAnnual ? 'bg-forest text-white shadow-lg' : 'text-gray-500 hover:text-forest'}`}
          >
            Annual <span className="text-clay ml-1">(Save 1 month)</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {tiers.map((tier) => (
          <div key={tier.name} className={`relative p-8 rounded-[2.5rem] card-classy flex flex-col h-full ${tier.highlighted ? 'border-clay shadow-3xl scale-105 z-10 bg-[#fdfbf7]' : 'bg-white'}`}>
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-clay text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg whitespace-nowrap">
                {tier.badge}
              </span>
            )}

            <div className="text-4xl mb-6 opacity-80">{tier.icon}</div>
            <h3 className="text-2xl font-serif font-bold text-forest mb-2 italic tracking-tight">{tier.name}</h3>

            <div className="flex items-baseline gap-2 mb-8 border-b border-sand pb-6">
              <span className="text-3xl font-black text-forest tracking-tighter">{isAnnual ? tier.annualPrice : tier.monthlyPrice}</span>
              <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{tier.period}</span>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {tier.features.map(f => (
                <li key={f} className="text-sm text-gray-600 flex items-start gap-3 leading-relaxed">
                  <span className="text-clay font-bold mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => openWhatsApp(tier.tierName)}
              className={`w-full py-5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${tier.highlighted ? 'bg-[#25D366] text-white shadow-xl' : 'bg-[#25D366]/10 text-[#075e54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact Us
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-forest rounded-[3rem] p-12 md:p-16 text-center text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-clay/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

        <h2 className="text-3xl md:text-4xl font-serif font-bold italic mb-6 relative z-10">Ready to grow your business?</h2>
        <p className="text-sand/70 max-w-xl mx-auto mb-10 text-lg font-light relative z-10">
          Get in touch via WhatsApp and we'll help you choose the perfect plan for your business needs.
        </p>
        <a
          href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent(`Hi, I'm interested in listing my business on ${siteName}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:bg-white hover:text-[#075e54] relative z-10"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      </div>

      <p className="mt-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        * Annual plans include 1 month free. Micro plan includes 2 months free for informal workers.
      </p>

      <div className="mt-8 text-center p-6 bg-sand/30 rounded-2xl border border-sand max-w-2xl mx-auto">
        <p className="text-sm text-forest font-medium">
          <span className="font-bold">Payment Methods:</span> EFT, SnapScan, Zapper, or Cash deposit at Shoprite/PEP. Contact us to arrange payment.
        </p>
      </div>
    </div>
  );
};

const AboutView: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
    <div className="mb-20">
      <h1 className="text-7xl md:text-9xl font-serif font-bold text-forest mb-12 italic tracking-tighter">Our Story.</h1>
      <p className="text-3xl font-serif italic text-clay leading-snug mb-16">Connecting the Waterberg Biosphere, one trusted business at a time.</p>
      <div className="prose prose-2xl text-gray-600 font-light leading-relaxed space-y-8">
        <p>
          {siteName} was born from a simple observation: in our vast and beautiful Waterberg region, finding reliable services shouldn't feel like navigating the bush without a compass.
        </p>
        <p>
          We are more than a directory; we are a digital bridge. Our mission is to provide boutique visibility to the master artisans, world-class lodges, and essential services that form the heartbeat of {config.town.name} and its surrounds.
        </p>
        <p>
          Whether you're a local resident looking for a plumber or a traveler seeking the perfect safari escape, {siteName} ensures you find verified excellence with a hyper-local touch.
        </p>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-10">
      <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
        <img src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Bushveld" />
      </div>
      <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Farm" />
      </div>
    </div>
  </div>
);

declare global {
  interface Window {
    cloudinary: any;
  }
}

const AddBusinessView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    businessName: '',
    sectorId: '',
    tier: 'micro',
    phone: '',
    email: '',
    description: '',
    address: '',
    popiaConsent: false
  });

  const openCloudinaryWidget = () => {
    if (uploadedImages.length >= 3) {
      alert('Maximum 3 photos allowed. Remove one to add another.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dkn6tnxao',
        uploadPreset: 'vaalwater_unsigned',
        sources: ['local', 'camera'],
        multiple: true,
        maxFiles: 3 - uploadedImages.length,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5000000,
        styles: {
          palette: {
            window: '#FDFBF7',
            windowBorder: config.branding.colors.primary,
            tabIcon: config.branding.colors.primary,
            menuIcons: config.branding.colors.secondary,
            textDark: config.branding.colors.primary,
            textLight: '#FFFFFF',
            link: config.branding.colors.secondary,
            action: config.branding.colors.primary,
            inactiveTabIcon: '#6b7280',
            error: '#EF4444',
            inProgress: config.branding.colors.secondary,
            complete: config.branding.colors.primary,
            sourceBg: '#FDFBF7'
          }
        }
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          setUploadedImages(prev => [...prev, result.info.secure_url]);
        }
      }
    );
    widget.open();
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.popiaConsent) return;

    const form = e.target as HTMLFormElement;
    const formDataToSend = new FormData(form);
    formDataToSend.append('photos', uploadedImages.join(', '));

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formDataToSend as any).toString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitted(true);
    }
  };

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-6 py-40 text-center animate-fade">
      <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl">🏛️</div>
      <h1 className="text-6xl font-serif font-bold text-forest italic mb-6">Registration Received</h1>
      <p className="text-xl text-gray-500 font-light mb-12">Our team will review your application and contact you within 48 hours to finalize your listing and verification.</p>
      <button onClick={() => { setSubmitted(false); setUploadedImages([]); }} className="text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Add Another Business</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16">
        <h1 className="text-6xl font-serif font-bold text-forest mb-6 italic">Partner Registration</h1>
        <p className="text-xl text-gray-500 font-light">Join the {siteName} registry and reach your local audience with professional clarity.</p>
      </div>
      <form
        name="business-application"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="bg-white p-12 md:p-20 rounded-[4rem] border border-[#e5e0d8] shadow-3xl space-y-10"
      >
        <input type="hidden" name="form-name" value="business-application" />
        <input type="hidden" name="bot-field" />

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Name *</label>
            <input required type="text" name="businessName" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-2xl font-serif italic" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector *</label>
            <select required name="sector" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl bg-transparent font-serif italic" value={formData.sectorId} onChange={e => setFormData({...formData, sectorId: e.target.value as SectorId})}>
              <option value="">Select a Sector</option>
              {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Plan</label>
            <select name="tier" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl bg-transparent font-serif italic" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})}>
              <option value="micro">Micro (R50/month) - First month free!</option>
              <option value="standard">Standard (R199/month)</option>
              <option value="premium">Premium (R349/month)</option>
              <option value="enterprise">Enterprise / Lodge (R599/month)</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Email *</label>
            <input required type="email" name="email" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
            <input type="tel" name="phone" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="+27 ..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
            <input type="text" name="address" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="Street, Town" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Description</label>
          <textarea name="description" rows={4} className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif italic resize-none" placeholder="What makes your business special?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Photos (up to 3)</label>
          <div className="flex flex-wrap gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-sand">
                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            {uploadedImages.length < 3 && (
              <button
                type="button"
                onClick={openCloudinaryWidget}
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-sand hover:border-clay flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-clay transition-colors"
              >
                <span className="text-3xl">📷</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Add Photo</span>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">Click to upload photos of your business (max 5MB each)</p>
        </div>

        <div className="p-6 bg-sand/30 rounded-2xl border border-sand">
          <p className="text-sm text-forest font-medium flex items-start gap-3">
            <span className="text-xl">📍</span>
            <span>For map location: Please WhatsApp your location pin to <a href={`https://wa.me/${waLinkNum}`} target="_blank" rel="noopener noreferrer" className="text-clay font-bold hover:underline">{formatWhatsApp(config.contact.whatsapp)}</a> after submitting this form.</span>
          </p>
        </div>

        <div className="pt-10 border-t border-[#e5e0d8]">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input required type="checkbox" name="popiaConsent" className="w-6 h-6 rounded border-sand text-forest focus:ring-clay" checked={formData.popiaConsent} onChange={e => setFormData({...formData, popiaConsent: e.target.checked})} />
            <span className="text-sm text-gray-500 group-hover:text-forest transition-colors">I confirm the above information is accurate and agree to the processing of my data according to POPIA.</span>
          </label>
        </div>
        <button type="submit" className="w-full bg-forest text-white py-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-3xl transition-all hover:scale-[1.01] active:scale-[0.99]">
          Apply for Listing
        </button>
      </form>
    </div>
  );
};

const SearchView: React.FC<{ query: string, onNavigate: (page: Page, params?: any) => void }> = ({ query, onNavigate }) => {
  const results = useMemo(() => {
    const q = query.toLowerCase();
    return BUSINESSES.filter(b => 
      b.name.toLowerCase().includes(q) || 
      b.description.toLowerCase().includes(q) || 
      b.subcategory?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16">
        <h1 className="text-6xl font-serif font-bold text-forest mb-4 italic">Search Results</h1>
        <p className="text-xl text-gray-500 font-light">Found {results.length} results for "{query}"</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {results.length > 0 ? results.map(b => (
          <div key={b.id} onClick={() => onNavigate('business', { id: b.id })} className="card-classy p-8 rounded-[2.5rem] cursor-pointer group flex items-start gap-8">
            <div className="w-40 h-40 flex-shrink-0 overflow-hidden rounded-2xl">
              <img src={b.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e'} className="w-full h-full object-cover shadow-lg transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[10px] font-black text-clay uppercase tracking-widest">{b.subcategory}</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors">{b.name}</h3>
              <p className="text-gray-400 text-sm mt-3 font-light leading-relaxed line-clamp-2">{b.description}</p>
              <div className="mt-6">
                <span className="text-[9px] font-black text-forest uppercase tracking-widest border-b border-forest/20 pb-1">View Profile</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No exact matches found for your search.</p>
            <button onClick={() => onNavigate('directory')} className="mt-6 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Browse All Categories</button>
          </div>
        )}
      </div>
    </div>
  );
};

const HomeView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', { q: searchQuery });
    }
  };

  return (
    <div className="animate-fade">
      <section className="relative h-[850px] flex items-center justify-center px-6 overflow-hidden">
        <img src={config.branding.heroImage} className="absolute inset-0 w-full h-full object-cover scale-105" alt={config.town.name} />
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white pt-20">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-sand/60 mb-8 block">{config.town.tagline}</span>
          <h1 className="text-7xl md:text-9xl font-serif font-bold mb-12 italic tracking-tighter leading-tight">{config.town.name}<br/>Connect</h1>

          <div className="max-w-3xl mx-auto mb-16 px-4">
            <form onSubmit={handleSearch} className="relative group">
               <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`where can i find... in ${config.town.name}?`} 
                className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full py-8 pl-10 pr-28 text-2xl font-serif italic text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all shadow-2xl"
               />
               <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-forest p-5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </button>
            </form>
            <div className="flex justify-center gap-6 mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-sand/40">Popular Search:</p>
              <button onClick={() => onNavigate('search', { q: 'Lodge' })} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">Lodges</button>
              <button onClick={() => onNavigate('search', { q: 'Doctor' })} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">Medical</button>
              <button onClick={() => onNavigate('search', { q: 'Cafe' })} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">Dining</button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('directory')} className="bg-white text-forest px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105">Browse Directory</button>
            <button onClick={() => onNavigate('map')} className="bg-clay text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105">Live Map</button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="mb-20 text-center">
          <h2 className="text-5xl font-serif font-bold text-forest italic mb-4">Discover Local Sectors</h2>
          <p className="text-gray-400 font-light">Explore the verified listings in our district.</p>
          <div className="w-20 h-1 bg-clay mx-auto mt-6"></div>
        </div>
        <SectorGrid onNavigate={onNavigate} />
      </section>

      <section className="bg-sand/20 py-32 border-y border-sand/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-clay mb-6">Partnership</h3>
           <h2 className="text-4xl md:text-6xl font-serif font-bold text-forest italic mb-10 leading-tight">Ready to elevate your visibility?</h2>
           <p className="text-xl text-gray-500 font-light mb-12 max-w-2xl mx-auto">Join the local registry starting from just R 300 per month. Get 2 months free when you go annual.</p>
           <button onClick={() => onNavigate('pricing')} className="bg-forest text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105">View Partner Plans</button>
        </div>
      </section>
    </div>
  );
};

const DirectoryView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => (
  <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
    <div className="mb-16">
      <h1 className="text-6xl font-serif font-bold text-forest mb-4 italic">Directory Hub</h1>
      <p className="text-xl text-gray-500 font-light">Select a sector to view local businesses and services.</p>
    </div>
    <SectorGrid onNavigate={onNavigate} />
  </div>
);

const CategoryView: React.FC<{ sectorId: SectorId, onNavigate: (page: Page, params?: any) => void }> = ({ sectorId, onNavigate }) => {
  const sector = SECTORS.find(s => s.id === sectorId);
  const list = useMemo(() => BUSINESSES.filter(b => b.sectorId === sectorId), [sectorId]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
        <span className="mx-3 opacity-30">/</span>
        <button onClick={() => onNavigate('directory')} className="hover:text-forest transition-colors">Directory</button>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-forest">{sector?.name}</span>
      </nav>

      <div className="mb-16">
        <h1 className="text-6xl font-serif font-bold text-forest italic">{sector?.name} Registry</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {list.length > 0 ? list.map(b => (
          <div key={b.id} onClick={() => onNavigate('business', { id: b.id })} className="card-classy p-8 rounded-[2.5rem] cursor-pointer group flex items-start gap-8">
            <div className="w-40 h-40 flex-shrink-0 overflow-hidden rounded-2xl">
              <img src={b.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e'} className="w-full h-full object-cover shadow-lg transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[10px] font-black text-clay uppercase tracking-widest">{b.subcategory}</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors">{b.name}</h3>
              <p className="text-gray-400 text-sm mt-3 font-light leading-relaxed line-clamp-2">{b.description}</p>
              <div className="mt-6">
                <span className="text-[9px] font-black text-forest uppercase tracking-widest border-b border-forest/20 pb-1">View Profile</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No listings in this sector yet.</p>
            <button onClick={() => onNavigate('recommend')} className="mt-6 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Recommend a Business</button>
          </div>
        )}
      </div>
    </div>
  );
};

const BusinessDetailView: React.FC<{ businessId: string, onNavigate: (page: Page, params?: any) => void }> = ({ businessId, onNavigate }) => {
  const business = BUSINESSES.find(b => b.id === businessId);
  const sector = SECTORS.find(s => s.id === business?.sectorId);

  if (!business) return (
    <div className="py-40 text-center">
      <h2 className="text-4xl font-serif font-bold text-forest italic">Listing not found.</h2>
      <button onClick={() => onNavigate('home')} className="mt-8 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Return Home</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="grid lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8">
          <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
            <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
            <span className="mx-3 opacity-30">/</span>
            <button onClick={() => onNavigate('category', { sector: business.sectorId })} className="hover:text-forest transition-colors">{sector?.name}</button>
          </nav>

          <h1 className="text-6xl md:text-9xl font-serif font-bold text-forest mb-6 italic tracking-tighter">{business.name}</h1>
          <div className="flex gap-4 mb-12">
            <span className="bg-sand text-forest px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{business.subcategory}</span>
            <span className="bg-forest text-sand px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{business.tier || 'Standard'}</span>
          </div>

          <div className="relative overflow-hidden rounded-[4rem] shadow-3xl mb-16 h-[550px]">
             <img src={business.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e'} className="w-full h-full object-cover" alt={business.name} />
          </div>
          
          <div className="prose prose-2xl max-w-none text-gray-700 leading-relaxed mb-20">
            <div className="whitespace-pre-line font-light text-xl">
              {business.description}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-[#fcf9f2] p-12 rounded-[3rem] border border-[#e5e0d8] shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 mb-12 text-center">Business Contact</h4>
              <div className="space-y-6">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="w-full bg-forest text-white py-5 rounded-xl block text-center font-black text-[10px] uppercase tracking-widest shadow-xl transition-transform hover:scale-105">Call Official Line</a>
                )}
                {business.whatsapp && (
                  <a href={`https://wa.me/${business.whatsapp.replace(/\D/g,'')}`} className="w-full border-2 border-[#25D366] text-[#075e54] py-5 rounded-xl block text-center font-black text-[10px] uppercase tracking-widest transition-transform hover:scale-105">WhatsApp Chat</a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="w-full border border-gray-200 text-gray-600 py-5 rounded-xl block text-center font-black text-[10px] uppercase tracking-widest hover:bg-forest hover:text-white transition-all">Visit Website</a>
                )}
                <div className="flex gap-4">
                  {business.facebook && <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white py-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Facebook</a>}
                  {business.instagram && <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white py-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity">Instagram</a>}
                </div>
              </div>
              
              <div className="mt-12 pt-10 border-t border-[#e5e0d8] space-y-6">
                 {business.email && <a href={`mailto:${business.email}`} className="block text-sm text-gray-500 text-center font-light underline decoration-sand decoration-2 hover:text-clay transition-colors">{business.email}</a>}
                 {business.address && <div className="text-sm text-gray-400 text-center font-light italic leading-relaxed">{business.address}</div>}
              </div>
            </div>
            
            <button onClick={() => onNavigate('map')} className="w-full p-8 bg-sand/30 border border-sand rounded-[2.5rem] flex items-center justify-between group hover:bg-sand/50 transition-all">
               <span className="text-[10px] font-black uppercase tracking-widest text-forest">View on Map</span>
               <span className="text-2xl group-hover:translate-x-2 transition-transform">📍</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecommendView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    sectorId: '',
    phone: '',
    website: '',
    reason: '',
    recommenderName: '',
    recommenderContact: '',
    popiaConsent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.sectorId || !formData.popiaConsent) return;

    // Explicitly encode form data with field names matching index.html hidden form
    const encode = (data: Record<string, string>) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
    };

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'recommend-business',
          businessName: formData.businessName,
          sector: formData.sectorId,
          businessPhone: formData.phone,
          businessWebsite: formData.website,
          recommendationReason: formData.reason,
          recommenderName: formData.recommenderName,
          recommenderContact: formData.recommenderContact,
          popiaConsent: formData.popiaConsent ? 'yes' : ''
        })
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-6 py-40 text-center animate-fade">
      <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl">✅</div>
      <h1 className="text-6xl font-serif font-bold text-forest italic mb-6">Thank You!</h1>
      <p className="text-xl text-gray-500 font-light mb-12">We'll review this recommendation and reach out to the business.</p>
      <button onClick={() => setSubmitted(false)} className="text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Submit Another Recommendation</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-serif font-bold text-forest mb-6 italic">Recommend a Business</h1>
        <p className="text-xl text-gray-500 font-light">Know a great local business that should be on {siteName}? Tell us about them.</p>
      </div>
      <form
        name="recommend-business"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="bg-white p-12 md:p-20 rounded-[4rem] border border-[#e5e0d8] shadow-3xl space-y-10"
      >
        <input type="hidden" name="form-name" value="recommend-business" />
        <input type="hidden" name="bot-field" />

        <div className="border-b border-sand pb-8 mb-2">
          <h3 className="text-[11px] font-black text-forest uppercase tracking-[0.3em]">Business Details</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Name *</label>
            <input required type="text" name="businessName" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-2xl font-serif italic" placeholder="Name of business" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector / Category *</label>
            <select required name="sector" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl bg-transparent font-serif italic" value={formData.sectorId} onChange={e => setFormData({...formData, sectorId: e.target.value as SectorId})}>
              <option value="">Select a Sector</option>
              {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Phone (if known)</label>
            <input type="tel" name="businessPhone" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="+27 ..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Website / Facebook (if known)</label>
            <input type="text" name="businessWebsite" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="URL or Facebook page" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Why do you recommend this business? *</label>
          <textarea required name="recommendationReason" rows={4} className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif italic resize-none" placeholder="Tell us about their service, quality, what makes them special..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
        </div>

        <div className="border-b border-sand pb-8 mb-2 pt-6">
          <h3 className="text-[11px] font-black text-forest uppercase tracking-[0.3em]">Your Details (Optional)</h3>
          <p className="text-sm text-gray-400 mt-2">So we can thank you or follow up if needed</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Name</label>
            <input type="text" name="recommenderName" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="Your name" value={formData.recommenderName} onChange={e => setFormData({...formData, recommenderName: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Contact (Phone or Email)</label>
            <input type="text" name="recommenderContact" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="Phone or email" value={formData.recommenderContact} onChange={e => setFormData({...formData, recommenderContact: e.target.value})} />
          </div>
        </div>

        <div className="pt-10 border-t border-[#e5e0d8]">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input required type="checkbox" name="popiaConsent" className="w-6 h-6 rounded border-sand text-forest focus:ring-clay" checked={formData.popiaConsent} onChange={e => setFormData({...formData, popiaConsent: e.target.checked})} />
            <span className="text-sm text-gray-500 group-hover:text-forest transition-colors">I consent to the processing of this information according to POPIA. *</span>
          </label>
        </div>
        <button type="submit" className="w-full bg-forest text-white py-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-3xl transition-all hover:scale-[1.01] active:scale-[0.99]">
          Submit Recommendation
        </button>
      </form>
    </div>
  );
};

const LegalView: React.FC<{ type: 'terms' | 'privacy' | 'disclaimer' }> = ({ type }) => {
  const termsContent = (
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-600 mb-8"><strong>Effective Date:</strong> January 2025</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="text-gray-600 mb-4">By accessing and using {siteName} ("the Platform"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">2. Description of Service</h2>
      <p className="text-gray-600 mb-4">{siteName} is a local business directory serving the {config.town.name} and Waterberg district of South Africa. We provide a platform for local businesses to showcase their services and for users to discover and connect with these businesses.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">3. User Responsibilities</h2>
      <p className="text-gray-600 mb-4">Users of the Platform agree to:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Use the Platform only for lawful purposes</li>
        <li>Not submit false, misleading, or fraudulent information</li>
        <li>Not impersonate any person or entity</li>
        <li>Not interfere with or disrupt the Platform's functionality</li>
        <li>Respect the intellectual property rights of others</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">4. Business Listing Guidelines</h2>
      <p className="text-gray-600 mb-4">Businesses listed on {siteName} must:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Provide accurate and truthful information about their services</li>
        <li>Maintain valid contact information</li>
        <li>Operate legally within South Africa</li>
        <li>Have a physical presence or provide services in the {config.town.name}/Waterberg region</li>
        <li>Not engage in any illegal, harmful, or unethical business practices</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">5. Accuracy of Information</h2>
      <p className="text-gray-600 mb-4">While we strive to ensure all information on our Platform is accurate and up-to-date, {siteName} does not guarantee the accuracy, completeness, or reliability of any business listing or information. Users are encouraged to verify details directly with businesses before engaging their services.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">6. Intellectual Property</h2>
      <p className="text-gray-600 mb-4">All content on {siteName}, including but not limited to text, graphics, logos, and software, is the property of {siteName} or its content suppliers and is protected by South African and international copyright laws. Unauthorized use, reproduction, or distribution of this content is prohibited.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">7. Limitation of Liability</h2>
      <p className="text-gray-600 mb-4">{siteName} shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Your use or inability to use the Platform</li>
        <li>Any transactions between users and listed businesses</li>
        <li>Any content posted on the Platform</li>
        <li>Any errors or omissions in business listings</li>
        <li>Any unauthorized access to or use of our servers</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">8. Termination</h2>
      <p className="text-gray-600 mb-4">We reserve the right to terminate or suspend access to our Platform immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Platform will cease immediately.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">9. Governing Law</h2>
      <p className="text-gray-600 mb-4">These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the South African courts.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">10. Contact Information</h2>
      <p className="text-gray-600 mb-4">For questions about these Terms of Use, please contact us at:</p>
      <ul className="list-none text-gray-600 mb-4">
        <li>Email: <a href={`mailto:${config.contact.email}`} className="text-clay hover:underline">{config.contact.email}</a></li>
        <li>WhatsApp: <a href={`https://wa.me/${waLinkNum}`} className="text-clay hover:underline">{formatWhatsApp(config.contact.whatsapp)}</a></li>
      </ul>
    </div>
  );

  const privacyContent = (
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-600 mb-8"><strong>Effective Date:</strong> January 2025</p>
      <p className="text-gray-600 mb-8">This Privacy Policy is compliant with the Protection of Personal Information Act, 2013 (POPIA) of South Africa.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">1. Information We Collect</h2>
      <p className="text-gray-600 mb-4">We collect the following types of information:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li><strong>Business Information:</strong> Business name, contact details (phone, email, address), website, social media links, business description, and photos</li>
        <li><strong>Personal Information:</strong> Name, email address, and phone number when you submit a form or recommendation</li>
        <li><strong>Usage Data:</strong> Information about how you interact with our Platform, including pages visited and features used</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">2. How We Use Your Information</h2>
      <p className="text-gray-600 mb-4">We use the collected information for the following purposes:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>To display business listings on our directory</li>
        <li>To process business registration applications</li>
        <li>To respond to inquiries and support requests</li>
        <li>To improve our Platform and services</li>
        <li>To send relevant communications (with your consent)</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">3. Legal Basis for Processing (POPIA)</h2>
      <p className="text-gray-600 mb-4">Under POPIA, we process your personal information based on:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li><strong>Consent:</strong> When you voluntarily submit information through our forms</li>
        <li><strong>Contractual Necessity:</strong> To provide our directory services to listed businesses</li>
        <li><strong>Legitimate Interest:</strong> To improve our services and maintain Platform security</li>
        <li><strong>Legal Compliance:</strong> When required by South African law</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">4. Data Sharing</h2>
      <p className="text-gray-600 mb-4">We do not sell your personal information. We may share information with:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Service providers who assist in operating our Platform (e.g., hosting, form processing)</li>
        <li>Law enforcement or government agencies when required by law</li>
        <li>Third parties with your explicit consent</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">5. Data Retention</h2>
      <p className="text-gray-600 mb-4">We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Business listings remain active until the business requests removal or fails to maintain their subscription.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">6. Your Rights Under POPIA</h2>
      <p className="text-gray-600 mb-4">As a data subject under POPIA, you have the right to:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
        <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
        <li><strong>Object:</strong> Object to the processing of your personal information</li>
        <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
        <li><strong>Complaint:</strong> Lodge a complaint with the Information Regulator</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">7. Cookies</h2>
      <p className="text-gray-600 mb-4">Our Platform may use cookies and similar technologies to enhance user experience. These may include essential cookies for Platform functionality and analytics cookies to understand usage patterns. You can manage cookie preferences through your browser settings.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">8. Security Measures</h2>
      <p className="text-gray-600 mb-4">We implement appropriate technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">9. Changes to This Policy</h2>
      <p className="text-gray-600 mb-4">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated effective date.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">10. Information Officer Contact</h2>
      <p className="text-gray-600 mb-4">For any privacy-related inquiries or to exercise your rights under POPIA, please contact our Information Officer:</p>
      <ul className="list-none text-gray-600 mb-4">
        <li>Email: <a href={`mailto:${config.contact.email}`} className="text-clay hover:underline">{config.contact.email}</a></li>
        <li>WhatsApp: <a href={`https://wa.me/${waLinkNum}`} className="text-clay hover:underline">{formatWhatsApp(config.contact.whatsapp)}</a></li>
        <li>Location: {config.town.name}, Limpopo, South Africa</li>
      </ul>
    </div>
  );

  const disclaimerContent = (
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-600 mb-8"><strong>Effective Date:</strong> January 2025</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">1. No Warranty on Business Listings</h2>
      <p className="text-gray-600 mb-4">{siteName} provides business listings for informational purposes only. We make no representations or warranties of any kind, express or implied, regarding:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>The accuracy, reliability, or completeness of any business information</li>
        <li>The quality, safety, or legality of products or services offered by listed businesses</li>
        <li>The qualifications, certifications, or credentials of business owners or employees</li>
        <li>The availability of listed businesses or their services</li>
        <li>The pricing information displayed for any products or services</li>
      </ul>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">2. Third-Party Content</h2>
      <p className="text-gray-600 mb-4">Business listings, descriptions, photos, and other content on {siteName} are provided by the businesses themselves or third parties. {siteName} does not endorse, verify, or guarantee the accuracy of this content. Users should exercise their own judgment when engaging with listed businesses.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">3. No Responsibility for Transactions</h2>
      <p className="text-gray-600 mb-4">{siteName} is a directory service only and is not a party to any transactions between users and listed businesses. We are not responsible for:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Any disputes arising from transactions with listed businesses</li>
        <li>The quality, delivery, or performance of products or services</li>
        <li>Payment issues or refund disputes</li>
        <li>Personal injury or property damage resulting from services</li>
        <li>Any losses incurred from reliance on business information</li>
      </ul>
      <p className="text-gray-600 mb-4">Users engage with listed businesses entirely at their own risk and should conduct their own due diligence before entering into any agreements.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">4. External Links Disclaimer</h2>
      <p className="text-gray-600 mb-4">Our Platform may contain links to external websites operated by third parties. {siteName} has no control over the content, privacy policies, or practices of these external sites and assumes no responsibility for them. The inclusion of any link does not imply endorsement or recommendation.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">5. Service Availability</h2>
      <p className="text-gray-600 mb-4">{siteName} strives to maintain continuous availability of our Platform but does not guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the Platform at any time without notice. We are not liable for any loss or inconvenience caused by Platform downtime or technical issues.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">6. Limitation of Liability</h2>
      <p className="text-gray-600 mb-4">To the fullest extent permitted by South African law, {siteName}, its owners, operators, employees, and affiliates shall not be liable for any:</p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Direct, indirect, incidental, special, or consequential damages</li>
        <li>Loss of profits, revenue, data, or business opportunities</li>
        <li>Personal injury or property damage</li>
        <li>Damages arising from the use or inability to use our Platform</li>
        <li>Damages arising from any transaction with a listed business</li>
      </ul>
      <p className="text-gray-600 mb-4">This limitation applies regardless of the legal theory under which such damages are sought.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">7. Indemnification</h2>
      <p className="text-gray-600 mb-4">You agree to indemnify and hold harmless {siteName} and its affiliates from any claims, damages, losses, or expenses arising from your use of the Platform or violation of these terms.</p>

      <h2 className="text-2xl font-serif font-bold text-forest mt-8 mb-4">8. Contact Us</h2>
      <p className="text-gray-600 mb-4">If you have questions about this Disclaimer, please contact us at:</p>
      <ul className="list-none text-gray-600 mb-4">
        <li>Email: <a href={`mailto:${config.contact.email}`} className="text-clay hover:underline">{config.contact.email}</a></li>
        <li>WhatsApp: <a href={`https://wa.me/${waLinkNum}`} className="text-clay hover:underline">{formatWhatsApp(config.contact.whatsapp)}</a></li>
      </ul>
    </div>
  );

  const content = {
    terms: { title: 'Terms of Use', body: termsContent },
    privacy: { title: 'Privacy Policy (POPIA Compliant)', body: privacyContent },
    disclaimer: { title: 'Legal Disclaimer', body: disclaimerContent }
  }[type];

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <h1 className="text-5xl font-serif font-bold text-forest mb-12 italic">{content.title}</h1>
      {content.body}
      <button onClick={() => window.history.back()} className="mt-12 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Return to Previous</button>
    </div>
  );
};

const ContactView: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
    <div className="text-center mb-16">
      <h1 className="text-6xl font-serif font-bold text-forest mb-6 italic">Get in Touch</h1>
      <p className="text-xl text-gray-500 font-light">Questions about our registry or need to update your listing? We're here to help.</p>
    </div>

    <div className="mb-12">
      <a
        href={`https://wa.me/${waLinkNum}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white p-8 rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center justify-center gap-4">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-1">Preferred Contact Method</p>
            <p className="text-3xl font-serif font-bold">WhatsApp Us</p>
            <p className="text-lg font-light mt-1">{formatWhatsApp(config.contact.whatsapp)}</p>
          </div>
        </div>
      </a>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <a
        href={`mailto:${config.contact.email}`}
        className="p-10 bg-sand/20 rounded-3xl border border-sand hover:bg-sand/40 transition-all group"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-forest/20 transition-colors">
            <span className="text-3xl">✉️</span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-clay mb-3">Email Us</h4>
          <p className="text-xl font-serif font-bold text-forest group-hover:text-clay transition-colors">{config.contact.email}</p>
        </div>
      </a>

      <a
        href={`tel:${config.contact.whatsapp}`}
        className="p-10 bg-sand/20 rounded-3xl border border-sand hover:bg-sand/40 transition-all group"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-forest/20 transition-colors">
            <span className="text-3xl">📞</span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-clay mb-3">Call Us</h4>
          <p className="text-xl font-serif font-bold text-forest group-hover:text-clay transition-colors">{formatWhatsApp(config.contact.whatsapp)}</p>
        </div>
      </a>
    </div>

    <div className="mt-12 p-10 bg-forest text-white rounded-3xl text-center">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">📍</span>
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-sand/50 mb-3">Location</h4>
      <p className="text-2xl font-serif font-bold italic">{config.town.name}, Waterberg</p>
      <p className="text-sand/70 mt-2 font-light">Limpopo Province, South Africa</p>
    </div>
  </div>
);

// ============ JOBS BOARD ============
const JobsView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const [filterSector, setFilterSector] = useState<string>('all');
  const activeJobs = JOBS.filter(j => j.isActive);
  const filteredJobs = filterSector === 'all' ? activeJobs : activeJobs.filter(j => j.sectorId === filterSector);

  const jobTypeLabels: Record<JobType, string> = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    'contract': 'Contract',
    'casual': 'Casual'
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">💼</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Jobs Board</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Find local employment opportunities in the Waterberg district.</p>
      </div>

      <div className="mb-12 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilterSector('all')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterSector === 'all' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          All Sectors
        </button>
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSector(s.id)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterSector === s.id ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {filteredJobs.length > 0 ? filteredJobs.map(job => (
          <div key={job.id} onClick={() => onNavigate('job-detail', { id: job.id })} className="card-classy p-8 rounded-[2.5rem] cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                job.jobType === 'full-time' ? 'bg-forest/10 text-forest' :
                job.jobType === 'part-time' ? 'bg-clay/10 text-clay' :
                job.jobType === 'contract' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {jobTypeLabels[job.jobType]}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(job.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mb-2">{job.title}</h3>
            <p className="text-clay font-bold text-sm mb-3">{job.businessName}</p>
            <p className="text-gray-400 text-sm font-light line-clamp-2 mb-4">{job.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📍 {job.location}</span>
              {job.salaryRange && <span className="text-[10px] font-black text-forest uppercase tracking-widest">{job.salaryRange}</span>}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No jobs found in this sector.</p>
          </div>
        )}
      </div>

      <div className="mt-20 bg-forest rounded-[3rem] p-12 text-center text-white">
        <h2 className="text-3xl font-serif font-bold italic mb-4">Have a Job to Post?</h2>
        <p className="text-sand/70 mb-8 font-light">Reach local talent by posting your vacancy on {siteName}.</p>
        <a
          href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent('Hi, I would like to post a job vacancy on the Jobs Board.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Post a Job via WhatsApp
        </a>
      </div>
    </div>
  );
};

const JobDetailView: React.FC<{ jobId: string, onNavigate: (page: Page, params?: any) => void }> = ({ jobId, onNavigate }) => {
  const job = JOBS.find(j => j.id === jobId);
  const sector = SECTORS.find(s => s.id === job?.sectorId);

  if (!job) return (
    <div className="py-40 text-center">
      <h2 className="text-4xl font-serif font-bold text-forest italic">Job not found.</h2>
      <button onClick={() => onNavigate('jobs')} className="mt-8 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Back to Jobs</button>
    </div>
  );

  const jobTypeLabels: Record<JobType, string> = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    'contract': 'Contract',
    'casual': 'Casual'
  };

  const getApplyLink = () => {
    switch (job.applicationMethod) {
      case 'email':
        return `mailto:${job.applicationContact}?subject=Application: ${encodeURIComponent(job.title)}`;
      case 'phone':
        return `tel:${job.applicationContact}`;
      case 'whatsapp':
        return `https://wa.me/${job.applicationContact.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am interested in the ${job.title} position.`)}`;
      case 'website':
        return job.applicationContact;
      default:
        return '#';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
        <span className="mx-3 opacity-30">/</span>
        <button onClick={() => onNavigate('jobs')} className="hover:text-forest transition-colors">Jobs</button>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-forest">{job.title}</span>
      </nav>

      <div className="flex flex-wrap gap-3 mb-6">
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
          job.jobType === 'full-time' ? 'bg-forest/10 text-forest' :
          job.jobType === 'part-time' ? 'bg-clay/10 text-clay' :
          job.jobType === 'contract' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {jobTypeLabels[job.jobType]}
        </span>
        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sand text-forest">
          {sector?.icon} {sector?.name}
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-serif font-bold text-forest italic mb-4">{job.title}</h1>
      <p className="text-2xl text-clay font-bold mb-8">{job.businessName}</p>

      <div className="flex flex-wrap gap-6 mb-12 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span>📍</span> {job.location}
        </div>
        {job.salaryRange && (
          <div className="flex items-center gap-2 text-forest font-bold">
            <span>💰</span> {job.salaryRange}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-400">
          <span>📅</span> Posted {new Date(job.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-[#e5e0d8] shadow-xl mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6">Job Description</h3>
        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{job.description}</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-[#e5e0d8] shadow-xl mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6">Requirements</h3>
        <ul className="space-y-3">
          {job.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600">
              <span className="text-clay font-bold mt-1">✓</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-forest p-10 rounded-[3rem] text-white text-center">
        <h3 className="text-2xl font-serif font-bold italic mb-4">Ready to Apply?</h3>
        <p className="text-sand/70 mb-6 font-light">Apply via {job.applicationMethod === 'email' ? 'email' : job.applicationMethod === 'phone' ? 'phone call' : job.applicationMethod === 'whatsapp' ? 'WhatsApp' : 'their website'}.</p>
        <a
          href={getApplyLink()}
          target={job.applicationMethod === 'website' ? '_blank' : undefined}
          rel={job.applicationMethod === 'website' ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-3 bg-clay text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-clay transition-all"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};

// ============ EVENTS CALENDAR ============
const EventsView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const upcomingEvents = EVENTS.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const filteredEvents = filterType === 'all' ? upcomingEvents : upcomingEvents.filter(e => e.eventType === filterType);

  const eventTypeLabels: Record<EventType, { label: string, icon: string }> = {
    'market': { label: 'Market', icon: '🛒' },
    'festival': { label: 'Festival', icon: '🎉' },
    'workshop': { label: 'Workshop', icon: '🎓' },
    'community': { label: 'Community', icon: '🤝' },
    'other': { label: 'Other', icon: '📌' }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <div className="w-20 h-20 bg-clay/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📅</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Events Calendar</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Discover what's happening in the Waterberg district.</p>
      </div>

      <div className="mb-12 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilterType('all')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          All Events
        </button>
        {Object.entries(eventTypeLabels).map(([type, { label, icon }]) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {filteredEvents.filter(e => e.isFeatured).length > 0 && (
        <div className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-clay mb-8 text-center">Featured Events</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredEvents.filter(e => e.isFeatured).map(event => (
              <div key={event.id} onClick={() => onNavigate('event-detail', { id: event.id })} className="card-classy rounded-[3rem] overflow-hidden cursor-pointer group">
                <div className="h-64 relative overflow-hidden">
                  <img src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-forest">{eventTypeLabels[event.eventType].icon} {eventTypeLabels[event.eventType].label}</span>
                  </div>
                  <div className="absolute top-6 right-6 bg-clay text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>📅 {new Date(event.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <span>🕐 {event.startTime} - {event.endTime}</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mb-3">{event.title}</h3>
                  <p className="text-gray-500 font-light line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📍 {event.location}</span>
                    {event.ticketPrice && <span className="text-clay font-bold">{event.ticketPrice}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 text-center">All Upcoming Events</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.filter(e => !e.isFeatured).length > 0 ? filteredEvents.filter(e => !e.isFeatured).map(event => (
          <div key={event.id} onClick={() => onNavigate('event-detail', { id: event.id })} className="card-classy p-6 rounded-[2rem] cursor-pointer group">
            {event.imageUrl && (
              <div className="h-40 rounded-2xl overflow-hidden mb-4">
                <img src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={event.title} />
              </div>
            )}
            <span className="text-[9px] font-black uppercase tracking-widest text-clay">{eventTypeLabels[event.eventType].icon} {eventTypeLabels[event.eventType].label}</span>
            <h3 className="text-xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mt-2 mb-3">{event.title}</h3>
            <div className="space-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <p>📅 {new Date(event.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} | {event.startTime}</p>
              <p>📍 {event.location}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No upcoming events in this category.</p>
          </div>
        )}
      </div>

      <div className="mt-20 bg-clay/10 border border-clay/20 rounded-[3rem] p-12 text-center">
        <h2 className="text-3xl font-serif font-bold text-forest italic mb-4">Hosting an Event?</h2>
        <p className="text-gray-500 mb-8 font-light max-w-xl mx-auto">Get your event listed on {siteName} and reach the local community.</p>
        <a
          href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent('Hi, I would like to post an event on the Events Calendar.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-forest transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Post an Event via WhatsApp
        </a>
      </div>
    </div>
  );
};

const EventDetailView: React.FC<{ eventId: string, onNavigate: (page: Page, params?: any) => void }> = ({ eventId, onNavigate }) => {
  const event = EVENTS.find(e => e.id === eventId);

  if (!event) return (
    <div className="py-40 text-center">
      <h2 className="text-4xl font-serif font-bold text-forest italic">Event not found.</h2>
      <button onClick={() => onNavigate('events')} className="mt-8 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Back to Events</button>
    </div>
  );

  const eventTypeLabels: Record<EventType, { label: string, icon: string }> = {
    'market': { label: 'Market', icon: '🛒' },
    'festival': { label: 'Festival', icon: '🎉' },
    'workshop': { label: 'Workshop', icon: '🎓' },
    'community': { label: 'Community', icon: '🤝' },
    'other': { label: 'Other', icon: '📌' }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
        <span className="mx-3 opacity-30">/</span>
        <button onClick={() => onNavigate('events')} className="hover:text-forest transition-colors">Events</button>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-forest">{event.title}</span>
      </nav>

      {event.imageUrl && (
        <div className="h-[400px] rounded-[3rem] overflow-hidden mb-10 shadow-2xl">
          <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-forest/10 text-forest">
          {eventTypeLabels[event.eventType].icon} {eventTypeLabels[event.eventType].label}
        </span>
        {event.isFeatured && (
          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-clay text-white">Featured</span>
        )}
      </div>

      <h1 className="text-5xl md:text-7xl font-serif font-bold text-forest italic mb-4">{event.title}</h1>
      <p className="text-xl text-clay font-bold mb-8">Hosted by {event.organizerName}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-sand/30 p-6 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date & Time</p>
          <p className="text-lg font-bold text-forest">{new Date(event.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-gray-600">{event.startTime} - {event.endTime}</p>
        </div>
        <div className="bg-sand/30 p-6 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Location</p>
          <p className="text-lg font-bold text-forest">{event.location}</p>
          <p className="text-gray-600">{event.address}</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-[#e5e0d8] shadow-xl mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6">About This Event</h3>
        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{event.description}</p>
      </div>

      <div className="bg-forest p-10 rounded-[3rem] text-white text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {event.ticketPrice && (
            <div className="text-center md:text-left">
              <p className="text-sand/60 text-[10px] font-black uppercase tracking-widest">Ticket Price</p>
              <p className="text-2xl font-bold">{event.ticketPrice}</p>
            </div>
          )}
          {event.bookingLink ? (
            <a
              href={event.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-clay text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-clay transition-all"
            >
              Get Tickets / Book Now
            </a>
          ) : (
            <a
              href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent(`Hi, I'm interested in the event: ${event.title} on ${event.date}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              More Info via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ CLASSIFIEDS ============
const ClassifiedsView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const activeClassifieds = CLASSIFIEDS.filter(c => c.isActive);
  const filteredClassifieds = filterCategory === 'all' ? activeClassifieds : activeClassifieds.filter(c => c.category === filterCategory);

  const categoryLabels: Record<ClassifiedCategory, { label: string, icon: string }> = {
    'for-sale': { label: 'For Sale', icon: '🏷️' },
    'wanted': { label: 'Wanted', icon: '🔍' },
    'services': { label: 'Services', icon: '🔧' },
    'other': { label: 'Other', icon: '📋' }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🏷️</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Classifieds</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Buy, sell, and find services in the Waterberg community.</p>
      </div>

      <div className="mb-12 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === 'all' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          All Ads
        </button>
        {Object.entries(categoryLabels).map(([cat, { label, icon }]) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClassifieds.length > 0 ? filteredClassifieds.map(item => (
          <div key={item.id} onClick={() => onNavigate('classified-detail', { id: item.id })} className="card-classy rounded-[2rem] overflow-hidden cursor-pointer group">
            {item.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title} />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  item.category === 'for-sale' ? 'bg-forest/10 text-forest' :
                  item.category === 'wanted' ? 'bg-clay/10 text-clay' :
                  item.category === 'services' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {categoryLabels[item.category].icon} {categoryLabels[item.category].label}
                </span>
                <span className="text-[9px] font-bold text-gray-400">{new Date(item.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm font-light line-clamp-2 mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📍 {item.location}</span>
                {item.price && <span className="text-lg font-black text-clay">{item.price}</span>}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No classifieds found in this category.</p>
          </div>
        )}
      </div>

      <div className="mt-20 bg-forest rounded-[3rem] p-12 text-center text-white">
        <h2 className="text-3xl font-serif font-bold italic mb-4">Post Your Ad</h2>
        <p className="text-sand/70 mb-8 font-light">Have something to sell, looking for something, or offering a service?</p>
        <a
          href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent('Hi, I would like to post a classified ad.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Post an Ad via WhatsApp
        </a>
      </div>
    </div>
  );
};

const ClassifiedDetailView: React.FC<{ classifiedId: string, onNavigate: (page: Page, params?: any) => void }> = ({ classifiedId, onNavigate }) => {
  const item = CLASSIFIEDS.find(c => c.id === classifiedId);

  if (!item) return (
    <div className="py-40 text-center">
      <h2 className="text-4xl font-serif font-bold text-forest italic">Classified not found.</h2>
      <button onClick={() => onNavigate('classifieds')} className="mt-8 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Back to Classifieds</button>
    </div>
  );

  const categoryLabels: Record<ClassifiedCategory, { label: string, icon: string }> = {
    'for-sale': { label: 'For Sale', icon: '🏷️' },
    'wanted': { label: 'Wanted', icon: '🔍' },
    'services': { label: 'Services', icon: '🔧' },
    'other': { label: 'Other', icon: '📋' }
  };

  const conditionLabels = {
    'new': 'New',
    'used': 'Used',
    'other': 'N/A'
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
        <span className="mx-3 opacity-30">/</span>
        <button onClick={() => onNavigate('classifieds')} className="hover:text-forest transition-colors">Classifieds</button>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-forest">{item.title}</span>
      </nav>

      {item.imageUrl && (
        <div className="h-[400px] rounded-[3rem] overflow-hidden mb-10 shadow-2xl">
          <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
          item.category === 'for-sale' ? 'bg-forest/10 text-forest' :
          item.category === 'wanted' ? 'bg-clay/10 text-clay' :
          item.category === 'services' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {categoryLabels[item.category].icon} {categoryLabels[item.category].label}
        </span>
        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sand text-forest">
          {item.subcategory}
        </span>
        {item.condition !== 'other' && (
          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
            {conditionLabels[item.condition]}
          </span>
        )}
      </div>

      <h1 className="text-5xl md:text-7xl font-serif font-bold text-forest italic mb-4">{item.title}</h1>

      {item.price && (
        <p className="text-4xl font-black text-clay mb-8">{item.price}</p>
      )}

      <div className="flex flex-wrap gap-6 mb-12 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span>📍</span> {item.location}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>📅</span> Posted {new Date(item.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-[#e5e0d8] shadow-xl mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6">Description</h3>
        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{item.description}</p>
      </div>

      <div className="bg-forest p-10 rounded-[3rem] text-white text-center">
        <h3 className="text-2xl font-serif font-bold italic mb-2">Contact Seller</h3>
        <p className="text-sand/70 mb-6 font-light">Posted by {item.sellerName}</p>
        <a
          href={`https://wa.me/${item.sellerContact.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ad: ${item.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contact via WhatsApp
        </a>
      </div>
    </div>
  );
};

// ============ PROPERTY LISTINGS ============
const PropertyView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterListing, setFilterListing] = useState<string>('all');

  let filteredProperties = PROPERTIES;
  if (filterType !== 'all') filteredProperties = filteredProperties.filter(p => p.propertyType === filterType);
  if (filterListing !== 'all') filteredProperties = filteredProperties.filter(p => p.listingType === filterListing);

  const propertyTypeLabels: Record<PropertyType, { label: string, icon: string }> = {
    'house': { label: 'House', icon: '🏠' },
    'apartment': { label: 'Apartment', icon: '🏢' },
    'land': { label: 'Land', icon: '🌳' },
    'commercial': { label: 'Commercial', icon: '🏪' },
    'farm': { label: 'Farm', icon: '🚜' }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <div className="w-20 h-20 bg-clay/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🏡</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Property</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Find your perfect property in the Waterberg region.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilterListing('all')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterListing === 'all' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          All Listings
        </button>
        <button
          onClick={() => setFilterListing('sale')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterListing === 'sale' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          For Sale
        </button>
        <button
          onClick={() => setFilterListing('rent')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterListing === 'rent' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          To Rent
        </button>
      </div>

      <div className="mb-12 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilterType('all')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-clay text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          All Types
        </button>
        {Object.entries(propertyTypeLabels).map(([type, { label, icon }]) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-clay text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {filteredProperties.filter(p => p.isFeatured).length > 0 && (
        <div className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-clay mb-8 text-center">Featured Properties</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredProperties.filter(p => p.isFeatured).map(property => (
              <div key={property.id} onClick={() => onNavigate('property-detail', { id: property.id })} className="card-classy rounded-[3rem] overflow-hidden cursor-pointer group">
                <div className="h-64 relative overflow-hidden">
                  <img src={property.imageUrls[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={property.title} />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-forest">{propertyTypeLabels[property.propertyType].icon} {propertyTypeLabels[property.propertyType].label}</span>
                  </div>
                  <div className={`absolute top-6 right-6 px-4 py-2 rounded-full shadow-lg ${property.listingType === 'sale' ? 'bg-forest text-white' : 'bg-clay text-white'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{property.listingType === 'sale' ? 'For Sale' : 'To Rent'}</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mb-3">{property.title}</h3>
                  <p className="text-3xl font-black text-clay mb-4">{property.price}</p>
                  <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                    {property.bedrooms && <span>🛏️ {property.bedrooms} Beds</span>}
                    {property.bathrooms && <span>🚿 {property.bathrooms} Baths</span>}
                    {property.size && <span>📐 {property.size.toLocaleString()} {property.propertyType === 'land' || property.propertyType === 'farm' ? 'm²' : 'm²'}</span>}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📍 {property.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 text-center">All Properties</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.filter(p => !p.isFeatured).length > 0 ? filteredProperties.filter(p => !p.isFeatured).map(property => (
          <div key={property.id} onClick={() => onNavigate('property-detail', { id: property.id })} className="card-classy rounded-[2rem] overflow-hidden cursor-pointer group">
            <div className="h-48 relative overflow-hidden">
              <img src={property.imageUrls[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={property.title} />
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full shadow-lg ${property.listingType === 'sale' ? 'bg-forest text-white' : 'bg-clay text-white'}`}>
                <span className="text-[9px] font-black uppercase tracking-widest">{property.listingType === 'sale' ? 'Sale' : 'Rent'}</span>
              </div>
            </div>
            <div className="p-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-clay">{propertyTypeLabels[property.propertyType].icon} {propertyTypeLabels[property.propertyType].label}</span>
              <h3 className="text-xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mt-2 mb-2">{property.title}</h3>
              <p className="text-2xl font-black text-clay mb-3">{property.price}</p>
              <div className="flex flex-wrap gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                {property.size && <span>📐 {property.size.toLocaleString()}</span>}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No properties found matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="mt-20 bg-forest rounded-[3rem] p-12 text-center text-white">
        <h2 className="text-3xl font-serif font-bold italic mb-4">List Your Property</h2>
        <p className="text-sand/70 mb-8 font-light">Selling or renting property in the Waterberg? Get it listed on {siteName}.</p>
        <a
          href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent('Hi, I would like to list a property.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          List Property via WhatsApp
        </a>
      </div>
    </div>
  );
};

const PropertyDetailView: React.FC<{ propertyId: string, onNavigate: (page: Page, params?: any) => void }> = ({ propertyId, onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const property = PROPERTIES.find(p => p.id === propertyId);

  if (!property) return (
    <div className="py-40 text-center">
      <h2 className="text-4xl font-serif font-bold text-forest italic">Property not found.</h2>
      <button onClick={() => onNavigate('property')} className="mt-8 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Back to Properties</button>
    </div>
  );

  const propertyTypeLabels: Record<PropertyType, { label: string, icon: string }> = {
    'house': { label: 'House', icon: '🏠' },
    'apartment': { label: 'Apartment', icon: '🏢' },
    'land': { label: 'Land', icon: '🌳' },
    'commercial': { label: 'Commercial', icon: '🏪' },
    'farm': { label: 'Farm', icon: '🚜' }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 animate-fade">
      <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
        <span className="mx-3 opacity-30">/</span>
        <button onClick={() => onNavigate('property')} className="hover:text-forest transition-colors">Property</button>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-forest">{property.title}</span>
      </nav>

      {/* Photo Gallery */}
      <div className="mb-10">
        <div className="h-[500px] rounded-[3rem] overflow-hidden mb-4 shadow-2xl">
          <img src={property.imageUrls[selectedImage]} className="w-full h-full object-cover" alt={property.title} />
        </div>
        {property.imageUrls.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {property.imageUrls.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all ${selectedImage === i ? 'ring-4 ring-clay' : 'opacity-60 hover:opacity-100'}`}
              >
                <img src={url} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${property.listingType === 'sale' ? 'bg-forest text-white' : 'bg-clay text-white'}`}>
              {property.listingType === 'sale' ? 'For Sale' : 'To Rent'}
            </span>
            <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sand text-forest">
              {propertyTypeLabels[property.propertyType].icon} {propertyTypeLabels[property.propertyType].label}
            </span>
            {property.isFeatured && (
              <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-clay/20 text-clay">Featured</span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-forest italic mb-4">{property.title}</h1>
          <p className="text-4xl font-black text-clay mb-6">{property.price}</p>
          <p className="text-gray-500 text-lg mb-8">📍 {property.address}</p>

          <div className="flex flex-wrap gap-6 mb-10 p-6 bg-sand/30 rounded-2xl">
            {property.bedrooms && (
              <div className="text-center">
                <p className="text-3xl font-black text-forest">{property.bedrooms}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bedrooms</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center">
                <p className="text-3xl font-black text-forest">{property.bathrooms}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bathrooms</p>
              </div>
            )}
            {property.size && (
              <div className="text-center">
                <p className="text-3xl font-black text-forest">{property.size.toLocaleString()}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">m²</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0d8] shadow-xl mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6">Description</h3>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{property.description}</p>
          </div>

          {property.features.length > 0 && (
            <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0d8] shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6">Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600">
                    <span className="text-clay">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-32">
            <div className="bg-forest p-8 rounded-[2rem] text-white mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sand/50 mb-4">Contact Agent</h3>
              <p className="text-2xl font-serif font-bold italic mb-6">{property.agentName}</p>
              <a
                href={`https://wa.me/${property.agentContact.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the property: ${property.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Contact Agent
              </a>
              <a
                href={`tel:${property.agentContact}`}
                className="w-full mt-4 inline-flex items-center justify-center gap-3 bg-white/10 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-forest transition-all"
              >
                📞 Call Now
              </a>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
              Posted {new Date(property.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ COMMUNITY ANNOUNCEMENTS ============
const AnnouncementsView: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const activeAnnouncements = ANNOUNCEMENTS.filter(a => a.isActive && new Date(a.expiryDate) >= new Date());
  const filteredAnnouncements = filterCategory === 'all' ? activeAnnouncements : activeAnnouncements.filter(a => a.category === filterCategory);

  const categoryLabels: Record<AnnouncementCategory, { label: string, icon: string, color: string }> = {
    'lost-found': { label: 'Lost & Found', icon: '🔍', color: 'bg-blue-100 text-blue-700' },
    'community-notice': { label: 'Community Notice', icon: '📢', color: 'bg-forest/10 text-forest' },
    'alert': { label: 'Alert', icon: '⚠️', color: 'bg-red-100 text-red-700' },
    'other': { label: 'Other', icon: '📋', color: 'bg-gray-100 text-gray-600' }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📢</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Announcements</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Stay informed about community news, alerts, and lost & found.</p>
      </div>

      <div className="mb-12 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === 'all' ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
        >
          All
        </button>
        {Object.entries(categoryLabels).map(([cat, { label, icon }]) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-forest text-white' : 'bg-sand/50 text-gray-500 hover:bg-sand'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(announcement => (
          <div key={announcement.id} onClick={() => onNavigate('announcement-detail', { id: announcement.id })} className="card-classy p-8 rounded-[2rem] cursor-pointer group flex gap-6">
            {announcement.imageUrl && (
              <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
                <img src={announcement.imageUrl} className="w-full h-full object-cover" alt={announcement.title} />
              </div>
            )}
            <div className="flex-grow">
              <div className="flex items-center gap-4 mb-3">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${categoryLabels[announcement.category].color}`}>
                  {categoryLabels[announcement.category].icon} {categoryLabels[announcement.category].label}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(announcement.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-forest italic group-hover:text-clay transition-colors mb-2">{announcement.title}</h3>
              <p className="text-gray-400 text-sm font-light line-clamp-2 mb-3">{announcement.description}</p>
              <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>📍 {announcement.location}</span>
                <span>⏳ Expires {new Date(announcement.expiryDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-sand/10 rounded-[3rem] border border-dashed border-[#e5e0d8]">
            <p className="text-2xl font-serif text-gray-400 italic">No announcements in this category.</p>
          </div>
        )}
      </div>

      <div className="mt-20 bg-clay/10 border border-clay/20 rounded-[3rem] p-12 text-center">
        <h2 className="text-3xl font-serif font-bold text-forest italic mb-4">Have an Announcement?</h2>
        <p className="text-gray-500 mb-8 font-light max-w-xl mx-auto">Lost something? Found something? Have a community notice to share?</p>
        <a
          href={`https://wa.me/${waLinkNum}?text=${encodeURIComponent('Hi, I would like to post a community announcement.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-forest transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Post Announcement via WhatsApp
        </a>
      </div>
    </div>
  );
};

const AnnouncementDetailView: React.FC<{ announcementId: string, onNavigate: (page: Page, params?: any) => void }> = ({ announcementId, onNavigate }) => {
  const announcement = ANNOUNCEMENTS.find(a => a.id === announcementId);

  if (!announcement) return (
    <div className="py-40 text-center">
      <h2 className="text-4xl font-serif font-bold text-forest italic">Announcement not found.</h2>
      <button onClick={() => onNavigate('announcements')} className="mt-8 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Back to Announcements</button>
    </div>
  );

  const categoryLabels: Record<AnnouncementCategory, { label: string, icon: string, color: string }> = {
    'lost-found': { label: 'Lost & Found', icon: '🔍', color: 'bg-blue-100 text-blue-700' },
    'community-notice': { label: 'Community Notice', icon: '📢', color: 'bg-forest/10 text-forest' },
    'alert': { label: 'Alert', icon: '⚠️', color: 'bg-red-100 text-red-700' },
    'other': { label: 'Other', icon: '📋', color: 'bg-gray-100 text-gray-600' }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <nav className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-forest transition-colors">Home</button>
        <span className="mx-3 opacity-30">/</span>
        <button onClick={() => onNavigate('announcements')} className="hover:text-forest transition-colors">Announcements</button>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-forest">{announcement.title}</span>
      </nav>

      {announcement.imageUrl && (
        <div className="h-[300px] rounded-[3rem] overflow-hidden mb-10 shadow-2xl">
          <img src={announcement.imageUrl} className="w-full h-full object-cover" alt={announcement.title} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${categoryLabels[announcement.category].color}`}>
          {categoryLabels[announcement.category].icon} {categoryLabels[announcement.category].label}
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-serif font-bold text-forest italic mb-8">{announcement.title}</h1>

      <div className="flex flex-wrap gap-6 mb-12 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span>📍</span> {announcement.location}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>📅</span> Posted {new Date(announcement.postedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div className="flex items-center gap-2 text-clay">
          <span>⏳</span> Expires {new Date(announcement.expiryDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-[#e5e0d8] shadow-xl mb-10">
        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{announcement.description}</p>
      </div>

      <div className="bg-forest p-10 rounded-[3rem] text-white text-center">
        <h3 className="text-2xl font-serif font-bold italic mb-2">Contact</h3>
        <p className="text-sand/70 mb-6 font-light">{announcement.contactName}</p>
        <a
          href={`https://wa.me/${announcement.contactMethod.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm contacting you about: ${announcement.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#075e54] transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contact via WhatsApp
        </a>
      </div>
    </div>
  );
};

const FloatingWhatsApp: React.FC = () => (
  <a
    href={`https://wa.me/${waLinkNum}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group"
    aria-label="Chat on WhatsApp"
  >
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-forest px-4 py-2 rounded-lg shadow-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
      Chat with us
    </span>
  </a>
);

export default function App() {
  const [navigation, setNavigation] = useState<{ page: Page, params: any }>({ page: 'home', params: {} });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) { setNavigation({ page: 'home', params: {} }); return; }
      const [page, paramStr] = hash.split('?');
      const params = paramStr ? Object.fromEntries(new URLSearchParams(paramStr)) : {};
      setNavigation({ page: page as Page, params });
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Inject town-specific colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-forest', config.branding.colors.primary);
    root.style.setProperty('--color-clay', config.branding.colors.secondary);
    root.style.setProperty('--color-sand', config.branding.colors.accent);
  }, []);

  const navigateTo = (page: Page, params: any = {}) => {
    const paramStr = new URLSearchParams(params).toString();
    window.location.hash = `${page}${paramStr ? '?' + paramStr : ''}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (navigation.page) {
      case 'home': return <HomeView onNavigate={navigateTo} />;
      case 'directory': return <DirectoryView onNavigate={navigateTo} />;
      case 'category': return <CategoryView sectorId={navigation.params.sector as SectorId} onNavigate={navigateTo} />;
      case 'business': return <BusinessDetailView businessId={navigation.params.id} onNavigate={navigateTo} />;
      case 'specials': return <SpecialsView onNavigate={navigateTo} />;
      case 'map': return <MapView onNavigate={navigateTo} />;
      case 'search': return <SearchView query={navigation.params.q || ''} onNavigate={navigateTo} />;
      case 'recommend': return <RecommendView />;
      case 'pricing': return <PricingView onNavigate={navigateTo} />;
      case 'about': return <AboutView />;
      case 'add-business': return <AddBusinessView />;
      case 'contact': return <ContactView />;
      case 'tourism': return <CategoryView sectorId="tourism-hospitality" onNavigate={navigateTo} />;
      case 'terms': return <LegalView type="terms" />;
      case 'privacy': return <LegalView type="privacy" />;
      case 'disclaimer': return <LegalView type="disclaimer" />;
      // Community Features
      case 'jobs': return <JobsView onNavigate={navigateTo} />;
      case 'job-detail': return <JobDetailView jobId={navigation.params.id} onNavigate={navigateTo} />;
      case 'events': return <EventsView onNavigate={navigateTo} />;
      case 'event-detail': return <EventDetailView eventId={navigation.params.id} onNavigate={navigateTo} />;
      case 'classifieds': return <ClassifiedsView onNavigate={navigateTo} />;
      case 'classified-detail': return <ClassifiedDetailView classifiedId={navigation.params.id} onNavigate={navigateTo} />;
      case 'property': return <PropertyView onNavigate={navigateTo} />;
      case 'property-detail': return <PropertyDetailView propertyId={navigation.params.id} onNavigate={navigateTo} />;
      case 'announcements': return <AnnouncementsView onNavigate={navigateTo} />;
      case 'announcement-detail': return <AnnouncementDetailView announcementId={navigation.params.id} onNavigate={navigateTo} />;
      default: return <HomeView onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Navbar onNavigate={navigateTo} />
      <main className="flex-grow">{renderContent()}</main>
      <Footer onNavigate={navigateTo} />
      <FloatingWhatsApp />
    </div>
  );
}
