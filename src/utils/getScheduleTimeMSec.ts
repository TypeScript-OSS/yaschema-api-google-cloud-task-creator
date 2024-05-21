import type { LimitMode } from '../types/LimitMode';

export const getScheduleTimeMSec = ({
  delayMSec,
  limitMode,
  limitMSec
}: {
  delayMSec: number;
  limitMode: LimitMode;
  limitMSec: number;
}) => {
  const delayedTimeMSec = Date.now() + delayMSec;

  if (limitMSec > 0) {
    switch (limitMode) {
      case 'leading':
        return Math.floor(delayedTimeMSec / limitMSec) * limitMSec;
      case 'trailing':
        return Math.ceil(delayedTimeMSec / limitMSec) * limitMSec;
    }
  } else {
    return delayedTimeMSec;
  }
};
