// ** React Imports
import { useEffect } from 'react';

// ** Hooks Imports
import type { GameState } from 'src/hooks/useGameState';

// ** Local Imports
import { BangladeshMap } from 'src/components/bangladesh-map/BangladeshMap';

interface QuizScreenProps {
  state: GameState;
  onDistrictClick: (name: string) => void;
  onNext: () => void;
  onBackToMenu: () => void;
  isGameOver: boolean;
  showEndConfirm: boolean;
  onEndGame: () => void;
  onRequestEnd: () => void;
  onCancelEnd: () => void;
}

export function QuizScreen({
  state,
  onDistrictClick,
  onNext,
  onBackToMenu,
  isGameOver,
  showEndConfirm,
  onEndGame,
  onRequestEnd,
  onCancelEnd
}: QuizScreenProps) {
  const isResult = state.mode === 'result';

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
      {showEndConfirm && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center'>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>End the quiz?</h3>
            <p className='text-gray-500 text-sm mb-5 leading-relaxed'>
              You've answered {state.totalQuestions} of 64 questions.
              <br />
              Score so far:{' '}
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
        <div className='flex-1 min-h-0 overflow-hidden order-2 lg:order-1 bg-white/50 rounded-2xl border border-gray-100 p-0'>
          <BangladeshMap
            onDistrictClick={onDistrictClick}
            interactive={state.mode === 'quiz'}
            hideTooltip={state.mode === 'quiz'}
            correctDistrict={state.lastAnswer?.correct || null}
            wrongDistrict={state.lastAnswer && !state.lastAnswer.isCorrect ? state.lastAnswer.selected : null}
            answeredDistricts={state.answeredDistricts.filter((d) => d !== state.lastAnswer?.correct)}
          />
        </div>

        <div className='lg:w-72 flex-shrink-0 order-1 lg:order-2'>
          <div
            className={`text-center px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-sm transition-colors duration-300 flex flex-col ${
              isGameOver ? 'min-h-[185px] sm:min-h-[195px]' : 'h-[110px] sm:h-[148px] lg:h-[150px]'
            } ${
              isResult
                ? state.lastAnswer?.isCorrect
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : 'bg-red-50 border-2 border-red-200'
                : 'bg-white border-2 border-emerald-100'
            }`}
          >
            {!isResult ? (
              <div className='h-full flex flex-col'>
                <div className='flex-1 flex flex-col justify-center'>
                  <p className='text-xl sm:text-2xl lg:text-2xl font-extrabold text-emerald-800 tracking-tight leading-tight'>
                    {state.currentDistrict}
                  </p>
                  <p className='text-gray-500 text-xs sm:text-sm mt-1.5'>Tap the district on the map</p>
                </div>
                <div className='pt-1.5'>
                  <p className='text-xs text-emerald-600 font-medium'>Waiting for your answer...</p>
                </div>
              </div>
            ) : isGameOver ? (
              <>
                {state.lastAnswer?.isCorrect ? (
                  <div className='pt-0.5'>
                    <p className='text-emerald-700 font-bold text-sm sm:text-base'>Correct!</p>
                    <p className='text-emerald-600 text-xs sm:text-sm mt-0.5 truncate'>
                      <strong>{state.lastAnswer.correct}</strong>
                    </p>
                  </div>
                ) : (
                  <div className='pt-0.5'>
                    <p className='text-red-700 font-bold text-sm sm:text-base'>Wrong!</p>
                    <p className='text-red-600 text-[11px] sm:text-xs mt-0.5 truncate'>
                      Your: <strong>{state.lastAnswer?.selected}</strong> • Correct:{' '}
                      <strong>{state.lastAnswer?.correct}</strong>
                    </p>
                  </div>
                )}

                <div className='mt-2 flex flex-col items-center gap-2'>
                  <div className='bg-white rounded-xl p-3 w-full border border-gray-200 mb-1.5'>
                    <p className='text-xs text-gray-400 uppercase tracking-wide font-medium'>Final Score</p>
                    <p className='text-2xl font-extrabold text-emerald-700 mt-1.5'>
                      {state.score}
                      <span className='text-lg text-gray-400'>/64</span>
                    </p>
                    <p
                      className='text-sm font-medium mt-1.5'
                      style={{
                        color: state.score >= 48 ? '#059669' : state.score >= 32 ? '#d97706' : '#dc2626'
                      }}
                    >
                      {state.score >= 48 ? '🌟 Excellent!' : state.score >= 32 ? '👍 Good job!' : '📚 Keep practicing!'}{' '}
                      {Math.round((state.score / 64) * 100)}%
                    </p>
                  </div>
                  <button
                    onClick={onBackToMenu}
                    className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer active:scale-[0.97] transition-all text-sm'
                  >
                    Back to Menu
                  </button>
                </div>
              </>
            ) : (
              <div className='h-full flex flex-col'>
                {state.lastAnswer?.isCorrect ? (
                  <div className='flex-1 flex flex-col justify-center pt-0.5'>
                    <p className='text-emerald-700 font-bold text-sm sm:text-base'>Correct!</p>
                    <p className='text-emerald-600 text-xs sm:text-sm mt-0.5'>
                      <strong>{state.lastAnswer.correct}</strong>
                    </p>
                  </div>
                ) : (
                  <div className='flex-1 flex flex-col justify-center pt-0.5'>
                    <p className='text-red-700 font-bold text-sm sm:text-base'>Wrong!</p>
                    <p className='text-red-600 text-[11px] sm:text-xs mt-0.5 break-words'>
                      Your: <strong>{state.lastAnswer?.selected}</strong> • Correct:{' '}
                      <strong>{state.lastAnswer?.correct}</strong>
                    </p>
                  </div>
                )}

                <button
                  onClick={onNext}
                  className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md cursor-pointer active:scale-[0.97] transition-all text-sm mt-auto'
                >
                  Next District →
                </button>
              </div>
            )}
          </div>

          <div className='hidden lg:block mt-3 bg-white rounded-xl p-4 border border-gray-100 text-sm text-gray-500'>
            <div className='flex justify-between mb-2'>
              <span>Correct</span>
              <span className='font-semibold text-emerald-600'>{state.score}</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span>Wrong</span>
              <span className='font-semibold text-red-500'>{state.totalQuestions - state.score}</span>
            </div>
            <div className='flex justify-between'>
              <span>Remaining</span>
              <span className='font-semibold text-gray-700'>{64 - state.totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
