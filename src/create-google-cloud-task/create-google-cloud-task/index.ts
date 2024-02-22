import type { CallOptions } from 'google-gax';
import { v4 as uuid } from 'uuid';
import type { ValidationMode } from 'yaschema';
import {
  type AnyBody,
  type AnyHeaders,
  type AnyParams,
  type AnyQuery,
  type AnyStatus,
  type ApiRequest,
  type GenericHttpApi,
  type HttpApi
} from 'yaschema-api';

import { getGoogleCloudLocationForRouteType } from '../../config/google-cloud-location';
import { getGoogleCloudProjectForRouteType } from '../../config/google-cloud-project';
import { getGoogleCloudServiceAccountEmailForRouteType } from '../../config/google-cloud-service-account-email';
import { getGoogleCloudTaskQueueForRouteType } from '../../config/google-cloud-task-queue';
import { getOnDidCreateTaskHandler } from '../../config/on-did-create-task';
import { getOnWillCreateTaskHandler } from '../../config/on-will-create-task';
import { getDefaultRequestValidationMode } from '../../config/validation-mode';
import { getGoogleCloudTasksClient } from '../../internal-utils/getGoogleCloudTasksClient';
import { internalCreateGoogleCloudTask } from '../../internal-utils/internalCreateGoogleCloudTask';
import type { CreateTaskRequest } from '../../types/CreateTaskRequest';
import type { LimitMode } from '../../types/LimitMode';
import type { LimitType } from '../../types/LimitType';
import { CreateTaskRequirementsError } from '../types/CreateTaskRequirementsError';
import type { CreateTaskResult } from '../types/CreateTaskResult';
import { generateGoogleCloudCreateTaskRequirementsFromApiRequest } from './internal/generateGoogleCloudCreateTaskRequirementsFromApiRequest';

const DEFAULT_TASK_LIMIT_MODE = 'trailing';
const DEFAULT_TASK_LIMIT_MSEC = 250;
const DEFAULT_TASK_LIMIT_TYPE = 'throttle';

const ONE_SEC_MSEC = 1000;
const ONE_MSEC_NSEC = 1000000;

/** When limiting is used, the api.name is the primary key used for deduplication */
export interface CreateGoogleCloudTaskOptions {
  /**
   * Override the configured request validation mode.
   *
   * @see `setDefaultRequestValidationMode`
   */
  requestValidationMode?: ValidationMode;
  creationOptions?: CallOptions;
  /** @defaultValue `'trailing'` */
  limitMode?: LimitMode;
  /** @defaultValue `250` */
  limitMSec?: number;
  /** @defaultValue `'throttle'` */
  limitType?: LimitType;
  /** If provided, extends the key used for deduplication (ex. if it's dependant on the specific request parameters) */
  limitNameExtension?: string;
}

/** Uses `new CloudTasksClient().createTask` to access the specified API */
export const createGoogleCloudTask = async <
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
  req: ApiRequest<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT>,
  {
    requestValidationMode = getDefaultRequestValidationMode(),
    creationOptions,
    limitMode = DEFAULT_TASK_LIMIT_MODE,
    limitMSec = DEFAULT_TASK_LIMIT_MSEC,
    limitType = DEFAULT_TASK_LIMIT_TYPE,
    limitNameExtension = ''
  }: CreateGoogleCloudTaskOptions = {}
): Promise<CreateTaskResult> => {
  if (api.method === 'LINK' || api.method === 'UNLINK') {
    throw new Error("LINK and UNLINK aren't supported by yaschema-api-google-cloud-task-creator");
  }

  const reqId = uuid();

  try {
    const { url, headers, body } = await generateGoogleCloudCreateTaskRequirementsFromApiRequest(api, req, {
      validationMode: requestValidationMode
    });

    const scheduleTimeMSec = getScheduleTimeMSec({ limitMode, limitMSec });

    const request: CreateTaskRequest = {
      parent: getGoogleCloudTasksClient().queuePath(
        getGoogleCloudProjectForRouteType(api.routeType),
        getGoogleCloudLocationForRouteType(api.routeType),
        getGoogleCloudTaskQueueForRouteType(api.routeType)
      ),
      task: {
        name:
          limitType !== 'none' && limitMSec > 0
            ? `projects/${getGoogleCloudProjectForRouteType(api.routeType)}/locations/${getGoogleCloudLocationForRouteType(
                api.routeType
              )}/queues/${getGoogleCloudTaskQueueForRouteType(api.routeType)}/tasks/${normalizeTaskId(
                `${api.name}-${limitNameExtension}`
              )}-${scheduleTimeMSec}`
            : null,
        scheduleTime:
          limitType !== 'none' && limitMSec > 0 && limitMode === 'trailing'
            ? { seconds: scheduleTimeMSec / ONE_SEC_MSEC, nanos: (scheduleTimeMSec % ONE_SEC_MSEC) * ONE_MSEC_NSEC }
            : undefined,
        httpRequest: {
          httpMethod: api.method,
          headers,
          url: url.toString(),
          oidcToken: {
            serviceAccountEmail: getGoogleCloudServiceAccountEmailForRouteType(api.routeType)
          },
          body
        }
      }
    };

    try {
      const createTaskPromise = internalCreateGoogleCloudTask(request, creationOptions);

      getOnWillCreateTaskHandler()({ api: api as any as GenericHttpApi, req, reqId });

      const [task] = await createTaskPromise;

      getOnDidCreateTaskHandler()({ api: api as any as GenericHttpApi, req, reqId, task });

      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : undefined };
    }
  } catch (e) {
    if (e instanceof CreateTaskRequirementsError) {
      return { ok: false, error: e.message };
    } else {
      throw e;
    }
  }
};

// Helpers

const getScheduleTimeMSec = ({ limitMode, limitMSec }: { limitMode: LimitMode; limitMSec: number }) => {
  switch (limitMode) {
    case 'leading':
      return Math.floor(Date.now() / limitMSec) * limitMSec;
    case 'trailing':
      return Math.ceil(Date.now() / limitMSec) * limitMSec;
  }
};

const normalizeTaskId = (name: string) => name.replace(/[^A-Za-z0-9_]+/g, '-');
