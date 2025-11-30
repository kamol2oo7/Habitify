import React, { useRef } from 'react';
import { Trash2, GripVertical, Pencil } from 'lucide-react';
import { Habit, Status } from '../types';
import { STATUS_COLORS } from '../constants';

interface HabitMatrixProps {
  habits: Habit[];
  daysInMonth: number;
  currentYear: number;
  currentMonth: number;
  logs: Record<string, Record<string, Status>>;
  selectedDate: Date;
  onToggleStatus: (date: string, habitId: string) => void;
  onDeleteHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onReorderHabits: (from: number, to: number) => void;
  onDateClick: (date: Date) => void;
}

const HabitMatrix: React.FC<HabitMatrixProps> = ({ 
  habits, 
  daysInMonth, 
  currentYear, 
  currentMonth, 
  logs, 
  selectedDate,
  onToggleStatus,
  onDeleteHabit,
  onEditHabit,
  onReorderHabits,
  onDateClick
}) => {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

  // Drag and Drop Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const getStatus = (day: number, habitId: string) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return logs[dateKey]?.[habitId] || Status.None;
  };

  const handleCellClick = (day: number, habitId: string) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onToggleStatus(dateKey, habitId);
    // Also select the date when interacting
    const newDate = new Date(currentYear, currentMonth, day);
    onDateClick(newDate);
  };

  // Drag Handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      dragItem.current = index;
      e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      dragOverItem.current = index;
      e.preventDefault();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDragEnd = () => {
      const fromIndex = dragItem.current;
      const toIndex = dragOverItem.current;
      
      if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
          onReorderHabits(fromIndex, toIndex);
      }
      dragItem.current = null;
      dragOverItem.current = null;
  };

  return (
    <div className="w-full bg-[#fdfbf7] dark:bg-neutral-900 border border-[#e8e4d9] dark:border-neutral-800 rounded-[2.5rem] p-6 overflow-hidden transition-colors duration-300 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-stone-800 dark:text-white uppercase tracking-wider mb-6 flex justify-between items-center">
          <span>Daily Protocol</span>
        </h3>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar relative">
        <div className="min-w-max">
          {/* Header Row (Days) */}
          <div className="flex mb-4">
            <div className="w-40 sticky left-0 bg-[#fdfbf7] dark:bg-neutral-900 z-50 shrink-0 border-r border-[#e8e4d9] dark:border-neutral-800 transition-colors"></div>
            {days.map(day => {
               const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth;
               return (
                <button 
                    key={day} 
                    onClick={() => onDateClick(new Date(currentYear, currentMonth, day))}
                    className={`w-9 flex flex-col justify-center items-center text-xs font-mono transition-colors rounded-xl hover:bg-[#e8e4d9] dark:hover:bg-neutral-800 pb-2
                        ${isSelected ? 'bg-[#e8e4d9] dark:bg-neutral-800' : ''}
                        ${isCurrentMonth && day === today ? 'text-emerald-500 font-bold' : 'text-stone-400 dark:text-neutral-500'}
                    `}
                >
                    <span className="mb-1">{day}</span>
                    {isSelected && <div className="w-1.5 h-1.5 bg-stone-800 dark:bg-white rounded-full"></div>}
                </button>
            )})}
          </div>

          {/* Habit Rows */}
          {habits.map((habit, index) => (
            <div 
                key={habit.id} 
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragEnter={(e) => onDragEnter(e, index)}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                className="flex mb-3 items-center hover:bg-[#f4f1ea] dark:hover:bg-neutral-800/30 transition-colors rounded-xl group/row cursor-default"
            >
              {/* Habit Name Column - Sticky */}
              <div className="w-40 sticky left-0 bg-[#fdfbf7] dark:bg-neutral-900 z-40 shrink-0 border-r border-[#e8e4d9] dark:border-neutral-800 py-2 pr-2 pl-2 flex items-center transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] rounded-l-xl">
                {/* Drag Handle */}
                <div className="mr-2 text-[#d6d3c9] dark:text-neutral-700 cursor-grab hover:text-stone-500 dark:hover:text-neutral-500 shrink-0 active:cursor-grabbing" title="Drag to reorder">
                    <GripVertical size={14} />
                </div>

                {/* Edit Trigger (Name) */}
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditHabit(habit);
                    }}
                    className="flex flex-col overflow-hidden grow min-w-0 cursor-pointer group/name hover:opacity-70 transition-opacity"
                    title="Click to Edit"
                >
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-stone-800 dark:text-gray-100 truncate">{habit.name}</span>
                        <Pencil size={8} className="opacity-0 group-hover/name:opacity-100 text-stone-400" />
                    </div>
                    <span className="text-[9px] text-stone-400 uppercase">{habit.type}</span>
                </div>
                
                <button 
                    type="button"
                    // CRITICAL: preventDefault stops the Drag event from hijacking the click.
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onTouchStart={(e) => { e.stopPropagation(); }}
                    onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        onDeleteHabit(habit.id); 
                    }}
                    className="relative z-50 text-[#d6d3c9] hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors p-2 shrink-0 flex items-center justify-center cursor-pointer ml-1 pointer-events-auto"
                    title="Delete Habit"
                >
                    <Trash2 size={14} className="pointer-events-none" />
                </button>
              </div>

              {/* Day Cells */}
              {days.map(day => {
                const status = getStatus(day, habit.id);
                return (
                  <button
                    key={`${habit.id}-${day}`}
                    onClick={() => handleCellClick(day, habit.id)}
                    className="w-9 h-9 flex items-center justify-center shrink-0 focus:outline-none group relative z-0"
                  >
                    <div className={`
                        w-6 h-6 rounded-[10px] transition-all duration-200 border border-transparent
                        ${STATUS_COLORS[status]}
                        ${status === Status.None ? 'bg-[#e8e4d9] dark:bg-neutral-800 hover:border-stone-400 dark:hover:border-neutral-600' : 'shadow-sm scale-95'}
                    `}></div>
                  </button>
                );
              })}
            </div>
          ))}

            {habits.length === 0 && (
                <div className="py-10 text-center text-stone-400 dark:text-neutral-600 text-sm italic border-dashed border border-[#e8e4d9] dark:border-neutral-800 rounded-2xl">
                    No habits tracked. Add one to begin.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HabitMatrix;