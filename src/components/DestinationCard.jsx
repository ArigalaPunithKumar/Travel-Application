import { MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DestinationCard({ destination }) {
  return (
    <Link to={`/destination/${destination.id}`} className="block group">
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative h-[420px] rounded-[2rem] overflow-hidden shadow-premium transition-all duration-300"
      >
        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
        
        <img 
          src={destination.imageUrl} 
          alt={destination.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-20" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center text-primary-light mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-xs font-bold uppercase tracking-wider">{destination.country}</span>
          </div>
          <h3 className="text-3xl font-display font-bold text-white mb-2">{destination.name}</h3>
          
          <div className="flex items-center justify-between mt-4">
            <span className="inline-flex items-center text-xs text-white/80 font-medium bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 mr-1 text-yellow-300" /> {destination.category || 'Destinations'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
