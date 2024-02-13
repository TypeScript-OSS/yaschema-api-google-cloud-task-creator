import { CloudTasksClient } from '@google-cloud/tasks';
import _ from 'lodash';

export const getGoogleCloudTasksClient = _.once(() => new CloudTasksClient());
