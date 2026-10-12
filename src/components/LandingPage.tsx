import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  FileText,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
  Heart,
  Award,
  Sun,
  Moon,
  Send,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface LandingPageProps {
  onEnterSystem: (role?: 'teacher' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterSystem }) => {
  const { toggleTheme, isDark } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Form states for Report Request
  const [childName, setChildName] = useState('');
  const [parentName, setParentName] = useState('');
  const [adminNumber, setAdminNumber] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Office Enquiry states
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !parentName || !adminNumber || !parentEmail) {
      alert('Please fill in all required fields to request the child report.');
      return;
    }
    setReportSubmitted(true);
    setTimeout(() => {
      // reset after some time
    }, 5000);
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName || !enquiryEmail || !enquiryMessage) {
      alert('Please complete your office enquiry details.');
      return;
    }
    setEnquirySubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-orange-600 dark:bg-orange-900 text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2 max-w-4xl mx-auto md:mx-0">
          <span className="font-bold tracking-wide">
            Term 1 2026:
          </span>
          <span>PCEA St Andrews Kindergarten Portal (kindergarten.pceastandrews.org) — Admissions Open.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] mx-auto md:mx-0">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" /> 0786198873
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" /> kindergarten@pceastandrews.org
          </span>
        </div>
      </div>

      {/* Main Navigation (Clean, advertising & info focused, no direct management buttons in header) */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-xl">
              PS
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                PCEA St Andrews Kindergarten
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Nurturing Excellence in Early Childhood Education
              </p>
            </div>
          </div>

          {/* Navigation Links & Theme Toggle */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
              <a href="#about" className="hover:text-orange-600 transition-colors">About Us</a>
              <a href="#gallery" className="hover:text-orange-600 transition-colors">Gallery</a>
              <a href="#enquire" className="hover:text-orange-600 transition-colors">Office Enquiry</a>
              <a href="#report-form" className="hover:text-orange-600 transition-colors">Request Report</a>
            </nav>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Toggle theme (Shift+D)"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section (Advertising the School - No management buttons here) */}
      <section id="about" className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-b from-orange-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
              <Sparkles className="w-4 h-4" />
              <span>Admissions Open for 2026 Academic Year</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Shaping Bright Futures with <span className="text-orange-600 dark:text-orange-500">Christian Values & Montessori Excellence</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Located in the serene surroundings of St Andrews Compound, Church Road, Nairobi, PCEA St Andrews Kindergarten provides a holistic, loving, and stimulating environment where children discover their full potential through play-based learning, CBC curriculum foundations, and spiritual growth.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xl font-black text-orange-600 dark:text-orange-400">Playgroup</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ages 2 - 3 Years</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">PP1 & PP2</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ages 4 - 5 Years</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">Grade 1 - 3</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CBC Primary Classes</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#report-form"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
              >
                <span>Request Child Report</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#enquire"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <HelpCircle className="w-4 h-4 text-orange-600" />
                <span>Enquire School Office</span>
              </a>
            </div>
          </div>

          {/* Right Advertising Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Why Parents Choose Us</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Holistic Child Development</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Experienced, CBC-trained and loving early childhood educators.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Secure, modern playgrounds and Montessori learning apparatus.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Robust digital reporting, attendance tracking, and parent communication.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Nutritious mid-morning snacks and hygienic catering standards.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Visiting Hours: Mon - Fri 8am - 4pm</span>
                <span className="text-orange-600 dark:text-orange-400">Book Visit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Picture Gallery Section */}
      <section id="gallery" className="py-20 px-4 sm:px-8 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Campus & Activities Gallery
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              A Glimpse Into Life at PCEA St Andrews
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Explore our vibrant classrooms, outdoor play areas, creative arts studios, and learning moments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gallery Item 1 */}
            <div className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="h-56 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white relative group-hover:scale-105 transition-transform duration-500">
                <span className="text-4xl font-black opacity-30 absolute">PP2</span>
                <div className="text-center p-4 z-10">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 text-white/90" />
                  <h4 className="font-bold text-base">Interactive Classroom Session</h4>
                  <p className="text-xs text-white/80 mt-1">Montessori learning in PP2 Sunshine</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Academics</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Engaging Early Numeracy & Literacy</h5>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="h-56 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white relative group-hover:scale-105 transition-transform duration-500">
                <span className="text-4xl font-black opacity-30 absolute">PLAY</span>
                <div className="text-center p-4 z-10">
                  <Heart className="w-12 h-12 mx-auto mb-2 text-white/90" />
                  <h4 className="font-bold text-base">Safe Outdoor Play Ground</h4>
                  <p className="text-xs text-white/80 mt-1">Swings, slides, and social development</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Recreation</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Physical Education & Motor Skills</h5>
              </div>
            </div>

            {/* Gallery Item 3 */}
            <div className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="h-56 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white relative group-hover:scale-105 transition-transform duration-500">
                <span className="text-4xl font-black opacity-30 absolute">ART</span>
                <div className="text-center p-4 z-10">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-white/90" />
                  <h4 className="font-bold text-base">Creative Arts & Crafts</h4>
                  <p className="text-xs text-white/80 mt-1">Painting, modeling, and expression</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Talents</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Nurturing Creativity in Every Child</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Enquiry Section */}
      <section id="enquire" className="py-20 px-4 sm:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Direct Contact
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Enquire With Our School Office
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Have questions regarding fee structures, admission vacancies, uniform lists, or school bus transport? Send a direct enquiry to the administration office and our admissions officer will respond promptly.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Call Office Line</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">0786198873</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Email Enquiries</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">kindergarten@pceastandrews.org</span>
                  <span className="text-xs text-slate-500 block">Alt: pceastandrewskindergarten@gmail.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Official Website & Portal</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">kindergarten.pceastandrews.org</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">Send Office Message</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Fill out this quick form for instant office follow-up.</p>

              {enquirySubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Enquiry Received Successfully!</h5>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Thank you, {enquiryName}. Our office will reach out to you via {enquiryEmail} within 24 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setEnquirySubmitted(false);
                      setEnquiryName('');
                      setEnquiryEmail('');
                      setEnquiryMessage('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      placeholder="e.g. Mary Wanjiku"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Email Address</label>
                    <input
                      type="email"
                      required
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      placeholder="e.g. mary@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enquiry Message / Question</label>
                    <textarea
                      rows={3}
                      required
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Ask about admissions, fee structures, school transport..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Office Enquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Request Child Report Section */}
      <section id="report-form" className="py-20 px-4 sm:px-8 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="max-w-xl mx-auto text-center mb-8">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/80 mb-2">
                Official Document Portal
              </p>
              <h3 className="text-2xl sm:text-3xl font-black">Request Child Progress Report</h3>
              <p className="text-xs text-white/90 mt-2">
                Parents can request official terminal progress reports and report cards directly by providing pupil details below.
              </p>
            </div>

            {reportSubmitted ? (
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl text-center space-y-4 shadow-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black">Report Request Logged Successfully!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                  Child Report Request for <strong className="text-orange-600">{childName}</strong> (Admin No: <span className="font-mono">{adminNumber}</span>) has been submitted for verification. The official term report will be sent to <span className="underline">{parentEmail}</span>.
                </p>
                <button
                  onClick={() => {
                    setReportSubmitted(false);
                    setChildName('');
                    setParentName('');
                    setAdminNumber('');
                    setParentEmail('');
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-md"
                >
                  Request Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name of Child *</label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Liam Kiprono"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name of Parent *</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. David Kiprono"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Child Admission Number *</label>
                    <input
                      type="text"
                      required
                      value={adminNumber}
                      onChange={(e) => setAdminNumber(e.target.value)}
                      placeholder="e.g. ADM-2026-001"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Email Address *</label>
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="e.g. david.kiprono@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-xs font-black text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit Child Report Request</span>
                  </button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
                    Reports are verified against school administrative records before dispatch.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer containing all system login / management system action buttons */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: School Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-base">
                PS
              </div>
              <h5 className="text-white font-bold text-sm">PCEA St Andrews</h5>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nurturing young minds in early childhood education with Christian values, Montessori principles, and CBC academic excellence.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h6 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Quick Links</h6>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#about" className="hover:text-orange-400 transition-colors">About Kindergarten</a></li>
              <li><a href="#gallery" className="hover:text-orange-400 transition-colors">Campus & Gallery</a></li>
              <li><a href="#enquire" className="hover:text-orange-400 transition-colors">Office Enquiry</a></li>
              <li><a href="#report-form" className="hover:text-orange-400 transition-colors">Request Report Form</a></li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h6 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Office & Location</h6>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>kindergarten.pceastandrews.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>0786198873</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>kindergarten@pceastandrews.org</span>
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-400">
                <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Alt: pceastandrewskindergarten@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Footer Actions (System Logins & Management Portal) */}
          <div className="space-y-3">
            <h6 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Staff & Management Actions</h6>
            <p className="text-[11px] text-slate-400 mb-3">Authorized teachers and administrators portal access.</p>

            <button
              onClick={() => onEnterSystem('teacher')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Open Teacher Portal & SMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onEnterSystem('admin')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Administrator Login</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <p>© 2026 PCEA St Andrews Kindergarten & School Management System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Secure SSL Connection Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
