import { useState, useEffect } from 'react';
import { MapPin, Search, ThermometerSun, Cloud, AlertCircle, Loader2, Droplets, Wind, ShieldAlert } from 'lucide-react';
import { getWeather, getTravelAdvisory } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocalWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchWeatherData = async (lat, lon, name) => {
    setStatus('loading');
    setAdvisory(null);
    try {
      const data = await getWeather(lat, lon);
      if (data) {
        setWeather(data);
        setStatus('success');
        
        // Fetch AI advisory asynchronously with current weather
        getTravelAdvisory(name, data).then(res => {
          if (res) setAdvisory(res);
        });
      } else {
        throw new Error('Failed to fetch weather');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Could not load weather data.');
    }
  };

  const handleUseLocation = () => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationName('Your Location');
        await fetchWeatherData(position.coords.latitude, position.coords.longitude, 'your current location');
      },
      () => {
        setStatus('error');
        setErrorMessage('Location permission denied. Please search instead.');
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Clean up query in case user typed "Nepal weather" instead of just "Nepal"
    const cleanQuery = searchQuery.toLowerCase().replace(' weather', '').trim();
    
    setStatus('loading');
    try {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        setLocationName(cleanQuery);
        await fetchWeatherData(40.7128, -74.0060, cleanQuery);
        return;
      }

      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cleanQuery}&limit=1&appid=${API_KEY}`);
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        setLocationName(geoData[0].name);
        await fetchWeatherData(geoData[0].lat, geoData[0].lon, geoData[0].name);
      } else {
        setStatus('error');
        setErrorMessage('Location not found.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Search failed.');
    }
  };

  return (
    <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/10 mb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Controls */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">Live Weather & Alerts</h2>
          <p className="text-slate-400 mb-8 text-sm max-w-md">Search for any city globally to get real-time weather conditions and AI-powered natural calamity warnings for your travel dates.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleUseLocation}
              className="group relative px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-all duration-300 overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700 ease-in-out" />
              <MapPin className="w-5 h-5 mr-2" /> Detect My Location
            </button>
            <div className="relative flex-1">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Or search city..." 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-[#252540] text-white placeholder-slate-500 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>
          
          {status === 'error' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 text-red-500 text-sm flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 mr-2" /> {errorMessage}
            </motion.div>
          )}

          {advisory && (
            <motion.div 
              initial={{opacity:0, y:10}} 
              animate={{opacity:1, y:0}} 
              className={`mt-6 text-sm flex items-start p-4 rounded-xl border ${
                advisory.toLowerCase().includes('warning') || advisory.toLowerCase().includes('not recommended') || advisory.toLowerCase().includes('flood')
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <ShieldAlert className={`w-6 h-6 mr-3 flex-shrink-0 mt-0.5 ${
                advisory.toLowerCase().includes('warning') || advisory.toLowerCase().includes('not recommended') || advisory.toLowerCase().includes('flood')
                ? 'text-red-600 animate-pulse'
                : 'text-amber-600'
              }`} />
              <div className="font-medium leading-relaxed">
                <span className="font-bold block mb-1 text-base">Travel Safety Advisory</span>
                {advisory}
              </div>
            </motion.div>
          )}
        </div>

        {/* Widget Display */}
        <div className="w-full md:w-80 flex-shrink-0 min-h-[220px]">
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-3xl shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
            {/* Animated Background Icon */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute -right-10 -top-10 text-white/10 w-48 h-48"
            >
              {weather?.condition?.toLowerCase().includes('rain') ? <Cloud className="w-full h-full" /> : 
               weather?.condition?.toLowerCase().includes('cloud') ? <Cloud className="w-full h-full" /> : 
               <ThermometerSun className="w-full h-full" />}
            </motion.div>
            
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex items-center justify-center text-center text-primary-light font-medium px-4">
                  Share location or search to view dynamic weather data.
                </motion.div>
              )}
              
              {status === 'loading' && (
                <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center text-white/80">
                  <Loader2 className="w-8 h-8 animate-spin text-white mb-3" />
                  <span className="text-sm font-medium animate-pulse">Fetching latest data...</span>
                </motion.div>
              )}
              
              {status === 'success' && weather && (
                <motion.div key="success" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="relative z-10 flex flex-col h-full justify-between">
                  <div className="font-bold text-primary-light flex items-center truncate text-sm uppercase tracking-wider mb-2">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" /> {locationName}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-6xl font-bold font-display tracking-tighter">{weather.temp}&deg;</div>
                      <div className="text-lg opacity-90 mt-1 capitalize font-medium">{weather.condition}</div>
                    </div>
                    {weather.icon && (
                      <motion.img 
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                        src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} 
                        alt={weather.condition} 
                        className="w-24 h-24 object-contain drop-shadow-xl" 
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 border-t border-white/20 pt-4 mt-auto">
                    <div className="flex items-center text-sm font-medium">
                      <Droplets className="w-4 h-4 mr-2 text-primary-light" />
                      {weather.humidity}% Humidity
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Wind className="w-4 h-4 mr-2 text-primary-light" />
                      {weather.windSpeed} m/s Wind
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
