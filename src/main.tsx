import { StrictMode, useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Moon, 
  Sun, 
  Lock,
  Zap,
  Target,
  Timer,
  Hourglass,
  Settings,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import './index.css';

// --- TYPES & CONSTANTS ---
const INITIAL_STATE = {
  clicks: 0,
  totalPoints: 0,
  timePlayed: 0,
  lastClickTime: Date.now(),
  viewedLogCount: 0,
  isDark: false,
  unlockedIds: [],
  lastUpdate: Date.now(),
};

const ACHIEVEMENTS = [
  { id: "first_tap", title: "System Online", description: "Register your first pulse signal.", rarity: "Common", icon: <Activity size={24} />, condition: (s) => s.clicks >= 1 },
  { id: "click_100", title: "Resonance", description: "Reach 100 sustained signals.", rarity: "Common", icon: <Zap size={24} />, condition: (s) => s.clicks >= 100 },
  { id: "click_1000", title: "Singularity", description: "Push the buffer to 1,000 strikes.", rarity: "Rare", icon: <Cpu size={24} />, condition: (s) => s.clicks >= 1000 },
  { id: "zen_master", title: "Buffer Calm", description: "Maintain silence for 60 seconds.", rarity: "Rare", icon: <Hourglass size={24} />, condition: (s) => s.clicks > 0 && (Date.now() - s.lastClickTime > 60000) },
  { id: "veteran", title: "Core Stability", description: "Logged 10 minutes of active uptime.", rarity: "Legendary", icon: <ShieldCheck size={24} />, condition: (s) => s.timePlayed >= 600 },
  { id: "auditor", title: "Deep Trace", description: "Inspected logs 10 times.", rarity: "Common", icon: <Search size={24} />, condition: (s) => s.viewedLogCount >= 10 },
  { id: "secret_access", title: "Ghost Protocol", description: "Accessed the hidden anchor point.", rarity: "Epic", icon: <Target size={24} />, condition: () => false }
];

// --- COMPONENTS ---
const ProgressBar = ({ value, label }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
      <span>{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        className="h-full bg-accent-yellow transition-all duration-500 ease-out"
      />
    </div>
  </div>
);

function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('achieve_it_v8');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old states if needed
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return INITIAL_STATE;
  });

  const [showLog, setShowLog] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('achieve_it_v8', JSON.stringify(state));
  }, [state]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, timePlayed: prev.timePlayed + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Achievement Engine
  useEffect(() => {
    ACHIEVEMENTS.forEach(ach => {
      if (!state.unlockedIds.includes(ach.id) && ach.condition(state)) {
        triggerUnlock(ach);
      }
    });
  }, [state.clicks, state.timePlayed, state.viewedLogCount]);

  const triggerUnlock = (ach) => {
    setState(prev => {
      if (prev.unlockedIds.includes(ach.id)) return prev;
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#EC4899', '#FACC15', '#14B8A6']
      });

      toast.success(`${ach.title.toUpperCase()} UNLOCKED`, {
        description: ach.description,
        className: "vibrant-toast",
      });

      return { ...prev, unlockedIds: [...prev.unlockedIds, ach.id] };
    });
  };

  const handlePulse = useCallback(() => {
    setState(prev => ({
      ...prev,
      clicks: prev.clicks + 1,
      totalPoints: prev.totalPoints + 15,
      lastClickTime: Date.now()
    }));
  }, []);

  const handleSecretFocus = () => {
    const secret = ACHIEVEMENTS.find(a => a.id === 'secret_access');
    if (secret && !state.unlockedIds.includes(secret.id)) {
      triggerUnlock(secret);
    }
  };

  const toggleTheme = () => setState(p => ({ ...p, isDark: !p.isDark }));

  return (
    <div className={`min-h-screen bg-bg flex flex-col font-sans selection:bg-accent-yellow overflow-hidden ${state.isDark ? 'dark grayscale-[0.2]' : ''}`}>
      <Toaster position="top-right" theme={state.isDark ? 'dark' : 'light'} />
      
      {/* HEADER */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-black/30 backdrop-blur-md border-b-2 border-accent-pink/30 z-10">
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <Trophy className="text-accent-yellow" size={24} />
          </motion.div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Achieve<span className="text-accent-pink">IT</span> <span className="opacity-40 font-mono text-[10px] ml-2 tracking-widest">v5.2.0</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-[10px] font-black tracking-widest opacity-80">{state.unlockedIds.length} / {ACHIEVEMENTS.length} ARCHIVED</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-bg transition-all shadow-lg"
          >
            {state.isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* ASIDE - TELEMETRY */}
        <aside className="w-full md:w-[280px] bg-black/10 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col gap-8">
          <div className="bg-card/5 border border-white/10 p-5 rounded-[24px] space-y-4">
             <ProgressBar label="Load Buffer" value={(state.clicks / 1000) * 100} />
             <ProgressBar label="Archive Completion" value={(state.unlockedIds.length / ACHIEVEMENTS.length) * 100} />
          </div>

          <div className="flex-1 space-y-3 font-mono text-[10px]">
             <div className="text-[9px] font-black opacity-20 uppercase tracking-[4px] mb-4">Core_Stats</div>
             <div className="flex justify-between p-2 bg-black/10 rounded-lg border border-white/5">
                <span className="opacity-40 flex items-center gap-2"><Timer size={10} /> UPTIME</span>
                <span className="font-bold text-accent-yellow">{state.timePlayed}S</span>
             </div>
             <div className="flex justify-between p-2 bg-black/10 rounded-lg border border-white/5">
                <span className="opacity-40 flex items-center gap-2"><Activity size={10} /> SIGNAL</span>
                <span className="font-bold text-accent-teal">{state.clicks}</span>
             </div>
             <div className="flex justify-between p-2 bg-black/10 rounded-lg border border-white/5">
                <span className="opacity-40 flex items-center gap-2"><Trophy size={10} /> ENERGY</span>
                <span className="font-bold text-accent-pink">{state.totalPoints}</span>
             </div>
          </div>

          <button 
            onClick={() => { setShowLog(true); setState(p => ({ ...p, viewedLogCount: p.viewedLogCount + 1 })) }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs rounded-xl transition-all active:scale-95 uppercase tracking-[3px]"
          >
            System_Audit
          </button>
        </aside>

        {/* DASHBOARD */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-10 bg-black/5 relative">
          
          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.button 
              whileTap={{ scale: 0.98, y: 2 }}
              onClick={handlePulse}
              className="group bg-white text-bg p-8 rounded-[32px] vibrant-card-shadow flex flex-col items-center justify-center gap-2 relative overflow-hidden h-44"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-yellow group-hover:h-3 transition-all" />
              <div className="text-4xl font-black italic tracking-tighter uppercase leading-none">Pulse</div>
              <div className="text-[10px] font-black opacity-30 uppercase tracking-[5px]">Signal_Generator</div>
              <ChevronRight className="absolute right-6 opacity-10 group-hover:opacity-40 transition-opacity" size={40} />
            </motion.button>

            <div className="bg-card/5 border-2 border-dashed border-white/10 p-8 rounded-[32px] flex flex-col justify-center relative overflow-hidden h-44">
              <div className="z-10">
                <div className="text-6xl font-black italic tracking-tighter text-white leading-none whitespace-nowrap overflow-hidden">
                  {state.clicks.toLocaleString()}
                </div>
                <div className="text-[10px] font-black opacity-40 uppercase mt-2 tracking-[2px]">Total_Received_Pulses</div>
              </div>
              <Zap className="absolute -right-4 -bottom-4 text-white/5" size={120} />
            </div>
          </div>

          {/* ACHIEVEMENT GRID */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-white/10" />
               <h2 className="text-[10px] font-black tracking-[8px] uppercase opacity-40">Archive_Indices</h2>
               <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = state.unlockedIds.includes(ach.id);
                return (
                  <motion.div 
                    key={ach.id} 
                    layout
                    initial={false}
                    className={`group bg-white/5 border border-white/10 p-6 rounded-[28px] overflow-hidden flex flex-col items-center text-center gap-4 transition-all relative ${!unlocked ? 'opacity-20 grayscale' : 'border-accent-pink/50 shadow-[0_0_20px_rgba(236,72,153,0.1)]'}`}
                  >
                    {unlocked && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-pink via-accent-yellow to-accent-teal" 
                      />
                    )}
                    
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${unlocked ? 'border-accent-pink bg-bg text-accent-pink' : 'border-white/20 text-white/40'}`}>
                      {unlocked ? ach.icon : <Lock size={20} />}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-xs uppercase italic tracking-tight text-white group-hover:text-accent-yellow transition-colors">
                        {unlocked ? ach.title : "Index_Locked"}
                      </h3>
                      <div className="text-[9px] font-black text-accent-pink tracking-[4px] uppercase opacity-80">{ach.rarity}</div>
                    </div>

                    {unlocked && (
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-[10px] font-medium opacity-50 italic leading-snug px-2"
                      >
                        {ach.description}
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* OVERLAY LOGS */}
          <AnimatePresence>
            {showLog && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="fixed inset-4 sm:inset-10 md:inset-20 z-50 bg-bg p-8 md:p-12 rounded-[40px] flex flex-col gap-8 shadow-2xl border border-white/10 backdrop-blur-xl"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">System_Diagnostics</h2>
                  </div>
                  <button onClick={() => setShowLog(false)} className="group bg-white text-bg px-6 py-2 font-black text-sm rounded-full flex items-center gap-2 hover:bg-accent-yellow transition-all">
                    Term_Session <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="flex-1 font-mono text-[10px] space-y-6 overflow-y-auto pr-4 scrollbar-hide">
                   <div className="p-6 bg-white/5 border-l-4 border-accent-teal rounded-2xl space-y-2">
                      <div className="text-accent-teal font-black text-xs mb-4 flex items-center gap-2 tracking-[4px]">
                        <Activity size={14} /> LIVE_ANALYTICS
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <p className="opacity-40">SYSTEM_UPTIME</p><p className="text-white">{state.timePlayed}s</p>
                        <p className="opacity-40">SIGNAL_COUNT</p><p className="text-white">{state.clicks}</p>
                        <p className="opacity-40">ARCHIVE_INDEX</p><p className="text-white">{state.unlockedIds.length} / {ACHIEVEMENTS.length}</p>
                        <p className="opacity-40">MEMORY_STAMP</p><p className="text-white">{new Date(state.lastClickTime).toLocaleTimeString()}</p>
                      </div>
                   </div>

                   <div className="p-6 bg-white/5 border-l-4 border-red-500 rounded-2xl">
                      <div className="text-red-500 font-black text-xs mb-4 tracking-[4px]">DESTRUCT_SEQUENCE</div>
                      <p className="opacity-50 mb-6 italic">Warning: This action will initiate a total memory wipe of all local clusters.</p>
                      <button 
                        onClick={() => { if(confirm('Initiate system purge? All progress will be voided.')) { localStorage.clear(); window.location.reload(); } }} 
                        className="px-8 py-3 bg-red-500/10 hover:bg-red-500 border border-red-500 text-red-500 hover:text-white font-black rounded-full transition-all text-[10px] uppercase tracking-widest active:scale-95"
                      >
                        Execute_Purge.sh
                      </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SECRET ANCHOR */}
          <div 
            onClick={handleSecretFocus} 
            className="fixed bottom-4 left-4 w-6 h-6 rounded-full flex items-center justify-center cursor-help group z-50"
          >
            <div className="w-1 h-1 bg-white/10 group-hover:w-4 group-hover:h-4 group-hover:bg-accent-yellow group-hover:shadow-[0_0_10px_#FACC15] transition-all rounded-full" />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="h-10 grow-0 bg-black/40 border-t border-white/5 flex items-center justify-between px-6 text-[8px] font-mono opacity-30 uppercase tracking-[4px] text-white">
        <span>Hyp-Ind Cluster S-9 // 2026</span>
        <span className="hidden sm:inline">Signal_Resonance_Positive // Sector_Secure</span>
        <span>Secure_Tunnel_v4.2</span>
      </footer>
    </div>
  );
}

// --- INITIALIZATION ---
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
