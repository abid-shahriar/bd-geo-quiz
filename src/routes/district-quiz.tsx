// ** React Imports
import { useEffect, useState } from 'react';

// ** Third Party Imports
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';

// ** Hooks Imports
import { useGameState } from 'src/hooks/useGameState';

// ** Local Imports
import { QuizPageView } from 'src/views/QuizPageView';

// ** Utils Imports
import { setLastScore } from 'src/utils/lastScore';

export const Route = createFileRoute('/district-quiz')({
  component: DistrictQuizPage
});

function DistrictQuizPage() {
  const navigate = useNavigate();
  const { state, startQuiz, handleDistrictClick, nextQuestion, isGameOver, progress, resetQuiz } = useGameState();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    if (!state.currentDistrict) {
      startQuiz();
    }
  }, [state.currentDistrict, startQuiz]);

  const handleConfirmEndQuiz = () => {
    setLastScore({
      score: state.score,
      totalQuestions: state.totalQuestions
    });

    setShowEndConfirm(false);
    resetQuiz();
    navigate({ to: '/' });
  };

  const handleBackToMenu = () => {
    setLastScore({
      score: state.score,
      totalQuestions: state.totalQuestions
    });

    resetQuiz();
    navigate({ to: '/' });
  };

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
                onClick={() => setShowEndConfirm(false)}
                className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all'
              >
                Continue
              </button>
              <button
                onClick={handleConfirmEndQuiz}
                className='flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all'
              >
                End Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      <header className='w-full bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-40 mb-3 sm:mb-4 -mx-4 sm:-mx-6 px-4 sm:px-6'>
        <div className='relative max-w-6xl mx-auto py-2.5 flex items-center justify-between'>
          <div className='flex items-center gap-2 z-10'>
            <button
              onClick={() => setShowEndConfirm(true)}
              className='bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-sm flex-shrink-0'
            >
              ✕ End
            </button>
          </div>

          <Link
            to='/'
            onClick={handleBackToMenu}
            className='absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-bold text-emerald-800 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap'
          >
            <span className='hidden sm:inline'>BD District Quiz</span>
            <span className='sm:hidden'>BD Quiz</span>
          </Link>

          <div className='flex items-center gap-2 text-sm z-10'>
            <div className='bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold'>
              ✓ {state.score}/{state.totalQuestions}
            </div>
            <div className='bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full font-medium'>{progress.current}/64</div>
          </div>
        </div>

        <div className='max-w-6xl mx-auto pb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex-1 bg-gray-200 rounded-full h-2 overflow-hidden'>
              <div
                className='bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out'
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className='text-xs text-gray-500 font-medium flex-shrink-0'>{progress.current}/64</span>
          </div>
        </div>
      </header>

      <QuizPageView
        state={state}
        onDistrictClick={handleDistrictClick}
        onNext={nextQuestion}
        onBackToMenu={handleBackToMenu}
        onRequestEnd={() => setShowEndConfirm(true)}
        isGameOver={isGameOver}
      />
    </div>
  );
}
