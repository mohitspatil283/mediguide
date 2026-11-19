import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EmergencySOSModal } from '../EmergencySOSModal';
import { CompareFloatingBar } from '../CompareFloatingBar';
import {
  Compass,
  Bookmark,
  FileText,
  Scale,
  MapPin,
  Building2,
  IndianRupee,
  FileEdit,
  ShieldCheck,
  Users,
  Layers,
  History,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  Stethoscope,
  Pill,
  Microscope,
  Droplet,
  FolderHeart,
  Settings,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mediguide_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mediguide_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const userRole = user?.role || 'USER';
  const isPatientRoute = location.pathname.startsWith('/patient');
  const isAdminRoute = location.pathname.startsWith('/admin') || userRole === 'ADMIN';
  const isRepRoute = location.pathname.startsWith('/rep') || userRole === 'FACILITY_REPRESENTATIVE';

  // 1. Role 1: Patient / Healthcare Seeker Navigation
  const patientNav = [
    { label: 'Dashboard Overview', path: '/patient/dashboard', icon: Compass },
    { label: 'Find Healthcare Facilities', path: '/search', icon: Search },
    {
      label: 'Explore Healthcare',
      isGroup: true,
      children: [
        { label: 'Hospitals', path: '/search?category=HOSPITAL', icon: Building2 },
        { label: 'Clinics', path: '/search?category=CLINIC', icon: Stethoscope },
        { label: 'Pharmacies', path: '/search?category=PHARMACY', icon: Pill },
        { label: 'Diagnostic Centres', path: '/search?category=DIAGNOSTIC', icon: Microscope },
        { label: 'Blood Centres', path: '/search?category=BLOOD_BANK', icon: Droplet },
        { label: 'Laboratories', path: '/search?category=PATHOLOGY', icon: Microscope },
        { label: 'Other Facilities', path: '/search?category=OTHER', icon: Building2 },
      ],
    },
    { label: 'Services & Procedures', path: '/services', icon: Layers },
    { label: 'Cost Transparency', path: '/compare', icon: Scale },
    { label: 'Nearby Map', path: '/map', icon: MapPin },
    { label: 'Saved Facilities', path: '/user/saved', icon: Bookmark },
    { label: 'My Reports', path: '/user/reports', icon: FileText },
    { label: 'Profile & Settings', path: '/user/profile', icon: Settings },
  ];

  // 2. Role 2: Facility Representative Navigation
  const repNav = [
    { label: 'Representative Overview', path: '/rep/dashboard', icon: Compass },
    { label: 'Appointment Management', path: '/rep/appointments', icon: Calendar },
    { label: 'Assigned Facility Details', path: '/rep/facility', icon: Building2 },
    { label: 'Services & Tariffs', path: '/rep/costs', icon: IndianRupee },
    { label: 'Update Submissions', path: '/rep/revisions', icon: FileEdit },
    { label: 'Public Facility Search', path: '/search', icon: Search },
    { label: 'Profile & Settings', path: '/user/profile', icon: Settings },
  ];

  // 3. Role 3: Platform Administrator Navigation
  const adminNav = [
    { label: 'Operations Overview', path: '/admin/dashboard', icon: Compass },
    { label: 'Facility Management', path: '/admin/facilities', icon: Building2 },
    { label: 'Pending Approvals Queue', path: '/admin/verification', icon: Clock },
    { label: 'Verified Facilities', path: '/admin/facilities?status=VERIFIED', icon: CheckCircle2 },
    { label: 'Archived / Rejected', path: '/admin/facilities?status=REJECTED', icon: ShieldAlert },
    { label: 'Service Catalog Management', path: '/admin/services', icon: Layers },
    { label: 'Tariff & Cost Management', path: '/admin/costs', icon: IndianRupee },
    { label: 'Facility Representatives', path: '/admin/users?role=FACILITY_REPRESENTATIVE', icon: Users },
    { label: 'User & Role Access', path: '/admin/users', icon: Users },
    { label: 'Community Data Reports', path: '/admin/reports', icon: FileText },
    { label: 'System Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Profile & Settings', path: '/user/profile', icon: Settings },
  ];

  // Determine active navigation schema for the 3 distinct roles
  const navItems = isAdminRoute
    ? adminNav
    : isRepRoute
    ? repNav
    : patientNav;

  // Role display metadata for the 3 distinct roles
  const roleDisplay = isAdminRoute
    ? { title: 'Platform Administrator', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
    : isRepRoute
    ? { title: 'Facility Representative', badge: 'bg-sky-50 text-sky-800 border-sky-200' }
    : { title: 'Patient / Healthcare Seeker', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

  // Generate actionable contextual notifications
  const notifications = [
    ...(userRole === 'USER'
      ? [
          {
            id: 'n1',
            title: 'Welcome to MediGuide Portal',
            message: 'Search verified facilities or check transparent pricing comparisons.',
            time: 'Active',
            link: '/search',
          },
          {
            id: 'n2',
            title: 'Saved Bookmarks',
            message: 'Easily revisit bookmarked clinics and hospitals from your sidebar.',
            time: 'Persistent',
            link: '/user/saved',
          },
        ]
      : []),
    ...(userRole === 'FACILITY_REPRESENTATIVE'
      ? [
          {
            id: 'n-rep-1',
            title: 'Facility Profile Updated',
            message: 'Keep your operating hours and cost sheets verified for accuracy.',
            time: 'Active',
            link: '/rep/facility',
          },
          {
            id: 'n-rep-2',
            title: 'Moderation Queue',
            message: 'Proposed edits require administrative verification before publishing.',
            time: 'Policy',
            link: '/rep/revisions',
          },
        ]
      : []),
    ...(userRole === 'ADMIN'
      ? [
          {
            id: 'n-adm-1',
            title: 'Verification Queue',
            message: 'Inspect pending facility submissions and representative updates.',
            time: 'Live',
            link: '/admin/verification',
          },
          {
            id: 'n-adm-2',
            title: 'Audit Logging Active',
            message: 'All administrative verdicts are tracked in immutable audit logs.',
            time: 'Active',
            link: '/admin/audit-logs',
          },
        ]
      : []),
  ];

  // Accurate matching helper for active links
  const isItemActive = (itemPath: string) => {
    if (itemPath === '/search') {
      const params = new URLSearchParams(location.search);
      const cat = params.get('category');
      return location.pathname === '/search' && (!cat || cat === 'ALL');
    }
    if (itemPath.includes('?')) {
      const [basePath, searchStr] = itemPath.split('?');
      if (location.pathname !== basePath) return false;
      const expectedParams = new URLSearchParams(searchStr);
      const currentParams = new URLSearchParams(location.search);
      for (const [key, val] of expectedParams.entries()) {
        if (currentParams.get(key) !== val) return false;
      }
      return true;
    }
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return (
      location.pathname === itemPath ||
      (itemPath.length > 5 && location.pathname.startsWith(itemPath))
    );
  };

  // Derive current page title from path
  let currentTitle = 'Dashboard';
  if (location.pathname.startsWith('/facility/')) {
    currentTitle = 'Facility Details';
  } else if (location.pathname === '/map') {
    currentTitle = 'Nearby Facilities Map';
  } else if (location.pathname === '/services') {
    currentTitle = 'Services & Procedures';
  } else if (location.pathname === '/compare') {
    currentTitle = 'Cost Transparency & Comparison';
  } else if (location.pathname === '/search') {
    const cat = new URLSearchParams(location.search).get('category');
    if (cat && cat !== 'ALL') {
      currentTitle = `${cat.charAt(0) + cat.slice(1).toLowerCase()} Facilities`;
    } else {
      currentTitle = 'Healthcare Facility Search';
    }
  } else {
    const found: any = navItems.find((item: any) => {
      if (item.isGroup && item.children) {
        return item.children.some((c: any) => isItemActive(c.path));
      }
      return isItemActive(item.path);
    });
    if (found) {
      if (found.isGroup && found.children) {
        const activeChild = found.children.find((c: any) => isItemActive(c.path));
        currentTitle = activeChild ? activeChild.label : found.label;
      } else {
        currentTitle = found.label;
      }
    }
  }

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. FIXED DESKTOP VERTICAL SIDEBAR (256px / w-64)
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Top: MediGuide Brand & Wordmark */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-forest-deep text-white font-black text-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-forest-dark block leading-none">
                Medi<span className="text-emerald-accent">Guide</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                {roleDisplay.title}
              </span>
            </div>
          </Link>

          {/* Quick collapse button in sidebar header */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Collapse sidebar (Ctrl+B)"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs" aria-label="Sidebar Navigation">
          {navItems.map((item: any, idx: number) => {
            if (item.isGroup) {
              return (
                <div key={idx} className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 text-slate-400 font-bold uppercase tracking-wider text-[10px] hover:text-slate-700 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        categoriesExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {categoriesExpanded && (
                    <div className="pl-2 space-y-0.5 mt-0.5 border-l-2 border-slate-100 ml-3">
                      {item.children.map((child: any) => {
                        const Icon = child.icon;
                        const isActive = isItemActive(child.path);

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              isActive
                                ? 'bg-forest-deep text-white font-bold shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = isItemActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors ${
                  isActive
                    ? 'bg-forest-deep text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: Emergency SOS & User Profile & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2 shrink-0">
          {/* Emergency SOS Shortcut (Patients / Users) */}
          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold text-xs transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>SOS / Emergency Help</span>
          </button>

          {/* User Profile Snippet */}
          {user ? (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-forest-deep text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Healthcare Seeker</p>
                  <p className="text-[10px] text-slate-500 truncate">Sign in for personalized portal</p>
                </div>
              </div>
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-lg bg-forest-deep text-white text-[11px] font-bold hover:bg-forest-dark transition-colors shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR TOGGLE ARROW BUTTON (Edge Floating Trigger)
      ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={`hidden lg:flex fixed top-20 z-40 items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-forest-deep hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-forest-deep/20 cursor-pointer ${
          sidebarCollapsed ? 'left-3' : 'left-64 -translate-x-1/2'
        }`}
        title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!sidebarCollapsed}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-700" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-700" />
        )}
      </button>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP HEADER (Positioned strictly right of sidebar on desktop)
      ───────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-2xs transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'
        }`}
      >
        {/* Left: Mobile hamburger & Desktop toggle & Page Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Reopen button if sidebar is collapsed */}
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-forest-deep bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <ChevronRight className="w-4 h-4" />
              <span>Menu</span>
            </button>
          )}

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              {currentTitle}
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 hidden sm:block">
              MediGuide Healthcare Portal · {roleDisplay.title}
            </p>
          </div>
        </div>

        {/* Right Actions: Emergency SOS, Search, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            title="Emergency Medical Guidance (112 / 108)"
          >
            <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
            <span className="hidden sm:inline">Emergency SOS</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Quick Search Button */}
          <Link
            to="/search"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-forest-deep" />
                    <span className="font-extrabold text-sm text-slate-900">Notifications</span>
                  </div>
                  <span className="text-[11px] font-bold text-forest-deep bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {notifications.length} Active
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => setNotificationsOpen(false)}
                      className="p-3.5 block hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu or Guest Sign In */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="User profile options"
              >
                <div className="w-8 h-8 rounded-full bg-forest-deep text-white font-extrabold text-xs flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 space-y-0.5">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleDisplay.badge}`}
                    >
                      {roleDisplay.title}
                    </span>
                  </div>

                  <div className="py-1 text-xs font-semibold text-slate-700">
                    <Link
                      to="/user/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Profile & Settings</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                      <span>Public Homepage</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-deep hover:bg-forest-dark shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT VIEWPORT (Transitions with sidebar state)
      ───────────────────────────────────────────────────────────── */}
      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'
        }`}
      >
        {children || <Outlet />}
      </main>

      {/* Floating comparison bar */}
      <CompareFloatingBar />

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE RESPONSIVE DRAWER (<1024px)
      ───────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest-deep flex items-center justify-center text-white font-black text-sm">
                  M
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900">MediGuide</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{roleDisplay.title}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs">
              {navItems.map((item: any, idx: number) => {
                if (item.isGroup) {
                  return (
                    <div key={idx} className="pt-2">
                      <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                        {item.label}
                      </p>
                      <div className="pl-2 space-y-0.5">
                        {item.children.map((child: any) => {
                          const Icon = child.icon;
                          const isActive = isItemActive(child.path);

                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium ${
                                isActive
                                  ? 'bg-forest-deep text-white font-bold'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const Icon = item.icon;
                const isActive = isItemActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold transition-colors ${
                      isActive
                        ? 'bg-forest-deep text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSosModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Emergency SOS Help</span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-bold text-white bg-forest-deep rounded-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal (Portal rendered to document.body) */}
      <EmergencySOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </div>
  );
};
