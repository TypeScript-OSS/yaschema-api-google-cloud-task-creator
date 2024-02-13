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
import { CreateTaskRequirementsError } from '../types/CreateTaskRequirementsError';
import type { CreateTaskResult } from '../types/CreateTaskResult';
import { generateGoogleCloudCreateTaskRequirementsFromApiRequest } from './internal/generateGoogleCloudCreateTaskRequirementsFromApiRequest';

export interface CreateGoogleCloudTaskOptions {
  /**
   * Override the configured request validation mode.
   *
   * @see `setDefaultRequestValidationMode`
   */
  requestValidationMode?: ValidationMode;
  creationOptions?: CallOptions;
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
  { requestValidationMode = getDefaultRequestValidationMode(), creationOptions }: CreateGoogleCloudTaskOptions = {}
): Promise<CreateTaskResult> => {
  if (api.method === 'LINK' || api.method === 'UNLINK') {
    throw new Error("LINK and UNLINK aren't supported by yaschema-api-google-cloud-task-creator");
  }

  const reqId = uuid();

  try {
    const { url, headers, body } = await generateGoogleCloudCreateTaskRequirementsFromApiRequest(api, req, {
      validationMode: requestValidationMode
    });

    const request: CreateTaskRequest = {
      parent: getGoogleCloudTasksClient().queuePath(
        getGoogleCloudProjectForRouteType(api.routeType),
        getGoogleCloudLocationForRouteType(api.routeType),
        getGoogleCloudTaskQueueForRouteType(api.routeType)
      ),
      task: {
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
