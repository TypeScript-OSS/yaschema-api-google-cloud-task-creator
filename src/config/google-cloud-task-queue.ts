const globalGoogleCloudTaskQueuesByRouteType: Record<string, string> = {};
let globalDefaultGoogleCloudTaskQueue = '';

/** Removes the Google Cloud task queue configuration for the specified route type, which will cause the default Google Cloud task queue to
 * be used unless a subsequent reconfiguration is made for the specified route type */
export const clearGoogleCloudTaskQueueForRouteType = (routeType: string) => {
  delete globalGoogleCloudTaskQueuesByRouteType[routeType];
};

/** Gets the default Google Cloud task queue that will be used in cases where no Google Cloud task queue has been specifically configured
 * for a given route type */
export const getDefaultGoogleCloudTaskQueue = () => globalDefaultGoogleCloudTaskQueue;

/**
 * Gets the Google Cloud task queue for the specified route type.
 *
 * If a Google Cloud task queue wasn't configured for the specified route type, the default Google Cloud task queue will be returned.
 */
export const getGoogleCloudTaskQueueForRouteType = (routeType: string) =>
  globalGoogleCloudTaskQueuesByRouteType[routeType] ?? globalDefaultGoogleCloudTaskQueue;

/** Sets the default Google Cloud task queue that will be used in cases where no Google Cloud task queue has been specifically configured
 * for a given route type */
export const setDefaultGoogleCloudTaskQueue = (taskQueue: string) => {
  globalDefaultGoogleCloudTaskQueue = taskQueue;
};

/** Configures the Google Cloud task queue for the specified route type. */
export const setGoogleCloudTaskQueueForRouteType = (routeType: string, taskQueue: string) => {
  globalGoogleCloudTaskQueuesByRouteType[routeType] = taskQueue;
};
