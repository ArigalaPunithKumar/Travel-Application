import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Compass, Calendar, ArrowRight, Sparkles, MessageCircle, Send, X, Bot, Navigation, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { destinations } from '../data/destinations';
import TypewriterQuote from '../components/TypewriterQuote';
import { askAI } from '../services/api';
import DestinationCard from '../components/DestinationCard';

export default function Home() {
  const trendingDestinations = destinations.slice(0, 6);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelStyle, setTravelStyle] = useState('Culture');

  // General Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: "Hi there! 👋 I'm your Wanderlust assistant. Ask me anything about our services, travel tips, destinations, or how to use this platform!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`);
          const data = await res.json();
          if (data?.[0]?.name) {
            setFromLocation(`${data[0].name}, ${data[0].country}`);
          }
        } catch (err) {
          console.error("Could not reverse geocode:", err);
        }
      }, () => {});
    }
  }, []);

  const travelStyles = [
    { name: 'Culture', emoji: '🏛️', reason: 'Museums, temples & local traditions' },
    { name: 'Adventure', emoji: '🧗', reason: 'Trekking, rafting & extreme sports' },
    { name: 'Relaxation', emoji: '🧘', reason: 'Spa, beaches & slow travel' },
    { name: 'Food', emoji: '🍜', reason: 'Street food, fine dining & cooking' },
    { name: 'Nature', emoji: '🌿', reason: 'Wildlife, forests & mountains' },
    { name: 'Family', emoji: '👨‍👩‍👧‍👦', reason: 'Kid-friendly, safe & fun' },
    { name: 'Spiritual', emoji: '🙏', reason: 'Pilgrimage, meditation & peace' },
    { name: 'Romantic', emoji: '❤️', reason: 'Honeymoon, couples & sunset' },
    { name: 'Solo', emoji: '🎒', reason: 'Independent, flexible & discovery' },
    { name: 'Budget', emoji: '💰', reason: 'Affordable stays & transport' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/planner', {
        state: {
          destination: searchQuery,
          from: fromLocation,
          startDate,
          endDate,
          travelStyle,
          autoSubmit: true
        }
      });
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const response = await askAI(
        userMsg,
        "You are a general assistant for the Wanderlust travel website. The site offers: AI-powered itinerary planning (free), destination exploration with 25+ destinations (India and international), real-time weather with calamity warnings, destination-specific AI chatbot on each destination page, and a Quick Planner. Services are free. Help users navigate the site, give travel tips, visa info, packing advice, or answer any general travel question. Be friendly, concise and helpful. Use HTML with Tailwind CSS for any formatted responses."
      );
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-foreground">
        {/* Vibrant Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000&auto=format&fit=crop" 
            alt="Paris Sunset" 
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary-dark/60 to-secondary-dark/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1a2e]/95" />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Text Content */}
          <div className="flex-1 text-left lg:pr-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide mb-6">
                <Sparkles className="w-4 h-4 mr-2 text-secondary-light" />
                AI-Powered Travel Intelligence
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-light to-secondary">Dream Trip</span> in Seconds.
              </h1>
              
              <TypewriterQuote />
              
              <p className="text-lg md:text-xl text-white/90 mb-8 font-light max-w-2xl leading-relaxed">
                Experience the world like never before. Tell us where you want to go, and our AI will instantly curate a deeply personalized, day-by-day itinerary based on real-time data.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/explore" 
                  className="bg-gradient-to-r from-secondary to-secondary-light text-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center hover:shadow-xl hover:-translate-y-1 shadow-lg"
                >
                  Explore Destinations <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button 
                  onClick={() => setChatOpen(true)}
                  className="bg-white/15 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center hover:bg-white/25 hover:-translate-y-1"
                >
                  <MessageCircle className="mr-2 w-5 h-5" /> Ask AI Assistant
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Floating Card — Enhanced Quick Planner */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-[480px]"
          >
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-premium border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-2xl text-foreground">Quick Planner</h3>
                <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Free</span>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-4">
                {/* From Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Travelling From</label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Your current city" 
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-emerald-50/50 text-sm"
                    />
                    {fromLocation && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">📍 Detected</span>}
                  </div>
                </div>

                {/* To Destination */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="e.g. Tokyo, Paris, Bali" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 text-sm"
                    />
                  </div>
                </div>

                {/* Date Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-2 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                      <input 
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-2 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Style */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Travel Style</label>
                  <div className="flex flex-wrap gap-2">
                    {travelStyles.slice(0, 5).map(s => (
                      <button 
                        key={s.name} type="button"
                        onClick={() => setTravelStyle(s.name)}
                        title={s.reason}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          travelStyle === s.name 
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s.emoji} {s.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {travelStyles.slice(5).map(s => (
                      <button 
                        key={s.name} type="button"
                        onClick={() => setTravelStyle(s.name)}
                        title={s.reason}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          travelStyle === s.name 
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s.emoji} {s.name}
                      </button>
                    ))}
                  </div>
                  {travelStyle && (
                    <p className="text-xs text-primary font-medium mt-1.5 ml-1">
                      ✨ {travelStyles.find(s => s.name === travelStyle)?.reason}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary via-primary-dark to-secondary hover:from-primary-dark hover:to-secondary-dark text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  🚀 Start Planning
                </button>
                <p className="text-center text-xs text-slate-400 font-medium">
                  No signup required • AI will include travel routes & medical tips
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations - Darker Background */}
      <section className="py-24 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Trending Destinations</h2>
              <p className="text-slate-400 text-lg">Discover the most popular places our travelers are exploring right now. Immerse yourself in rich cultures and breathtaking landscapes.</p>
            </div>
            <Link to="/explore" className="text-secondary font-semibold hover:text-secondary-light flex items-center mt-4 md:mt-0 transition-colors">
              View all places <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingDestinations.slice(0, 3).map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* General AI Chatbot — Floating Button + Modal */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
          >
            <MessageCircle className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-[#1e1e2f] rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mr-3">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Wanderlust AI Assistant</h4>
                  <p className="text-white/70 text-xs">Ask anything about travel & services</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-sm' 
                      : 'bg-[#2a2a3e] text-slate-200 rounded-bl-sm border border-white/5'
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                </motion.div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2a2a3e] text-slate-300 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/5">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSend} className="p-4 border-t border-white/10 flex gap-2 bg-[#1a1a2a]">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about services, visa tips..."
                className="flex-1 bg-[#2a2a3e] text-white placeholder-slate-500 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button 
                type="submit" 
                disabled={isChatLoading}
                className="bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
