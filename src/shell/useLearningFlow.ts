import { useState, useEffect, useRef, useCallback } from 'react';
import { api, StudentProgress } from '../api/client';

export type FlowStep = 'OBJECTIVE' | 'PREDICT' | 'INTERACT' | 'OBSERVE' | 'EXPLAIN' | 'CHECK';

export interface UseLearningFlowOptions {
  moduleId: string;
  requiredInteractions: string[];
  onCompletion?: (score: number) => void;
}

export function useLearningFlow({
  moduleId,
  requiredInteractions,
  onCompletion,
}: UseLearningFlowOptions) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('OBJECTIVE');
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set());
  const [prediction, setPrediction] = useState<string>('');
  const [isPredictionSaved, setIsPredictionSaved] = useState<boolean>(false);
  const [observationData, setObservationData] = useState<any>(null);
  const [isObservationSaved, setIsObservationSaved] = useState<boolean>(false);
  const [explanationText, setExplanationText] = useState<string>('');
  const [isExplanationSaved, setIsExplanationSaved] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; max: number; attempts: number } | null>(null);
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [secondsActive, setSecondsActive] = useState<number>(0);

  const lastInteractionTimeRef = useRef<number>(Date.now());
  const activeTimerRef = useRef<number | null>(null);

  // Mark user activity for secondsActive metric (PRD 5.4: visible tab & activity in previous 60s)
  const registerActivity = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
  }, []);

  // Initialize and load saved state from API/Storage
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      api.logEvent(moduleId, 'module_opened');
      const prog = await api.getModuleProgress(moduleId);
      const obs = await api.getObservation(moduleId);

      if (!isMounted) return;

      setStatus(prog.status);
      setSecondsActive(prog.secondsActive || 0);

      if (prog.interactionsCompleted) {
        setCompletedInteractions(new Set(prog.interactionsCompleted));
      }
      if (prog.prediction?.answer) {
        setPrediction(prog.prediction.answer);
        setIsPredictionSaved(true);
      }
      if (obs?.data) {
        setObservationData(obs.data);
        setIsObservationSaved(true);
      }
      if (prog.explanation?.text) {
        setExplanationText(prog.explanation.text);
        setIsExplanationSaved(true);
      }
      if (prog.quiz) {
        setQuizScore(prog.quiz);
      }

      // If user had progress, start at INTERACT or the appropriate step
      if (prog.status === 'completed') {
        setCurrentStep('INTERACT');
      } else if (prog.prediction?.answer) {
        setCurrentStep('INTERACT');
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [moduleId]);

  // Active time tracking interval
  useEffect(() => {
    const onUserEvent = () => registerActivity();
    window.addEventListener('mousemove', onUserEvent);
    window.addEventListener('keydown', onUserEvent);
    window.addEventListener('click', onUserEvent);
    window.addEventListener('touchstart', onUserEvent);

    activeTimerRef.current = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInteractionTimeRef.current < 60000) {
        setSecondsActive((prev) => {
          const next = prev + 1;
          if (next % 15 === 0) {
            api.saveProgress(moduleId, { secondsActive: next });
          }
          return next;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', onUserEvent);
      window.removeEventListener('keydown', onUserEvent);
      window.removeEventListener('click', onUserEvent);
      window.removeEventListener('touchstart', onUserEvent);
      if (activeTimerRef.current) clearInterval(activeTimerRef.current);
    };
  }, [moduleId, registerActivity]);

  // Record an interaction
  const recordInteraction = useCallback(
    (key: string, payload?: any) => {
      registerActivity();
      setCompletedInteractions((prev) => {
        const next = new Set(prev);
        if (!next.has(key)) {
          next.add(key);
          api.logEvent(moduleId, 'interaction', { key, payload });
          api.saveProgress(moduleId, {
            interactionsCompleted: Array.from(next),
            status: status === 'completed' ? 'completed' : 'in_progress',
          });
        }
        return next;
      });
    },
    [moduleId, registerActivity, status]
  );

  const startModule = () => {
    registerActivity();
    setCurrentStep('PREDICT');
    if (status === 'not_started') {
      setStatus('in_progress');
      api.saveProgress(moduleId, { status: 'in_progress' });
    }
  };

  const savePrediction = (answer: string, skipped = false) => {
    registerActivity();
    setPrediction(answer);
    setIsPredictionSaved(true);
    if (skipped) {
      api.logEvent(moduleId, 'predict_skipped', { answer });
    } else {
      api.logEvent(moduleId, 'predict_submitted', { answer });
    }
    api.saveProgress(moduleId, {
      prediction: { answer, savedAt: new Date().toISOString() },
      status: status === 'completed' ? 'completed' : 'in_progress',
    });
    setCurrentStep('INTERACT');
  };

  const saveObservation = (kind: 'table' | 'text', data: any) => {
    registerActivity();
    setObservationData(data);
    setIsObservationSaved(true);
    api.saveObservation(moduleId, kind, data);
    api.logEvent(moduleId, 'observation_saved', { kind, fields: Object.keys(data || {}) });
  };

  const saveExplanation = (text: string) => {
    registerActivity();
    setExplanationText(text);
    setIsExplanationSaved(true);
    api.logEvent(moduleId, 'explanation_saved', { text });
    api.saveProgress(moduleId, {
      explanation: { text, savedAt: new Date().toISOString() },
    });
  };

  const checkCompletion = useCallback(
    (score: number, max: number, attempts: number) => {
      registerActivity();
      const quizResult = { score, max, attempts };
      setQuizScore(quizResult);
      api.logEvent(moduleId, 'check_answered', quizResult);

      const allInteractionsDone = requiredInteractions.every((req) => completedInteractions.has(req));
      const hasObservation = isObservationSaved || observationData !== null;

      // Completion rule (PRD 5.2): CHECK submitted + required interactions done + observation saved
      const isComplete = allInteractionsDone && hasObservation;
      const nextStatus = isComplete ? 'completed' : 'in_progress';

      setStatus(nextStatus);
      api.saveProgress(moduleId, {
        status: nextStatus,
        quiz: quizResult,
      });

      if (isComplete) {
        api.logEvent(moduleId, 'module_completed', {
          score,
          secondsActive,
        });
        if (onCompletion) onCompletion(score);
      }
    },
    [
      completedInteractions,
      isObservationSaved,
      moduleId,
      observationData,
      onCompletion,
      recordInteraction,
      registerActivity,
      requiredInteractions,
      secondsActive,
    ]
  );

  const resetModuleState = () => {
    registerActivity();
    setCompletedInteractions(new Set());
    setIsObservationSaved(false);
    setObservationData(null);
    setIsExplanationSaved(false);
    setExplanationText('');
    setQuizScore(null);
    setStatus('in_progress');
    api.saveProgress(moduleId, {
      status: 'in_progress',
      interactionsCompleted: [],
      explanation: undefined,
      quiz: undefined,
    });
  };

  const isAllRequiredInteractionsDone = requiredInteractions.length === 0 ||
    requiredInteractions.every((req) => completedInteractions.has(req));

  return {
    currentStep,
    setCurrentStep,
    completedInteractions,
    recordInteraction,
    isAllRequiredInteractionsDone,
    prediction,
    isPredictionSaved,
    savePrediction,
    observationData,
    isObservationSaved,
    saveObservation,
    explanationText,
    isExplanationSaved,
    saveExplanation,
    quizScore,
    checkCompletion,
    status,
    secondsActive,
    startModule,
    resetModuleState,
    registerActivity,
  };
}
