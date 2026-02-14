import { useEffect, useState } from 'react';
import { BangladeshMap } from './BangladeshMap';
import { useGameState } from './useGameState';
import { DIVISION_COLORS } from './data/districts';
import './index.css';

function App() {
  const {
    state,
    startQuiz,
    startStudy,
    goToMenu,
    handleDistrictClick,
    nextQuestion,
    isGameOver,
    progress
  } = useGameState();

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleEndGame = () => {
    setShowEndConfirm(false);
    goToMenu();
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex flex-col items-center'>
      {/* Header */}
      <header className='w-full bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {state.mode === 'study' && (
              <button
                onClick={goToMenu}
                className='bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-emerald-700 font-semibold text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm'
              >
                ← Back
              </button>
            )}
            <button
              onClick={goToMenu}
              className='text-lg md:text-xl font-bold text-emerald-800 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-2'
            >
              <span className='hidden sm:inline'>BD District Quiz</span>
              <span className='sm:hidden'>BD Quiz</span>
            </button>
          </div>

          {state.mode === 'study' && (
            <span className='bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium'>
              📖 Study Mode
            </span>
          )}

          {(state.mode === 'quiz' || state.mode === 'result') && (
            <div className='flex items-center gap-2 text-sm'>
              <button
                onClick={() => setShowEndConfirm(true)}
                className='bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-sm flex-shrink-0'
              >
                ✕ End
              </button>
              <div className='bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold'>
                ✓ {state.score}/{state.totalQuestions}
              </div>
              <div className='bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full font-medium'>
                {progress.current}/64
              </div>
            </div>
          )}
        </div>

        {state.mode === 'quiz' && (
          <div className='max-w-6xl mx-auto px-4 sm:px-6 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex-1 bg-gray-200 rounded-full h-2 overflow-hidden'>
                <div
                  className='bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out'
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className='text-xs text-gray-500 font-medium flex-shrink-0'>
                {progress.current}/64
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className='flex-1 flex flex-col max-w-6xl w-full px-4 sm:px-6 py-4 min-h-0'>
        {state.mode === 'menu' && (
          <MenuScreen
            onStartQuiz={startQuiz}
            onStartStudy={startStudy}
            lastScore={state.totalQuestions > 0 ? state : null}
          />
        )}
        {state.mode === 'study' && <StudyScreen />}
        {(state.mode === 'quiz' || state.mode === 'result') && (
          <QuizScreen
            state={state}
            onDistrictClick={handleDistrictClick}
            onNext={nextQuestion}
            onBackToMenu={goToMenu}
            isGameOver={isGameOver}
            showEndConfirm={showEndConfirm}
            onEndGame={handleEndGame}
            onRequestEnd={() => setShowEndConfirm(true)}
            onCancelEnd={() => setShowEndConfirm(false)}
          />
        )}
      </main>
    </div>
  );
}

