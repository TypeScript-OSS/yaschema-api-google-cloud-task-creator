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
  const timeMSec = Date.now() + delayMSec;

  switch (limitMode) {
    case 'leading':
      return Math.floor(timeMSec / limitMSec) * limitMSec;
    case 'trailing':
      return Math.ceil(timeMSec / limitMSec) * limitMSec;
  }
};
