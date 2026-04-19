import { Link, useLocation } from 'react-router-dom';
import { FileText, Gauge, LayoutDashboard, ArrowLeft } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/audit',     label: 'Audit',     icon: FileText },
  { path: '/score',     label: 'FairScore',  icon: Gauge },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b border-[#1E1E24] bg-[#111114] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1.5 font-syne font-bold text-base text-[#F0F0F0] tracking-tight">
              BLIND
              <span className="inline-block w-2 h-2 rounded-full bg-[#E8FF47] animate-[blink-dot_2.5s_ease_infinite]" />
              SPOT
            </Link>
            <span className="hidden md:block w-px h-5 bg-[#1E1E24]" />
            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 text-xs text-[#6B6B7A] hover:text-[#E8FF47] transition-colors font-dm"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to site
            </Link>
          </div>

          {/* Nav items */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-dm transition-colors ${
                    active
                      ? 'text-[#E8FF47] bg-[#E8FF4710]'
                      : 'text-[#6B6B7A] hover:text-[#F0F0F0]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
