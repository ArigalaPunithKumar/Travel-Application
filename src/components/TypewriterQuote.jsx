import { useState, useEffect } from 'react';

const quotes = [
  "“To travel is to discover that everyone is wrong about other countries.” – Aldous Huxley",
  "“The world is a book and those who do not travel read only one page.” – St. Augustine",
  "“Take only memories, leave only footprints.” – Chief Seattle",
  "“Travel makes one modest. You see what a tiny place you occupy in the world.” – Gustave Flaubert",
  "“Life is either a daring adventure or nothing at all.” – Helen Keller"
];

export default function TypewriterQuote() {
  const [text, setText] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentQuote = quotes[quoteIndex];
    
    if (isTyping) {
      if (text.length < currentQuote.length) {
        const timeout = setTimeout(() => {
          setText(currentQuote.slice(0, text.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 5000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (text.length > 0) {
        const timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setIsTyping(true);
      }
    }
  }, [text, isTyping, quoteIndex]);

  return (
    <div className="h-20 flex items-start mb-4 max-w-2xl">
      <p className="text-xl md:text-2xl text-secondary-light font-display italic font-light tracking-wide border-r-2 border-secondary-light pr-1 animate-[pulse_1s_ease-in-out_infinite]">
        {text}
      </p>
    </div>
  );
}
