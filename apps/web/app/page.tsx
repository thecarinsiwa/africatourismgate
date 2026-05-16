import { isNonEmptyString } from '@africatourismgate/utils';

export default function HomePage() {
  const title = isNonEmptyString('Africa Tourism Gate') ? 'Africa Tourism Gate' : 'ATG';
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8 overflow-hidden relative">
      {/* Background gradients and decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-700/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-yellow-600/20 blur-[150px]"></div>
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%] h-[80%] rounded-full bg-slate-800/50 blur-[100px] -z-10"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl text-center space-y-10 p-10 md:p-16 backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-[2.5rem] shadow-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-yellow-300 via-emerald-200 to-emerald-500 pb-2">
            {title}
          </h1>
          <p className="text-xl md:text-3xl font-light text-emerald-50/80">
            Nous préparons quelque chose d&apos;exceptionnel pour vous.
          </p>
        </div>
        
        <div className="pt-8 pb-4">
          <div className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-emerald-900/50 to-slate-800/50 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-xl md:text-2xl font-semibold tracking-[0.2em] uppercase text-emerald-400 animate-pulse relative z-10">
              Lancement en Septembre 2026
            </p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto pt-6 border-t border-white/10">
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-light">
            La plateforme révolutionnaire pour découvrir, planifier et vivre 
            les meilleures expériences touristiques en Afrique. <br />
            Restez connectés, le voyage commence bientôt.
          </p>
        </div>
      </div>
    </main>
  );
}
