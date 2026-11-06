import { ModuleSpec } from './types';
import { M01Spec } from './m01-onion-root';
import { M02Spec } from './m02-growth-zones';
import { M03Spec } from './m03-microscope';
import { M04Spec } from './m04-transport';
import { M05Spec } from './m05-animal-tissues';
import { M06Spec } from './m06-connective';
import { M07Spec } from './m07-muscles';
import { M08Spec } from './m08-neuron';
import { M09Spec } from './m09-elbow';
import { M10Spec } from './m10-joints';
import { M11Spec } from './m11-skeleton';

export const ALL_MODULES: ModuleSpec[] = [
  M01Spec,
  M02Spec,
  M03Spec,
  M04Spec,
  M05Spec,
  M06Spec,
  M07Spec,
  M08Spec,
  M09Spec,
  M10Spec,
  M11Spec,
];

export const MODULE_CATEGORIES: {
  category: 'Plant Tissues' | 'Animal Tissues' | 'Movement & Skeleton';
  modules: ModuleSpec[];
}[] = [
  {
    category: 'Plant Tissues',
    modules: [M01Spec, M02Spec, M03Spec, M04Spec],
  },
  {
    category: 'Animal Tissues',
    modules: [M05Spec, M06Spec, M07Spec, M08Spec],
  },
  {
    category: 'Movement & Skeleton',
    modules: [M09Spec, M10Spec, M11Spec],
  },
];

export function getModuleById(id: string): ModuleSpec | undefined {
  return ALL_MODULES.find((m) => m.meta.id.toLowerCase() === id.toLowerCase());
}

