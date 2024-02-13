import type { getGoogleCloudTasksClient } from '../internal-utils/getGoogleCloudTasksClient';

export type CreateTaskRequest = Parameters<ReturnType<typeof getGoogleCloudTasksClient>['createTask']>[0];
