import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#12121f] relative selection:bg-primary/20 font-sans">
      {/* Ambient Premium Background — Vivid & Dark */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-secondary/15 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-accent/15 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-[#0a0a15] text-slate-300 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">Wanderlust</h3>
              <p className="text-sm leading-relaxed text-slate-500 max-w-sm">
                AI assisted travel planning, destination research, and practical itinerary workflows for travelers who want clearer routes before they book.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Plan</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/planner" className="text-slate-400 hover:text-primary-light transition-colors">AI Travel Planner</a></li>
                <li><a href="/explore" className="text-slate-400 hover:text-primary-light transition-colors">Destinations</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Travel Guides</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Trip Planning Guide</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Use Cases</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Budget Travel Planner</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Family Travel Planner</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Solo Travel Planner</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Custom AI Planner</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Terms of Use</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Disclaimer</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary-light transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 text-sm text-slate-600 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            <div className="mt-4 md:mt-0 space-x-4">
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Global Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-bounce"
          style={{ animationDuration: '2s' }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
