import type { CallOptions } from 'google-gax';

import type { CreateTaskRequest } from '../types/CreateTaskRequest';
import { getGoogleCloudTasksClient } from './getGoogleCloudTasksClient.js';

export const internalCreateGoogleCloudTask = (request: CreateTaskRequest, options?: CallOptions) =>
  getGoogleCloudTasksClient().createTask(request, options);
