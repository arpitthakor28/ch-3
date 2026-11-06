import React from 'react';
import { FlowStep } from '../shell/useLearningFlow';

export interface CheckQuestion {
  qid: string;
  prompt: string;
  options: string[];
  answer: string;
  why: string;
}

export interface ModuleMeta {
  id: string; // "M01" to "M11"
  title: string;
  subtitle: string;
  category: 'Plant Tissues' | 'Animal Tissues' | 'Movement & Skeleton';
  themeId: string;
  objective: string;
  predictPrompt: string;
  predictOptions?: string[];
  notes: { title: string; text: string }[];
  checks: CheckQuestion[];
  requiredInteractions: string[];
}

export interface ModuleComponentProps {
  mode: 'textbook' | 'lab';
  seed: number;
  flowStep: FlowStep;
  recordInteraction: (key: string, payload?: any) => void;
  completedInteractions: Set<string>;
  onObservationUpdate?: (data: any) => void;
  resetSignal?: number;
}

export interface ModuleSpec {
  meta: ModuleMeta;
  Component: React.FC<ModuleComponentProps>;
}
