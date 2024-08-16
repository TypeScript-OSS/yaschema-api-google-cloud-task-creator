import type { google } from '@google-cloud/tasks/build/protos/protos';
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

import { getGoogleCloudLocationForRouteType } from '../../config/google-cloud-location.js';
import { getGoogleCloudProjectForRouteType } from '../../config/google-cloud-project.js';
import { getGoogleCloudServiceAccountEmailForRouteType } from '../../config/google-cloud-service-account-email.js';
import { getGoogleCloudTaskQueueForRouteType } from '../../config/google-cloud-task-queue.js';
import { getOnDidCreateTaskHandler } from '../../config/on-did-create-task.js';
import { getOnWillCreateTaskHandler } from '../../config/on-will-create-task.js';
import { getDefaultRequestValidationMode } from '../../config/validation-mode.js';
import { DEFAULT_TASK_LIMIT_MODE, DEFAULT_TASK_LIMIT_MSEC, DEFAULT_TASK_LIMIT_TYPE } from '../../consts/defaults.js';
import { getGoogleCloudTasksClient } from '../../internal-utils/getGoogleCloudTasksClient.js';
import { internalCreateGoogleCloudTask } from '../../internal-utils/internalCreateGoogleCloudTask.js';
import type { CreateTaskRequest } from '../../types/CreateTaskRequest';
import type { LimitMode } from '../../types/LimitMode';
import type { LimitType } from '../../types/LimitType';
import { getScheduleTimeMSec } from '../../utils/getScheduleTimeMSec.js';
import { getTaskName } from '../../utils/getTaskName.js';
import { CreateTaskRequirementsError } from '../types/CreateTaskRequirementsError.js';
import type { CreateTaskResult } from '../types/CreateTaskResult';
import { generateGoogleCloudCreateTaskRequirementsFromApiRequest } from './internal/generateGoogleCloudCreateTaskRequirementsFromApiRequest.js';

const ONE_SEC_MSEC = 1000;
const ONE_MSEC_NSEC = 1000000;

const alreadyScheduledNames = new Set<string>();

const defaultCallOptions: CallOptions = { timeout: 90 * ONE_SEC_MSEC };

/** When limiting is used, the api.name is the primary key used for deduplication */
export interface CreateGoogleCloudTaskOptions {
  /**
   * Override the configured request validation mode.
   *
   * @see `setDefaultRequestValidationMode`
   */
  requestValidationMode?: ValidationMode;
  /** The default timeout is 90000ms (90s) */
  creationOptions?: CallOptions;
  /** @defaultValue `0` */
  delayMSec?: number;
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
    delayMSec = 0,
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

    const scheduleTimeMSec = getScheduleTimeMSec({ delayMSec, limitMode, limitMSec });

    let scheduleTime: google.protobuf.ITimestamp | undefined;
    if (Date.now() > scheduleTimeMSec) {
      scheduleTime = { seconds: Math.floor(scheduleTimeMSec / ONE_SEC_MSEC), nanos: (scheduleTimeMSec % ONE_SEC_MSEC) * ONE_MSEC_NSEC };
    }

    const name = getTaskName(api, { limitType, limitMSec, limitNameExtension, scheduleTimeMSec });
    if (name !== null && alreadyScheduledNames.has(name)) {
      // Already scheduled, nothing more to do
      return { ok: true, createdNewTask: false };
    }

    const request: CreateTaskRequest = {
      parent: getGoogleCloudTasksClient().queuePath(
        getGoogleCloudProjectForRouteType(api.routeType),
        getGoogleCloudLocationForRouteType(api.routeType),
        getGoogleCloudTaskQueueForRouteType(api.routeType)
      ),
      task: {
        name,
        scheduleTime,
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

    if (name !== null) {
      alreadyScheduledNames.add(name);
    }

    try {
      const createTaskPromise = internalCreateGoogleCloudTask(request, { ...defaultCallOptions, ...creationOptions });

      getOnWillCreateTaskHandler()({ api: api as any as GenericHttpApi, req, reqId });

      const [task] = await createTaskPromise;

      getOnDidCreateTaskHandler()({ api: api as any as GenericHttpApi, req, reqId, task });

      return { ok: true, createdNewTask: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : undefined;

      // If the task is already enqueued, treat as success
      if (error?.includes('ALREADY_EXISTS') ?? false) {
        return { ok: true, createdNewTask: false };
      }

      if (name !== null) {
        alreadyScheduledNames.delete(name);
      }

      return { ok: false, error };
    }
  } catch (e) {
    if (e instanceof CreateTaskRequirementsError) {
      return { ok: false, error: e.message };
    } else {
      throw e;
    }
  }
};
