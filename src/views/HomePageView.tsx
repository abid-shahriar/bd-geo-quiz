// ** Local Imports
import { DIVISION_COLORS } from 'src/data/districts';

interface HomePageViewProps {
  onStartQuiz: () => void;
  onStartStudy: () => void;
  onDismissLastScore?: () => void;
  lastScore: { score: number; totalQuestions: number } | null;
}

export function HomePageView({ onStartQuiz, onStartStudy, onDismissLastScore, lastScore }: HomePageViewProps) {
  return (
    <div className='flex-1 flex flex-col items-center justify-center gap-6 py-8'>
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-extrabold text-emerald-800 mb-2 tracking-tight'>
          Bangladesh District Quiz
        </h1>
        <p className='text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed'>
          Can you locate all 64 districts on the map?
          <br />
          Test your knowledge or study to learn!
        </p>
      </div>

      {lastScore && lastScore.totalQuestions > 0 && (
        <div className='relative bg-white rounded-xl shadow-md p-2 text-center border border-emerald-100 min-w-[180px]'>
          <button
            type='button'
            aria-label='Clear last score'
            onClick={onDismissLastScore}
            className='absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-5 h-5 rounded-full bg-red-100 border border-red-200 shadow-sm text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors flex items-center justify-center cursor-pointer z-10 text-[10px]'
          >
            ✕
          </button>
          <p className='text-gray-400 text-xs font-medium uppercase tracking-wide mb-1'>Last Score</p>
          <p className='text-3xl font-extrabold text-emerald-700'>
            {lastScore.score}
            <span className='text-lg text-gray-400'>/{lastScore.totalQuestions}</span>
          </p>
          <p className='text-emerald-600 text-sm font-medium mt-1'>
            {Math.round((lastScore.score / lastScore.totalQuestions) * 100)}% correct
          </p>
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-3 w-full max-w-sm px-2'>
        <button
          onClick={onStartQuiz}
          className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-md cursor-pointer active:scale-[0.97] hover:-translate-y-0.5'
        >
          🎯 Start Quiz
        </button>
        <button
          onClick={onStartStudy}
          className='flex-1 bg-white hover:bg-sky-50 text-sky-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-md cursor-pointer active:scale-[0.97] border-2 border-sky-200 hover:-translate-y-0.5'
        >
          📖 Study Map
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-md p-5 w-full max-w-sm border border-gray-100'>
        <h3 className='font-semibold text-gray-600 mb-3 text-md mb-4 pb-2 border-b text-center uppercase tracking-wide'>
          8 Divisions
        </h3>
        <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
          {Object.entries(DIVISION_COLORS).map(([division, color]) => (
            <div key={division} className='flex items-center gap-2.5 text-sm text-gray-600'>
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
