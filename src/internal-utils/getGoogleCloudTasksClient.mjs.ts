import { CloudTasksClient } from '@google-cloud/tasks';
import { once } from 'lodash';

export const getGoogleCloudTasksClient = once(() => new CloudTasksClient());
