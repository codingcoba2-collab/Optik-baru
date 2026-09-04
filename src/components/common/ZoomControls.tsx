import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const ZoomControls: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('eyehub_zoom_level');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    applyZoom(zoomLevel);
  }, [zoomLevel]);

  const applyZoom = (level: number) => {
    try {
      // Chromium & Safari support CSS zoom directly
      (document.documentElement.style as any).zoom = `${level}%`;
      localStorage.setItem('eyehub_zoom_level', level.toString());
    } catch (e) {
      console.warn('Zoom application notice:', e);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(75, prev - 10));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
      <button
        onClick={handleZoomOut}
        disabled={zoomLevel <= 75}
        title="Zoom Out (Perkecil Layar)"
        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleResetZoom}
        title="Reset Zoom ke 100%"
        className="px-1.5 py-0.5 text-[10px] font-mono font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      >
        {zoomLevel}%
      </button>

      <button
        onClick={handleZoomIn}
        disabled={zoomLevel >= 150}
        title="Zoom In (Perbesar Layar)"
        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
