import React, { useState } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  Building,
} from 'lucide-react';
import { CITIES_DATA, DEFAULT_CITY, DEFAULT_PUNE_COORDS } from '../constants/locations';

export interface SearchParams {
  keyword: string;
  category: string;
  lat?: number;
  lng?: number;
  radius: number;
  service?: string;
  cost_available?: boolean;
  city?: string;
  locality?: string;
}

interface SearchBarProps {
  initialKeyword?: string;
  initialCategory?: string;
  initialRadius?: string | number;
  initialService?: string;
  initialCostOnly?: boolean;
  initialCity?: string;
  initialLocality?: string;
  onSearch: (params: SearchParams) => void;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialKeyword = '',
  initialCategory = 'ALL',
  initialRadius = 25,
  initialService = 'ALL',
  initialCostOnly = false,
  initialCity = DEFAULT_CITY,
  initialLocality = 'ALL',
  onSearch,
  compact = false,
}) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState(initialCategory);
  const [radius, setRadius] = useState<number>(Number(initialRadius) || 25);
  const [service, setService] = useState(initialService);
  const [costOnly, setCostOnly] = useState(initialCostOnly);
  const [city, setCity] = useState(initialCity || DEFAULT_CITY);
  const [locality, setLocality] = useState(initialLocality || 'ALL');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    city === 'Pune' ? DEFAULT_PUNE_COORDS : null
  );

  const [showFilters, setShowFilters] = useState(false);

  const currentCityObj =
    CITIES_DATA.find((c) => c.name.toLowerCase() === city.toLowerCase()) || CITIES_DATA[0];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setLocality('ALL');
    const found = CITIES_DATA.find((c) => c.name.toLowerCase() === newCity.toLowerCase());
    if (found) {
      setCoords(found.center);
    } else {
      setCoords(null);
    }
  };

  const handleLocalityChange = (newLocality: string) => {
    setLocality(newLocality);
    if (newLocality === 'ALL') {
      if (currentCityObj) {
        setCoords(currentCityObj.center);
      }
    } else {
      const foundLoc = currentCityObj?.localities.find(
        (l) => l.name.toLowerCase() === newLocality.toLowerCase()
      );
      if (foundLoc) {
        setCoords({ lat: foundLoc.lat, lng: foundLoc.lng });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      keyword: keyword.trim(),
      category,
      lat: coords?.lat,
      lng: coords?.lng,
      radius,
      service: service !== 'ALL' ? service : undefined,
      cost_available: costOnly ? true : undefined,
      city: city !== 'ALL' ? city : undefined,
      locality: locality !== 'ALL' ? locality : undefined,
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-border-subtle shadow-card p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Compact, Single-Row Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 items-center">
          {/* 1. Keyword search (Facility or service) */}
          <div className="sm:col-span-2 md:col-span-5">
            <div className="relative">
              <input
                type="text"
                id="search-keyword-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Hospital name, procedure, specialty..."
                aria-label="Search facility, procedure, or specialty"
                className="w-full h-12 pl-10 pr-3 rounded-xl border border-border-subtle bg-warm-25 hover:bg-white focus:bg-white text-charcoal-dark placeholder:text-charcoal-secondary text-sm font-medium focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 transition-colors"
              />
              <Search className="w-4.5 h-4.5 text-charcoal-secondary absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* 2. City Selector */}
          <div className="sm:col-span-1 md:col-span-3">
            <div className="relative">
              <select
                id="search-city-select"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                aria-label="Select city"
                className="w-full h-12 appearance-none pl-9 pr-8 rounded-xl border border-border-subtle bg-warm-25 hover:bg-white focus:bg-white text-charcoal-dark text-sm font-semibold focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 transition-colors cursor-pointer"
              >
                <optgroup label="Primary City">
                  <option value="Pune">Pune (31+ Areas)</option>
                </optgroup>
                <optgroup label="Other Cities">
                  <option value="Mumbai">Mumbai</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                  <option value="Thane">Thane</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Satara">Satara</option>
                  <option value="Sangli">Sangli</option>
                  <option value="Ahilyanagar">Ahilyanagar</option>
                </optgroup>
              </select>
              <MapPin className="w-4 h-4 text-emerald-accent absolute left-3 top-4 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-secondary absolute right-3 top-4.5 pointer-events-none" />
            </div>
          </div>

          {/* 3. Area / Locality Selector */}
          <div className="sm:col-span-1 md:col-span-2">
            <div className="relative">
              <select
                id="search-locality-select"
                value={locality}
                onChange={(e) => handleLocalityChange(e.target.value)}
                aria-label="Select locality"
                className="w-full h-12 appearance-none pl-8 pr-7 rounded-xl border border-border-subtle bg-warm-25 hover:bg-white focus:bg-white text-charcoal-dark text-sm font-semibold focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20 transition-colors cursor-pointer"
              >
                <option value="ALL">All Localities</option>
                {currentCityObj?.localities.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <Building className="w-4 h-4 text-charcoal-secondary absolute left-2.5 top-4 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-secondary absolute right-2.5 top-4.5 pointer-events-none" />
            </div>
          </div>

          {/* 4. Action Button & Optional Filter Toggle */}
          <div className="sm:col-span-2 md:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 w-12 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                showFilters || costOnly || service !== 'ALL' || category !== 'ALL'
                  ? 'border-teal-deep bg-mint-soft text-teal-deep'
                  : 'border-border-subtle bg-warm-25 hover:bg-sage-pale text-charcoal-secondary'
              }`}
              title="More search filters"
              aria-label="Toggle advanced filters"
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>

            <button
              type="submit"
              id="search-submit-button"
              className="flex-1 h-12 px-5 rounded-xl bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark text-white font-bold text-sm shadow-brand hover:shadow-lg transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-deep"
            >
              <Search className="w-4 h-4 text-mint-soft" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Drawer (Only when user explicitly toggles) */}
        {showFilters && (
          <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in slide-in-from-top-1">
            {/* Category */}
            <div>
              <label
                htmlFor="search-category-select"
                className="block text-charcoal-secondary font-semibold mb-1"
              >
                Facility Category
              </label>
              <div className="relative">
                <select
                  id="search-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 appearance-none pr-7 py-1 px-3 rounded-lg border border-border-subtle bg-white text-charcoal-dark text-xs font-medium focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20"
                >
                  <option value="ALL">All Categories</option>
                  <option value="HOSPITAL">Hospitals</option>
                  <option value="CLINIC">Clinics &amp; Polyclinics</option>
                  <option value="DIAGNOSTIC_CENTRE">Diagnostic Centres</option>
                  <option value="PHARMACY">Pharmacies</option>
                  <option value="BLOOD_CENTRE">Blood Centres</option>
                  <option value="LABORATORY">Pathology Labs</option>
                  <option value="OTHER">Other Care</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-secondary absolute right-2.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Medical Service */}
            <div>
              <label
                htmlFor="search-service-select"
                className="block text-charcoal-secondary font-semibold mb-1"
              >
                Medical Service
              </label>
              <div className="relative">
                <select
                  id="search-service-select"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full h-10 appearance-none pr-7 py-1 px-3 rounded-lg border border-border-subtle bg-white text-charcoal-dark text-xs font-medium focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20"
                >
                  <option value="ALL">All Services</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="ECG">ECG</option>
                  <option value="MRI">MRI Scan</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Complete Blood Count (CBC)">Complete Blood Count</option>
                  <option value="Echocardiogram (2D Echo)">2D Echo</option>
                  <option value="Dental Scaling & Cleaning">Dental Scaling</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-secondary absolute right-2.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Radius */}
            <div>
              <label
                htmlFor="search-radius-select"
                className="block text-charcoal-secondary font-semibold mb-1"
              >
                Search Radius
              </label>
              <div className="relative">
                <select
                  id="search-radius-select"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-10 appearance-none pr-7 py-1 px-3 rounded-lg border border-border-subtle bg-white text-charcoal-dark text-xs font-medium focus:border-teal-deep focus:ring-1 focus:ring-teal-deep/20"
                >
                  <option value={1}>Within 1 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={15}>Within 15 km</option>
                  <option value={25}>Within 25 km (Standard)</option>
                  <option value={50}>Within 50 km</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-secondary absolute right-2.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Cost Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border-subtle hover:bg-sage-pale cursor-pointer select-none w-full">
                <input
                  type="checkbox"
                  id="chk-cost-available"
                  checked={costOnly}
                  onChange={(e) => setCostOnly(e.target.checked)}
                  className="rounded text-emerald-accent focus:ring-teal-deep w-4 h-4 border-border-subtle"
                />
                <span className="text-charcoal-dark text-xs font-medium">With verified tariffs only</span>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
