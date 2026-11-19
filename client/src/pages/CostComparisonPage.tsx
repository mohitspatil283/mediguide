import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { api } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { VerificationBadge } from '../components/VerificationBadge';
import { BookAppointmentModal } from '../components/BookAppointmentModal';
import { CITIES_DATA, DEFAULT_CITY, DEFAULT_PUNE_COORDS } from '../constants/locations';
import {
  Scale,
  Sparkles,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  IndianRupee,
  MapPin,
  Building2,
  Trash2,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Navigation,
  Eye,
  PlusCircle,
  Check,
} from 'lucide-react';

export const CostComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedFacilities, removeFacility, clearFacilities, toggleFacility } = useCompare();

  // Active view mode: 'auto' (Healthcare Amazon / Treatment comparison) or 'matrix' (Head-to-head)
  const [activeTab, setActiveTab] = useState<'auto' | 'matrix'>(
    searchParams.get('mode') === 'matrix' ? 'matrix' : 'auto'
  );

  const [selectedBookingFacility, setSelectedBookingFacility] = useState<any | null>(null);

  // Auto comparison state
  const [loadingAuto, setLoadingAuto] = useState<boolean>(true);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [activeService, setActiveService] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [autoFacilities, setAutoFacilities] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 8, total: 0, total_pages: 1, has_more: false });
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Filter state
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || DEFAULT_CITY);
  const [selectedLocality, setSelectedLocality] = useState<string>(searchParams.get('locality') || 'ALL');
  const [selectedRadius, setSelectedRadius] = useState<number>(Number(searchParams.get('radius')) || 25);
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('ALL');
  const [budgetTier, setBudgetTier] = useState<string>('ALL'); // 'ALL' | 'UNDER_1K' | '1K_5K' | '5K_10K' | 'ABOVE_10K'
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('price_asc');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');

  // Matrix comparison state
  const [availableFacilities, setAvailableFacilities] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [matrixServiceId, setMatrixServiceId] = useState<string>('');
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(false);

  // Get current city object
  const currentCityObj = useMemo(() => {
    return CITIES_DATA.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase()) || CITIES_DATA[0];
  }, [selectedCity]);

  // Compute active coordinates based on city / locality
  const activeCoords = useMemo(() => {
    if (selectedLocality !== 'ALL' && currentCityObj) {
      const loc = currentCityObj.localities.find((l) => l.name.toLowerCase() === selectedLocality.toLowerCase());
      if (loc) return { lat: loc.lat, lng: loc.lng };
    }
    return currentCityObj?.center || DEFAULT_PUNE_COORDS;
  }, [selectedLocality, currentCityObj]);

  // Derive min/max price from budgetTier
  const { minPrice, maxPrice } = useMemo(() => {
    switch (budgetTier) {
      case 'UNDER_1K':
        return { minPrice: undefined, maxPrice: 1000 };
      case '1K_5K':
        return { minPrice: 1000, maxPrice: 5000 };
      case '5K_10K':
        return { minPrice: 5000, maxPrice: 10000 };
      case 'ABOVE_10K':
        return { minPrice: 10000, maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  }, [budgetTier]);

  // Load Auto Comparison Data
  const fetchAutoComparison = async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingAuto(true);
      }

      const queryServiceId = searchParams.get('serviceId') ? Number(searchParams.get('serviceId')) : undefined;
      const queryServiceName = searchParams.get('service') || searchTerm || undefined;

      const res = await api.compareByService({
        service_id: queryServiceId || (activeService ? activeService.service_id : undefined),
        service_query: queryServiceName,
        city: selectedCity,
        locality: selectedLocality,
        lat: activeCoords?.lat,
        lng: activeCoords?.lng,
        radius: selectedRadius,
        facility_type: selectedFacilityType,
        min_price: minPrice,
        max_price: maxPrice,
        verified_only: verifiedOnly,
        sort: sortBy,
        page: pageToLoad,
        limit: 8,
      });

      if (res.success) {
        if (append) {
          setAutoFacilities((prev) => [...prev, ...(res.facilities || [])]);
        } else {
          setAutoFacilities(res.facilities || []);
        }
        setServicesList(res.all_services || []);
        setActiveService(res.service || null);
        setStats(res.stats || null);
        setPagination(res.pagination || { page: 1, limit: 8, total: 0, total_pages: 1, has_more: false });
      }
    } catch (err) {
      console.error('Failed to fetch automated comparison:', err);
    } finally {
      setLoadingAuto(false);
      setLoadingMore(false);
    }
  };

  // Initial load and whenever filters change
  useEffect(() => {
    if (activeTab === 'auto') {
      fetchAutoComparison(1, false);
    }
  }, [
    activeTab,
    selectedCity,
    selectedLocality,
    selectedRadius,
    selectedFacilityType,
    budgetTier,
    verifiedOnly,
    sortBy,
    searchParams,
  ]);

  // Load available facilities for matrix dropdown
  useEffect(() => {
    async function loadMatrixData() {
      try {
        const facRes = await api.searchFacilities({ radius: 50 });
        if (facRes.success && facRes.data) {
          setAvailableFacilities(facRes.data);
        }
      } catch (err) {
        console.error('Failed to load matrix facilities:', err);
      }
    }
    loadMatrixData();
  }, []);

  // Fetch matrix comparison when selected facilities change
  useEffect(() => {
    async function fetchMatrix() {
      if (selectedFacilities.length < 2) {
        setComparisonData(null);
        return;
      }

      try {
        setLoadingMatrix(true);
        const ids = selectedFacilities.map((f) => f.facility_id);
        const res = await api.compareCosts(
          ids,
          matrixServiceId ? parseInt(matrixServiceId, 10) : undefined
        );
        if (res.success) {
          setComparisonData(res);
        }
      } catch (err) {
        console.error('Fetch matrix compare error:', err);
      } finally {
        setLoadingMatrix(false);
      }
    }
    if (activeTab === 'matrix') {
      fetchMatrix();
    }
  }, [selectedFacilities, matrixServiceId, activeTab]);

  const handleSelectService = (svc: any) => {
    setActiveService(svc);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('serviceId', String(svc.service_id));
    newParams.delete('service');
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedLocality('ALL');
    setSelectedRadius(25);
    setSelectedFacilityType('ALL');
    setBudgetTier('ALL');
    setVerifiedOnly(false);
    setSortBy('price_asc');
    setSearchTerm('');
    const newParams = new URLSearchParams();
    if (activeService) newParams.set('serviceId', String(activeService.service_id));
    setSearchParams(newParams);
  };

  const handleLoadMore = () => {
    if (pagination.has_more && !loadingMore) {
      fetchAutoComparison(pagination.page + 1, true);
    }
  };

  const loadPresetComparison = () => {
    const ruby = availableFacilities.find((f) => f.facility_name.includes('Ruby Hall'));
    const jupiter = availableFacilities.find((f) => f.facility_name.includes('Jupiter'));
    const sancheti = availableFacilities.find((f) => f.facility_name.includes('Sancheti'));

    clearFacilities();
    if (ruby) toggleFacility(ruby);
    if (jupiter) toggleFacility(jupiter);
    if (sancheti) toggleFacility(sancheti);
  };

  const handleAddFacilityToMatrix = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    if (!id) return;
    const fac = availableFacilities.find((f) => f.facility_id === id);
    if (fac) {
      toggleFacility({
        facility_id: fac.facility_id,
        facility_name: fac.facility_name,
        facility_type: fac.facility_type,
        city: fac.city,
      });
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MediGuide Cost Transparency Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Healthcare Price Transparency</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Compare medical procedures, consultations, and diagnostic tests automatically across verified healthcare facilities.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'auto'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Auto Price Comparison</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-brand-600" />
            <span>Head-to-Head (1-on-1)</span>
            {selectedFacilities.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-extrabold">
                {selectedFacilities.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <DisclaimerBanner compact={true} />

      {/* ========================================================================= */}
      {/* MODE 1: AUTOMATIC "HEALTHCARE AMAZON" TREATMENT COMPARISON                */}
      {/* ========================================================================= */}
      {activeTab === 'auto' && (
        <div className="space-y-6">
          {/* Quick Procedure Selector Chips */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                <span>Select Medical Procedure / Test:</span>
              </span>

              {/* Service Dropdown for full list */}
              <div className="relative">
                <select
                  value={activeService ? activeService.service_id : ''}
                  onChange={(e) => {
                    const svc = servicesList.find((s) => s.service_id === Number(e.target.value));
                    if (svc) handleSelectService(svc);
                  }}
                  className="py-1.5 px-3 rounded-xl border border-slate-300 text-slate-800 bg-white font-medium text-xs focus:ring-2 focus:ring-brand-500"
                >
                  {servicesList.map((svc) => (
                    <option key={svc.service_id} value={svc.service_id}>
                      {svc.name} ({svc.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Pills for Top Procedures */}
            <div className="flex flex-wrap items-center gap-2">
              {servicesList.slice(0, 8).map((svc) => {
                const isSelected = activeService?.service_id === svc.service_id;
                return (
                  <button
                    key={svc.service_id}
                    onClick={() => handleSelectService(svc)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{svc.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {svc.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Service Description */}
            {activeService && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <p className="line-clamp-1 italic">
                  Showing price transparency data for <strong className="text-slate-800 font-semibold">{activeService.name}</strong>: {activeService.description || 'Standardized clinical procedure.'}
                </p>
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg shrink-0">
                  {stats?.total_providers || 0} Facilities Available
                </span>
              </div>
            )}
          </div>

          {/* Smart Recommendation Hero Banner (Guidance Layer) */}
          {stats && stats.total_providers > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Lowest Price Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                    🏷️ Lowest Price in City
                  </span>
                  <span className="bg-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Best Rate
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-black">
                    ₹{stats.min_cost.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-100 mt-0.5 font-medium">
                    Verified lowest starting tariff
                  </p>
                </div>
              </div>

              {/* Potential Savings Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-100">
                    💰 Max Savings Potential
                  </span>
                  <span className="bg-indigo-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Up to {stats.savings_percentage}% Off
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-black">
                    Save ₹{stats.potential_savings.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-indigo-100 mt-0.5 font-medium">
                    By comparing providers
                  </p>
                </div>
              </div>

              {/* City Benchmark Average */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    📊 City Benchmark Avg
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedCity}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-black text-slate-900">
                    ₹{stats.avg_cost.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Mean tariff across facilities
                  </p>
                </div>
              </div>

              {/* Highest Tier Corporate */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    🏢 Super-Speciality Peak
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Corporate Max
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-black text-slate-900">
                    ₹{stats.max_cost.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Deluxe tertiary care rates
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main 2-Column Section: Filters on Left, Results on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Smart Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-5 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                    <span>Smart Filters</span>
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* City & Locality */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>City & Locality</span>
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedLocality('ALL');
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                  >
                    {CITIES_DATA.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.state})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="ALL">All Localities in {selectedCity}</option>
                    {currentCityObj?.localities.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distance Radius */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-slate-400" />
                      <span>Radius</span>
                    </label>
                    <span className="text-xs font-bold text-brand-700">{selectedRadius} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>5 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Budget Bracket */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>Budget Bracket</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'ALL', label: 'All Budgets' },
                      { id: 'UNDER_1K', label: 'Under ₹1,000' },
                      { id: '1K_5K', label: '₹1,000 – ₹5,000' },
                      { id: '5K_10K', label: '₹5,000 – ₹10,000' },
                      { id: 'ABOVE_10K', label: 'Above ₹10,000' },
                    ].map((tier) => (
                      <label
                        key={tier.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          budgetTier === tier.id
                            ? 'bg-brand-50 text-brand-800 border border-brand-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{tier.label}</span>
                        <input
                          type="radio"
                          name="budgetTier"
                          checked={budgetTier === tier.id}
                          onChange={() => setBudgetTier(tier.id)}
                          className="accent-brand-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Facility Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Facility Type</span>
                  </label>
                  <select
                    value={selectedFacilityType}
                    onChange={(e) => setSelectedFacilityType(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="ALL">All Facility Types</option>
                    <option value="HOSPITAL">Hospitals</option>
                    <option value="DIAGNOSTIC_CENTRE">Diagnostic & Imaging Centres</option>
                    <option value="CLINIC">Polyclinics & Clinics</option>
                    <option value="LABORATORY">Pathology Laboratories</option>
                    <option value="PHARMACY">Pharmacies</option>
                  </select>
                </div>

                {/* Verified Only Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">Verified Tariffs Only</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Results List with Sorting & Cards */}
            <div className="lg:col-span-3 space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-xs text-slate-600">
                  Showing <strong className="text-slate-900 font-bold">{autoFacilities.length}</strong> of{' '}
                  <strong className="text-slate-900 font-bold">{pagination.total}</strong> providers for{' '}
                  <span className="font-extrabold text-brand-700">{activeService?.name || 'Selected Service'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Sort:</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="price_asc">Lowest Price First (Default)</option>
                    <option value="price_desc">Highest Price First</option>
                    <option value="distance_asc">Nearest Distance First</option>
                    <option value="name_asc">Facility Name (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Facility Cards Feed */}
              {loadingAuto ? (
                <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                  <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Comparing prices across healthcare providers...</p>
                  <p className="text-xs text-slate-400">Fetching latest tariffs, calculating savings & benchmark rates</p>
                </div>
              ) : autoFacilities.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">No matching facilities found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No facilities offering this procedure matched your current filters. Try widening your radius or clearing budget filters.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {autoFacilities.map((fac, idx) => {
                    const isCheapest = fac.smart_badges?.includes('LOWEST_PRICE');
                    const isBestValue = fac.smart_badges?.includes('BEST_VALUE');
                    const isVerified = fac.smart_badges?.includes('VERIFIED_TARIFF');
                    const isTrust = fac.smart_badges?.includes('TRUST_SUBSIDIZED');
                    const isAlreadyInCompare = selectedFacilities.some(
                      (s) => s.facility_id === fac.facility_id
                    );

                    return (
                      <div
                        key={fac.facility_id}
                        className={`bg-white rounded-2xl border transition-all hover:shadow-md p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                          isCheapest
                            ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
                            : isBestValue
                            ? 'border-indigo-300 ring-2 ring-indigo-100'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Left: Info & Badges */}
                        <div className="space-y-2 flex-1">
                          {/* Badges Row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isCheapest && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white tracking-wide uppercase">
                                🏷️ Lowest Price
                              </span>
                            )}
                            {isBestValue && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white tracking-wide uppercase">
                                🌟 Best Value
                              </span>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                <Check className="w-3 h-3" />
                                <span>Verified Tariff</span>
                              </span>
                            )}
                            {isTrust && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                                🏥 Subsidized / Trust
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {fac.facility_type}
                            </span>
                          </div>

                          {/* Facility Name & Location */}
                          <div>
                            <Link
                              to={`/facility/${fac.facility_id}`}
                              className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-brand-700 transition-colors line-clamp-1"
                            >
                              {fac.facility_name}
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{fac.locality ? `${fac.locality}, ${fac.city}` : fac.city}</span>
                              </span>
                              {fac.distance_km !== null && (
                                <span className="flex items-center gap-1 font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                                  <Navigation className="w-3 h-3" />
                                  <span>{fac.distance_km} km away</span>
                                </span>
                              )}
                              <span className="text-slate-400">•</span>
                              <span className="text-[11px] text-slate-400">{fac.operating_hours}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle/Right: Price & Comparison */}
                        <div className="flex flex-row md:flex-col items-baseline md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                          {fac.cost_record ? (
                            <div className="text-left md:text-right">
                              <p className="text-2xl font-black text-slate-900 tracking-tight">
                                {fac.cost_record.formatted_cost}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {fac.cost_record.unit_basis || 'per consultation'}
                              </p>

                              {/* vs city average badge */}
                              {fac.vs_city_avg_percent !== undefined && (
                                <div className="mt-1">
                                  {fac.vs_city_avg_percent > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                      <TrendingDown className="w-3 h-3" />
                                      <span>{fac.vs_city_avg_percent}% below city avg</span>
                                    </span>
                                  ) : fac.vs_city_avg_percent < 0 ? (
                                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {Math.abs(fac.vs_city_avg_percent)}% above city avg
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold text-slate-500">
                                      Matches city average
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-left md:text-right">
                              <span className="text-xs font-semibold text-slate-400 italic">
                                Rate on request
                              </span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingFacility(fac)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book</span>
                            </button>

                            <Link
                              to={`/facility/${fac.facility_id}`}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-brand-700 hover:border-brand-300 text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </Link>

                            <button
                              onClick={() => {
                                toggleFacility({
                                  facility_id: fac.facility_id,
                                  facility_name: fac.facility_name,
                                  facility_type: fac.facility_type,
                                  city: fac.city,
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                isAlreadyInCompare
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200'
                              }`}
                            >
                              {isAlreadyInCompare ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Compared</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>+ 1-on-1 Compare</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Scalable "Load More" Pagination Control */}
              {pagination.has_more && (
                <div className="pt-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 text-slate-800 hover:text-brand-700 font-extrabold text-xs shadow-xs hover:shadow-md transition-all inline-flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                        <span>Loading more providers...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Providers ({pagination.total - autoFacilities.length} remaining)</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CUSTOM HEAD-TO-HEAD MATRIX VIEW (1-ON-1 COMPARISON)              */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Facility Selection Toolbar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selected Facilities ({selectedFacilities.length}/4):
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Preset comparison button */}
                <button
                  onClick={loadPresetComparison}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold transition-colors"
                >
                  Load Pune Benchmarks (Ruby Hall vs Jupiter vs Sancheti)
                </button>

                {/* Add Facility Dropdown */}
                {selectedFacilities.length < 4 && (
                  <div className="relative">
                    <select
                      onChange={handleAddFacilityToMatrix}
                      defaultValue=""
                      className="py-1.5 px-3 pr-8 rounded-xl border border-brand-300 text-brand-900 bg-brand-50/60 font-semibold text-xs cursor-pointer focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="" disabled>
                        + Add Facility to Compare...
                      </option>
                      {availableFacilities
                        .filter(
                          (f) => !selectedFacilities.some((s) => s.facility_id === f.facility_id)
                        )
                        .map((fac) => (
                          <option key={fac.facility_id} value={fac.facility_id}>
                            {fac.facility_name} ({fac.facility_type})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Filter by Specific Service */}
                <select
                  value={matrixServiceId}
                  onChange={(e) => setMatrixServiceId(e.target.value)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-800 bg-white font-medium text-xs focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">All Standard Services</option>
                  {servicesList.map((svc) => (
                    <option key={svc.service_id} value={svc.service_id}>
                      {svc.name}
                    </option>
                  ))}
                </select>

                {selectedFacilities.length > 0 && (
                  <button
                    onClick={clearFacilities}
                    className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Selected chips row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {selectedFacilities.map((fac) => (
                <div
                  key={fac.facility_id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{fac.facility_name}</span>
                  <button
                    onClick={() => removeFacility(fac.facility_id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                    title="Remove from comparison"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {selectedFacilities.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No facilities selected. Select at least 2 facilities to view side-by-side cost comparisons, or use the benchmark button above.
                </p>
              )}
            </div>
          </div>

          {/* Matrix Table */}
          {selectedFacilities.length < 2 ? (
            <div className="py-20 text-center rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Select At Least 2 Facilities</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Use the dropdown above or check "Compare" on any facility card in the directory to compare service rates.
                </p>
              </div>
              <button
                onClick={loadPresetComparison}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Load Benchmark Comparison (3 Pune Hospitals)
              </button>
            </div>
          ) : loadingMatrix ? (
            <div className="py-20 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
              <p className="font-semibold text-slate-600 text-xs">Generating cost matrix...</p>
            </div>
          ) : comparisonData ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <th className="py-4 px-5 text-xs font-bold uppercase text-slate-500 w-1/4">
                        Healthcare Service
                      </th>
                      {comparisonData.facilities.map((fac: any) => (
                        <th key={fac.facility_id} className="py-4 px-5 min-w-[220px]">
                          <div className="space-y-1">
                            <Link
                              to={`/facility/${fac.facility_id}`}
                              className="font-extrabold text-slate-900 hover:text-brand-700 text-base leading-snug line-clamp-1"
                            >
                              {fac.facility_name}
                            </Link>
                            <p className="text-xs text-slate-500 font-medium">{fac.city}</p>
                            <VerificationBadge status={fac.status} size="sm" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonData.matrix.map((row: any) => (
                      <tr key={row.service_id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-5 align-top">
                          <p className="font-bold text-slate-900">{row.service_name}</p>
                          <p className="text-xs text-slate-400 font-medium">{row.service_category}</p>
                        </td>

                        {comparisonData.facilities.map((fac: any) => {
                          const item = row.facilities[fac.facility_id];

                          if (!item || !item.offered) {
                            return (
                              <td key={fac.facility_id} className="py-4 px-5 align-top text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                  Service not offered
                                </span>
                              </td>
                            );
                          }

                          if (!item.cost_available) {
                            return (
                              <td key={fac.facility_id} className="py-4 px-5 align-top text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1 text-slate-400 italic">
                                  Cost information unavailable
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={fac.facility_id} className="py-4 px-5 align-top space-y-1">
                              <p className="text-base font-extrabold text-emerald-700">
                                {item.formatted_cost}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                Unit: {item.unit_basis}
                              </p>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <VerificationBadge status={item.verification_status} size="sm" />
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={item.source}>
                                Source: {item.source}
                              </p>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Disclaimer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <p>
                  Note: Rates shown reflect approximate tariff ranges collected through official publications and facility representatives.
                </p>
                <span className="font-semibold text-slate-600">INR (₹) Standardized</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Book Appointment Modal */}
      {selectedBookingFacility && (
        <BookAppointmentModal
          facility={selectedBookingFacility}
          isOpen={!!selectedBookingFacility}
          onClose={() => setSelectedBookingFacility(null)}
          initialServiceId={activeService?.service_id}
          initialServiceName={activeService?.name}
        />
      )}
    </div>
  );
};
