import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isHome ? 'bg-transparent text-white py-6' : 'bg-[#12121f]/90 backdrop-blur-2xl shadow-lg border-b border-white/5 text-white py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Compass className={`w-8 h-8 transition-transform duration-500 group-hover:rotate-45 text-primary-light`} />
            <span className="font-display font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary">Wanderlust</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/explore" className="font-medium hover:text-secondary transition-colors text-slate-300 hover:text-white">
              Destinations
            </Link>
            <Link to="/planner" className="font-medium hover:text-secondary transition-colors text-slate-300 hover:text-white">
              AI Planner
            </Link>
            <Link to="/planner" className="px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-secondary text-white hover:-translate-y-0.5">
              Plan My Trip
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 bg-[#1a1a2e] rounded-2xl p-6 space-y-4 border border-white/10"
          >
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white font-medium">Destinations</Link>
            <Link to="/planner" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white font-medium">AI Planner</Link>
            <Link to="/planner" onClick={() => setMobileOpen(false)} className="block bg-gradient-to-r from-primary to-secondary text-white text-center py-3 rounded-xl font-bold">Plan My Trip</Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
