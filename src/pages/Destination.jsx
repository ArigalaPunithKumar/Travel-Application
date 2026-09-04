import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Cloud, ThermometerSun, Calendar, Sparkles, Send, Loader2, ArrowUp, ShieldAlert, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { destinations } from '../data/destinations';
import { getDestinationImage, getWeather, askAI, generateItinerary, getTravelAdvisory } from '../services/api';

export default function Destination() {
  const { id } = useParams();
  const dest = destinations.find(d => d.id === id);
  
  const [imageUrl, setImageUrl] = useState('');
  const [weather, setWeather] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [isItineraryLoading, setIsItineraryLoading] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const chatEndRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [advisory, setAdvisory] = useState(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Window scroll listener for Scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (dest) {
      getDestinationImage(`${dest.name} ${dest.country} landmark high quality`, dest.imageUrl).then(setImageUrl);
      getWeather(dest.latitude, dest.longitude).then(w => {
        setWeather(w);
        if (w) {
          getTravelAdvisory(`${dest.name}, ${dest.country}`, w).then(res => { if (res) setAdvisory(res); });
        }
      });
      
      setChatMessages([
        { role: 'ai', text: `Hi! I'm your AI guide for ${dest.name}. Ask me what to pack, when to go, or hidden gems to explore!` }
      ]);
    }
  }, [dest]);

  if (!dest) return <div className="pt-24 text-center">Destination not found.</div>;

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);
    
    const response = await askAI(userMessage, dest.description);
    
    setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsChatLoading(false);
  };

  const handleGenerateItinerary = async () => {
    setIsItineraryLoading(true);
    const data = await generateItinerary(`${dest.name}, ${dest.country}`, 3);
    setItinerary(data);
    setIsItineraryLoading(false);
  };

  return (
    <div className="min-h-screen relative z-10 pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] w-full">
        {imageUrl && <img src={imageUrl} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121f] via-black/40 to-black/10" />
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <Link to="/explore" className="text-white/80 hover:text-white flex items-center mb-6 w-fit backdrop-blur-md bg-white/10 px-4 py-2 rounded-full transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
          </Link>
          <div className="flex items-center text-white/90 font-medium mb-2 text-lg">
            <MapPin className="w-5 h-5 mr-2" /> {dest.country}
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white shadow-sm">{dest.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* About */}
          <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
            <h2 className="text-3xl font-display font-bold text-white mb-4">About {dest.name}</h2>
            <p className="text-lg text-slate-400 leading-relaxed">{dest.description}</p>
          </motion.section>

          {/* Famous Places */}
          <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
            <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-primary" /> Must-Visit Places
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dest.famousPlaces.map((place, i) => (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  key={i} 
                  className="bg-[#1a1a2e] border border-white/5 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all flex items-center cursor-default group"
                >
                  <div className="bg-primary/20 p-3 rounded-full mr-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">{place}</h3>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Nearby Places */}
          {dest.nearbyPlaces && (
            <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
              <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-secondary" /> Nearby Getaways
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dest.nearbyPlaces.map((place, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    key={i} 
                    className="bg-[#1a1a2e] border border-white/5 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-center"
                  >
                    <div className="bg-secondary/20 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 text-secondary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-white">{place.split(' (')[0]}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {place.includes('(') ? place.split('(')[1].replace(')', '') : 'Nearby'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Itinerary Planner */}
          <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-3xl font-display font-bold text-white flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-accent" /> AI Itinerary
              </h2>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateItinerary} 
                disabled={isItineraryLoading}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-all disabled:opacity-50 shadow-lg"
              >
                {isItineraryLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Generate 3-Day Plan
              </motion.button>
            </div>
            
            {itinerary.length > 0 && (
              <div className="space-y-6">
                {itinerary.map((day, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    key={day.day} 
                    className="bg-[#1a1a2e] border-l-4 border-primary p-6 rounded-r-2xl shadow-lg"
                  >
                    <div className="flex items-center text-primary-light font-bold mb-4 text-xl">
                      Day {day.day}: {day.title}
                    </div>
                    <ul className="space-y-3">
                      {day.activities.map((act, j) => (
                        <li key={j} className="flex items-start text-slate-300 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-secondary mt-1.5 mr-3 flex-shrink-0" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}
            
            {itinerary.length === 0 && !isItineraryLoading && (
              <div className="bg-[#1a1a2e] border border-white/5 p-8 rounded-2xl text-center text-slate-500">
                Click generate to let AI plan your perfect trip.
              </div>
            )}
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Weather Widget */}
          <div className="bg-gradient-to-br from-blue-500 to-primary text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-white/10 w-40 h-40">
              <Cloud className="w-full h-full" />
            </div>
            <h3 className="font-semibold text-xl mb-6 flex items-center">
              <ThermometerSun className="w-6 h-6 mr-2" /> Live Weather
            </h3>
            {weather ? (
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <div className="text-6xl font-bold font-display">{weather.temp}°</div>
                  <div className="text-xl opacity-90 mt-1">{weather.condition}</div>
                </div>
                {weather.icon && (
                  <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} className="w-20 h-20" />
                )}
              </div>
            ) : (
              <div className="animate-pulse flex space-x-4 h-20 items-center text-white/70">Loading weather...</div>
            )}
          </div>

          {/* Travel Advisory */}
          {advisory && (
            <motion.div 
              initial={{opacity:0, y:10}} 
              animate={{opacity:1, y:0}}
              className={`text-sm flex items-start p-5 rounded-2xl border ${
                advisory.toLowerCase().includes('warning') || advisory.toLowerCase().includes('not recommended') || advisory.toLowerCase().includes('flood') || advisory.toLowerCase().includes('earthquake') || advisory.toLowerCase().includes('cyclone') || advisory.toLowerCase().includes('attack')
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <ShieldAlert className={`w-6 h-6 mr-3 flex-shrink-0 mt-0.5 ${
                advisory.toLowerCase().includes('warning') || advisory.toLowerCase().includes('not recommended') || advisory.toLowerCase().includes('flood')
                ? 'text-red-400 animate-pulse'
                : 'text-amber-400'
              }`} />
              <div className="font-medium leading-relaxed">
                <span className="font-bold block mb-1 text-base">⚠️ Travel Safety Advisory</span>
                {advisory}
              </div>
            </motion.div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold text-lg text-white mb-3 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-emerald-400" /> Emergency Contacts
            </h3>
            <div className="space-y-2 text-sm text-slate-400">
              {dest.country === 'India' && (
                <>
                  <p>🚔 Police: <span className="text-white font-medium">100</span></p>
                  <p>🚑 Ambulance: <span className="text-white font-medium">108</span></p>
                  <p>🔥 Fire: <span className="text-white font-medium">101</span></p>
                  <p>📞 Women Helpline: <span className="text-white font-medium">181</span></p>
                  <p>🆘 Disaster: <span className="text-white font-medium">112 (Universal)</span></p>
                </>
              )}
              {dest.country === 'United States' && (
                <>
                  <p>🚔 Police / 🚑 Ambulance / 🔥 Fire: <span className="text-white font-medium">911</span></p>
                  <p>🆘 Non-Emergency: <span className="text-white font-medium">311</span></p>
                </>
              )}
              {dest.country === 'Japan' && (
                <>
                  <p>🚔 Police: <span className="text-white font-medium">110</span></p>
                  <p>🚑 Ambulance / 🔥 Fire: <span className="text-white font-medium">119</span></p>
                </>
              )}
              {dest.country !== 'India' && dest.country !== 'United States' && dest.country !== 'Japan' && (
                <p>🆘 Universal Emergency: <span className="text-white font-medium">112</span></p>
              )}
              <p className="text-xs text-slate-500 mt-2 italic">Save these numbers before you travel!</p>
            </div>
          </div>

          {/* AI Chatbot */}
          <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 font-semibold flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-300" /> Destination Assistant
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#12121f] relative">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'ai' || msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'ai' || msg.role === 'assistant' ? 'bg-[#252540] border border-white/5 text-slate-200 rounded-tl-none' : 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-tr-none'}`}
                  >
                    {(msg.role === 'ai' || msg.role === 'assistant') ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.text || msg.content }} />
                    ) : (
                      msg.text || msg.content
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#252540] border border-white/5 text-slate-400 p-4 rounded-2xl rounded-tl-none text-sm flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-[#1a1a2e] border-t border-white/10">
              <form onSubmit={handleChat} className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Ask about things to do, hotels..." 
                  className="flex-1 bg-[#252540] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-white placeholder-slate-500"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-white p-3 rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-primary transition-colors z-50 flex items-center justify-center"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
