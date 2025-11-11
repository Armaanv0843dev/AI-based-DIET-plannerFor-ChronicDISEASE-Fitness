"use client";

import { useEffect, useState } from "react";

const FACTS: string[] = [
  "Eat a variety of colorful vegetables each day for vitamins and fiber.",
  "Include protein with every meal to support satiety and muscle maintenance.",
  "Whole grains provide longer-lasting energy than refined carbohydrates.",
  "Stay hydrated — aim for about 2 liters of fluids daily.",
  "Limit added sugars; choose fruit for natural sweetness and fiber.",
  "Healthy fats (nuts, seeds, olive oil) support brain and heart health.",
  "Small, frequent meals can help manage blood sugar for some people.",
  "Fiber-rich foods promote gut health and help control appetite.",
  "Eating slowly helps your brain recognize when you're full.",
  "Dark leafy greens are rich in iron and other essential minerals.",
  "Fish contains omega-3 fatty acids that support brain function.",
  "Berries are packed with antioxidants that fight inflammation.",
  "Fermented foods like yogurt support gut health with probiotics.",
  "Nuts and seeds provide healthy fats and plant-based protein.",
  "Mushrooms are a good source of vitamin D when exposed to sunlight.",
  "Green tea contains compounds that may boost metabolism.",
  "Spices like turmeric and ginger have anti-inflammatory properties.",
  "Beans and lentils are excellent sources of plant-based protein.",
  "Eating breakfast can help regulate your appetite throughout the day.",
  "Dark chocolate (70%+ cocoa) contains beneficial antioxidants.",
];

export default function FactsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onNext = () => setIndex((i) => (i + 1) % FACTS.length);
    const onPrev = () => setIndex((i) => (i - 1 + FACTS.length) % FACTS.length);

    // Auto-rotate facts every 8 seconds
    const interval = setInterval(onNext, 8000);

    window.addEventListener("facts-next", onNext as EventListener);
    window.addEventListener("facts-prev", onPrev as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("facts-next", onNext as EventListener);
      window.removeEventListener("facts-prev", onPrev as EventListener);
    };
  }, []);

  return (
    <div className="bg-[#309c3e]/90 p-6 rounded-lg shadow-lg hover:bg-[#2b8233]/10 transition-all duration-300">
      <div className="text-base text-white mb-3 font-semibold">Did you know?</div>
      <div className="text-xl text-white font-medium min-h-[4rem] transition-all duration-500 leading-relaxed">
        {FACTS[index]}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-white/80">
          Fact {index + 1} of {FACTS.length}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.dispatchEvent(new Event("facts-prev"))}
            className="text-white/80 hover:text-white transition-colors"
          >
            ←
          </button>
          <button 
            onClick={() => window.dispatchEvent(new Event("facts-next"))}
            className="text-white/80 hover:text-white transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
