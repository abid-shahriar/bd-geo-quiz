// ** Third Party Imports
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent
});

function RootComponent() {
  return (
    <div className='h-dvh overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex flex-col items-center'>
      <main className='flex-1 flex flex-col max-w-6xl w-full px-4 sm:px-6 py-3 sm:py-4 min-h-0 overflow-hidden'>
        <Outlet />
      </main>
    </div>
  );
}
