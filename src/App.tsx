import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Timer, 
  Moon, 
  Sun, 
  Trophy,
  History,
  TrendingUp,
  Settings,
  ChevronRight,
  Sparkles,
  Zap,
  MousePointer2,
  Search,
  Hourglass,
  Lock,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';

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

// --- HELPER COMPONENTS (Inlined for simplicity) ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card text-ink rounded-[24px] overflow-hidden vibrant-card-shadow ${className}`}>
    {children}
  </div>
);

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
export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('achieve_it_v2');
    return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
  });

  const [showLog, setShowLog] = useState(false);
  const clickCountRef = useRef(0);

  // Achievement Definitions (Memoized)
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
      condition: () => false, // Manual trigger
    }
  ], []);

  // Persistence & Effects
  useEffect(() => localStorage.setItem('achieve_it_v2', JSON.stringify(state)), [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, timePlayed: prev.timePlayed + 1 }));
      checkAchievements();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkAchievements = useCallback(() => {
    achievements.forEach(ach => {
      if (!state.unlockedIds.includes(ach.id) && ach.condition(state)) {
        unlock(ach);
      }
    });
  }, [state, achievements]);

  const unlock = (ach: Achievement) => {
    setState(prev => {
      if (prev.unlockedIds.includes(ach.id)) return prev;
      
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#EC4899', '#FACC15', '#14B8A6'] });
      
      toast.success(
        <div className="flex flex-col">
          <span className="font-black text-accent-pink uppercase text-xs">Badge Earned!</span>
          <span className="text-sm font-bold text-ink italic">{ach.title}</span>
        </div>,
        { className: "rounded-none border-4 border-accent-pink bg-white shadow-xl" }
      );

      return { ...prev, unlockedIds: [...prev.unlockedIds, ach.id] };
    });
  };

  const handleGenerate = () => {
    setState(prev => ({ ...prev, clicks: prev.clicks + 1, totalPoints: prev.totalPoints + 5, lastClickTime: Date.now() }));
    checkAchievements();
  };

  const handleSecret = () => {
    const s = achievements.find(a => a.id === 'secret');
    if (s && !state.unlockedIds.includes(s.id)) unlock(s);
  };

  const completion = (state.unlockedIds.length / achievements.length) * 100;

  return (
    <div className={`min-h-screen max-w-[1024px] mx-auto bg-bg flex flex-col font-sans transition-all selection:bg-accent-yellow selection:text-bg ${state.isDark ? 'dark' : ''}`}>
      <Toaster position="top-center" />
      
      {/* HEADER */}
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
            onClick={() => setState(p => ({ ...p, isDark: !p.isDark }))}
            className="w-10 h-10 rounded-full bg-accent-pink text-white flex items-center justify-center hover:rotate-12 transition-transform shadow-lg"
          >
            {state.isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] relative overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="bg-black/10 border-r-2 border-white/10 border-dashed p-6 flex flex-col gap-6">
          <div className="bg-accent-teal p-6 rounded-[24px] text-white vibrant-featured-shadow flex flex-col gap-3">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Goal Tracker</div>
             <div className="font-black text-xl italic">Pulse Master</div>
             <ProgressBar value={(state.clicks / 500) * 100} />
             <div className="text-[9px] font-bold opacity-60">Reach 500 pulses to peak.</div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
             <div className="text-[10px] font-black uppercase opacity-40 tracking-bold">Session Metrics</div>
             <div className="grid gap-2 font-mono text-xs">
                <div className="flex justify-between p-2 bg-black/20"><span>UPTIME</span><span>{state.timePlayed}s</span></div>
                <div className="flex justify-between p-2 bg-black/20"><span>ENERGY</span><span>{state.totalPoints}</span></div>
                <div className="flex justify-between p-2 bg-black/20"><span>SYNC</span><span className="text-green-400">READY</span></div>
             </div>

             <div className="mt-8">
               <div className="text-[10px] font-black uppercase opacity-40 mb-3">Trophy History</div>
               <div className="flex flex-wrap gap-2">
                 {state.unlockedIds.slice(-6).reverse().map(id => (
                   <div key={id} className="w-10 h-10 bg-accent-pink rounded-lg flex items-center justify-center text-white shadow-md border border-white/20">
                      <Sparkles size={16} />
                   </div>
                 ))}
               </div>
             </div>
          </div>

          <button 
            onClick={() => { setShowLog(true); setState(p => ({ ...p, viewedLog: p.viewedLog + 1 })) }}
            className="w-full py-3 bg-accent-yellow text-bg font-black rounded-xl hover:bg-white transition-all active:scale-95 shadow-lg"
          >
            OPEN SYSTEM LOG
          </button>
        </aside>

        {/* WORKSPACE */}
        <div className="p-8 overflow-y-auto space-y-8 bg-black/5 relative">
          
          {/* GENERATOR SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <button 
              onClick={handleGenerate}
              className="bg-card text-ink p-8 rounded-[32px] vibrant-card-shadow flex flex-col items-center gap-3 active:translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-yellow" />
              <div className="w-20 h-20 bg-accent-yellow rounded-full flex items-center justify-center text-bg shadow-inner group-hover:scale-110 transition-transform">
                <Target size={40} />
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black uppercase opacity-40">Command Input</div>
                <div className="text-3xl font-black italic tracking-tighter">EXECUTE_PULSE</div>
              </div>
            </button>

            <div className="bg-card text-ink p-8 rounded-[32px] vibrant-card-shadow flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-pink" />
              <div className="text-[10px] font-black uppercase opacity-40 mb-1">Pulse Resonance</div>
              <div className="text-5xl font-black italic tracking-tighter text-accent-pink">{state.clicks.toLocaleString()}</div>
              <p className="text-xs font-mono opacity-50 mt-2 uppercase">Core status: Optimal</p>
            </div>
          </div>

          {/* BADGE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {achievements.map((ach) => {
              const unlocked = state.unlockedIds.includes(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  layout
                  className={`bg-card p-6 rounded-[28px] flex flex-col items-center text-center gap-3 transition-all vibrant-card-shadow relative ${!unlocked ? 'opacity-40 grayscale scale-95' : 'border-4 border-accent-pink'}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-bg ${unlocked ? 'bg-accent-teal' : 'bg-slate-400'}`}>
                    {unlocked ? ach.icon : <Lock size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-black text-sm uppercase tracking-tight text-ink italic leading-tight">
                      {unlocked ? ach.title : "Classified"}
                    </h3>
                    <div className="text-[9px] font-black text-accent-pink mt-1 mb-2 tracking-widest">{ach.rarity.toUpperCase()}</div>
                    {unlocked && <p className="text-[10px] font-medium opacity-70 italic leading-relaxed">{ach.description}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* SYSTEM LOG MODAL */}
          <AnimatePresence>
            {showLog && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-4 z-50 bg-bg/95 border-b-8 border-accent-pink p-8 rounded-[32px] flex flex-col gap-6 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b-4 border-white/20 pb-4">
                  <h2 className="text-4xl font-black italic text-accent-yellow leading-none">SYSTEM_LOG.DAT</h2>
                  <button onClick={() => setShowLog(false)} className="bg-white text-bg px-4 py-2 font-black text-xs uppercase rounded-lg">CLOSE</button>
                </div>
                
                <div className="flex-1 font-mono text-xs overflow-y-auto space-y-4">
                  <div className="p-4 bg-black/20 border-l-4 border-accent-teal">
                    <div className="text-accent-teal font-black">Runtime Diagnostics</div>
                    <div className="mt-2 space-y-1 opacity-80">
                      <p>START_TIME: {new Date(state.lastUpdate).toLocaleTimeString()}</p>
                      <p>CORE_TEMPERATURE: STABLE</p>
                      <p>BADGE_COUNT: {state.unlockedIds.length}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-black/20 border-l-4 border-accent-pink">
                    <div className="text-accent-pink font-black">Memory Allocation</div>
                    <p className="mt-2 opacity-70 italic">Warning: Manual memory wipe is irreversible.</p>
                    <button 
                      onClick={() => { if(confirm('Purge all memory clusters?')) { localStorage.clear(); window.location.reload(); } }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white font-black hover:bg-black transition-all"
                    >
                      FORMAT_DRIVE.EXE
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SECRET ANCHOR */}
          <div 
            onClick={handleSecret}
            className="fixed bottom-4 left-4 w-4 h-4 rounded-full bg-accent-yellow/5 hover:bg-accent-yellow/20 cursor-crosshair transition-all"
            title="S_0x04"
          />
        </div>
      </main>

      <footer className="h-10 bg-black/30 border-t-2 border-white/10 flex items-center px-8 justify-between text-[10px] font-mono opacity-40 uppercase tracking-widest text-white">
        <div>Hyper-Industrial Games &copy; 2026</div>
        <div className="flex gap-4">
          <span>{new Date().toISOString()}</span>
          <span className="flex items-center gap-1"><ExternalLink size={10} /> v2.1-LEAN</span>
        </div>
      </footer>
    </div>
  );
}
