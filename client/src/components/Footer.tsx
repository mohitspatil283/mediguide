import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sage-pale border-t border-border-subtle text-charcoal-secondary pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-border-subtle">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-deep to-forest-deep text-white flex items-center justify-center shadow-md shadow-emerald-accent/20">
                <HeartPulse className="w-4.5 h-4.5 text-mint-soft stroke-[2.2]" />
              </div>
              <span className="font-heading font-bold text-xl text-charcoal-dark tracking-tight">
                Medi<span className="text-emerald-accent">Guide</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-charcoal-secondary leading-relaxed max-w-sm">
              Integrated healthcare navigation and cost transparency platform. Assisting patients and families in discovering verified healthcare facilities and comparing approximate procedure tariffs across Maharashtra.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border-subtle text-xs text-charcoal-dark font-medium shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-accent"></span>
              Academic Demonstration &bull; Pune &amp; Maharashtra
            </div>
          </div>

          {/* Directory Categories */}
          <div>
            <h4 className="text-xs font-bold text-teal-deep uppercase tracking-wider mb-3.5">
              Facility Types
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/search?category=HOSPITAL" className="hover:text-teal-deep transition-colors">
                  Hospitals
                </Link>
              </li>
              <li>
                <Link to="/search?category=CLINIC" className="hover:text-teal-deep transition-colors">
                  Clinics &amp; Polyclinics
                </Link>
              </li>
              <li>
                <Link to="/search?category=DIAGNOSTIC_CENTRE" className="hover:text-teal-deep transition-colors">
                  Diagnostic Centres
                </Link>
              </li>
              <li>
                <Link to="/search?category=PHARMACY" className="hover:text-teal-deep transition-colors">
                  Pharmacies
                </Link>
              </li>
              <li>
                <Link to="/search?category=LABORATORY" className="hover:text-teal-deep transition-colors">
                  Pathology Labs
                </Link>
              </li>
              <li>
                <Link to="/search?category=BLOOD_CENTRE" className="hover:text-teal-deep transition-colors">
                  Blood Centres
                </Link>
              </li>
            </ul>
          </div>

          {/* Discovery Tools */}
          <div>
            <h4 className="text-xs font-bold text-teal-deep uppercase tracking-wider mb-3.5">
              Platform Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/search" className="hover:text-teal-deep transition-colors">
                  Facility Directory
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-teal-deep transition-colors">
                  Cost Comparison
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-teal-deep transition-colors">
                  Nearby Map Explorer
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-deep transition-colors">
                  Services Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Disclaimers */}
          <div>
            <h4 className="text-xs font-bold text-teal-deep uppercase tracking-wider mb-3.5">
              Transparency &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/disclaimer" className="hover:text-teal-deep transition-colors">
                  Medical Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-deep transition-colors">
                  About MediGuide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-deep transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-teal-deep transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-deep transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-secondary">
          <p>
            &copy; {currentYear} MediGuide Platform. Non-commercial informational healthcare directory.
          </p>
          <p className="text-[11px] text-charcoal-secondary">
            Indicative procedure rates are not guaranteed hospital bills.
          </p>
        </div>
      </div>
    </footer>
  );
};
