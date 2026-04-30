import { StrictMode, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Timer, Moon, Sun, Trophy, History, TrendingUp, 
  Settings, ChevronRight, Sparkles, Zap, MousePointer2, 
  Search, Hourglass, Lock, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import './index.css';

// --- TYPES & CONSTANTS ---
enum AchievementCategory {
  GENERAL = "General",
  CLICKING = "Clicking",
  TIME = "Time",
  SECRETS = "Secrets",
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  isUnlocked: boolean;
  condition: (state: GameState) => boolean;
  icon: React.ReactNode;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

interface GameState {
  clicks: number;
  totalPoints: number;
  timePlayed: number;
  lastClickTime: number;
  viewedLog: number;
  isDark: boolean;
  unlockedIds: string[];
  lastUpdate: number;
}

const INITIAL_STATE: GameState = {
  clicks: 0,
  totalPoints: 0,
  timePlayed: 0,
  lastClickTime: Date.now(),
  viewedLog: 0,
  isDark: false,
  unlockedIds: [],
  lastUpdate: Date.now(),
};

// --- HELPER COMPONENTS ---
const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-3 bg-black/10 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, value)}%` }}
      className="h-full bg-accent-yellow transition-all duration-500"
    />
  </div>
);

// --- MAIN APP ---
function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('achieve_it_v5');
    if (saved) return { ...INITIAL_STATE, ...JSON.parse(saved) };
    return INITIAL_STATE;
  });

  const [showLog, setShowLog] = useState(false);

  const achievements: Achievement[] = useMemo(() => [
    {
      id: "first_tap",
      title: "The Awakening",
      description: "Initialize the system with your first tap.",
      category: AchievementCategory.GENERAL,
      isUnlocked: false,
      icon: <MousePointer2 size={24} />,
      rarity: "Common",
      condition: (s) => s.clicks >= 1,
    },
    {
      id: "click_50",
      title: "Energy Pulse",
      description: "Reach 50 generation pulses.",
      category: AchievementCategory.CLICKING,
      isUnlocked: false,
      icon: <Zap size={24} />,
      rarity: "Common",
      condition: (s) => s.clicks >= 50,
    },
    {
      id: "click_500",
      title: "Overload",
      description: "Push the system to 500 generation strikes.",
      category: AchievementCategory.CLICKING,
      isUnlocked: false,
      icon: <Target size={24} />,
      rarity: "Rare",
      condition: (s) => s.clicks >= 500,
    },
    {
      id: "zen",
      title: "System Rest",
      description: "Wait 60 seconds between clicks.",
      category: AchievementCategory.TIME,
      isUnlocked: false,
      icon: <Timer size={24} />,
      rarity: "Rare",
      condition: (s) => Date.now() - s.lastClickTime > 60000 && s.clicks > 0,
    },
    {
      id: "time_10m",
      title: "Server Veteran",
      description: "Total uptime of 10 minutes.",
      category: AchievementCategory.TIME,
      isUnlocked: false,
      icon: <Hourglass size={24} />,
      rarity: "Legendary",
      condition: (s) => s.timePlayed >= 600,
    },
    {
      id: "view_log",
      title: "Auditor",
      description: "Check the system logs 5 times.",
      category: AchievementCategory.GENERAL,
      isUnlocked: false,
      icon: <Settings size={24} />,
      rarity: "Common",
      condition: (s) => s.viewedLog >= 5,
    },
    {
      id: "secret",
      title: "Glitch Finder",
      description: "Found the hidden system anchor.",
      category: AchievementCategory.SECRETS,
      isUnlocked: false,
      icon: <Search size={24} />,
      rarity: "Epic",
      condition: () => false,
    }
  ], []);

  useEffect(() => {
    localStorage.setItem('achieve_it_v5', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, timePlayed: prev.timePlayed + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    achievements.forEach(ach => {
      if (!state.unlockedIds.includes(ach.id) && ach.condition(state)) {
        unlock(ach);
      }
    });
  }, [state.clicks, state.timePlayed, state.viewedLog]);

  const unlock = (ach: Achievement) => {
    setState(prev => {
      if (prev.unlockedIds.includes(ach.id)) return prev;
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#EC4899', '#FACC15', '#14B8A6']
      });

      toast.success(`${ach.title} Unlocked!`, {
        className: "vibrant-toast",
      });

      return { ...prev, unlockedIds: [...prev.unlockedIds, ach.id] };
    });
  };

  const handleGenerate = () => {
    setState(prev => ({
      ...prev,
      clicks: prev.clicks + 1,
      totalPoints: prev.totalPoints + 5,
      lastClickTime: Date.now()
    }));
  };

  const handleSecret = () => {
    const s = achievements.find(a => a.id === 'secret');
    if (s && !state.unlockedIds.includes(s.id)) unlock(s);
  };

  const toggleTheme = () => setState(p => ({ ...p, isDark: !p.isDark }));

  return (
    <div className={`min-h-screen max-w-[1024px] mx-auto bg-bg flex flex-col font-sans selection:bg-accent-yellow ${state.isDark ? 'brightness-90' : ''}`}>
      <Toaster position="top-center" theme={state.isDark ? 'dark' : 'light'} />
      
      <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-black/20 border-b-4 border-accent-pink">
        <div className="flex items-center gap-4">
          <Trophy className="text-accent-yellow animate-bounce" size={32} />
          <h1 className="text-4xl font-extrabold uppercase italic tracking-tighter text-white">
            Achieve<span className="text-accent-yellow">IT</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-2 rounded-full border-2 border-white/20 font-black text-xs hidden sm:block">
            🏆 {state.unlockedIds.length}/{achievements.length} UNLOCKED
          </div>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-accent-pink text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            {state.isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] relative overflow-hidden">
        <aside className="bg-black/10 border-r-2 border-white/10 border-dashed p-6 flex flex-col gap-6">
          <div className="bg-accent-teal p-6 rounded-[24px] text-white vibrant-featured-shadow">
             <div className="text-[10px] font-black uppercase opacity-80 mb-2">Pulse Goal</div>
             <ProgressBar value={(state.clicks / 500) * 100} />
             <div className="text-[9px] font-bold opacity-60 mt-2 italic">Goal: 500 Hits</div>
          </div>

          <div className="flex-1 space-y-4 font-mono text-xs overflow-y-auto pr-2">
             <div className="text-[10px] font-black opacity-30 mt-4">CORE_TELEMETRY</div>
             <div className="flex justify-between p-2 bg-black/20 rounded">
                <span>UPTIME</span>
                <span>{state.timePlayed}s</span>
             </div>
             <div className="flex justify-between p-2 bg-black/20 rounded">
                <span>RESONANCE</span>
                <span>{state.totalPoints}</span>
             </div>
          </div>

          <button 
            onClick={() => { setShowLog(true); setState(p => ({ ...p, viewedLog: p.viewedLog + 1 })) }}
            className="w-full py-3 bg-accent-yellow text-bg font-black rounded-xl hover:bg-white transition-all shadow-lg active:scale-95 uppercase tracking-widest"
          >
            System_Log
          </button>
        </aside>

        <div className="p-8 overflow-y-auto space-y-8 bg-black/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
            <button 
              onClick={handleGenerate}
              className="bg-card text-ink p-8 rounded-[32px] vibrant-card-shadow flex flex-col items-center gap-3 active:translate-y-1 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-yellow" />
              <div className="text-3xl font-black italic tracking-tighter uppercase">Generate</div>
              <div className="text-[10px] uppercase font-bold opacity-40">Frequency: {((state.clicks / (state.timePlayed || 1)) * 60).toFixed(1)} / min</div>
            </button>
            <div className="bg-card text-ink p-8 rounded-[32px] vibrant-card-shadow flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-pink" />
              <div className="text-5xl font-black italic tracking-tighter text-accent-pink leading-none">{state.clicks.toLocaleString()}</div>
              <div className="text-[10px] font-mono opacity-50 uppercase mt-1">Total Hits Confirmed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {achievements.map((ach) => {
              const unlocked = state.unlockedIds.includes(ach.id);
              return (
                <motion.div 
                  key={ach.id} 
                  layout
                  className={`bg-card p-6 rounded-[28px] flex flex-col items-center text-center gap-2 transition-all vibrant-card-shadow relative ${!unlocked ? 'opacity-40 grayscale scale-95' : 'border-4 border-accent-pink achievement-unlocked'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white border-2 border-bg shadow-lg ${unlocked ? 'bg-accent-teal' : 'bg-slate-400'}`}>
                    {unlocked ? ach.icon : <Lock size={24} />}
                  </div>
                  <h3 className="font-black text-sm uppercase italic tracking-tight text-ink mt-2">
                    {unlocked ? ach.title : "Classified"}
                  </h3>
                  <div className="text-[9px] font-black text-accent-pink tracking-widest">{ach.rarity.toUpperCase()}</div>
                  {unlocked && <p className="text-[10px] font-medium opacity-60 italic leading-tight">{ach.description}</p>}
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {showLog && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }} 
                className="absolute inset-4 z-50 bg-bg p-8 rounded-[32px] flex flex-col gap-6 shadow-2xl border-b-8 border-accent-pink"
              >
                <div className="flex justify-between items-center border-b-2 border-white/10 pb-4">
                  <h2 className="text-4xl font-black italic text-accent-yellow uppercase">Metrics</h2>
                  <button onClick={() => setShowLog(false)} className="bg-white text-bg px-4 py-2 font-black text-xs rounded-lg italic">CLOSE</button>
                </div>
                <div className="flex-1 font-mono text-xs space-y-4 opacity-80 overflow-y-auto">
                   <div className="p-4 bg-black/20 border-l-4 border-accent-teal rounded">
                      <div className="text-accent-teal font-black mb-2">DIAGNOSTICS</div>
                      <p>UPTIME: {state.timePlayed}s</p>
                      <p>CLICKS: {state.clicks}</p>
                      <p>BADGES: {state.unlockedIds.length} / {achievements.length}</p>
                   </div>
                   <div className="p-4 bg-black/20 border-l-4 border-accent-pink rounded">
                      <div className="text-accent-pink font-black mb-2">STORAGE</div>
                      <p className="mb-4">Internal buffer is {Math.round(JSON.stringify(state).length / 10.24) / 100} KB.</p>
                      <button 
                        onClick={() => { if(confirm('Purge all data?')) { localStorage.clear(); window.location.reload(); } }} 
                        className="px-4 py-2 bg-red-600 text-white font-black rounded hover:bg-black transition-colors"
                      >
                        PURGE_MEMORY.EXE
                      </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div onClick={handleSecret} className="fixed bottom-4 left-4 w-4 h-4 rounded-full bg-accent-yellow/5 hover:bg-accent-yellow/50 cursor-crosshair transition-all" />
        </div>
      </main>

      <footer className="h-10 shrink-0 bg-black/20 border-t border-white/10 flex items-center justify-between px-8 text-[9px] font-mono opacity-40 uppercase tracking-widest">
        <span>Hyper-Industrial Systems © 2026</span>
        <span className="flex items-center gap-2">
           Stable Build v5.0.2 <ExternalLink size={10} />
        </span>
      </footer>
    </div>
  );
}

// --- RENDER ---
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
