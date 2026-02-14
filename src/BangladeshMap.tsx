import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  districts,
  MAP_WIDTH,
  MAP_HEIGHT,
  type District
} from './data/districts';

interface BangladeshMapProps {
  onDistrictClick?: (districtName: string) => void;
  showLabels?: boolean;
  hideTooltip?: boolean;
  highlightDivision?: string | null;
  correctDistrict?: string | null;
  wrongDistrict?: string | null;
  answeredDistricts?: string[];
  interactive?: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

export const BangladeshMap: React.FC<BangladeshMapProps> = ({
  onDistrictClick,
  showLabels = false,
  hideTooltip = false,
  highlightDivision = null,
  correctDistrict = null,
  wrongDistrict = null,
  answeredDistricts = [],
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    name: string;
    bn_name: string;
    division: string;
  } | null>(null);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null);

  // Clamp pan so the map doesn't fly off screen
  const clampPan = useCallback((px: number, py: number, z: number) => {
    const container = containerRef.current;
    if (!container) return { x: px, y: py };
    const rect = container.getBoundingClientRect();
    const scaledW = rect.width * z;
    const scaledH = rect.height * z;
    const maxPanX = Math.max(0, (scaledW - rect.width) / 2);
    const maxPanY = Math.max(0, (scaledH - rect.height) / 2);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, px)),
      y: Math.max(-maxPanY, Math.min(maxPanY, py))
    };
  }, []);

  const handleZoom = useCallback(
    (delta: number, centerX?: number, centerY?: number) => {
      setZoom((prev) => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
        if (newZoom === 1) {
          setPan({ x: 0, y: 0 });
        } else if (centerX !== undefined && centerY !== undefined) {
          setPan((prevPan) => {
            const scale = newZoom / prev;
            const newPanX = centerX - (centerX - prevPan.x) * scale;
            const newPanY = centerY - (centerY - prevPan.y) * scale;
            return clampPan(newPanX, newPanY, newZoom);
          });
        }
        return newZoom;
      });
    },
    [clampPan]
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      handleZoom(delta, cx, cy);
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [handleZoom]);

  // Mouse pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
    },
    [zoom, pan]
  );

  const handleMouseMoveGlobal = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(
        clampPan(panStart.current.panX + dx, panStart.current.panY + dy, zoom)
      );
    },
    [isPanning, zoom, clampPan]
  );

  const handleMouseUpGlobal = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isPanning, handleMouseMoveGlobal, handleMouseUpGlobal]);

  // Touch pinch zoom & pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0],
          t2 = e.touches[1];
        const dist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );
        const rect = container.getBoundingClientRect();
        const cx = (t1.clientX + t2.clientX) / 2 - rect.left - rect.width / 2;
        const cy = (t1.clientY + t2.clientY) / 2 - rect.top - rect.height / 2;

        if (
          lastPinchDist.current !== null &&
          lastPinchCenter.current !== null
        ) {
          const delta = (dist - lastPinchDist.current) * 0.01;
          handleZoom(delta, cx, cy);
        }
        lastPinchDist.current = dist;
        lastPinchCenter.current = { x: cx, y: cy };
      } else if (e.touches.length === 1 && zoom > 1) {
        e.preventDefault();
        const t = e.touches[0];
        if (panStart.current.x !== 0 || panStart.current.y !== 0) {
          const dx = t.clientX - panStart.current.x;
          const dy = t.clientY - panStart.current.y;
          setPan(
            clampPan(
              panStart.current.panX + dx,
              panStart.current.panY + dy,
              zoom
            )
          );
        }
        panStart.current = {
          x: t.clientX,
          y: t.clientY,
          panX: pan.x,
          panY: pan.y
        };
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && zoom > 1) {
        const t = e.touches[0];
        panStart.current = {
          x: t.clientX,
          y: t.clientY,
          panX: pan.x,
          panY: pan.y
        };
      }
    };

    const onTouchEnd = () => {
      lastPinchDist.current = null;
      lastPinchCenter.current = null;
    };

    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [zoom, pan, handleZoom, clampPan]);

  const handleMouseEnter = useCallback(
    (district: District, e: React.MouseEvent) => {
      if (!interactive && !showLabels) return;
      setHoveredDistrict(district.name);
      const elem = containerRef.current;
      if (elem) {
        const rect = elem.getBoundingClientRect();
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          name: district.name,
          bn_name: district.bn_name,
          division: district.division
        });
      }
    },
    [interactive, showLabels]
  );

  const handleMouseMoveDistrict = useCallback(
    (district: District, e: React.MouseEvent) => {
      if (!interactive && !showLabels) return;
      const elem = containerRef.current;
      if (elem) {
        const rect = elem.getBoundingClientRect();
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          name: district.name,
          bn_name: district.bn_name,
          division: district.division
        });
      }
    },
    [interactive, showLabels]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredDistrict(null);
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (districtName: string) => {
      if (!interactive || !onDistrictClick) return;
      onDistrictClick(districtName);
    },
    [interactive, onDistrictClick]
  );

  // Touch support for district clicking
  const [touchedDistrict, setTouchedDistrict] = useState<string | null>(null);

  const handleTouchStart = useCallback(
    (district: District, e: React.TouchEvent) => {
      if (!interactive) return;
      if (zoom > 1) return; // let pan handler work
      e.preventDefault();
      setTouchedDistrict(district.name);
    },
    [interactive, zoom]
  );

  const handleTouchEnd = useCallback(
    (district: District, e: React.TouchEvent) => {
      if (!interactive || !onDistrictClick) return;
      if (zoom > 1) return;
      e.preventDefault();
      if (touchedDistrict === district.name) {
        onDistrictClick(district.name);
      }
      setTouchedDistrict(null);
    },
    [interactive, onDistrictClick, touchedDistrict, zoom]
  );

  const getDistrictFill = useCallback(
    (district: District): string => {
      if (correctDistrict === district.name) return '#22c55e';
      if (wrongDistrict === district.name) return '#ef4444';
      if (answeredDistricts.includes(district.name)) return '#e2e8f0';
      if (
        hoveredDistrict === district.name ||
        touchedDistrict === district.name
      )
        return '#fde68a';
      if (highlightDivision && district.division === highlightDivision)
        return district.divisionColor + '70';
      if (highlightDivision && district.division !== highlightDivision)
        return '#e2e8f0';
      return district.divisionColor + '35';
    },
    [
      correctDistrict,
      wrongDistrict,
      answeredDistricts,
      hoveredDistrict,
      touchedDistrict,
      highlightDivision
    ]
  );

  const getDistrictStroke = useCallback(
    (district: District): string => {
      if (correctDistrict === district.name) return '#16a34a';
      if (wrongDistrict === district.name) return '#dc2626';
      if (
        hoveredDistrict === district.name ||
        touchedDistrict === district.name
      )
        return '#f59e0b';
      if (answeredDistricts.includes(district.name)) return '#cbd5e1';
      if (highlightDivision && district.division === highlightDivision)
        return district.divisionColor;
      if (highlightDivision && district.division !== highlightDivision)
        return '#cbd5e1';
      return '#64748b';
    },
    [
      correctDistrict,
      wrongDistrict,
      hoveredDistrict,
      touchedDistrict,
      answeredDistricts,
      highlightDivision
    ]
  );

  const getDistrictStrokeWidth = useCallback(
    (district: District): number => {
      if (correctDistrict === district.name || wrongDistrict === district.name)
        return 2.5;
      if (
        hoveredDistrict === district.name ||
        touchedDistrict === district.name
      )
        return 1.8;
      return 0.5;
    },
    [correctDistrict, wrongDistrict, hoveredDistrict, touchedDistrict]
  );

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full flex items-center justify-center overflow-hidden'
      onMouseDown={handleMouseDown}
      style={{
        cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default'
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className='w-full h-full max-h-[80vh]'
        style={{
          touchAction: 'none',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        {/* District paths */}
        {districts.map((district) => (
          <path
            key={district.name}
            d={district.path}
            fill={getDistrictFill(district)}
            stroke={getDistrictStroke(district)}
            strokeWidth={getDistrictStrokeWidth(district)}
            strokeLinejoin='round'
            className={interactive ? 'cursor-pointer' : ''}
            style={{
              transition:
                'fill 0.15s ease, stroke 0.15s ease, stroke-width 0.15s ease'
            }}
            onMouseEnter={(e) => handleMouseEnter(district, e)}
            onMouseMove={(e) => handleMouseMoveDistrict(district, e)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(district.name)}
            onTouchStart={(e) => handleTouchStart(district, e)}
            onTouchEnd={(e) => handleTouchEnd(district, e)}
          />
        ))}

        {/* Labels in study mode */}
        {showLabels &&
          districts.map((district) => (
            <g key={`label-${district.name}`}>
              <text
                x={district.labelX}
                y={district.labelY}
                textAnchor='middle'
                dominantBaseline='central'
                fill='white'
                fontSize={5}
                fontWeight='700'
                strokeWidth={2.5}
                stroke='white'
                paintOrder='stroke'
                className='pointer-events-none select-none'
              >
                {district.name}
              </text>
              <text
                x={district.labelX}
                y={district.labelY}
                textAnchor='middle'
                dominantBaseline='central'
                fill='#1e293b'
                fontSize={5}
                fontWeight='700'
                className='pointer-events-none select-none'
              >
                {district.name}
              </text>
            </g>
          ))}

        {/* Also show correct district label in result mode */}
        {correctDistrict &&
          !showLabels &&
          districts
            .filter(
              (d) => d.name === correctDistrict || d.name === wrongDistrict
            )
            .map((district) => (
              <text
                key={`result-label-${district.name}`}
                x={district.labelX}
                y={district.labelY}
                textAnchor='middle'
                dominantBaseline='central'
                fill={district.name === correctDistrict ? '#16a34a' : '#dc2626'}
                fontSize={7}
                fontWeight='700'
                className='pointer-events-none select-none'
                style={{
                  textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white'
                }}
              >
                {district.name}
              </text>
            ))}
      </svg>

      {/* Zoom controls */}
      <div className='absolute bottom-3 right-3 flex flex-col gap-1.5 z-10'>
        <button
          onClick={() => handleZoom(0.5)}
          className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-lg font-bold'
          title='Zoom in'
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-0.5)}
          className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-lg font-bold'
          title='Zoom out'
        >
          −
        </button>
        {zoom > 1 && (
          <button
            onClick={resetZoom}
            className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-xs font-medium'
            title='Reset zoom'
          >
            ↺
          </button>
        )}
      </div>

      {/* Zoom level indicator */}
      {zoom > 1 && (
        <div className='absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm'>
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Tooltip */}
      {tooltip && !hideTooltip && (
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
      )}
    </div>
  );
};
