import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  FileText,
  Calendar,
  Database,
  ChevronDown,
  Search,
  Bell,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onOpenSpec: () => void;
  dbStatus: { provider: string; connected: boolean };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onOpenSpec,
  dbStatus
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity with the Signature Warm Orange / Coral Accent */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 ring-2 ring-orange-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight font-sans">
                Edura<span className="text-orange-500 font-black">SMS</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200/60">
                School Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              St. Theresa Campus • Term 1, 2026
            </p>
          </div>
        </div>

        {/* Center: Search in HRMS / SMS Bar styled like reference image */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              placeholder="Search in School SMS..."
              className="w-full pl-10 pr-20 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
                CTRL + /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Status Badges (Matching Screenshot's Active Users, Security Alerts, Env Pills) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Learners Green Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-slate-600">Active Learners</span>
            <span className="font-extrabold text-emerald-800">340</span>
          </div>

          {/* Alert Red/Orange Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-[11px] text-slate-600">Print Queue</span>
            <span className="font-extrabold text-rose-800">4</span>
          </div>

          {/* Environment/Term Tabs (Production in bright orange, Staging/Dev subtle) */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button className="px-3 py-1 rounded-md bg-orange-500 text-white font-bold shadow-xs hover:bg-orange-600 transition-colors cursor-pointer">
              Term 1 Live
            </button>
            <button className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 font-medium">
              Mid-Term
            </button>
            <button className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 font-medium">
              2026 AY
            </button>
          </div>

          {/* Non-Technical Specification Link */}
          <button
            onClick={onOpenSpec}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            title="Open non-technical system specification guide"
          >
            <FileText className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Spec Guide</span>
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                  currentUser.role === 'admin' ? 'bg-orange-500' : 'bg-slate-800'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-orange-600 font-semibold capitalize">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Class Teacher'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active User & Role
                  </p>
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-3 hover:bg-orange-50/50 transition-colors cursor-pointer ${
                      u.id === currentUser.id ? 'bg-orange-50/70 border-l-2 border-orange-500 font-medium' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${
                        u.role === 'admin' ? 'bg-orange-500' : 'bg-slate-800'
                      }`}
                    >
                      {u.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-900 truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{u.title}</div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          u.role === 'admin'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
