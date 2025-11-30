import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit, Status, DailyMetric } from './types';
import { DEFAULT_HABITS_TEMPLATE } from './constants';
import MountainHeader from './components/MountainHeader';
import HabitMatrix from './components/HabitMatrix';
import MetricChart from './components/MetricChart';

const App: React.FC = () => {
  // --- STATE ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Data State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, Record<string, Status>>>({});
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  
  // Navigation & Selection State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // For the Analytics Panel

  // UI State
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Forms
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitType, setNewHabitType] = useState<'build'|'break'>('build');

  // --- PERSISTENCE ---

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('habitify_theme');
    
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('habitify_theme', newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Load Data
  useEffect(() => {
    const loadedHabits = localStorage.getItem('habitify_habits');
    const loadedLogs = localStorage.getItem('habitify_logs');
    const loadedMetrics = localStorage.getItem('habitify_metrics');

    if (loadedHabits) setHabits(JSON.parse(loadedHabits));
    else setHabits(DEFAULT_HABITS_TEMPLATE);

    if (loadedLogs) setLogs(JSON.parse(loadedLogs));
    if (loadedMetrics) setMetrics(JSON.parse(loadedMetrics));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('habitify_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habitify_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('habitify_metrics', JSON.stringify(metrics));
  }, [metrics]);


  // --- HANDLERS ---

  const handleToggleStatus = (dateKey: string, habitId: string) => {
    setLogs(prev => {
      const dayLogs = prev[dateKey] || {};
      const currentStatus = dayLogs[habitId] || Status.None;
      
      let nextStatus = Status.None;
      if (currentStatus === Status.None) nextStatus = Status.Done;
      else if (currentStatus === Status.Done) nextStatus = Status.Partial;
      else if (currentStatus === Status.Partial) nextStatus = Status.Missed;
      else nextStatus = Status.None;

      return {
        ...prev,
        [dateKey]: {
          ...dayLogs,
          [habitId]: nextStatus
        }
      };
    });
  };

  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setNewHabitName("");
    setNewHabitType("build");
    setShowAddHabitModal(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setNewHabitType(habit.type);
    setShowAddHabitModal(true);
  };

  const handleSaveHabit = () => {
    if (!newHabitName.trim()) return;

    if (editingHabit) {
        // Edit Mode
        setHabits(prev => prev.map(h => 
            h.id === editingHabit.id 
            ? { ...h, name: newHabitName, type: newHabitType } 
            : h
        ));
    } else {
        // Create Mode
        const newHabit: Habit = {
            id: `h${Date.now()}`,
            name: newHabitName,
            type: newHabitType
        };
        setHabits([...habits, newHabit]);
    }
    
    setNewHabitName("");
    setShowAddHabitModal(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = (id: string) => {
    // Removed window.confirm for instant deletion to fix UX issues
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleReorderHabits = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const updatedHabits = [...habits];
    const [movedItem] = updatedHabits.splice(fromIndex, 1);
    updatedHabits.splice(toIndex, 0, movedItem);
    setHabits(updatedHabits);
  };

  const handleUpdateMetric = (dateKey: string, newValues: { sleep: number; mood: number; satisfaction: number }) => {
      setMetrics(prev => {
          const filtered = prev.filter(m => m.date !== dateKey);
          return [...filtered, { date: dateKey, ...newValues }];
      });
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    // Reset selected date to first of new month to avoid confusion
    const firstOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    setSelectedDate(firstOfNewMonth);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const currentMonthMetrics = metrics.filter(m => {
      const d = new Date(m.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-[#f4f1ea] dark:bg-black text-stone-800 dark:text-neutral-200 font-sans selection:bg-[#e8e4d9] dark:selection:bg-neutral-700 selection:text-black dark:selection:text-white transition-colors duration-300 pt-4 md:pt-6 pb-12">
      
      {/* Header Section */}
      <MountainHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 bg-[#fdfbf7] dark:bg-neutral-900 p-2 rounded-full border border-[#e8e4d9] dark:border-neutral-800 shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#f4f1ea] dark:hover:bg-neutral-800 rounded-full transition-colors"><ChevronLeft size={16} /></button>
            <div className="text-sm font-bold font-mono min-w-[140px] text-center">
               {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[#f4f1ea] dark:hover:bg-neutral-800 rounded-full transition-colors"><ChevronRight size={16} /></button>
          </div>

          <button 
            onClick={handleOpenAddModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full text-sm font-bold hover:opacity-80 transition-opacity shadow-lg"
          >
            <Plus size={16} />
            ADD HABIT
          </button>
        </div>

        {/* Main Grid */}
        <HabitMatrix 
          habits={habits}
          daysInMonth={daysInMonth}
          currentYear={currentDate.getFullYear()}
          currentMonth={currentDate.getMonth()}
          logs={logs}
          selectedDate={selectedDate}
          onToggleStatus={handleToggleStatus}
          onDeleteHabit={handleDeleteHabit}
          onReorderHabits={handleReorderHabits}
          onDateClick={setSelectedDate}
          onEditHabit={handleOpenEditModal}
        />

        {/* Dashboard / Analytics Panel */}
        <MetricChart 
            data={currentMonthMetrics} 
            isDarkMode={isDarkMode} 
            selectedDate={selectedDate}
            onUpdateMetric={handleUpdateMetric}
            logs={logs}
            habits={habits}
        />

        {/* Footer */}
        <div className="mt-16 text-center text-stone-400 dark:text-neutral-600 text-xs tracking-widest uppercase pb-12">
          Habitify © {new Date().getFullYear()} • Forge Your Character
        </div>
      </div>

      {/* --- ADD/EDIT HABIT MODAL --- */}
      {showAddHabitModal && (
        <div className="fixed inset-0 bg-stone-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] dark:bg-neutral-900 border border-[#e8e4d9] dark:border-neutral-700 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                  {editingHabit ? 'Edit Protocol' : 'Create New Protocol'}
              </h3>
              <button onClick={() => setShowAddHabitModal(false)} className="p-2 bg-[#f4f1ea] dark:bg-neutral-800 rounded-full hover:bg-[#e8e4d9] transition-colors">
                  <X className="text-stone-600 dark:text-gray-500" size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 pl-2">Habit Name</label>
                <input 
                  type="text" 
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read 20 pages"
                  className="w-full bg-white dark:bg-neutral-950 border border-[#e8e4d9] dark:border-neutral-800 rounded-2xl p-4 text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 pl-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setNewHabitType('build')}
                    className={`p-4 rounded-2xl border text-sm font-medium transition-all ${newHabitType === 'build' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-500' : 'bg-white dark:bg-neutral-900 border-[#e8e4d9] dark:border-neutral-800 text-stone-400'}`}
                  >
                    BUILD (+)<br/><span className="text-[10px] opacity-70">Do this</span>
                  </button>
                  <button 
                    onClick={() => setNewHabitType('break')}
                    className={`p-4 rounded-2xl border text-sm font-medium transition-all ${newHabitType === 'break' ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-500' : 'bg-white dark:bg-neutral-900 border-[#e8e4d9] dark:border-neutral-800 text-stone-400'}`}
                  >
                    BREAK (-)<br/><span className="text-[10px] opacity-70">Avoid this</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={handleSaveHabit}
                className="w-full bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-full mt-2 hover:opacity-90 transition-opacity shadow-lg"
              >
                {editingHabit ? 'UPDATE PROTOCOL' : 'CONFIRM PROTOCOL'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;