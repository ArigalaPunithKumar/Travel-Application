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

export async function askAI(prompt, context) {
  if (!OPENROUTER_API_KEY) {
    console.warn("No OpenRouter API key provided. Using mock chat response.");
    return "I am a mock AI assistant. Please add your OpenRouter API key to `.env` to enable real AI capabilities. To answer your question: " + context.substring(0, 50) + "...";
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
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
        ]
      })
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("Error asking AI via OpenRouter:", error);
    return "Sorry, I encountered an error connecting to the AI.";
  }
}

export async function generateItinerary(destination, days = 3) {
  if (!OPENROUTER_API_KEY) {
    console.warn("No OpenRouter API key provided. Using mock itinerary.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { day: 1, title: 'Arrival & Exploration', activities: ['Check into hotel', 'Visit local market', 'Dinner at famous restaurant'] },
          { day: 2, title: 'Sightseeing & Culture', activities: ['Guided city tour', 'Museum visit', 'Sunset viewing'] },
          { day: 3, title: 'Adventure & Departure', activities: ['Morning hike/activity', 'Souvenir shopping', 'Head to airport'] }
        ]);
      }, 1500);
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: `Create a ${days}-day travel itinerary for ${destination}. 
            Return ONLY a valid JSON array of objects. Do NOT wrap it in markdown blockquotes like \`\`\`json.
            Each object must have exactly these keys:
            - "day": number (e.g. 1)
            - "title": string (brief theme for the day)
            - "activities": array of 3 strings (specific things to do)`
          }
        ]
      })
    });

    const data = await response.json();
    const textContent = data.choices[0].message.content;
    
    // Attempt to parse JSON safely, sometimes AI returns markdown around it
    let cleanJson = textContent;
    if (cleanJson.includes('```json')) {
      cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
    } else if (cleanJson.includes('```')) {
      cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating itinerary from OpenRouter:", error);
    return [
      { day: 1, title: 'Arrival & Exploration (Fallback)', activities: ['Check into hotel', 'Visit local market', 'Dinner at famous restaurant'] },
      { day: 2, title: 'Sightseeing & Culture (Fallback)', activities: ['Guided city tour', 'Museum visit', 'Sunset viewing'] },
      { day: 3, title: 'Adventure & Departure (Fallback)', activities: ['Morning hike/activity', 'Souvenir shopping', 'Head to airport'] }
    ];
  }
}

export async function getTravelAdvisory(location) {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const models = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-3n-e4b-it:free"
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content: `You are a concise travel safety advisor. Today is ${currentDate}. Reply in 2-3 sentences MAXIMUM. No markdown.`
            },
            {
              role: "user",
              content: `For "${location}", briefly warn about: 1) Any recent natural disasters (floods, earthquakes, cyclones, landslides, tsunamis) 2) Any recent man-made risks (terrorist attacks, political unrest, protests, disease outbreaks) 3) Current seasonal weather risks. If nothing dangerous, say "Weather is currently favorable for travel to ${location}."`
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const result = data?.choices?.[0]?.message?.content;
      if (result && result.trim().length > 10) {
        return result.trim();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`Advisory timed out with model ${model}, trying next...`);
        continue;
      }
      console.error(`Advisory error with model ${model}:`, error);
      continue;
    }
  }

  return "Please check local news for the latest travel advisories for this destination.";
}
