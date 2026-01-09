
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BUSINESSES, SECTORS } from './data';
import { Business, SectorId, Page, Sector } from './types';
import L from 'leaflet';

const Navbar: React.FC<{ onNavigate: (page: Page, params?: any) => void }> = ({ onNavigate }) => (
  <nav className="bg-white/90 backdrop-blur-md border-b border-[#e5e0d8] sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="flex justify-between h-20 items-center">
        <div 
          className="flex-shrink-0 flex items-center cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center mr-3 transition-all group-hover:bg-clay shadow-sm group-hover:rotate-12">
            <span className="text-white font-serif font-bold text-xl italic">V</span>
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-forest">
            Vaalwater<span className="text-clay">Connect</span>
          </span>
        </div>
        <div className="hidden md:flex space-x-4 lg:space-x-5 items-center">
          <button onClick={() => onNavigate('home')} className="nav-link">Home</button>
          <button onClick={() => onNavigate('directory')} className="nav-link">Directory</button>
          <button onClick={() => onNavigate('specials')} className="nav-link">Specials</button>
          <button onClick={() => onNavigate('map')} className="nav-link">Map</button>
          <button onClick={() => onNavigate('tourism')} className="nav-link">Tourism</button>
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
          .nav-link:hover { color: #2d4a3e; }
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
          <h4 className="text-white font-serif font-bold text-2xl mb-6 italic">VaalwaterConnect</h4>
          <p className="text-sm leading-relaxed max-w-sm text-sand/60 font-light">
            Hyperlocal excellence for the Waterberg district. Connecting our community with integrity and boutique visibility.
          </p>
          <div className="mt-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-clay">Contact Us</p>
            <p className="text-sm text-white">hello@vaalwaterconnect.co.za</p>
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
        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">&copy; {new Date().getFullYear()} VaalwaterConnect. All rights reserved.</p>
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
  const exampleSpecials = [
    {
      id: 's1',
      businessId: '1',
      businessName: 'Waterberg Game Reserve',
      title: 'Mid-Week Wilderness Escape',
      offer: '30% Discount on Luxury Safari Suites',
      validUntil: '30 September 2024',
      description: 'Book a mid-week stay (Mon-Thu) and enjoy deep discounts on our premium suites. Includes 2 guided game drives per day.',
      icon: '🦓',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 's2',
      businessId: '11',
      businessName: 'The Stoep Cafe',
      title: 'Farmers Breakfast Special',
      offer: 'Buy One, Get One Half Price',
      validUntil: 'Every Saturday Morning',
      description: 'The perfect start to your weekend. Bring a friend and enjoy our famous traditional breakfast platter. Valid 08:00 - 11:00.',
      icon: '🍳',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 's3',
      businessId: '20',
      businessName: 'Sunset Ridge Lodge',
      title: 'Waterberg Stargazing Long Stay',
      offer: 'Stay 4 Nights, Pay for 3',
      validUntil: 'End of Year 2024',
      description: 'Experience the pristine night skies of the Waterberg. Book a 4-night stay and the final night is on us. Perfect for family retreats.',
      icon: '✨',
      imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-20 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-clay mb-4 block">Limited Time Offers</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Local Specials.</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Discover exclusive deals from our trusted partners in the Waterberg district.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {exampleSpecials.map((special) => (
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
           Are you a Vaalwater business with a special offer? Listings on our Specials page are included in our Annual Essential and Lodge partner plans.
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
      leafletMap.current = L.map(mapRef.current).setView([-24.296, 28.113], 12);

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
  const tiers = [
    { 
      name: 'Monthly Standard', 
      price: 'R 300', 
      period: '/ month',
      badge: null,
      features: ['Basic directory listing', 'WhatsApp & Phone contact', 'Map pinpoint integration', 'Verified business check', 'Social media links'], 
      icon: '🌿',
      action: 'Select Monthly'
    },
    { 
      name: 'Annual Essential', 
      price: 'R 2,500', 
      period: '/ year',
      badge: '2 Months Free!',
      highlighted: true,
      features: ['All Monthly features', 'Two months free included', 'Priority search placement', 'Custom gallery (up to 3 photos)', 'Featured in "Local Gems" list', 'Monthly "Specials" feature'], 
      icon: '🌳',
      action: 'Get 2 Months Free'
    },
    { 
      name: 'Lodge & Enterprise', 
      price: 'R 5,000', 
      period: '/ year',
      badge: 'Premium Visibility',
      features: ['Full bespoke profile page', 'Booking link integration', 'Professional photography highlight', 'Unlimited search tags', 'Direct email inquiries', 'Unlimited "Specials" posts'], 
      icon: '🏨',
      action: 'Go Enterprise'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade">
      <div className="text-center mb-24">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-clay mb-4 block">Our Partner Plans</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-forest italic mb-6">Simple Pricing.</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">Elevate your business visibility in the Waterberg district. Choose the plan that fits your growth.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <div key={tier.name} className={`relative p-12 rounded-[3.5rem] card-classy flex flex-col h-full ${tier.highlighted ? 'border-clay shadow-3xl scale-105 z-10 bg-[#fdfbf7]' : 'bg-white'}`}>
            {tier.badge && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-clay text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                {tier.badge}
              </span>
            )}
            
            <div className="text-5xl mb-8 opacity-80">{tier.icon}</div>
            <h3 className="text-3xl font-serif font-bold text-forest mb-2 italic tracking-tight">{tier.name}</h3>
            
            <div className="flex items-baseline gap-2 mb-10 border-b border-sand pb-8">
              <span className="text-4xl font-black text-forest tracking-tighter">{tier.price}</span>
              <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">{tier.period}</span>
            </div>

            <ul className="space-y-5 mb-12 flex-grow">
              {tier.features.map(f => (
                <li key={f} className="text-sm text-gray-600 flex items-start gap-4 leading-relaxed">
                  <span className="text-clay font-bold mt-0.5">✓</span> 
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onNavigate('add-business')}
              className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all transform hover:scale-[1.02] active:scale-95 ${tier.highlighted ? 'bg-forest text-white shadow-2xl' : 'bg-sand text-forest border border-[#e5e0d8] hover:bg-forest hover:text-white'}`}
            >
              {tier.action}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-forest rounded-[3rem] p-16 text-center text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-clay/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <h2 className="text-4xl font-serif font-bold italic mb-6 relative z-10">Limited Time: Two Months Free</h2>
        <p className="text-sand/70 max-w-xl mx-auto mb-10 text-lg font-light relative z-10">
          Subscribe to any annual plan today and save R 600 instantly. We are committed to supporting local businesses through affordable, high-quality digital visibility.
        </p>
        <button 
          onClick={() => onNavigate('contact')}
          className="bg-clay text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:bg-white hover:text-forest relative z-10"
        >
          Enquire About Plans
        </button>
      </div>

      <p className="mt-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        * All prices are billed annually except for the Monthly Standard plan.
      </p>
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
          VaalwaterConnect was born from a simple observation: in our vast and beautiful Waterberg region, finding reliable services shouldn't feel like navigating the bush without a compass.
        </p>
        <p>
          We are more than a directory; we are a digital bridge. Our mission is to provide boutique visibility to the master artisans, world-class lodges, and essential services that form the heartbeat of Vaalwater and its surrounds.
        </p>
        <p>
          Whether you're a local resident looking for a plumber or a traveler seeking the perfect safari escape, VaalwaterConnect ensures you find verified excellence with a hyper-local touch.
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

const AddBusinessView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    sectorId: '',
    tier: 'standard',
    phone: '',
    email: '',
    description: '',
    address: '',
    popiaConsent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.popiaConsent) return;
    console.log('Official Business Registration:', { ...formData, timestamp: new Date().toISOString() });
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-6 py-40 text-center animate-fade">
      <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl">🏛️</div>
      <h1 className="text-6xl font-serif font-bold text-forest italic mb-6">Registration Received</h1>
      <p className="text-xl text-gray-500 font-light mb-12">Our team will review your application and contact you within 48 hours to finalize your listing and verification.</p>
      <button onClick={() => setSubmitted(false)} className="text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Add Another Business</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16">
        <h1 className="text-6xl font-serif font-bold text-forest mb-6 italic">Partner Registration</h1>
        <p className="text-xl text-gray-500 font-light">Join the VaalwaterConnect registry and reach your local audience with professional clarity.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-12 md:p-20 rounded-[4rem] border border-[#e5e0d8] shadow-3xl space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Name *</label>
            <input required type="text" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-2xl font-serif italic" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector *</label>
            <select required className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl bg-transparent font-serif italic" value={formData.sectorId} onChange={e => setFormData({...formData, sectorId: e.target.value as SectorId})}>
              <option value="">Select a Sector</option>
              {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Plan</label>
            <select className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl bg-transparent font-serif italic" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})}>
              <option value="monthly">Monthly Standard (R 300 p.m.)</option>
              <option value="annual">Annual Essential (R 2,500 p.a.)</option>
              <option value="lodge">Lodge & Large Enterprise (R 5,000 p.a.)</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Email *</label>
            <input required type="email" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Description</label>
          <textarea rows={4} className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif italic resize-none" placeholder="What makes your business special?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div className="pt-10 border-t border-[#e5e0d8]">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input required type="checkbox" className="w-6 h-6 rounded border-sand text-forest focus:ring-clay" checked={formData.popiaConsent} onChange={e => setFormData({...formData, popiaConsent: e.target.checked})} />
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
        <img src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover scale-105" alt="Waterberg" />
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white pt-20">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-sand/60 mb-8 block">Waterberg Biosphere District</span>
          <h1 className="text-7xl md:text-9xl font-serif font-bold mb-12 italic tracking-tighter leading-tight">Vaalwater<br/>Connect.</h1>
          
          <div className="max-w-3xl mx-auto mb-16 px-4">
            <form onSubmit={handleSearch} className="relative group">
               <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="where can i find... in Vaalwater?" 
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
                 {business.email && <div className="text-sm text-gray-500 text-center font-light underline decoration-sand decoration-2">{business.email}</div>}
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
    recommender: '',
    popiaConsent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.sectorId || !formData.popiaConsent) return;
    const submissionData = { ...formData, timestamp: new Date().toISOString() };
    console.log('Recommendation Submitted:', submissionData);
    const subject = `Business Recommendation: ${formData.businessName}`;
    const sectorName = SECTORS.find(s => s.id === formData.sectorId)?.name;
    const body = `Recommendation Details:\n----------------------------\nBusiness: ${formData.businessName}\nSector: ${sectorName}\nPhone: ${formData.phone || 'N/A'}\nLink: ${formData.website || 'N/A'}\nReason: ${formData.reason}\nRecommender: ${formData.recommender || 'Anonymous'}`;
    const mailto = `mailto:listings@vaalwaterconnect.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-6 py-40 text-center animate-fade">
      <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl">✅</div>
      <h1 className="text-6xl font-serif font-bold text-forest italic mb-6">Thank You!</h1>
      <p className="text-xl text-gray-500 font-light mb-12">We've received your recommendation. If valid, we will reach out to the business and add them to our registry.</p>
      <button onClick={() => setSubmitted(false)} className="text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Submit Another</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-fade">
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-serif font-bold text-forest mb-6 italic">Recommend a Gem</h1>
        <p className="text-xl text-gray-500 font-light">Know a master artisan or local shop that belongs on our map? Let us know.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-12 md:p-20 rounded-[4rem] border border-[#e5e0d8] shadow-3xl space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Business Name *</label>
            <input required type="text" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-2xl font-serif italic" placeholder="Name of establishment" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector *</label>
            <select required className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl bg-transparent font-serif italic" value={formData.sectorId} onChange={e => setFormData({...formData, sectorId: e.target.value as SectorId})}>
              <option value="">Select a Sector</option>
              {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number (Optional)</label>
            <input type="tel" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="+27 ..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Link (Optional)</label>
            <input type="text" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="Website or Facebook URL" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Why do you recommend them?</label>
          <textarea rows={3} className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif italic resize-none" placeholder="Tell us about their service..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Name (Optional)</label>
          <input type="text" className="w-full px-0 py-4 border-b-2 border-sand focus:border-clay outline-none text-xl font-serif" placeholder="Who are you?" value={formData.recommender} onChange={e => setFormData({...formData, recommender: e.target.value})} />
        </div>
        <div className="pt-10">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input type="checkbox" className="w-6 h-6 rounded border-sand text-forest focus:ring-clay" checked={formData.popiaConsent} onChange={e => setFormData({...formData, popiaConsent: e.target.checked})} />
            <span className="text-sm text-gray-500 group-hover:text-forest transition-colors">I consent to the processing of this information according to POPIA.</span>
          </label>
        </div>
        <button type="submit" className="w-full bg-forest text-white py-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-3xl transition-all hover:scale-[1.01]">
          Submit Recommendation
        </button>
      </form>
    </div>
  );
};

const LegalView: React.FC<{ type: 'terms' | 'privacy' | 'disclaimer' }> = ({ type }) => {
  const content = {
    terms: { title: 'Terms of Use', body: 'By using VaalwaterConnect, you agree to comply with our standards of accuracy and community integrity. We act as a directory only and are not responsible for individual service quality.' },
    privacy: { title: 'Privacy Policy (POPIA)', body: 'We respect your data. In compliance with the Protection of Personal Information Act (POPIA), we only store business information provided voluntarily for the purpose of directory listing.' },
    disclaimer: { title: 'Legal Disclaimer', body: 'While we strive for accuracy, VaalwaterConnect does not warrant that business information is current at all times. Users should verify details directly with the establishments.' }
  }[type];

  return (
    <div className="max-w-3xl mx-auto px-6 py-32 animate-fade">
      <h1 className="text-5xl font-serif font-bold text-forest mb-12 italic">{content.title}</h1>
      <p className="text-xl text-gray-600 leading-relaxed font-light">{content.body}</p>
      <button onClick={() => window.history.back()} className="mt-12 text-clay font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Return to Previous</button>
    </div>
  );
};

const ContactView: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 py-32 animate-fade text-center">
    <h1 className="text-6xl font-serif font-bold text-forest mb-12 italic">Get in Touch</h1>
    <p className="text-xl text-gray-500 mb-16 font-light">Questions about our registry or need to update your listing?</p>
    <div className="grid md:grid-cols-2 gap-12">
      <div className="p-12 bg-sand/20 rounded-3xl border border-sand">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-clay mb-4">Email HQ</h4>
        <p className="text-2xl font-serif font-bold text-forest">hello@vaalwaterconnect.co.za</p>
      </div>
      <div className="p-12 bg-forest text-white rounded-3xl">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-sand/40 mb-4">District Office</h4>
        <p className="text-2xl font-serif font-bold italic">Vaalwater, Waterberg</p>
      </div>
    </div>
  </div>
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
      default: return <HomeView onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Navbar onNavigate={navigateTo} />
      <main className="flex-grow">{renderContent()}</main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
