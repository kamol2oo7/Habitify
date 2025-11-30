import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DailyMetric, Habit, Status } from '../types';
import { Flame, Ban, Moon, Clock } from 'lucide-react';
import { Logo } from './Logo';

interface MetricChartProps {
  data: DailyMetric[];
  isDarkMode: boolean;
  selectedDate: Date;
  onUpdateMetric: (dateKey: string, metrics: { sleep: number; mood: number; satisfaction: number }) => void;
  logs: Record<string, Record<string, Status>>;
  habits: Habit[];
}

// --- HELPER COMPONENTS ---

const StreakCard: React.FC<{ habit: Habit; streak: number }> = ({ habit, streak }) => {
    const isBuild = habit.type === 'build';
    return (
        <div className="flex items-center justify-between p-4 bg-[#f4f1ea] dark:bg-neutral-800/50 rounded-2xl border border-[#e8e4d9] dark:border-neutral-800">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-xl ${isBuild ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                   {isBuild ? <Flame size={18} /> : <Ban size={18} />}
                </div>
                <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-stone-900 dark:text-gray-200 truncate">{habit.name}</span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">{isBuild ? 'Day Streak' : 'Days Free'}</span>
                </div>
            </div>
            <div className="text-xl font-black text-stone-900 dark:text-white font-mono pl-2">
                {streak}
            </div>
        </div>
    );
};

const MetricChart: React.FC<MetricChartProps> = ({ data, isDarkMode, selectedDate, onUpdateMetric, logs, habits }) => {
  // --- CHART LOGIC ---
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sortedData.map(d => ({
    ...d,
    shortDate: d.date.split('-').slice(1).join('/')
  }));

  const axisColor = isDarkMode ? '#525252' : '#a8a29e'; // stone-400
  const gridColor = isDarkMode ? '#262626' : '#e8e4d9'; // warm beige border
  const tooltipBg = isDarkMode ? '#171717' : '#fdfbf7'; // cream
  const tooltipBorder = isDarkMode ? '#262626' : '#e8e4d9';

  // --- SLIDER LOGIC ---
  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const [currentMetrics, setCurrentMetrics] = useState({ sleep: 5, mood: 5, satisfaction: 5 });

  useEffect(() => {
      const existing = data.find(m => m.date === dateKey);
      if (existing) {
          setCurrentMetrics({ sleep: existing.sleep, mood: existing.mood, satisfaction: existing.satisfaction });
      } else {
          setCurrentMetrics({ sleep: 5, mood: 5, satisfaction: 5 });
      }
  }, [dateKey, data]);

  const handleSliderChange = (key: 'sleep' | 'mood' | 'satisfaction', value: number) => {
      const newMetrics = { ...currentMetrics, [key]: value };
      setCurrentMetrics(newMetrics);
      onUpdateMetric(dateKey, newMetrics);
  };

  // --- SLEEP CALCULATOR LOGIC (90 Min Rule) ---
  // Initialize from localStorage or default to 06:00
  const [wakeTime, setWakeTime] = useState(() => {
    return localStorage.getItem('habitify_waketime') || "06:00";
  });
  
  const [bedTimes, setBedTimes] = useState<string[]>([]);

  // Persist wakeTime whenever it changes
  useEffect(() => {
    localStorage.setItem('habitify_waketime', wakeTime);
  }, [wakeTime]);

  useEffect(() => {
    if (!wakeTime) return;
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(h, m, 0);

    // Calculate backwards: 6 cycles (9h) and 5 cycles (7.5h) + 15 min fall asleep time
    const c6 = new Date(wakeDate.getTime() - (9 * 60 * 60 * 1000) - (15 * 60 * 1000));
    const c5 = new Date(wakeDate.getTime() - (7.5 * 60 * 60 * 1000) - (15 * 60 * 1000));
    
    const format = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setBedTimes([format(c6), format(c5)]);
  }, [wakeTime]);


  // --- STREAK LOGIC ---
  const calculateStreak = (habitId: string) => {
      let streak = 0;
      const today = new Date();
      // Check last 365 days
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${dayStr}`;

        const status = logs[key]?.[habitId];

        // If today is empty, don't break streak yet (user might not have logged yet)
        if (i === 0 && (!status || status === Status.None)) continue;

        if (status === Status.Done) {
            streak++;
        } else {
            // Stop at first non-done day
            break;
        }
      }
      return streak;
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
        
        {/* ROW 1: BIO-FEEDBACK DASHBOARD */}
        <div className="w-full bg-[#fdfbf7] dark:bg-neutral-900 border border-[#e8e4d9] dark:border-neutral-800 rounded-[2.5rem] p-0 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[340px]">
        
            {/* LEFT: Inputs Section (Order 2 on Mobile, Order 1 on Desktop) */}
            <div className="w-full md:w-1/3 order-2 md:order-1 p-5 md:p-8 border-t md:border-t-0 md:border-r border-[#e8e4d9] dark:border-neutral-800 bg-[#fbfaf6] dark:bg-neutral-900/50 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-bold text-stone-800 dark:text-white uppercase tracking-wider">
                            Bio-Feedback
                        </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-neutral-500 font-mono mb-4 md:mb-8">{formattedDate}</p>

                    <div className="space-y-4 md:space-y-8">
                        {[
                            { label: 'Sleep', key: 'sleep', color: 'accent-emerald-500', value: currentMetrics.sleep },
                            { label: 'Mood', key: 'mood', color: 'accent-yellow-500', value: currentMetrics.mood },
                            { label: 'Satisfaction', key: 'satisfaction', color: 'accent-red-500', value: currentMetrics.satisfaction }
                        ].map((item) => (
                            <div key={item.key} className="relative group">
                                <div className="flex justify-between items-end mb-1 md:mb-2">
                                    <label className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest">{item.label}</label>
                                    <span className="text-sm md:text-lg font-bold text-stone-900 dark:text-white font-mono">{item.value}<span className="text-stone-400 text-xs">/10</span></span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={item.value}
                                    onChange={(e) => handleSliderChange(item.key as any, parseInt(e.target.value))}
                                    className={`w-full h-1 bg-[#e8e4d9] dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer ${item.color} focus:outline-none`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Chart Section (Order 1 on Mobile, Order 2 on Desktop) */}
            <div className="w-full md:w-2/3 order-1 md:order-2 p-6 relative">
                <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] text-stone-400">Sleep</span></div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-[10px] text-stone-400">Mood</span></div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] text-stone-400">Sat.</span></div>
                </div>

                <div className="h-64 md:h-full w-full pt-6">
                    {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} opacity={0.5} />
                        <XAxis 
                            dataKey="shortDate" 
                            stroke={axisColor} 
                            tick={{fill: axisColor, fontSize: 10, fontFamily: 'monospace'}} 
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />
                        <YAxis 
                            domain={[0, 10]} 
                            stroke={axisColor} 
                            tick={{fill: axisColor, fontSize: 10, fontFamily: 'monospace'}} 
                            tickLine={false}
                            axisLine={false}
                            ticks={[0, 5, 10]}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px' }}
                            itemStyle={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}
                            labelStyle={{ marginBottom: '0.5rem', color: axisColor, fontSize: 10 }}
                            cursor={{stroke: axisColor, strokeWidth: 1}}
                        />
                        
                        <Line type="monotone" dataKey="sleep" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="mood" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="satisfaction" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    </LineChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400">
                             {/* Use new Logo icon only, no text */}
                            <Logo showText={false} className="h-12 text-[#d6d3c9] dark:text-neutral-700" />
                            <p className="text-xs opacity-60 mt-4 font-mono">NO DATA RECORDED</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* ROW 2: WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* WIDGET 1: Sleep Calculator */}
            <div className="bg-[#fdfbf7] dark:bg-neutral-900 border border-[#e8e4d9] dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-500">
                    <Moon size={18} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-white">Sleep Architect</h3>
                </div>
                
                <div className="mb-6">
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-2">Target Wake Up</label>
                    <div className="relative">
                        <input 
                            type="time" 
                            value={wakeTime}
                            onChange={(e) => setWakeTime(e.target.value)}
                            className="w-full bg-[#f4f1ea] dark:bg-black border border-[#e8e4d9] dark:border-neutral-800 rounded-2xl p-3 pl-10 text-xl font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-[10px] text-stone-400 uppercase font-bold mb-1">Optimal Bedtimes (90m cycles)</div>
                    <div className="flex justify-between gap-3">
                        <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-3 text-center border border-transparent hover:border-emerald-500/50 transition-all shadow-sm">
                            <span className="block text-2xl font-bold text-stone-900 dark:text-white tracking-tight">{bedTimes[0]}</span>
                            <span className="text-[10px] text-stone-400">6 Cycles (9h)</span>
                        </div>
                        <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-3 text-center border border-transparent hover:border-emerald-500/50 transition-all shadow-sm">
                            <span className="block text-2xl font-bold text-stone-900 dark:text-white tracking-tight">{bedTimes[1]}</span>
                            <span className="text-[10px] text-stone-400">5 Cycles (7.5h)</span>
                        </div>
                    </div>
                </div>
            </div>

             {/* WIDGET 2: Streak Monitor */}
             <div className="bg-[#fdfbf7] dark:bg-neutral-900 border border-[#e8e4d9] dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-sm col-span-1 md:col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-orange-500">
                        <Flame size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-white">Live Streaks</h3>
                    </div>
                    <div className="bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1 rounded-full">
                        ACTIVE
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {habits.length > 0 ? (
                        habits.map(habit => (
                            <StreakCard key={habit.id} habit={habit} streak={calculateStreak(habit.id)} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-stone-400 text-xs italic">
                            No habits active.
                        </div>
                    )}
                </div>
            </div>
            
        </div>
        
        {/* APP BRANDING LOGO FOOTER */}
        <div className="flex justify-center mt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <Logo showText={false} className="h-6 text-stone-400" />
        </div>
    </div>
  );
};

export default MetricChart;