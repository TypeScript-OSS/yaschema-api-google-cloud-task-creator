import type { LimitMode } from '../types/LimitMode';

export const getScheduleTimeMSec = ({ limitMode, limitMSec }: { limitMode: LimitMode; limitMSec: number }) => {
  switch (limitMode) {
    case 'leading':
      return Math.floor(Date.now() / limitMSec) * limitMSec;
    case 'trailing':
      return Math.ceil(Date.now() / limitMSec) * limitMSec;
  }
};
