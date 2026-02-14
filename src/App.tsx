import { useState } from 'react';
import { MenuScreen, StudyScreen, QuizScreen } from './features/game/screens';
import { useGameState } from './useGameState';
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
    <div className='h-dvh overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex flex-col items-center'>
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

        {(state.mode === 'quiz' || state.mode === 'result') && (
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
      <main className='flex-1 flex flex-col max-w-6xl w-full px-4 sm:px-6 py-3 sm:py-4 min-h-0 overflow-hidden'>
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

export default App;
