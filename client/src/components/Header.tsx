import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import {
  HeartPulse,
  Scale,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  Building2,
  Bookmark,
  FileText,
  User,
  LogOut,
  ChevronDown,
  AlertOctagon,
  Compass,
} from 'lucide-react';
import { EmergencySOSModal } from './EmergencySOSModal';

export const Header: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { selectedFacilities } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isHomeActive = location.pathname === '/' && location.hash !== '#categories';
  const isExploreActive = location.hash === '#categories' || location.pathname === '/categories';
  const isCompareActive = location.pathname.startsWith('/compare');
  const isAboutActive = location.pathname.startsWith('/about');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-subtle shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Wordmark */}
          <Link
            to="/"
            onClick={() => {
              if (location.pathname === '/') {
                if (location.hash) {
                  window.history.pushState(null, '', '/');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-teal-deep rounded-xl p-1 -ml-1 transition-opacity"
            aria-label="MediGuide Home"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-teal-deep via-forest-deep to-forest-dark flex items-center justify-center text-white shadow-md shadow-emerald-accent/20 group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="w-5 h-5 md:w-6 md:h-6 text-mint-soft stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xl md:text-2xl text-charcoal-dark tracking-tight leading-none">
                  Medi<span className="text-emerald-accent">Guide</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-mint-soft text-teal-deep border border-border-subtle rounded">
                  Nav
                </span>
              </div>
              <p className="text-[11px] text-charcoal-secondary hidden sm:block font-medium mt-0.5">
                Healthcare Navigation &amp; Cost Transparency
              </p>
            </div>
          </Link>

          {/* Active City Focus Badge */}
          <Link
            to="/search?city=Pune"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sage-pale hover:bg-mint-soft border border-border-subtle text-charcoal-dark hover:text-teal-deep transition-colors shadow-subtle"
            title="Primary Focus: Pune (31+ Localities)"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-accent" />
            <span>Pune, Maharashtra</span>
            <span className="text-[10px] bg-mint-soft text-teal-deep px-1.5 py-0.2 rounded font-bold">
              31+ Areas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main navigation">
            <Link
              to="/"
              onClick={() => {
                if (location.pathname === '/') {
                  if (location.hash) {
                    window.history.pushState(null, '', '/');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                isHomeActive
                  ? 'text-teal-deep font-semibold bg-mint-soft/80 border border-border-subtle'
                  : 'text-charcoal-secondary hover:text-charcoal-dark hover:bg-sage-pale font-medium'
              }`}
            >
              Home
            </Link>

            <Link
              to="/#categories"
              onClick={() => {
                if (location.pathname === '/') {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                isExploreActive
                  ? 'text-teal-deep font-semibold bg-mint-soft/80 border border-border-subtle'
                  : 'text-charcoal-secondary hover:text-charcoal-dark hover:bg-sage-pale font-medium'
              }`}
            >
              Explore Facilities
            </Link>

            <Link
              to="/compare"
              className={`px-3 py-2 rounded-xl text-sm transition-colors inline-flex items-center gap-1.5 ${
                isCompareActive
                  ? 'text-teal-deep font-semibold bg-mint-soft/80 border border-border-subtle'
                  : 'text-charcoal-secondary hover:text-charcoal-dark hover:bg-sage-pale font-medium'
              }`}
            >
              <span>Compare Costs</span>
              <span className="px-1.5 py-0.2 text-[9px] uppercase font-extrabold bg-emerald-100 text-emerald-800 rounded-full">
                Auto
              </span>
              {selectedFacilities.length > 0 && (
                <span className="px-1.5 py-0.2 text-[11px] font-bold bg-emerald-accent text-white rounded-full">
                  {selectedFacilities.length}
                </span>
              )}
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                isAboutActive
                  ? 'text-teal-deep font-semibold bg-mint-soft/80 border border-border-subtle'
                  : 'text-charcoal-secondary hover:text-charcoal-dark hover:bg-sage-pale font-medium'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Desktop Right Auth / Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              title="Emergency Helplines (112 / 108)"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>Emergency SOS</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    role === 'ADMIN'
                      ? '/admin/dashboard'
                      : role === 'FACILITY_REPRESENTATIVE'
                      ? '/rep/dashboard'
                      : '/patient/dashboard'
                  }
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-deep hover:bg-forest-deep text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-mint-soft" />
                  <span>Dashboard</span>
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-subtle bg-white hover:bg-sage-pale text-charcoal-dark transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-teal-deep shadow-subtle"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-lg bg-mint-soft text-teal-deep font-bold flex items-center justify-center text-xs uppercase border border-border-subtle">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="font-semibold text-charcoal-dark leading-tight max-w-[110px] truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-emerald-accent uppercase font-bold tracking-wider">
                        {role.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-secondary" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-panel border border-border-subtle py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1"
                    >
                      <div className="px-4 py-2.5 border-b border-border-subtle">
                        <p className="text-charcoal-secondary text-[11px]">Signed in as</p>
                        <p className="font-semibold text-charcoal-dark truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-mint-soft text-teal-deep rounded">
                          {role.replace('_', ' ')}
                        </span>
                      </div>

                      {role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-charcoal-dark hover:bg-sage-pale hover:text-teal-deep font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-accent" />
                          Admin Dashboard
                        </Link>
                      )}

                      {role === 'FACILITY_REPRESENTATIVE' && (
                        <Link
                          to="/rep/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-charcoal-dark hover:bg-sage-pale hover:text-teal-deep font-medium"
                        >
                          <Building2 className="w-4 h-4 text-emerald-accent" />
                          Representative Portal
                        </Link>
                      )}

                      {role === 'USER' && (
                        <>
                          <Link
                            to="/patient/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-charcoal-dark hover:bg-sage-pale hover:text-teal-deep font-medium"
                          >
                            <Compass className="w-4 h-4 text-emerald-accent" />
                            Patient Dashboard
                          </Link>
                          <Link
                            to="/user/saved"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-charcoal-dark hover:bg-sage-pale hover:text-teal-deep font-medium"
                          >
                            <Bookmark className="w-4 h-4 text-emerald-accent" />
                            Saved Facilities
                          </Link>
                          <Link
                            to="/user/reports"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-charcoal-dark hover:bg-sage-pale hover:text-teal-deep font-medium"
                          >
                            <FileText className="w-4 h-4 text-emerald-accent" />
                            My Reports
                          </Link>
                        </>
                      )}

                      <Link
                        to="/user/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-charcoal-dark hover:bg-sage-pale hover:text-teal-deep font-medium"
                      >
                        <User className="w-4 h-4 text-charcoal-secondary" />
                        Account Settings
                      </Link>

                      <div className="border-t border-border-subtle my-1"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-700 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-charcoal-dark hover:text-teal-deep hover:bg-sage-pale rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-accent hover:bg-forest-deep active:bg-forest-dark rounded-xl transition-all shadow-brand hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            {selectedFacilities.length > 0 && (
              <Link
                to="/compare"
                className="p-2 text-teal-deep bg-mint-soft rounded-xl relative"
                aria-label="Compare selected facilities"
              >
                <Scale className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-emerald-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {selectedFacilities.length}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal-dark hover:bg-sage-pale transition-colors focus-visible:ring-2 focus-visible:ring-teal-deep"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-1">
          <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
            <Link
              to="/"
              onClick={() => {
                setMobileMenuOpen(false);
                if (location.pathname === '/') {
                  if (location.hash) {
                    window.history.pushState(null, '', '/');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium ${
                isHomeActive ? 'bg-mint-soft text-teal-deep font-semibold' : 'text-charcoal-dark hover:bg-sage-pale'
              }`}
            >
              Home
            </Link>
            <Link
              to="/#categories"
              onClick={() => {
                setMobileMenuOpen(false);
                if (location.pathname === '/') {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium ${
                isExploreActive ? 'bg-mint-soft text-teal-deep font-semibold' : 'text-charcoal-dark hover:bg-sage-pale'
              }`}
            >
              Explore Facilities
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                isCompareActive ? 'bg-mint-soft text-teal-deep font-semibold' : 'text-charcoal-dark hover:bg-sage-pale'
              }`}
            >
              <span>Compare Costs</span>
              {selectedFacilities.length > 0 && (
                <span className="bg-emerald-accent text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {selectedFacilities.length}
                </span>
              )}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium ${
                isAboutActive ? 'bg-mint-soft text-teal-deep font-semibold' : 'text-charcoal-dark hover:bg-sage-pale'
              }`}
            >
              About MediGuide
            </Link>
          </nav>

          <div className="border-t border-border-subtle pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-1 text-xs">
                <div className="px-3 py-2 mb-1 bg-sage-pale rounded-xl">
                  <p className="text-charcoal-secondary text-[11px]">Signed in as</p>
                  <p className="font-semibold text-charcoal-dark text-sm">{user.name}</p>
                </div>
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-charcoal-dark hover:bg-sage-pale rounded-xl font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-accent" />
                    Admin Dashboard
                  </Link>
                )}
                {role === 'FACILITY_REPRESENTATIVE' && (
                  <Link
                    to="/rep/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-charcoal-dark hover:bg-sage-pale rounded-xl font-medium"
                  >
                    <Building2 className="w-4 h-4 text-emerald-accent" />
                    Representative Portal
                  </Link>
                )}
                {role === 'USER' && (
                  <>
                    <Link
                      to="/patient/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-charcoal-dark hover:bg-sage-pale rounded-xl font-medium"
                    >
                      <Compass className="w-4 h-4 text-emerald-accent" />
                      Patient Dashboard
                    </Link>
                    <Link
                      to="/user/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-charcoal-dark hover:bg-sage-pale rounded-xl font-medium"
                    >
                      <Bookmark className="w-4 h-4 text-emerald-accent" />
                      Saved Facilities
                    </Link>
                    <Link
                      to="/user/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-charcoal-dark hover:bg-sage-pale rounded-xl font-medium"
                    >
                      <FileText className="w-4 h-4 text-emerald-accent" />
                      My Reports
                    </Link>
                  </>
                )}

                {/* Emergency SOS Button in Mobile Menu */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSosModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-xs transition-colors my-1 text-xs"
                >
                  <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
                  <span>Emergency SOS Help</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-rose-700 hover:bg-rose-50 rounded-xl font-medium text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {/* Emergency SOS for visitors in Mobile Menu */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSosModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-xs transition-colors text-xs"
                >
                  <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
                  <span>Emergency SOS Help</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold text-charcoal-dark bg-white border border-border-subtle rounded-xl hover:bg-sage-pale"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold text-white bg-emerald-accent rounded-xl hover:bg-forest-deep shadow-brand"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      <EmergencySOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </header>
  );
};
