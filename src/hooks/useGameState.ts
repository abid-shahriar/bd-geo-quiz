// ** React Imports
import { useState, useCallback, useMemo } from 'react';

// ** Local Imports
import { districts } from 'src/data/districts';

export interface GameState {
  currentDistrict: string;
  score: number;
  totalQuestions: number;
  answeredDistricts: string[];
  lastAnswer: {
    selected: string;
    correct: string;
    isCorrect: boolean;
  } | null;
  remainingDistricts: string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const allDistrictNames = districts.map((d) => d.name);

export function useGameState() {
  const [state, setState] = useState<GameState>({
    currentDistrict: '',
    score: 0,
    totalQuestions: 0,
    answeredDistricts: [],
    lastAnswer: null,
    remainingDistricts: []
  });

  const startQuiz = useCallback(() => {
    const shuffled = shuffleArray(allDistrictNames);
    setState({
      currentDistrict: shuffled[0],
      score: 0,
      totalQuestions: 0,
      answeredDistricts: [],
      lastAnswer: null,
      remainingDistricts: shuffled.slice(1)
    });
  }, []);

  const handleDistrictClick = useCallback((districtName: string) => {
    setState((prev) => {
      if (!prev.currentDistrict || prev.lastAnswer) return prev;

      const isCorrect = districtName === prev.currentDistrict;
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        totalQuestions: prev.totalQuestions + 1,
        answeredDistricts: [...prev.answeredDistricts, prev.currentDistrict],
        lastAnswer: {
          selected: districtName,
          correct: prev.currentDistrict,
          isCorrect
        }
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.remainingDistricts.length === 0) {
        return { ...prev, currentDistrict: '', lastAnswer: null };
      }
      return {
        ...prev,
        currentDistrict: prev.remainingDistricts[0],
        remainingDistricts: prev.remainingDistricts.slice(1),
        lastAnswer: null
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDistrict: '',
      lastAnswer: null
    }));
  }, []);

  const isGameOver = useMemo(() => {
    return state.lastAnswer !== null && state.remainingDistricts.length === 0;
  }, [state.lastAnswer, state.remainingDistricts.length]);

  const progress = useMemo(() => {
    return {
      current: state.totalQuestions,
      total: 64,
      percentage: Math.round((state.totalQuestions / 64) * 100)
    };
  }, [state.totalQuestions]);

  return {
    state,
    startQuiz,
    resetQuiz,
    handleDistrictClick,
    nextQuestion,
    isGameOver,
    progress
  };
}
