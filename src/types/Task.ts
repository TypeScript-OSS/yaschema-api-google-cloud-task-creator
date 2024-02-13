import type { internalCreateGoogleCloudTask } from '../internal-utils/internalCreateGoogleCloudTask';

export type Task = Awaited<ReturnType<typeof internalCreateGoogleCloudTask>>[0];
