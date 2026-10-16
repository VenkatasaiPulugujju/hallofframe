import React from 'react';
import { usePosts } from '../context/PostContext';
import { Sparkles, Coffee, BookOpen, Wrench, Music, Library, Zap } from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Chaos', icon: Zap, color: '#FFD719' },
  { id: 'Hostel Shenanigans', label: 'Hostel Shenanigans', icon: Wrench, color: '#8055F5' },
  { id: 'Canteen Chronicles', label: 'Canteen Chronicles', icon: Coffee, color: '#39D62D' },
  { id: 'Exam Brainrot', label: 'Exam Brainrot', icon: BookOpen, color: '#FF4388' },
  { id: 'Lab Disasters', label: 'Lab Disasters', icon: Sparkles, color: '#FFD719' },
  { id: 'Fest Fever', label: 'Fest Fever', icon: Music, color: '#8055F5' },
  { id: 'Library Stealth', label: 'Library Stealth', icon: Library, color: '#39D62D' },
];

export const CategoryFilter: React.FC = () => {
  const { activeCategory, setActiveCategory } = usePosts();

  return (
    <div className="mb-6 overflow-x-auto pb-2 scrollbar-none select-none">
      <div className="flex items-center gap-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-[#111111] font-display font-extrabold text-xs uppercase tracking-wider transition-all btn-press ${
                isActive
                  ? 'bg-[#111111] text-white shadow-brutal-sm translate-y-[-1px]'
                  : 'bg-[#FFF9F0] text-[#111111] hover:bg-white hover:border-[#111111] shadow-brutal-xs'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-[#111111]"
                style={{ backgroundColor: cat.color }}
              />
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
