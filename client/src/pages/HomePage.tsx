import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { SearchBar, SearchParams } from '../components/SearchBar';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FacilityCard } from '../components/FacilityCard';
import { api } from '../services/api';
import {
  Building2,
  Stethoscope,
  Pill,
  Microscope,
  Droplet,
  FlaskConical,
  Activity,
  ArrowRight,
  MapPin,
  Scale,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Users2,
  Sparkles,
  Search,
  AlertOctagon,
  PhoneCall,
} from 'lucide-react';
import { EmergencySOSModal } from '../components/EmergencySOSModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuredFacilities, setFeaturedFacilities] = useState<any[]>([]);
  const [publicStats, setPublicStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  useEffect(() => {
    if (location.hash === '#categories') {
      const timer = setTimeout(() => {
        const el = document.getElementById('categories');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const [facRes, statsRes] = await Promise.all([
          api.searchFacilities({ city: 'Pune', radius: 25, sort: 'services_count' }),
          api.getPublicStats().catch(() => null),
        ]);
        if (isMounted) {
          if (facRes.success && facRes.data) {
            setFeaturedFacilities(facRes.data.slice(0, 4));
          }
          if (statsRes?.success && statsRes.data) {
            setPublicStats(statsRes.data);
          }
        }
      } catch (err) {
        console.error('Featured facilities load error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (params: SearchParams) => {
    const q = new URLSearchParams();
    if (params.keyword) q.append('keyword', params.keyword);
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.lat && params.lng) {
      q.append('lat', String(params.lat));
      q.append('lng', String(params.lng));
    }
    if (params.radius) q.append('radius', String(params.radius));
    if (params.service && params.service !== 'ALL') q.append('service', params.service);
    if (params.cost_available) q.append('cost_available', 'true');
    if (params.city && params.city !== 'ALL') q.append('city', params.city);
    if (params.locality && params.locality !== 'ALL') q.append('locality', params.locality);
    navigate(`/search?${q.toString()}`);
  };

  const categories = [
    {
      type: 'HOSPITAL',
      title: 'Hospitals',
      desc: 'Multi-speciality, acute, and secondary inpatient medical centres.',
      icon: <Building2 className="w-5 h-5 text-forest-deep" />,
      bg: 'bg-mint-soft/70 hover:bg-mint-soft border-border-subtle',
      iconBg: 'bg-white',
    },
    {
      type: 'CLINIC',
      title: 'Clinics & Polyclinics',
      desc: 'Primary outpatient consultations and community family practice.',
      icon: <Stethoscope className="w-5 h-5 text-teal-deep" />,
      bg: 'bg-sage-pale hover:bg-mint-soft/50 border-border-subtle',
      iconBg: 'bg-white',
    },
    {
      type: 'PHARMACY',
      title: 'Pharmacies',
      desc: '24/7 licensed retail dispensaries and prescription medicine stores.',
      icon: <Pill className="w-5 h-5 text-emerald-accent" />,
      bg: 'bg-mint-soft/50 hover:bg-mint-soft border-border-subtle',
      iconBg: 'bg-white',
    },
    {
      type: 'DIAGNOSTIC_CENTRE',
      title: 'Diagnostic Imaging Centres',
      desc: 'MRI, CT scans, ultrasound sonography, and digital X-ray radiology.',
      icon: <Microscope className="w-5 h-5 text-teal-deep" />,
      bg: 'bg-sage-pale hover:bg-mint-soft/50 border-border-subtle',
      iconBg: 'bg-white',
    },
    {
      type: 'LABORATORY',
      title: 'Pathology Labs',
      desc: 'Diagnostic blood panels, CBC, biochemical, and biopsy tests.',
      icon: <FlaskConical className="w-5 h-5 text-forest-deep" />,
      bg: 'bg-mint-soft/60 hover:bg-mint-soft border-border-subtle',
      iconBg: 'bg-white',
    },
    {
      type: 'BLOOD_CENTRE',
      title: 'Blood Centres',
      desc: 'Licensed blood banks, component separation, and supply.',
      icon: <Droplet className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50/70 hover:bg-rose-50 border-rose-100',
      iconBg: 'bg-white',
    },
    {
      type: 'OTHER',
      title: 'Urgent & Specialized Care',
      desc: 'Daycare procedures, rehabilitation centres, and urgent triage.',
      icon: <Activity className="w-5 h-5 text-teal-deep" />,
      bg: 'bg-sage-pale hover:bg-mint-soft/50 border-border-subtle',
      iconBg: 'bg-white',
    },
  ];

  return (
    <div className="pb-20">

      {/* ================================================================= */}
      {/* HERO SECTION — Photography + Search                               */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden border-b border-border-subtle">

        {/* Full-bleed hero photo background for mobile */}
        <div className="absolute inset-0 lg:hidden">
          <img
            src="/images/hero-photo.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          {/* Deep teal overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-deep/80 via-forest-deep/85 to-forest-dark/90" />
        </div>

        {/* Desktop: split layout */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] lg:min-h-[600px] items-center gap-0 lg:gap-12">

            {/* ── Left Content Panel ─────────────────────────────────── */}
            <div className="lg:col-span-6 relative z-10 py-16 sm:py-20 lg:py-24 space-y-6">

              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                bg-white/15 lg:bg-white border border-white/30 lg:border-border-subtle
                text-white lg:text-teal-deep text-xs font-semibold
                shadow-subtle backdrop-blur-sm lg:backdrop-blur-none">
                <Sparkles className="w-3.5 h-3.5 text-mint-soft lg:text-emerald-accent" />
                <span>Healthcare Navigation &bull; Pune &amp; Maharashtra</span>
              </div>

              {/* Hero heading */}
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold
                text-white lg:text-charcoal-dark tracking-tight leading-[1.15]">
                Find the Right{' '}
                <span className="block text-mint-soft lg:text-teal-deep">
                  Healthcare Facility.
                </span>
                <span className="block text-white/90 lg:text-charcoal-dark">
                  Understand the Cost.
                </span>
              </h1>

              {/* Supporting copy */}
              <p className="text-sm sm:text-base text-white/85 lg:text-charcoal-secondary
                max-w-xl leading-relaxed">
                Discover healthcare facilities, explore available services, and compare
                available price information to make more informed decisions.
              </p>

              {/* Search bar */}
              <div className="pt-1 space-y-2">
                <SearchBar onSearch={handleSearch} compact={true} />
                
                {/* Instant Procedure Comparison Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-white/90 lg:text-slate-500 font-bold text-[11px] flex items-center gap-1">
                    <span>⚡ Compare Automatically:</span>
                  </span>
                  {[
                    { label: 'MRI Scan', query: 'MRI' },
                    { label: 'CT Scan', query: 'CT Scan' },
                    { label: 'Ultrasound', query: 'Ultrasound' },
                    { label: 'Blood Test (CBC)', query: 'Blood Test' },
                    { label: 'Consultation', query: 'General Consultation' },
                  ].map((p) => (
                    <Link
                      key={p.label}
                      to={`/compare?service=${encodeURIComponent(p.query)}`}
                      className="px-2.5 py-1 rounded-lg bg-white/20 lg:bg-slate-100 hover:bg-white lg:hover:bg-brand-50 text-white lg:text-brand-800 font-semibold text-[11px] border border-white/20 lg:border-slate-200 transition-colors shadow-2xs"
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2
                text-xs font-semibold text-white/80 lg:text-charcoal-secondary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-mint-soft lg:text-emerald-accent shrink-0" />
                  31+ Pune Localities covered
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-mint-soft lg:text-emerald-accent shrink-0" />
                  Verified procedure tariffs
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-mint-soft lg:text-emerald-accent shrink-0" />
                  Transparent approximate pricing
                </span>
              </div>
            </div>

            {/* ── Right Photo Panel (desktop only) ───────────────────── */}
            <div className="hidden lg:flex lg:col-span-6 items-stretch self-stretch">
              <div className="relative w-full overflow-hidden">
                {/* Photo — takes full column height */}
                <img
                  src={imgError ? '/images/hero-visual.jpg' : '/images/hero-photo.jpg'}
                  alt="Modern multi-storey hospital exterior with green landscaping"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={() => setImgError(true)}
                />
                {/* Inner gradient to blend with left panel */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/10 to-transparent pointer-events-none" />
                {/* Bottom overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/20 via-transparent to-transparent pointer-events-none" />

                {/* Floating badge */}
                <div className="absolute bottom-6 right-6 max-w-[200px]
                  rounded-2xl bg-white/95 backdrop-blur-sm border border-border-subtle
                  shadow-card p-3.5 space-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-deep">
                    <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
                    Pune Discovery Beacon
                  </span>
                  <p className="text-[10px] text-charcoal-secondary font-medium leading-snug">
                    31+ Localities · Multi-Tier Tariffs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Ribbon ──────────────────────────────────────────────── */}
        <div className="relative z-10 bg-white border-t border-border-subtle">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border-subtle glass-bg p-4 rounded-xl shadow-card transition-ease">
                <Link
                  to="/search?verification_status=VERIFIED"
                  className="px-4 py-5 sm:px-6 sm:py-6 hover:bg-sage-pale transition-colors group text-center"
                  title="View all verified healthcare providers"
                >
                <p className="text-2xl sm:text-3xl font-heading font-bold text-charcoal-dark
                  group-hover:text-teal-deep transition-colors">
                  {publicStats ? `${publicStats.verifiedFacilities}+` : '40+'}
                </p>
                <p className="text-xs font-semibold text-charcoal-secondary mt-0.5">
                  Verified Facilities
                </p>
                <span className="text-[11px] text-emerald-accent font-bold
                  inline-flex items-center gap-0.5 mt-1">
                  Browse verified &rarr;
                </span>
              </Link>

              <Link
                to="/search?cost_available=true"
                className="px-4 py-5 sm:px-6 sm:py-6 hover:bg-sage-pale transition-colors group text-center"
                title="Filter facilities with verified pricing tariffs"
              >
                <p className="text-2xl sm:text-3xl font-heading font-bold text-teal-deep
                  group-hover:text-emerald-accent transition-colors">
                  {publicStats ? `₹ ${publicStats.verifiedCosts}+` : '₹ Transparent'}
                </p>
                <p className="text-xs font-semibold text-charcoal-secondary mt-0.5">
                  Published Tariffs
                </p>
                <span className="text-[11px] text-emerald-accent font-bold
                  inline-flex items-center gap-0.5 mt-1">
                  Explore pricing &rarr;
                </span>
              </Link>

              <Link
                to="/search?city=Pune"
                className="px-4 py-5 sm:px-6 sm:py-6 hover:bg-sage-pale transition-colors group text-center"
                title="Search across Pune's 31+ localities"
              >
                <p className="text-2xl sm:text-3xl font-heading font-bold text-charcoal-dark
                  group-hover:text-teal-deep transition-colors">
                  {publicStats ? `${publicStats.puneLocalities}+` : '31+'}{' '}
                  <span className="text-lg">Areas</span>
                </p>
                <p className="text-xs font-semibold text-charcoal-secondary mt-0.5">
                  Pune Coverage
                </p>
                <span className="text-[11px] text-emerald-accent font-bold
                  inline-flex items-center gap-0.5 mt-1">
                  View localities &rarr;
                </span>
              </Link>

              <Link
                to="/search"
                className="px-4 py-5 sm:px-6 sm:py-6 hover:bg-sage-pale transition-colors group text-center"
                title="Browse all healthcare categories"
              >
                <p className="text-2xl sm:text-3xl font-heading font-bold text-teal-deep
                  group-hover:text-emerald-accent transition-colors">
                  7 Types
                </p>
                <p className="text-xs font-semibold text-charcoal-secondary mt-0.5">
                  Care Categories
                </p>
                <span className="text-[11px] text-emerald-accent font-bold
                  inline-flex items-center gap-0.5 mt-1">
                  All categories &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MANDATORY REGULATORY & SCOPE DISCLAIMER                           */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        <DisclaimerBanner />
      </section>

      {/* ================================================================= */}
      {/* HEALTHCARE CATEGORIES                                              */}
      {/* ================================================================= */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3
          border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-accent uppercase tracking-wider">
              Directory Structure
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark mt-1">
              Healthcare Facility Categories
            </h2>
          </div>
          <Link
            to="/search"
            className="text-xs sm:text-sm font-semibold text-teal-deep
              hover:text-emerald-accent flex items-center gap-1 group shrink-0"
          >
            <span>View All Directory Facilities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.type}
              to={`/search?category=${c.type}`}
              className={`p-5 rounded-2xl border ${c.bg}
                hover:border-emerald-accent/50 hover:shadow-card-hover
                transition-all duration-200 flex flex-col justify-between group`}
            >
              <div className="space-y-3">
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} border border-border-subtle
                  flex items-center justify-center
                  transition-transform group-hover:scale-105 shadow-subtle`}>
                  {c.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-dark
                    group-hover:text-teal-deep transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-charcoal-secondary mt-1 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
              <div className="pt-3.5 flex items-center justify-between text-xs font-bold
                text-charcoal-secondary group-hover:text-teal-deep
                border-t border-border-subtle/60 mt-3">
                <span>Explore category</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* FEATURED HEALTHCARE FACILITIES                                     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3
          border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-accent uppercase tracking-wider">
              Verified Providers
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark mt-1">
              Featured Healthcare Facilities
            </h2>
          </div>
          <Link
            to="/search"
            className="text-xs sm:text-sm font-semibold text-teal-deep
              hover:text-emerald-accent flex items-center gap-1 group shrink-0"
          >
            <span>See complete directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-sage-pale/60 border border-border-subtle animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredFacilities.map((fac) => (
              <FacilityCard key={fac.facility_id} facility={fac} />
            ))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* COST TRANSPARENCY — Photo + Feature panel                         */}
      {/* ================================================================= */}
      <section className="mt-14 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-border-subtle shadow-card
            bg-sage-pale grid grid-cols-1 lg:grid-cols-2">

            {/* Lab Photography Panel */}
            <div className="relative min-h-[260px] lg:min-h-[480px] overflow-hidden">
              <img
                src="/images/lab-interior.jpg"
                alt="Modern pathology laboratory with diagnostic equipment"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Teal overlay accent */}
              <div className="absolute inset-0 bg-gradient-to-br
                from-teal-deep/40 via-transparent to-forest-dark/30 pointer-events-none" />
              {/* Bottom caption strip */}
              <div className="absolute bottom-0 left-0 right-0 p-5
                bg-gradient-to-t from-forest-dark/80 to-transparent">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                  bg-white/15 backdrop-blur-sm border border-white/20
                  text-white text-xs font-semibold">
                  <Scale className="w-3.5 h-3.5 text-mint-soft" />
                  Transparent Procedure Tariffs
                </span>
              </div>
            </div>

            {/* Content Panel */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-6">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark
                  tracking-tight leading-snug">
                  No Surprise Bills.{' '}
                  <span className="text-teal-deep">
                    Compare Indicative Costs Before You Visit.
                  </span>
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-charcoal-secondary leading-relaxed">
                  MediGuide compiles published hospital tariff schedules, representative
                  submissions, and standard rates for common procedures—from general
                  consultations to advanced MRI scans.
                </p>
              </div>

              {/* Feature bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal-dark font-medium">
                {[
                  'Fixed & min–max cost range transparency',
                  'Clear unit basis (per consultation, per scan)',
                  'Verified data sources & update timestamps',
                  'Side-by-side facility comparison matrix',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Sample rates card */}
              <div className="bg-white rounded-2xl border border-border-subtle p-4 space-y-2.5 shadow-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs font-bold text-charcoal-dark">
                  <span>Diagnostic Test Comparison</span>
                  <span className="text-emerald-accent font-semibold text-[11px]">
                    Sample Live Rates (Pune)
                  </span>
                </div>
                {[
                  {
                    name: 'General Consultation',
                    sub: 'City Polyclinic · OPD',
                    price: '₹500',
                    note: 'Fixed rate',
                    colour: 'text-teal-deep',
                  },
                  {
                    name: 'MRI Scan (Brain/Spine)',
                    sub: 'Metropolis Diagnostics · 1.5T',
                    price: '₹6,500 – ₹9,500',
                    note: 'Approx. range',
                    colour: 'text-emerald-accent',
                  },
                  {
                    name: 'Complete Blood Count (CBC)',
                    sub: 'Dr. Lal PathLabs · Profile',
                    price: '₹250 – ₹380',
                    note: 'Per test profile',
                    colour: 'text-teal-deep',
                  },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="p-3 rounded-xl bg-warm-25 border border-border-subtle
                      flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-charcoal-dark">{row.name}</p>
                      <p className="text-[11px] text-charcoal-secondary">{row.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${row.colour}`}>{row.price}</p>
                      <p className="text-[10px] text-charcoal-secondary">{row.note}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-charcoal-secondary italic text-center pt-0.5">
                  * Approximate charges. Always confirm directly with the healthcare provider.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/compare"
                  className="px-5 py-2.5 rounded-xl bg-emerald-accent hover:bg-forest-deep
                    text-white font-bold text-xs shadow-brand hover:shadow-lg
                    inline-flex items-center gap-2 transition-all"
                >
                  <Scale className="w-4 h-4" />
                  ⚡ Auto-Compare Healthcare Tariffs
                </Link>
                <Link
                  to="/services"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-mint-soft
                    border border-border-subtle text-charcoal-dark font-semibold text-xs
                    transition-colors shadow-subtle"
                >
                  Explore Services Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* HOW MEDIGUIDE WORKS                                               */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-accent uppercase tracking-wider">
            Simple Workflow
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark">
            How MediGuide Works
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-secondary leading-relaxed">
            Three simple steps designed to locate verified facilities and understand
            procedure expenses upfront.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: <Search className="w-5 h-5 text-teal-deep" />,
              title: 'Search for Facilities or Services',
              body: 'Filter by city, area locality, facility category, or medical service. Set custom radius settings from 1 km to 50 km for localized discovery.',
            },
            {
              step: '02',
              icon: <Building2 className="w-5 h-5 text-teal-deep" />,
              title: 'Explore Facility Information',
              body: 'Review verified physical addresses, direct telephone lines, operating schedules, clinical departments, and administrative audit provenance.',
            },
            {
              step: '03',
              icon: <Scale className="w-5 h-5 text-teal-deep" />,
              title: 'Compare Available Cost Information',
              body: 'Select multiple providers to review published tariff schedules side by side, compare procedure expenses, and contact facilities with confidence.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-border-subtle
                shadow-card hover:shadow-card-hover hover:border-emerald-accent/30
                transition-all duration-200 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mint-soft flex items-center justify-center
                  border border-border-subtle shrink-0">
                  {item.icon}
                </div>
                <span className="text-xs font-mono font-bold text-charcoal-secondary/60">
                  Step {item.step}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal-dark leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-secondary leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* CITY-WISE HEALTHCARE COVERAGE                                      */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3
          border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-accent uppercase tracking-wider">
              Geographic Coverage
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark mt-1">
              City-Wise Healthcare Coverage across Maharashtra
            </h2>
          </div>
          <Link
            to="/map"
            className="text-xs sm:text-sm font-semibold text-teal-deep
              hover:text-emerald-accent flex items-center gap-1 group shrink-0"
          >
            <span>Interactive Map Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Pune Primary Focus Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-card">
          {/* Pune city photo background */}
          <div className="absolute inset-0">
            <img
              src="/images/hero-photo.jpg"
              alt="Pune healthcare coverage"
              className="w-full h-full object-cover object-center scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r
              from-teal-deep/95 via-forest-deep/90 to-teal-deep/70" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 text-white space-y-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold
                    uppercase tracking-wider bg-emerald-accent text-white">
                    Primary Focus City
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold
                    bg-white/10 text-mint-soft border border-white/20">
                    31+ Localities Covered
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                  Pune Healthcare Directory
                </h3>
                <p className="text-xs sm:text-sm text-mint-soft/90 max-w-xl leading-relaxed">
                  Extensive records covering multi-speciality hospitals, diagnostic clinics,
                  pathology laboratories, pharmacies, and blood banks from Hinjawadi and Wakad
                  to Hadapsar and Camp.
                </p>
              </div>
              <Link
                to="/search?city=Pune"
                className="px-5 py-3 rounded-2xl bg-white hover:bg-mint-soft text-teal-deep
                  font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 self-start"
              >
                <span>Explore All Pune Facilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Locality pills */}
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs font-bold text-mint-soft mb-2.5">
                Key Pune Localities with Facilities:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Shivajinagar', 'Kothrud', 'Baner', 'Wakad', 'Hinjawadi',
                  'Aundh', 'Deccan', 'Pimpri-Chinchwad', 'Hadapsar', 'Kharadi',
                  'Viman Nagar', 'Koregaon Park', 'Swargate', 'Camp',
                  'Pimple Saudagar', 'Pimple Gurav', 'Bhosari', 'Akurdi',
                  'Nigdi', 'Chinchwad', 'Dapodi', 'Vishrantwadi', 'Lohegaon',
                  'Wagholi', 'Sinhagad Road', 'Dhayari', 'Narhe', 'Bavdhan',
                  'Katraj', 'Kondhwa',
                ].map((loc) => (
                  <Link
                    key={loc}
                    to={`/search?city=Pune&locality=${encodeURIComponent(loc)}`}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20
                      border border-white/10 text-[11px] font-medium text-white transition-colors"
                  >
                    {loc}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: 'Mumbai', desc: 'Metropolitan Hospitals' },
            { name: 'Navi Mumbai', desc: 'Super Speciality' },
            { name: 'Thane', desc: 'Clinics & Diagnostics' },
            { name: 'Nagpur', desc: 'Regional Facilities' },
            { name: 'Nashik', desc: 'Diagnostic Hubs' },
            { name: 'Chhatrapati Sambhajinagar', desc: 'Pathology Labs' },
            { name: 'Kolhapur', desc: 'Medical Centres' },
            { name: 'Solapur', desc: 'Inpatient Care' },
            { name: 'Satara', desc: 'Primary Clinics' },
            { name: 'Sangli', desc: 'Diagnostics' },
            { name: 'Ahilyanagar', desc: 'Healthcare Directory' },
          ].map((c) => (
            <Link
              key={c.name}
              to={`/search?city=${encodeURIComponent(c.name)}`}
              className="p-3.5 rounded-2xl border border-border-subtle bg-white
                hover:border-emerald-accent/50 hover:shadow-subtle
                transition-all flex flex-col justify-between group"
            >
              <div>
                <MapPin className="w-4 h-4 text-emerald-accent
                  group-hover:scale-110 transition-transform mb-1.5" />
                <h4 className="font-bold text-charcoal-dark text-xs
                  group-hover:text-teal-deep transition-colors leading-snug">
                  {c.name}
                </h4>
                <p className="text-[10px] text-charcoal-secondary mt-0.5">{c.desc}</p>
              </div>
              <div className="pt-2 text-[10px] font-bold text-teal-deep flex items-center gap-0.5">
                <span>View</span>
                <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* TRUST & TRANSPARENCY STANDARDS                                     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-accent uppercase tracking-wider">
            Data Integrity
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark">
            Trust &amp; Transparency Standards
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-secondary">
            How healthcare records, verification tiers, and price data are reviewed and audited.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-emerald-accent" />,
              title: 'Clear Data Provenance',
              body: 'Every facility record is explicitly labelled as demonstration sample data, verified partner record, or community submission. No unverified claims are presented as verified.',
            },
            {
              icon: <FileCheck2 className="w-5 h-5 text-emerald-accent" />,
              title: 'Administrative Review Pipeline',
              body: 'Authorized facility representatives submit tariff schedules and updates to a moderation queue where administrators review official documentation before publication.',
            },
            {
              icon: <Users2 className="w-5 h-5 text-emerald-accent" />,
              title: 'Community Reporting & Audit Logs',
              body: 'Patients can flag discrepancies in contact numbers or fees. Revisions and reports are recorded with immutable audit logs preventing silent overwriting of data.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-border-subtle
                shadow-card hover:shadow-card-hover hover:border-emerald-accent/30
                transition-all duration-200 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-mint-soft flex items-center
                justify-center border border-border-subtle">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-charcoal-dark">{item.title}</h3>
              <p className="text-xs sm:text-sm text-charcoal-secondary leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* CLOSING INVITATION BANNER                                         */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br
            from-teal-deep via-forest-deep to-forest-dark" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row
            items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Navigate Healthcare in Your City with Clarity
              </h3>
              <p className="text-xs sm:text-sm text-mint-soft/85 max-w-xl leading-relaxed">
                Discover verified clinics, explore diagnostic labs, and compare procedure
                rates across Pune and Maharashtra with transparent information.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/#categories"
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-mint-soft
                  text-teal-deep font-bold text-xs shadow-md transition-all"
              >
                Explore Facilities
              </Link>
              <Link
                to="/compare"
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20
                  border border-white/20 text-white font-bold text-xs transition-all"
              >
                Compare Costs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency SOS Guidance Modal */}
      <EmergencySOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </div>
  );
};
