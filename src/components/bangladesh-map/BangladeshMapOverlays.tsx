// ** Local Imports
import type { MapTooltip } from 'src/components/bangladesh-map/BangladeshMap.types';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  return (
    <div className='absolute bottom-3 right-3 flex flex-col gap-1.5 z-10'>
      <button
        onClick={onZoomIn}
        className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-lg font-bold'
        title='Zoom in'
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-lg font-bold'
        title='Zoom out'
      >
        −
      </button>
      {zoom > 1 && (
        <button
          onClick={onResetZoom}
          className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-xs font-medium'
          title='Reset zoom'
        >
          ↺
        </button>
      )}
    </div>
  );
}

interface ZoomIndicatorProps {
  zoom: number;
  showLabels: boolean;
}

export function ZoomIndicator({ zoom, showLabels }: ZoomIndicatorProps) {
  if (zoom <= 1) return null;

  return (
    <div
      className={`absolute right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm ${
        showLabels ? 'top-12' : 'top-3'
      }`}
    >
      {Math.round(zoom * 100)}%
    </div>
  );
}

interface TooltipOverlayProps {
  tooltip: MapTooltip | null;
  hideTooltip?: boolean;
}

export function TooltipOverlay({ tooltip, hideTooltip = false }: TooltipOverlayProps) {
  if (!tooltip || hideTooltip) return null;

  return (
    <div
      className='absolute bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-50 whitespace-nowrap'
      style={{
        left: tooltip.x + 12,
        top: tooltip.y - 35
      }}
    >
      <div className='font-bold text-sm'>{tooltip.name}</div>
      <div className='text-gray-300 text-[10px]'>
        {tooltip.bn_name} &bull; {tooltip.division}
      </div>
    </div>
  );
}
