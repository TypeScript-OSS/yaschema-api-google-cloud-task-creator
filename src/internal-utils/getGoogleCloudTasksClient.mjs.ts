import { CloudTasksClient } from '@google-cloud/tasks';
import { once } from 'lodash-es';

export const getGoogleCloudTasksClient = once(() => new CloudTasksClient());
