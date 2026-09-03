import { useState } from 'react';
import { Search, Globe, MapPin, Sparkles, Mountain, Landmark, Building2, Trees, Utensils, Umbrella, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { destinations } from '../data/destinations';
import DestinationCard from '../components/DestinationCard';
import LocalWeatherWidget from '../components/LocalWeatherWidget';

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'india', label: 'India', icon: MapPin },
    { id: 'international', label: 'International', icon: Globe },
    { id: 'spiritual', label: 'Spiritual', icon: Sparkles },
    { id: 'adventure', label: 'Adventure', icon: Mountain },
    { id: 'history & heritage', label: 'History', icon: Landmark },
    { id: 'city & luxury', label: 'City & Luxury', icon: Building2 },
    { id: 'nature & wildlife', label: 'Nature', icon: Trees },
    { id: 'food & culture', label: 'Food & Culture', icon: Utensils },
    { id: 'beach & relaxation', label: 'Beaches', icon: Umbrella },
    { id: 'romantic / honeymoon', label: 'Romantic', icon: Heart }
  ];

  const filteredDestinations = destinations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'india') return d.country === 'India';
    if (activeTab === 'international') return d.country !== 'India';
    
    return d.category && d.category.toLowerCase().includes(activeTab.toLowerCase());
  });

  return (
    <div className="pt-24 pb-16 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <LocalWeatherWidget />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 mt-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-display font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-secondary to-accent">
              Explore Destinations
            </h1>
            <p className="text-lg text-slate-400 font-medium">
              Find your perfect getaway from our curated list of world-class locations.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search places..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-[#1a1a2e] text-white placeholder-slate-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-4 snap-x">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm snap-start ${
                  activeTab === cat.id 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                    : 'bg-[#1a1a2e] backdrop-blur-sm text-slate-400 hover:bg-[#252540] hover:text-white border border-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${activeTab === cat.id ? 'text-white' : 'text-primary-light'}`} />
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredDestinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <DestinationCard destination={dest} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24">
            <h3 className="text-2xl font-semibold text-slate-300 mb-2">No destinations found</h3>
            <p className="text-slate-500">Try adjusting your search terms.</p>
          </div>
        )}

      </div>
    </div>
  );
}
