'use client';
import { useState, useEffect } from 'react';

const BACKGROUND_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/48/Volcanoes_National_Park_Banner_Image.gif',
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/95/Serengeti_-_Stefan_Swanepoel.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/13/An_aerial_view_of_the_towering_volcanic_peak_of_Mt._Nyiragongo.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e4/Les_Oiseaux_%C3%A0_Tchegera.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/24/Photo_of_the_day_15.11.2015_%2822595558879%29.jpg'
];

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0
  });
  
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    // Background image carousel
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(bgInterval);
  }, []);

  useEffect(() => {
    // Set target date to July 17, 2026 (2 months from now)
    const targetDate = new Date('2026-07-17T00:00:00');

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <main className="min-h-screen flex flex-col items-center justify-between text-white relative overflow-hidden">
      {/* Background Carousel */}
      {BACKGROUND_IMAGES.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out -z-20 ${
            index === currentBgIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url("${img}")` }}
        />
      ))}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 -z-10"></div>

      {/* Top spacer */}
      <div className="flex-1 w-full"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-6 px-4 md:px-8 w-full max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-medium tracking-wide">
          Coming Soon
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg font-light text-white/90 max-w-2xl mx-auto leading-relaxed pb-4">
          Our website is currently undergoing scheduled maintenance.<br className="hidden sm:block"/>
          We Should be back shortly. Thank you for your patience.
        </p>
        
        {/* Timer */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-8 pt-2 pb-6">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.mins },
            { label: 'Sec', value: timeLeft.secs }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white text-slate-800 shadow-lg">
              <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary mb-0 sm:mb-1">
                {formatNumber(item.value)}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-800 tracking-wide uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Notify Button */}
        <div className="pt-2">
          <button className="bg-primary hover:bg-primary-hover text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full uppercase tracking-wider text-xs sm:text-sm font-semibold transition-colors shadow-lg">
            Notify Us
          </button>
        </div>
      </div>

      {/* Bottom spacer and Social */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-8 sm:pb-10 w-full items-center">
        <p className="text-white/90 mb-3 sm:mb-4 font-normal text-xs sm:text-sm">Follow us for update</p>
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center px-4">
          {/* Facebook */}
          <a href="https://www.facebook.com/africatourismgate/" className="w-8 h-8 rounded-full bg-[#3b5998] flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
          </a>
          {/* X */}
          <a href="https://x.com/Congotourismga1" className="w-8 h-8 rounded-full bg-[#55acee] flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10C2.38 10 2.38 10 2.38 10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16.01 6.01 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z"/></svg>
          </a>
          
          {/* Instagram */}
          <a href="https://www.instagram.com/africatourismgate/" className="w-8 h-8 rounded-full bg-[#833ab4] bg-gradient-to-tr from-[#fd5949] to-[#d6249f] flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.16C15.2 2.16 15.58 2.17 16.86 2.23C18.04 2.28 18.84 2.51 19.53 2.78C20.25 3.06 20.86 3.44 21.46 4.04C22.06 4.64 22.44 5.25 22.72 5.97C22.99 6.66 23.22 7.46 23.27 8.64C23.33 9.92 23.34 10.3 23.34 13.5C23.34 16.7 23.33 17.08 23.27 18.36C23.22 19.54 22.99 20.34 22.72 21.03C22.44 21.75 22.06 22.36 21.46 22.96C20.86 23.56 20.25 23.94 19.53 24.22C18.84 24.49 18.04 24.72 16.86 24.77C15.58 24.83 15.2 24.84 12 24.84C8.8 24.84 8.42 24.83 7.14 24.77C5.96 24.72 5.16 24.49 4.47 24.22C3.75 23.94 3.14 23.56 2.54 22.96C1.94 22.36 1.56 21.75 1.28 21.03C1.01 20.34 0.78 19.54 0.73 18.36C0.67 17.08 0.66 16.7 0.66 13.5C0.66 10.3 0.67 9.92 0.73 8.64C0.78 7.46 1.01 6.66 1.28 5.97C1.56 5.25 1.94 4.64 2.54 4.04C3.14 3.44 3.75 3.06 4.47 2.78C5.16 2.51 5.96 2.28 7.14 2.23C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33 0.01 7.05 0.07C5.77 0.13 4.9 0.33 4.14 0.63C3.35 0.94 2.68 1.34 2.01 2.01C1.34 2.68 0.94 3.35 0.63 4.14C0.33 4.9 0.13 5.77 0.07 7.05C0.01 8.33 0 8.74 0 12C0 15.26 0.01 15.67 0.07 16.95C0.13 18.23 0.33 19.1 0.63 19.86C0.94 20.65 1.34 21.32 2.01 21.99C2.68 22.66 3.35 23.06 4.14 23.37C4.9 23.67 5.77 23.87 7.05 23.93C8.33 23.99 8.74 24 12 24C15.26 24 15.67 23.99 16.95 23.93C18.23 23.87 19.1 23.67 19.86 23.37C20.65 23.06 21.32 22.66 21.99 21.99C22.66 21.32 23.06 20.65 23.37 19.86C23.67 19.1 23.87 18.23 23.93 16.95C23.99 15.67 24 15.26 24 12C24 8.74 23.99 8.33 23.93 7.05C23.87 5.77 23.67 4.9 23.37 4.14C23.06 3.35 22.66 2.68 21.99 2.01C21.32 1.34 20.65 0.94 19.86 0.63C19.1 0.33 18.23 0.13 16.95 0.07C15.67 0.01 15.26 0 12 0ZM12 5.84C8.6 5.84 5.84 8.6 5.84 12C5.84 15.4 8.6 18.16 12 18.16C15.4 18.16 18.16 15.4 18.16 12C18.16 8.6 15.4 5.84 12 5.84ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM18.41 4.15C17.62 4.15 16.97 4.79 16.97 5.59C16.97 6.38 17.62 7.03 18.41 7.03C19.2 7.03 19.84 6.38 19.84 5.59C19.84 4.79 19.2 4.15 18.41 4.15Z"/></svg>
          </a>
        </div>
      </div>
    </main>
  );
}

