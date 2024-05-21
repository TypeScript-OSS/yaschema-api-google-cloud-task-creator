import type { LimitMode } from '../types/LimitMode';
import type { LimitType } from '../types/LimitType';

export const DEFAULT_TASK_LIMIT_MODE: LimitMode = 'trailing';
export const DEFAULT_TASK_LIMIT_MSEC = 250;
export const DEFAULT_TASK_LIMIT_TYPE: LimitType = 'throttle';
