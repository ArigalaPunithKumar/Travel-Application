import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Compass, Sparkles, ArrowRight, Wallet, Loader2, Navigation, ShieldCheck, Stethoscope, Route, Plane, Train, Car, ArrowDown } from 'lucide-react';
import { generateItinerary, askAI } from '../services/api';

export default function Planner() {
  const location = useLocation();
  const itineraryRef = useRef(null);
  const [fromLocation, setFromLocation] = useState(location.state?.from || '');
  const [destination, setDestination] = useState(location.state?.destination || '');
  const [startDate, setStartDate] = useState(location.state?.startDate || '');
  const [endDate, setEndDate] = useState(location.state?.endDate || '');
  const [budget, setBudget] = useState('50000');
  const [travelStyle, setTravelStyle] = useState(location.state?.travelStyle || 'Culture');
  
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [isTravelInfoLoading, setIsTravelInfoLoading] = useState(false);

  const travelStyles = [
    { name: 'Culture', emoji: '🏛️', reason: 'Museums, temples & local traditions' },
    { name: 'Adventure', emoji: '🧗', reason: 'Trekking, rafting & extreme sports' },
    { name: 'Relaxation', emoji: '🧘', reason: 'Spa, beaches & slow travel' },
    { name: 'Food', emoji: '🍜', reason: 'Street food, fine dining & cooking classes' },
    { name: 'Nature', emoji: '🌿', reason: 'Wildlife, forests & mountains' },
    { name: 'Family', emoji: '👨‍👩‍👧‍👦', reason: 'Kid-friendly, safe & fun for all ages' },
    { name: 'Spiritual', emoji: '🙏', reason: 'Pilgrimage, meditation & peace' },
    { name: 'Romantic', emoji: '❤️', reason: 'Honeymoon, couples & sunset views' },
    { name: 'Solo', emoji: '🎒', reason: 'Independent, flexible & self-discovery' },
    { name: 'Budget', emoji: '💰', reason: 'Affordable stays & public transport' },
  ];

  // Auto-detect location if not pre-filled
  useEffect(() => {
    if (!fromLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`);
          const data = await res.json();
          if (data?.[0]?.name) {
            setFromLocation(`${data[0].name}, ${data[0].country}`);
          }
        } catch (err) { /* ignore */ }
      }, () => {});
    }
  }, []);

  // Auto-generate if routed from Home page
  useEffect(() => {
    if (location.state?.destination && location.state?.autoSubmit) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!destination.trim()) return;

    setIsLoading(true);
    setIsTravelInfoLoading(true);
    setTravelInfo(null);

    try {
      let days = 3;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (days > 14) days = 14;
        if (days < 1) days = 1;
      }
      
      const result = await generateItinerary(destination, days);
      setItinerary(result);
      // Auto-scroll to itinerary after a brief delay
      setTimeout(() => {
        itineraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    // Fetch travel route + medical info in parallel
    try {
      const dateRange = startDate && endDate ? `from ${startDate} to ${endDate}` : 'for a 3-day trip';
      const travelResponse = await askAI(
        `I am travelling from ${fromLocation || 'my city'} to ${destination} ${dateRange} with a budget of ₹${budget} INR. Travel style: ${travelStyle}.`,
        `You are a comprehensive travel advisor. Provide the following in a single, well-structured HTML response using Tailwind CSS classes:
        
        1. **How to Travel**: List ALL ways to get from ${fromLocation || 'a major Indian city'} to ${destination} (flights, trains, buses, driving). Include approximate travel time, cost range in INR, and which is recommended.
        
        2. **Medical & Health Essentials**: List essential medicines and medical items to carry. Include first-aid kit, altitude sickness pills if going to hills, anti-diarrheal, sunscreen, insect repellent, hand sanitizer, face masks, any vaccinations needed for the destination. Use a bright red/orange warning card style.
        
        3. **Packing Checklist**: Based on the destination's weather and the travel style (${travelStyle}), suggest what to pack.
        
        4. **Safety Tips**: Important local safety advice, emergency numbers, and any travel warnings.
        
        Use beautiful HTML with Tailwind CSS. Use colored cards, icons via emojis, bold headings. Make it visually appealing. Do NOT use markdown.`
      );
      setTravelInfo(travelResponse);
    } catch (err) {
      console.error("Travel info error:", err);
    } finally {
      setIsTravelInfoLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#0f0f1a] flex flex-col items-center pb-24 relative z-10">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute top-[50%] left-[5%] w-[25%] h-[25%] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-secondary to-accent font-bold tracking-widest uppercase text-sm mb-4">Free AI Travel Itinerary Generator</h2>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
              Free AI Travel <br /> Itinerary Generator
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              Enter your origin, destination, dates and get a practical day-by-day itinerary with travel routes, medical tips, and packing advice.
            </p>
            <div className="flex justify-center space-x-6 mt-8 text-sm text-slate-500 font-medium">
              <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary" /> No signup</span>
              <span className="flex items-center"><Route className="w-4 h-4 mr-2 text-secondary" /> Travel routes</span>
              <span className="flex items-center"><Stethoscope className="w-4 h-4 mr-2 text-accent" /> Medical tips</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <h3 className="font-bold text-2xl text-white flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-secondary" /> Live AI Planner
            </h3>
            <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Free</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* From & To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">✈️ Travelling From</label>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
                  <input 
                    type="text" value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="Your city (auto-detected)"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-[#252540] text-white placeholder-slate-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">📍 Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 w-5 h-5" />
                  <input 
                    type="text" value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where do you want to go?"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-[#252540] text-white placeholder-slate-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Dates & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">📅 Start Date</label>
                <input 
                  type="date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-[#252540] text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">📅 End Date</label>
                <input 
                  type="date" value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-[#252540] text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">💰 Budget (INR)</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                  <input 
                    type="number" value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50000"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-[#252540] text-white placeholder-slate-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Travel Styles */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">🧳 Travel Style</label>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map(s => (
                  <button 
                    key={s.name} type="button"
                    onClick={() => setTravelStyle(s.name)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      travelStyle === s.name 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105' 
                        : 'bg-[#252540] text-slate-400 hover:bg-[#303050] hover:text-white border border-white/5'
                    }`}
                  >
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
              {travelStyle && (
                <p className="text-xs text-primary-light font-medium mt-2 ml-1">
                  ✨ {travelStyles.find(s => s.name === travelStyle)?.reason}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white py-5 rounded-xl font-bold text-xl transition-all shadow-xl flex justify-center items-center disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : null}
                {isLoading ? "Generating... (Auto-scrolling when done)" : "🚀 Generate my free itinerary"} {!isLoading && <ArrowRight className="ml-2 w-6 h-6" />}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                Scroll down to view your itinerary after generation, or wait to be auto-directed.
              </p>
            </div>
          </form>
        </motion.div>

        {/* Scroll Target */}
        <div ref={itineraryRef} className="h-4" />

        {/* Travel Info Section (Routes, Medical, Packing) */}
        <AnimatePresence>
          {(isTravelInfoLoading || travelInfo) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mt-8 bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center">
                <Route className="w-7 h-7 mr-3 text-secondary" /> Travel Guide: {fromLocation || 'Your City'} → {destination}
              </h2>
              {isTravelInfoLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mr-3 text-primary" />
                  <span className="text-lg">AI is preparing your travel guide, medical tips & packing list...</span>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: travelInfo }} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Itinerary Section */}
        <AnimatePresence>
          {itinerary && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mt-12 bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-8 text-center flex items-center justify-center">
                <Sparkles className="w-8 h-8 mr-3 text-secondary" /> Your Custom Itinerary for {destination}
              </h2>
              <div className="space-y-6">
                {itinerary.map((day) => (
                  <motion.div 
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: day.day * 0.1 }}
                    className="bg-[#252540] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row gap-6"
                  >
                    <div className="md:w-1/4">
                      <div className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold px-4 py-2 rounded-lg inline-block mb-2">Day {day.day}</div>
                      <h3 className="font-bold text-lg text-white leading-tight">{day.title}</h3>
                    </div>
                    <div className="md:w-3/4">
                      <ul className="space-y-3">
                        {day.activities.map((act, j) => (
                          <li key={j} className="flex items-start text-slate-300 font-medium">
                            <span className="w-2 h-2 rounded-full bg-secondary mt-2 mr-3 flex-shrink-0" />
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Medical Warning Box */}
              <div className="mt-8 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-red-300 flex items-center mb-3">
                  <Stethoscope className="w-6 h-6 mr-2" /> ⚠️ Medical Essentials — Don't Forget!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="flex items-start"><span className="mr-2">💊</span> First-aid kit (bandages, antiseptic, cotton)</div>
                  <div className="flex items-start"><span className="mr-2">🤒</span> Fever & pain relief (Paracetamol/Dolo 650)</div>
                  <div className="flex items-start"><span className="mr-2">🤢</span> Anti-diarrheal & ORS packets</div>
                  <div className="flex items-start"><span className="mr-2">🧴</span> Sunscreen SPF 50+ & insect repellent</div>
                  <div className="flex items-start"><span className="mr-2">😷</span> Face masks & hand sanitizer</div>
                  <div className="flex items-start"><span className="mr-2">💉</span> Any personal prescription medicines</div>
                  <div className="flex items-start"><span className="mr-2">🏔️</span> Altitude sickness pills (for hill stations)</div>
                  <div className="flex items-start"><span className="mr-2">🩹</span> Motion sickness tablets (for long drives)</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Related Planning Paths */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-white font-bold text-2xl mb-8 text-center">Related planning paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Browse destinations", desc: "Use destination hubs when you need city-level itinerary options before generating." },
              { title: "Plan by budget", desc: "Use budget-first planning when total cost is the main trip constraint." },
              { title: "Plan family travel", desc: "Use family-first planning for easier pacing, logistics, and kid-friendly days." },
              { title: "Plan solo travel", desc: "Use solo-first planning for flexible routes, safer neighborhoods, and independent pacing." },
              { title: "Read travel guides", desc: "Use guides to understand trip structure, budget tradeoffs, and workflows." },
              { title: "See a 5-day example", desc: "Review a concrete itinerary before asking the AI planner to adjust pacing." }
            ].map((path, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="bg-[#252540] hover:bg-[#303050] border border-white/5 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1"
              >
                <h4 className="text-white font-bold text-lg mb-2">{path.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{path.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
