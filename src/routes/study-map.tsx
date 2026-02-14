// ** Third Party Imports
import { Link, createFileRoute } from '@tanstack/react-router';

// ** Local Imports
import { StudyPageView } from 'src/views/StudyPageView';

export const Route = createFileRoute('/study-map')({
  component: StudyMapPage
});

function StudyMapPage() {
  return (
    <div className='flex-1 flex flex-col min-h-0'>
      <header className='w-full bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-40 mb-3 sm:mb-4 -mx-4 sm:-mx-6 px-4 sm:px-6'>
        <div className='relative max-w-6xl mx-auto py-2.5 flex items-center justify-between'>
          <div className='flex items-center gap-2 z-10'>
            <Link
              to='/'
              className='bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-emerald-700 font-semibold text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm'
            >
              ← Back
            </Link>
          </div>

          <Link
            to='/'
            className='absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-bold text-emerald-800 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap'
          >
            <span className='hidden sm:inline'>BD District Quiz</span>
            <span className='sm:hidden'>BD Quiz</span>
          </Link>

          <span className='bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium'>📖 Study Mode</span>
        </div>
      </header>

      <StudyPageView />
    </div>
  );
}