// ============ Menu Screen ============
function MenuScreen({
  onStartQuiz,
  onStartStudy,
  lastScore
}: {
  onStartQuiz: () => void;
  onStartStudy: () => void;
  lastScore: { score: number; totalQuestions: number } | null;
}) {
  return (
    <div className='flex-1 flex flex-col items-center justify-center gap-6 py-8 px-4'>
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-extrabold text-emerald-800 mb-2 tracking-tight'>
          Bangladesh District Quiz
        </h1>
        <p className='text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed px-4'>
          Can you locate all 64 districts on the map? Test your knowledge or
          study to learn!
        </p>
      </div>

      {lastScore && lastScore.totalQuestions > 0 && (
        <div className='bg-white rounded-2xl shadow-md p-6 text-center border border-emerald-100 min-w-[180px]'>
          <p className='text-gray-400 text-xs font-medium uppercase tracking-wide mb-1'>
            Last Score
          </p>
          <p className='text-3xl font-extrabold text-emerald-700'>
            {lastScore.score}
            <span className='text-lg text-gray-400'>
              /{lastScore.totalQuestions}
            </span>
          </p>
          <p className='text-emerald-600 text-sm font-medium mt-1'>
            {Math.round((lastScore.score / lastScore.totalQuestions) * 100)}%
            correct
          </p>
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-3 w-full max-w-sm px-2'>
        <button
          onClick={onStartQuiz}
          className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg cursor-pointer active:scale-[0.97] hover:-translate-y-0.5'
        >
          🎯 Start Quiz
        </button>
        <button
          onClick={onStartStudy}
          className='flex-1 bg-white hover:bg-sky-50 text-sky-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-lg cursor-pointer active:scale-[0.97] border-2 border-sky-200 hover:-translate-y-0.5'
        >
          📖 Study Map
        </button>
      </div>

      {/* Division Legend */}
      <div className='bg-white rounded-xl shadow-md p-5 w-full max-w-sm border border-gray-100'>
        <h3 className='font-semibold text-gray-600 mb-3 text-md mb-4 pb-2 border-b text-center uppercase tracking-wide'>
          8 Divisions
        </h3>
        <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
          {Object.entries(DIVISION_COLORS).map(([division, color]) => (
            <div
              key={division}
              className='flex items-center gap-2.5 text-sm text-gray-600'
            >
              <div
                className='w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-black/10'
                style={{ backgroundColor: color }}
              />
              {division}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Study Screen ============
function StudyScreen() {
  const [showDivisionFilter, setShowDivisionFilter] = useState<string | null>(
    null
  );
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
        {/* Map */}
        <div className='relative flex-1 min-h-0 order-1 bg-white/50 rounded-2xl border border-gray-100 p-2 sm:p-3'>
          {/* Mobile floating divisions */}
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

          {/* Zoom hint at top of map */}
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

        {/* Desktop division sidebar */}
        <div className='hidden lg:block lg:w-52 flex-shrink-0 order-2'>
          <div className='bg-white rounded-2xl shadow-sm p-4 border border-gray-100'>
            <h3 className='font-semibold text-gray-600 text-xs uppercase tracking-wide mb-3'>
              Divisions
            </h3>
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

// ============ Quiz Screen ============
function QuizScreen({
  state,
  onDistrictClick,
  onNext,
  onBackToMenu,
  isGameOver,
  showEndConfirm,
  onEndGame,
  onRequestEnd,
  onCancelEnd
}: {
  state: ReturnType<typeof useGameState>['state'];
  onDistrictClick: (name: string) => void;
  onNext: () => void;
  onBackToMenu: () => void;
  isGameOver: boolean;
  showEndConfirm: boolean;
  onEndGame: () => void;
  onRequestEnd: () => void;
  onCancelEnd: () => void;
}) {
  const isResult = state.mode === 'result';

  // Keyboard support: Enter or Space to go next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (isResult && isGameOver) {
          onBackToMenu();
        } else if (isResult) {
          onNext();
        }
      }
      if (e.key === 'Escape') {
        onRequestEnd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResult, isGameOver, onNext, onBackToMenu, onRequestEnd]);

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      {/* End game confirmation modal */}
      {showEndConfirm && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center'>
            <div className='text-4xl mb-3'>🏁</div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>
              End the quiz?
            </h3>
            <p className='text-gray-500 text-sm mb-5 leading-relaxed'>
              You've answered {state.totalQuestions} of 64 questions. Score so
              far:{' '}
              <strong>
                {state.score}/{state.totalQuestions}
              </strong>
            </p>
            <div className='flex gap-3'>
              <button
                onClick={onCancelEnd}
                className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all'
              >
                Continue
              </button>
              <button
                onClick={onEndGame}
                className='flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all'
              >
                End Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex-1 flex flex-col lg:flex-row gap-4 min-h-0'>
        {/* Map */}
        <div className='flex-1 min-h-0 order-2 lg:order-1 bg-white/50 rounded-2xl border border-gray-100 p-2 sm:p-3'>
          <BangladeshMap
            onDistrictClick={onDistrictClick}
            interactive={state.mode === 'quiz'}
            hideTooltip={state.mode === 'quiz'}
            correctDistrict={state.lastAnswer?.correct || null}
            wrongDistrict={
              state.lastAnswer && !state.lastAnswer.isCorrect
                ? state.lastAnswer.selected
                : null
            }
            answeredDistricts={state.answeredDistricts.filter(
              (d) => d !== state.lastAnswer?.correct
            )}
          />
        </div>

        {/* Question / Result Panel - sidebar on desktop, top on mobile */}
        <div className='lg:w-72 flex-shrink-0 order-1 lg:order-2'>
          <div
            className={`text-center py-5 px-5 rounded-2xl shadow-sm transition-colors duration-300 ${
              isResult
                ? state.lastAnswer?.isCorrect
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : 'bg-red-50 border-2 border-red-200'
                : 'bg-white border-2 border-emerald-100'
            }`}
          >
            {!isResult ? (
              <>
                <p className='text-gray-400 text-xs mb-2 uppercase tracking-wide font-medium'>
                  Find on map
                </p>
                <p className='text-2xl lg:text-3xl font-extrabold text-emerald-800 tracking-tight'>
                  {state.currentDistrict}
                </p>
                <p className='text-gray-400 text-xs mt-3'>
                  Click the district on the map
                </p>
              </>
            ) : (
              <>
                {state.lastAnswer?.isCorrect ? (
                  <div>
                    <div className='text-4xl mb-2'>✅</div>
                    <p className='text-emerald-700 font-bold text-lg'>
                      Correct!
                    </p>
                    <p className='text-emerald-600 text-sm mt-1'>
                      <strong>{state.lastAnswer.correct}</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className='text-4xl mb-2'>❌</div>
                    <p className='text-red-700 font-bold text-lg'>Wrong!</p>
                    <p className='text-red-600 text-sm mt-1'>
                      You clicked <strong>{state.lastAnswer?.selected}</strong>
                    </p>
                    <p className='text-red-500 text-xs mt-1'>
                      Correct: <strong>{state.lastAnswer?.correct}</strong>
                    </p>
                  </div>
                )}

                <div className='mt-5 flex flex-col items-center gap-3'>
                  {isGameOver ? (
                    <>
                      <div className='bg-white rounded-xl p-4 w-full border border-gray-200 mb-2'>
                        <p className='text-xs text-gray-400 uppercase tracking-wide font-medium'>
                          Final Score
                        </p>
                        <p className='text-3xl font-extrabold text-emerald-700 mt-2'>
                          {state.score}
                          <span className='text-lg text-gray-400'>/64</span>
                        </p>
                        <p
                          className='text-sm font-medium mt-1.5'
                          style={{
                            color:
                              state.score >= 48
                                ? '#059669'
                                : state.score >= 32
                                  ? '#d97706'
                                  : '#dc2626'
                          }}
                        >
                          {state.score >= 48
                            ? '🌟 Excellent!'
                            : state.score >= 32
                              ? '👍 Good job!'
                              : '📚 Keep practicing!'}{' '}
                          {Math.round((state.score / 64) * 100)}%
                        </p>
                      </div>
                      <button
                        onClick={onBackToMenu}
                        className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl cursor-pointer active:scale-[0.97] transition-all'
                      >
                        Back to Menu
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onNext}
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl cursor-pointer active:scale-[0.97] transition-all'
                    >
                      Next District →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick stats on desktop */}
          <div className='hidden lg:block mt-3 bg-white rounded-xl p-4 border border-gray-100 text-sm text-gray-500'>
            <div className='flex justify-between mb-2'>
              <span>Correct</span>
              <span className='font-semibold text-emerald-600'>
                {state.score}
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span>Wrong</span>
              <span className='font-semibold text-red-500'>
                {state.totalQuestions - state.score}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Remaining</span>
              <span className='font-semibold text-gray-700'>
                {64 - state.totalQuestions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
