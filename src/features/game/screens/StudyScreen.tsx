// ** React Imports
import { useState } from 'react';

// ** Local Imports
import { DIVISION_COLORS } from 'src/data/districts';
import { BangladeshMap } from 'src/components/bangladesh-map/BangladeshMap';

export function StudyScreen() {
  const [showDivisionFilter, setShowDivisionFilter] = useState<string | null>(null);
  const [mapResetToken, setMapResetToken] = useState(0);
  const [showMobileDivisions, setShowMobileDivisions] = useState(false);

  const clearDivisionSelection = () => {
    if (!showDivisionFilter) return;
    setShowDivisionFilter(null);
    setMapResetToken((token) => token + 1);
    setShowMobileDivisions(false);
  };

  const handleDivisionSelect = (division: string) => {
    setShowDivisionFilter((prev) => {
      const next = prev === division ? null : division;
      if (next === null) {
        setMapResetToken((token) => token + 1);
      }
      return next;
    });
    setShowMobileDivisions(false);
  };

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      <div className='flex-1 flex flex-col lg:flex-row gap-4 min-h-0'>
        <div className='relative flex-1 min-h-0 order-1 bg-white/50 rounded-2xl border border-gray-100 overflow-hidden'>
          <div className='lg:hidden absolute top-3 left-3 z-20'>
            <button
              onClick={() => setShowMobileDivisions((prev) => !prev)}
              className='bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold text-xs px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5'
            >
              🧭 {showDivisionFilter ?? 'Divisions'} {showMobileDivisions ? '▲' : '▼'}
            </button>

            {showMobileDivisions && (
              <div className='mt-2 w-[min(82vw,18rem)] max-h-[45vh] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-2.5'>
                {showDivisionFilter && (
                  <button
                    onClick={clearDivisionSelection}
                    className='w-full mb-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 transition-colors cursor-pointer'
                  >
                    Clear selection
                  </button>
                )}
                <div className='grid grid-cols-2 gap-2'>
                  {Object.entries(DIVISION_COLORS).map(([division, color]) => (
                    <button
                      key={`mobile-${division}`}
                      className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg transition-all cursor-pointer text-left min-w-0 ${
                        showDivisionFilter === division
                          ? 'font-semibold text-gray-900 shadow-sm outline outline-2'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      style={
                        showDivisionFilter === division
                          ? {
                              backgroundColor: color + '15',
                              outlineColor: color + '80'
                            }
                          : {}
                      }
                      onClick={() => handleDivisionSelect(division)}
                    >
                      <div
                        className='w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10'
                        style={{ backgroundColor: color }}
                      />
                      <span className='truncate'>{division}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='absolute top-3 right-3 z-10 pointer-events-none'>
            <p className='bg-black/45 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full backdrop-blur-sm whitespace-nowrap'>
              Pinch to zoom • Drag to pan
            </p>
          </div>

          <BangladeshMap
            key={`study-map-${showDivisionFilter ?? 'all'}-${mapResetToken}`}
            showLabels
            hideTooltip
            interactive={false}
            highlightDivision={showDivisionFilter}
          />
        </div>

        <div className='hidden lg:block lg:w-52 flex-shrink-0 order-2'>
          <div className='bg-white rounded-2xl shadow-sm p-4 border border-gray-100'>
            <h3 className='font-semibold text-gray-600 text-xs uppercase tracking-wide mb-3'>Divisions</h3>
            {showDivisionFilter && (
              <button
                onClick={clearDivisionSelection}
                className='w-full mb-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 transition-colors cursor-pointer'
              >
                Clear selection
              </button>
            )}
            <div className='grid grid-cols-1 gap-2'>
              {Object.entries(DIVISION_COLORS).map(([division, color]) => (
                <button
                  key={`desktop-${division}`}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all cursor-pointer text-left min-w-0 ${
                    showDivisionFilter === division
                      ? 'font-semibold text-gray-900 shadow-sm outline outline-2'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={
                    showDivisionFilter === division
                      ? {
                          backgroundColor: color + '15',
                          outlineColor: color + '80'
                        }
                      : {}
                  }
                  onClick={() => handleDivisionSelect(division)}
                >
                  <div
                    className='w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-black/10'
                    style={{ backgroundColor: color }}
                  />
                  <span className='truncate'>{division}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
