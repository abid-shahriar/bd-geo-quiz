// ** React Imports
import { useState } from 'react';

// ** Third Party Imports
import { createFileRoute, useNavigate } from '@tanstack/react-router';

// ** Local Imports
import { HomePageView } from 'src/views/HomePageView';

// ** Utils Imports
import { clearLastScore, getLastScore } from 'src/utils/lastScore';

export const Route = createFileRoute('/')({
  component: HomePage
});

function HomePage() {
  const navigate = useNavigate();
  const [lastScore, setLastScore] = useState(getLastScore);

  const handleStartQuiz = () => {
    navigate({ to: '/district-quiz' });
  };

  const handleStartStudy = () => {
    navigate({ to: '/study-map' });
  };

  const handleDismissLastScore = () => {
    clearLastScore();
    setLastScore(null);
  };

  return (
    <HomePageView
      onStartQuiz={handleStartQuiz}
      onStartStudy={handleStartStudy}
      onDismissLastScore={handleDismissLastScore}
      lastScore={lastScore}
    />
  );
}
