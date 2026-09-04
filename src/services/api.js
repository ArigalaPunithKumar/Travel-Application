const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function getWeather(lat, lon) {
  if (!WEATHER_API_KEY) {
    console.warn("No OpenWeather API key provided. Using mock weather data.");
    return { temp: 24, condition: "Sunny", icon: "01d" };
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
    const data = await res.json();
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

export async function getDestinationImage(query, fallbackUrl) {
  if (!UNSPLASH_API_KEY) {
    return fallbackUrl || `https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop`;
  }

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_API_KEY}&per_page=1&orientation=landscape`);
    const data = await res.json();
    return data.results[0]?.urls?.regular || fallbackUrl || `https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop`;
  } catch (error) {
    console.error("Error fetching image:", error);
    return fallbackUrl || `https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop`;
  }
}

async function callAI(messages, maxTokens = null) {
  const models = [
    "google/gemini-2.5-flash:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-3n-e4b-it:free"
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const body = { model, messages };
      if (maxTokens) body.max_tokens = maxTokens;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) continue;

      const data = await response.json();
      const result = data?.choices?.[0]?.message?.content;
      
      if (result && result.trim().length > 5) {
        return result.trim();
      }
    } catch (error) {
      console.warn(`Model ${model} failed or timed out. Trying next...`);
      continue;
    }
  }
  throw new Error("All AI models failed or timed out.");
}

export async function askAI(prompt, context) {
  if (!OPENROUTER_API_KEY) {
    console.warn("No OpenRouter API key provided.");
    return "Please add your OpenRouter API key to `.env` to enable real AI capabilities.";
  }

  try {
    const response = await callAI([
      {
        role: "system",
        content: `You are a helpful travel guide assistant. Use this context about the destination to answer questions: ${context}. 
        IMPORTANT: If the user asks for recommendations like hotels, restaurants, or places to visit, you MUST return your response as raw HTML using Tailwind CSS classes for beautiful cards. For example, for a hotel use: <div class="bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-200 mb-3"><h4 class="font-bold text-lg text-primary">Hotel Name</h4><p class="text-sm text-slate-600 mt-1">Description...</p></div>. 
        Do NOT use markdown (no asterisks, no backticks). Return ONLY valid HTML that can be rendered directly.`
      },
      {
        role: "user",
        content: prompt
      }
    ]);
    return response;
  } catch (error) {
    console.error("Error asking AI:", error);
    return "Sorry, I am currently experiencing high traffic and couldn't process that. Please try again in a moment.";
  }
}

export async function generateItinerary(destination, days = 3) {
  if (!OPENROUTER_API_KEY) {
    return [
      { day: 1, title: 'Arrival & Exploration (Fallback)', activities: ['Check into hotel', 'Visit local market', 'Dinner'] },
      { day: 2, title: 'Sightseeing (Fallback)', activities: ['Guided city tour', 'Museum visit', 'Sunset viewing'] },
      { day: 3, title: 'Departure (Fallback)', activities: ['Morning activity', 'Souvenir shopping', 'Head to airport'] }
    ];
  }

  try {
    const textContent = await callAI([
      {
        role: "user",
        content: `Create a ${days}-day travel itinerary for ${destination}. 
        Return ONLY a valid JSON array of objects. Do NOT wrap it in markdown blockquotes like \`\`\`json.
        Each object must have exactly these keys:
        - "day": number (e.g. 1)
        - "title": string (brief theme for the day)
        - "activities": array of 3 strings (specific things to do)`
      }
    ], 1000);
    
    let cleanJson = textContent;
    if (cleanJson.includes('```json')) cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
    else if (cleanJson.includes('```')) cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return [
      { day: 1, title: 'Arrival & Exploration (Fallback)', activities: ['Check into hotel', 'Visit local market', 'Dinner'] },
      { day: 2, title: 'Sightseeing (Fallback)', activities: ['Guided city tour', 'Museum visit', 'Sunset viewing'] },
      { day: 3, title: 'Departure (Fallback)', activities: ['Morning activity', 'Souvenir shopping', 'Head to airport'] }
    ];
  }
}

export async function getTravelAdvisory(location, weather) {
  if (!OPENROUTER_API_KEY) return null;

  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  let weatherContext = "";
  if (weather) {
    weatherContext = `The current live weather in ${location} is ${weather.temp}°C with ${weather.condition}. `;
  }

  try {
    const response = await callAI([
      {
        role: "system",
        content: `You are a concise travel safety advisor. Today is ${currentDate}. Reply in 2-3 sentences MAXIMUM. No markdown.`
      },
      {
        role: "user",
        content: `${weatherContext}For "${location}", check your knowledge for any major news from the last 10-15 days. Briefly warn about: 1) Any recent natural disasters (floods, earthquakes, cyclones) 2) Any recent man-made risks (unrest, disease) 3) Any risks associated with the current live weather. If nothing dangerous, say "Based on recent reports, current conditions are favorable for travel to ${location}."`
      }
    ], 200);
    return response;
  } catch (error) {
    console.error("Advisory error:", error);
    // Ultimate fallback if AI completely fails
    if (weather) {
      const temp = weather.temp;
      const cond = weather.condition.toLowerCase();
      if (cond.includes("rain") || cond.includes("storm") || cond.includes("drizzle") || cond.includes("thunder")) {
        return `Current live weather in ${location} shows ${temp}°C and ${cond}. Please carry waterproof gear, check road conditions, and be cautious of localized flooding.`;
      }
      if (temp > 35) {
        return `Current live weather in ${location} shows a very hot ${temp}°C. Stay hydrated and avoid prolonged outdoor activities during peak hours.`;
      }
      if (temp < 5) {
        return `Current live weather in ${location} shows a very cold ${temp}°C. Pack adequate warm clothing and be cautious on icy roads.`;
      }
      return `Current live weather in ${location} is ${temp}°C with ${cond}. Conditions appear favorable for travel.`;
    }
    return `Conditions are generally favorable for travel to ${location} during this season.`;
  }
}
