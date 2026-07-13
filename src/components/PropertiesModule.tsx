/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Home, 
  DollarSign, 
  BedDouble, 
  Maximize2, 
  Share2, 
  Check, 
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  User,
  X,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Building2
} from 'lucide-react';
import { Property, Lead, UserProfile } from '../types';
import TiltCard from './TiltCard';
import { t, formatCurrency, getLocalizedPropertyType, LanguageCode, CurrencyCode, PropertySchemeType } from '../lib/i18n';

const REAL_ESTATE_STOCK_GALLERY = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80', tag: 'Luxury Flat' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80', tag: 'Villa Exterior' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80', tag: 'Modern Bedroom' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80', tag: 'Sky Residences' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80', tag: 'Royal Lounge' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80', tag: 'Bespoke Poolside' }
];

interface PropertiesModuleProps {
  properties: Property[];
  leads: Lead[];
  currentUser: UserProfile;
  onAddProperty: (property: any) => void;
  onShareProperty: (leadId: string, propertyId: string, channel: 'WhatsApp' | 'SMS' | 'Email') => void;
  lang?: LanguageCode;
  currency?: CurrencyCode;
  propScheme?: PropertySchemeType;
}

export default function PropertiesModule({
  properties,
  leads,
  currentUser,
  onAddProperty,
  onShareProperty,
  lang = 'en',
  currency = 'USD',
  propScheme = 'global'
}: PropertiesModuleProps) {
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Create state for sharing
  const [sharingLeadId, setSharingLeadId] = useState('');
  const [sharingChannel, setSharingChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  
  // Add Property Form inputs
  const [marketRegion, setMarketRegion] = useState<'PK' | 'US' | 'AE'>('PK');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('DHA Phase 6, Lahore');
  const [newType, setNewType] = useState('Villa');
  const [newPrice, setNewPrice] = useState('');
  const [newSize, setNewSize] = useState('10 Marla Luxury');
  const [newBedrooms, setNewBedrooms] = useState('3');
  const [newBathrooms, setNewBathrooms] = useState('3');
  const [newFloor, setNewFloor] = useState('8');
  const [newFurnishing, setNewFurnishing] = useState('Fully-Furnished');
  const [newDescription, setNewDescription] = useState('');

  // Handle auto-updating fields when market changes
  React.useEffect(() => {
    if (marketRegion === 'PK') {
      setNewLocation('DHA Phase 6, Lahore');
      setNewType('Villa');
      setNewSize('10 Marla Luxury');
    } else if (marketRegion === 'US') {
      setNewLocation('Beverly Hills, CA 90210');
      setNewType('Single Family Home');
      setNewSize('2,500 Sq. Ft.');
    } else if (marketRegion === 'AE') {
      setNewLocation('Dubai Marina');
      setNewType('Apartment');
      setNewSize('1,800 Sq. Ft. BUA');
    }
  }, [marketRegion]);

  // Picture upload state - supports file uploads (base64) and gallery selection
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [activeUploadTab, setActiveUploadTab] = useState<'files' | 'gallery'>('files');
  
  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  // File Upload Handlers
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPropertyImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleToggleStockGalleryImage = (url: string) => {
    setPropertyImages(prev => {
      if (prev.includes(url)) {
        return prev.filter(item => item !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const handleRemoveUploadedImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submit handler
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) {
      alert('Must input at least Title and Price.');
      return;
    }
    
    onAddProperty({
      title: newTitle,
      location: newLocation,
      propertyType: newType,
      price: Number(newPrice),
      size: newSize,
      bedrooms: Number(newBedrooms),
      bathrooms: Number(newBathrooms),
      floor: Number(newFloor),
      furnishingStatus: newFurnishing,
      description: newDescription || 'Premium residency available for viewings.',
      images: propertyImages.length > 0 ? propertyImages : undefined
    });

    // Reset fields
    setNewTitle('');
    setNewPrice('');
    setNewDescription('');
    setPropertyImages([]);
    setShowAddProperty(false);
    alert('Success: New property cataloged into CRM storage.');
  };

  const handleDispatchShare = () => {
    if (!selectedPropertyId || !sharingLeadId) {
      alert('Please choose a counseling client lead parameter first.');
      return;
    }
    onShareProperty(sharingLeadId, selectedPropertyId, sharingChannel);
    alert(`Success: Property details brochure prepared and dispatched to candidate via ${sharingChannel}. Recorded on ledger.`);
    setSharingLeadId('');
  };

  // Filter properties
  const filteredProperties = properties.filter(p => {
    const term = searchQuery.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(term) || p.location.toLowerCase().includes(term);
    const matchType = typeFilter ? p.propertyType === typeFilter : true;
    const matchLoc = locationFilter ? p.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    return matchSearch && matchType && matchLoc;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full" id="properties-module">
      {/* Left Property List */}
      <div className={`lg:col-span-8 flex flex-col space-y-4 h-[calc(100vh-140px)] overflow-y-auto ${selectedPropertyId ? 'hidden lg:block' : 'block'}`}>
        
        {/* Banner with controls */}
        <div className="flex justify-between items-center bg-card p-4 border border-default rounded-2xl shadow-xs">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Exclusive Inventory ({filteredProperties.length})</h2>
            <p className="text-[10px] text-muted mt-0.5">Real Estate available for distribution</p>
          </div>
          <button 
            id="add-property-toggle-btn"
            onClick={() => setShowAddProperty(true)}
            className="bg-slate-900 border border-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Catalog Property
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-card p-3 border border-default rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Search text */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted" size={14} />
            <input 
              id="property-search-input"
              type="text" 
              placeholder="Search properties, sector..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-default pl-8 pr-3 py-2 rounded-xl text-xs placeholder:text-muted focus:outline-none"
            />
          </div>

          <select 
            id="property-type-filter"
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-surface border border-default p-2 rounded-xl text-xs"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa / Penthouse</option>
            <option value="Commercial">Commercial Project</option>
            <option value="Land Plot">Independent land Plots</option>
          </select>

          <select 
            id="property-location-filter"
            value={locationFilter} 
            onChange={e => setLocationFilter(e.target.value)}
            className="bg-surface border border-default p-2 rounded-xl text-xs"
          >
            <option value="">All Locations</option>
            <option value="Golf Course">Golf Course Road</option>
            <option value="Dwarka">Dwarka Expressway</option>
            <option value="Sohna">Sohna Road</option>
            <option value="DLF">DLF City</option>
          </select>
        </div>

        {/* Grid display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="property-grid-cards">
          {filteredProperties.map(prop => (
            <TiltCard key={prop.id} maxTilt={5}>
            <div 
              onClick={() => setSelectedPropertyId(prop.id)}
              className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden hover:border-indigo-200 hover:shadow-md cursor-pointer transition flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={prop.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'} 
                  alt={prop.title} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-1 rounded">
                  {getLocalizedPropertyType(prop.propertyType, propScheme, lang)}
                </span>
                <span className="absolute bottom-3 right-3 bg-emerald-500/90 text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded">
                  {formatCurrency(prop.price, currency, currency === 'PKR' || lang === 'ur' ? 'regional' : 'standard')}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{prop.title}</h3>
                  <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
                    <MapPin size={11} className="text-muted" /> {prop.location}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-3 text-[10px] text-muted font-medium">
                  <span>Bedrooms: {prop.bedrooms || 'Plot'}</span>
                  <span>Size: {prop.size}</span>
                </div>
              </div>
            </div>
            </TiltCard>
          ))}

          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-16 bg-card border border-dashed border-default rounded-2xl">
              <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-muted">No properties found</p>
              <p className="text-xs text-slate-300 mt-1">Add your first property to start building inventory</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Property Details & One-Click Sharing ledger */}
      <div className={`lg:col-span-4 bg-card border border-default rounded-2xl h-[calc(100vh-140px)] flex flex-col overflow-y-auto ${selectedPropertyId ? 'block' : 'hidden lg:flex justify-center items-center text-slate-350'}`}>
        {activeProperty ? (
          <div className="p-5 space-y-6 flex-1 flex flex-col" id="property-details-view">
            {/* Toggle header info */}
            <div className="flex justify-between items-center border-b border-default pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Specs Dashboard
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 mt-2">{activeProperty.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPropertyId(null)}
                className="bg-surface text-muted p-1 rounded-lg hover:bg-surface-alt transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-secondary">
              {/* Image stack */}
              <img 
                src={activeProperty.images[0]} 
                alt="Estate Preview" 
                className="w-full h-36 object-cover rounded-xl"
              />

              {/* Specs Bento block */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-surface p-2.5 rounded-xl">
                  <span className="text-[10px] text-muted block font-normal">Pricing</span>
                  <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{formatCurrency(activeProperty.price, currency, currency === 'PKR' || lang === 'ur' ? 'regional' : 'standard')}</span>
                </div>
                <div className="bg-surface p-2.5 rounded-xl">
                  <span className="text-[10px] text-muted block font-normal">Size Scale</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{activeProperty.size}</span>
                </div>
                <div className="bg-surface p-2.5 rounded-xl">
                  <span className="text-[10px] text-muted block font-normal">Furnishing</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{activeProperty.furnishingStatus}</span>
                </div>
                <div className="bg-surface p-2.5 rounded-xl">
                  <span className="text-[10px] text-muted block font-normal">Project Floor</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">Lvl {activeProperty.floor || 'G'}</span>
                </div>
              </div>

              {/* Overview body */}
              <div className="space-y-1">
                <h4 className="font-extrabold text-secondary text-[10px] uppercase">Property Overview</h4>
                <p className="text-muted font-light leading-relaxed">{activeProperty.description}</p>
              </div>

              {/* Amenities list */}
              <div className="space-y-1">
                <h4 className="font-extrabold text-secondary text-[10px] uppercase">Highlights</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeProperty.amenities.map((item, index) => (
                    <span 
                      key={index}
                      className="bg-slate-100 hover:bg-slate-200 text-secondary px-2 py-1 rounded-md text-[10px] font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Developer info */}
              <div className="bg-surface border border-default rounded-xl p-3 space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-muted block font-extrabold">Listing Owner Contact</span>
                <p className="text-xs font-bold text-slate-800">{activeProperty.ownerInfo.name}</p>
                <p className="text-[10px] text-muted flex items-center gap-1">📞 {activeProperty.ownerInfo.phone} ({activeProperty.ownerInfo.role})</p>
              </div>
            </div>

            {/* ONE-CLICK SHARING DIALOG ENCRYPTED IN DETAILS */}
            <div className="border-t border-default pt-4 mt-auto space-y-3">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 block">
                One-Click Client Dispatch Ledger
              </span>

              <div className="space-y-2">
                <select 
                  id="share-target-lead-select"
                  value={sharingLeadId}
                  onChange={e => setSharingLeadId(e.target.value)}
                  className="w-full border border-default rounded-lg p-2 text-xs"
                >
                  <option value="">-- Choose target lead client --</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.fullName} ({lead.preferredLocation})</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <select 
                    id="share-channel-select"
                    value={sharingChannel}
                    onChange={e => setSharingChannel(e.target.value as any)}
                    className="border border-default rounded-lg p-2 text-xs flex-1"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS Message</option>
                    <option value="Email">HTML Email Panel</option>
                  </select>

                  <button 
                    id="dispatch-share-btn"
                    onClick={handleDispatchShare}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-muted space-y-2">
            <Home size={36} />
            <span className="text-xs">Select listed home properties</span>
          </div>
        )}
      </div>

      {/* CATALOG ADD PROPERTY MODAL */}
      {showAddProperty && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B132B] text-slate-100 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-slate-800 max-h-[90vh] overflow-y-auto" id="add-property-modal" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Catalog New Residential Listing</h3>
                <p className="text-[10px] text-muted mt-0.5">Define property variables in local context scale</p>
              </div>
              <button onClick={() => setShowAddProperty(false)} className="text-muted hover:text-white transition p-1.5 hover:bg-slate-900 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Premium Market Region Selector Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Select Market Localization</label>
              <div className="grid grid-cols-3 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMarketRegion('PK')}
                  className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${marketRegion === 'PK' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-muted hover:text-white'}`}
                >
                  Pakistan (PKR)
                </button>
                <button
                  type="button"
                  onClick={() => setMarketRegion('US')}
                  className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${marketRegion === 'US' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-muted hover:text-white'}`}
                >
                  USA (USD)
                </button>
                <button
                  type="button"
                  onClick={() => setMarketRegion('AE')}
                  className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${marketRegion === 'AE' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-muted hover:text-white'}`}
                >
                  Dubai (AED)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProperty} className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-300">Property Project Title</label>
                <input 
                  id="add-prop-title"
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder={marketRegion === 'PK' ? 'e.g. DHA Phase 6 Luxury Villa' : marketRegion === 'US' ? 'e.g. Beverly Hills Mansion' : 'e.g. Marina Gate Penthouse'}
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Sector / Location context aware */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Sector / Location</label>
                {marketRegion === 'US' ? (
                  <input
                    id="add-prop-location"
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Beverly Hills, CA 90210"
                    className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                ) : (
                  <select 
                    id="add-prop-location"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {marketRegion === 'PK' ? (
                      <>
                        <option value="DHA Phase 6, Lahore">DHA Phase 6, Lahore</option>
                        <option value="Bahria Town, Karachi">Bahria Town, Karachi</option>
                        <option value="Gulberg, Islamabad">Gulberg, Islamabad</option>
                        <option value="Clifton, Karachi">Clifton, Karachi</option>
                        <option value="F-7, Islamabad">F-7, Islamabad</option>
                      </>
                    ) : (
                      <>
                        <option value="Dubai Marina">Dubai Marina</option>
                        <option value="Downtown Dubai">Downtown Dubai</option>
                        <option value="Palm Jumeirah">Palm Jumeirah</option>
                        <option value="JVC (Jumeirah Village Circle)">JVC (Jumeirah Village Circle)</option>
                        <option value="Business Bay">Business Bay</option>
                      </>
                    )}
                  </select>
                )}
              </div>

              {/* Property Type context aware */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Property Type</label>
                <select 
                  id="add-prop-type"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {marketRegion === 'PK' ? (
                    <>
                      <option value="Villa">Villa / House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Commercial">Commercial Project</option>
                      <option value="Land Plot">Independent Land Plot</option>
                    </>
                  ) : marketRegion === 'US' ? (
                    <>
                      <option value="Single Family Home">Single Family Home</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Commercial">Commercial</option>
                    </>
                  ) : (
                    <>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa / Penthouse</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land Plot">Independent Land Plot</option>
                    </>
                  )}
                </select>
              </div>

              {/* Pricing Context Aware */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">
                  {marketRegion === 'PK' ? 'Pricing in PKR (Total)' : marketRegion === 'US' ? 'Pricing in USD ($)' : 'Pricing in AED (Dirhams)'}
                </label>
                <input 
                  id="add-prop-price"
                  type="number" 
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder={
                    marketRegion === 'PK' ? 'e.g. 55000000 (meaning 5.5 Crore)' :
                    marketRegion === 'US' ? 'e.g. 1250000 (meaning $1.25M)' :
                    'e.g. 2400000 (meaning 2.4M AED)'
                  }
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Format Scale / Size Context Aware */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Format Scale / Size</label>
                <input 
                  id="add-prop-size"
                  type="text" 
                  value={newSize}
                  onChange={e => setNewSize(e.target.value)}
                  placeholder={
                    marketRegion === 'PK' ? 'e.g. 10 Marla Luxury, 1 Kanal Premium' :
                    marketRegion === 'US' ? 'e.g. 2,500 Sq. Ft. Single Family' :
                    'e.g. 1,800 Sq. Ft. BUA'
                  }
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Bedrooms Count</label>
                <input 
                  id="add-prop-beds"
                  type="number" 
                  value={newBedrooms}
                  onChange={e => setNewBedrooms(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Furnishing Style</label>
                <select 
                  id="add-prop-furnish"
                  value={newFurnishing}
                  onChange={e => setNewFurnishing(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="Fully-Furnished">Fully-Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Bared Unfurnished</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-300">Draft Listing Marketing copy</label>
                <textarea 
                  id="add-prop-desc"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Write persuasive property listing descriptions..."
                  rows={2}
                  className="w-full bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl resize-none text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* MEDIA PICTURE UPLOADER DUAL SECTION */}
              <div className="col-span-2 space-y-2 border-t border-slate-800 pt-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Property Photo Attachments</label>
                  <div className="flex bg-slate-900 rounded-lg p-0.5 select-none text-[10px] border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveUploadTab('files')}
                      className={`px-3 py-1.5 rounded-md transition font-black cursor-pointer ${activeUploadTab === 'files' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xs' : 'text-muted hover:text-white'}`}
                    >
                      Browse Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUploadTab('gallery')}
                      className={`px-3 py-1.5 rounded-md transition font-black cursor-pointer ${activeUploadTab === 'gallery' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xs' : 'text-muted hover:text-white'}`}
                    >
                      Select From Gallery
                    </button>
                  </div>
                </div>

                {/* Upload from local system path */}
                {activeUploadTab === 'files' && (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 bg-slate-900/40 rounded-2xl p-4 text-center cursor-pointer transition relative group">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleLocalFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Upload from files"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1.5 text-muted">
                        <UploadCloud className="text-muted group-hover:text-emerald-400 transition duration-150 animate-bounce" size={20} style={{ animationDuration: '3s' }} />
                        <div>
                          <p className="font-bold text-slate-300 text-[11px]">Click to upload pictures from devices or files</p>
                          <p className="text-[9px] text-muted mt-0.5">Acceptable formats: JPEG, PNG, WEBP (Auto-compressed)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Select from pre-populated gallery stock */}
                {activeUploadTab === 'gallery' && (
                  <div className="space-y-1.5 bg-slate-900/40 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-muted block font-semibold">Available Exclusive Gallery Assets (<span className="text-emerald-400">Select multiple</span>):</span>
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                      {REAL_ESTATE_STOCK_GALLERY.map((g) => {
                        const isSelected = propertyImages.includes(g.url);
                        return (
                          <div 
                            key={g.id}
                            onClick={() => handleToggleStockGalleryImage(g.url)}
                            className={`relative h-16 rounded-xl overflow-hidden cursor-pointer transition duration-150 border-2 ${isSelected ? 'border-emerald-500 scale-[0.98] ring-2 ring-emerald-500/25' : 'border-slate-800 opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
                          >
                            <img src={g.url} alt={g.tag} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1">
                              <span className="text-[8px] font-bold text-white block text-center truncate">{g.tag}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                                <Check size={8} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected/Uploaded image previews */}
                {propertyImages.length > 0 && (
                  <div className="space-y-1.5 bg-slate-900/50 border border-slate-800 p-2.5 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-300 font-extrabold flex items-center gap-1">
                        <ImageIcon size={11} className="text-emerald-400" /> Cataloged Media Assets ({propertyImages.length})
                      </span>
                      <button 
                        type="button"
                        onClick={() => setPropertyImages([])}
                        className="text-[9px] text-rose-400 font-bold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                      {propertyImages.map((img, i) => (
                        <div key={i} className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-800 group flex-shrink-0 bg-slate-950 shadow-xs">
                          <img src={img} alt="Catalog preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedImage(i)}
                            className="absolute inset-0 bg-rose-600/85 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150 cursor-pointer"
                            title="Remove picture"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                id="submit-property-btn"
                type="submit"
                className="col-span-2 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black py-3 rounded-xl transition duration-150 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.35)] cursor-pointer flex items-center justify-center gap-1"
              >
                Confirm Property Addition
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
