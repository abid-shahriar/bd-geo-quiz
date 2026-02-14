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
  const [isTouchPanning, setIsTouchPanning] = useState(false);
  const [viewBoxScale, setViewBoxScale] = useState(1);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null);
  const lastTouchPoint = useRef<{ x: number; y: number } | null>(null);

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
        setIsTouchPanning(false);
        lastTouchPoint.current = null;
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
          const delta = Math.max(
            -0.35,
            Math.min(0.35, (dist - lastPinchDist.current) * 0.01)
          );
          handleZoom(delta, cx, cy);
        }
        lastPinchDist.current = dist;
        lastPinchCenter.current = { x: cx, y: cy };
      } else if (e.touches.length === 1 && zoom > 1) {
        e.preventDefault();
        const t = e.touches[0];
        setIsTouchPanning(true);

        if (lastTouchPoint.current) {
          const dx = t.clientX - lastTouchPoint.current.x;
          const dy = t.clientY - lastTouchPoint.current.y;
          setPan((prevPan) => clampPan(prevPan.x + dx, prevPan.y + dy, zoom));
        }

        lastTouchPoint.current = { x: t.clientX, y: t.clientY };
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0],
          t2 = e.touches[1];
        lastPinchDist.current = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );
      }

      if (e.touches.length === 1 && zoom > 1) {
        const t = e.touches[0];
        lastTouchPoint.current = { x: t.clientX, y: t.clientY };
        setIsTouchPanning(true);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastPinchDist.current = null;
        lastPinchCenter.current = null;
      }

      if (e.touches.length === 1 && zoom > 1) {
        const t = e.touches[0];
        lastTouchPoint.current = { x: t.clientX, y: t.clientY };
        setIsTouchPanning(true);
      } else {
        lastTouchPoint.current = null;
        setIsTouchPanning(false);
      }
    };

    const onTouchCancel = () => {
      lastPinchDist.current = null;
      lastPinchCenter.current = null;
      lastTouchPoint.current = null;
      setIsTouchPanning(false);
    };

    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchCancel, {
      passive: true
    });
    return () => {
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [zoom, handleZoom, clampPan]);

  // Track rendered SVG scale to convert pixel pan to SVG units
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const updateScale = () => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT);
      setViewBoxScale(scale || 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(svg);

    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

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

  const panXViewBox = pan.x / viewBoxScale;
  const panYViewBox = pan.y / viewBoxScale;

  useEffect(() => {
    if (!showLabels) return;
    if (!highlightDivision) return;

    if (!viewBoxScale) return;

    const divisionDistricts = districts.filter(
      (d) => d.division === highlightDivision
    );

    if (divisionDistricts.length === 0) return;

    const minX = Math.min(...divisionDistricts.map((d) => d.labelX));
    const maxX = Math.max(...divisionDistricts.map((d) => d.labelX));
    const minY = Math.min(...divisionDistricts.map((d) => d.labelY));
    const maxY = Math.max(...divisionDistricts.map((d) => d.labelY));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const spanX = Math.max(30, maxX - minX);
    const spanY = Math.max(30, maxY - minY);
    const fitZoomX = MAP_WIDTH / (spanX + 80);
    const fitZoomY = MAP_HEIGHT / (spanY + 120);
    const targetZoom = Math.max(
      1.8,
      Math.min(3.2, Math.min(MAX_ZOOM, fitZoomX, fitZoomY))
    );

    const panSvgX = -targetZoom * (centerX - MAP_WIDTH / 2);
    const panSvgY = -targetZoom * (centerY - MAP_HEIGHT / 2);
    const panPxX = panSvgX * viewBoxScale;
    const panPxY = panSvgY * viewBoxScale;

    const rafId = window.requestAnimationFrame(() => {
      setZoom(targetZoom);
      setPan(clampPan(panPxX, panPxY, targetZoom));
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [showLabels, highlightDivision, viewBoxScale, clampPan]);

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full flex items-center justify-center overflow-hidden'
      onMouseDown={handleMouseDown}
      style={{
        cursor:
          zoom > 1
            ? isPanning || isTouchPanning
              ? 'grabbing'
              : 'grab'
            : 'default'
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className='w-full h-full max-h-[80vh]'
        style={{
          touchAction: 'none'
        }}
      >
        <g transform={`translate(${panXViewBox} ${panYViewBox})`}>
          <g
            transform={`translate(${MAP_WIDTH / 2} ${MAP_HEIGHT / 2}) scale(${zoom}) translate(${-MAP_WIDTH / 2} ${-MAP_HEIGHT / 2})`}
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
                    style={{ textRendering: 'geometricPrecision' }}
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
                    style={{ textRendering: 'geometricPrecision' }}
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
                    fill={
                      district.name === correctDistrict ? '#16a34a' : '#dc2626'
                    }
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
          </g>
        </g>
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
