import type { AnyBody, AnyHeaders, AnyParams, AnyQuery, AnyStatus, HttpApi } from 'yaschema-api';

import { getGoogleCloudLocationForRouteType } from '../config/google-cloud-location.js';
import { getGoogleCloudProjectForRouteType } from '../config/google-cloud-project.js';
import { getGoogleCloudTaskQueueForRouteType } from '../config/google-cloud-task-queue.js';
import type { LimitType } from '../types/LimitType';

export const getTaskName = <
  ReqHeadersT extends AnyHeaders,
  ReqParamsT extends AnyParams,
  ReqQueryT extends AnyQuery,
  ReqBodyT extends AnyBody,
  ResStatusT extends AnyStatus,
  ResHeadersT extends AnyHeaders,
  ResBodyT extends AnyBody,
  ErrResStatusT extends AnyStatus,
  ErrResHeadersT extends AnyHeaders,
  ErrResBodyT extends AnyBody
>(
  api: HttpApi<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT, ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT>,
  {
    limitType,
    limitMSec,
    limitNameExtension,
    scheduleTimeMSec
  }: {
    limitType: LimitType;
    limitMSec: number;
    limitNameExtension: string | undefined;
    /** As computed using `getScheduledTimeMSec` */
    scheduleTimeMSec: number;
  }
) =>
  limitType !== 'none' && limitMSec > 0
    ? `projects/${getGoogleCloudProjectForRouteType(api.routeType)}/locations/${getGoogleCloudLocationForRouteType(
        api.routeType
      )}/queues/${getGoogleCloudTaskQueueForRouteType(api.routeType)}/tasks/${normalizeTaskId(
        `${api.name}-${limitNameExtension}`
      )}-${scheduleTimeMSec}`
    : null;

// Helpers

const normalizeTaskId = (name: string) => name.replace(/[^A-Za-z0-9_]+/g, '-');
