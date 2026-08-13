import { Play, Square, Clock } from 'lucide-react';

export default function TimeTracker() {
  return (
    <div className="bg-gradient-to-br from-green-primary to-green-dark rounded-[22px] p-6 shadow-card flex flex-col items-center justify-center text-white min-h-[260px]">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={16} className="text-green-light" />
        <span className="text-xs font-medium text-green-light tracking-wide">Time Tracker</span>
      </div>

      {/* Timer */}
      <div className="text-[48px] font-bold tracking-tight leading-none mb-8 font-mono">
        01:24:08
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm">
          <Play size={18} className="fill-white text-white ml-0.5" />
        </button>
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm">
          <Square size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
