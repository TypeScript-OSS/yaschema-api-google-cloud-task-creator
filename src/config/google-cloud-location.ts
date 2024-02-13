const globalGoogleCloudLocationsByRouteType: Record<string, string> = {};
let globalDefaultGoogleCloudLocation = '';

/** Removes the Google Cloud location configuration for the specified route type, which will cause the default Google Cloud location to be
 * used unless a subsequent reconfiguration is made for the specified route type */
export const clearGoogleCloudLocationForRouteType = (routeType: string) => {
  delete globalGoogleCloudLocationsByRouteType[routeType];
};

/** Gets the default Google Cloud location that will be used in cases where no Google Cloud location has been specifically configured for a
 * given route type */
export const getDefaultGoogleCloudLocation = () => globalDefaultGoogleCloudLocation;

/**
 * Gets the Google Cloud location for the specified route type.
 *
 * If a Google Cloud location wasn't configured for the specified route type, the default Google Cloud location will be returned.
 */
export const getGoogleCloudLocationForRouteType = (routeType: string) =>
  globalGoogleCloudLocationsByRouteType[routeType] ?? globalDefaultGoogleCloudLocation;

/** Sets the default Google Cloud location that will be used in cases where no Google Cloud location has been specifically configured for a
 * given route type */
export const setDefaultGoogleCloudLocation = (location: string) => {
  globalDefaultGoogleCloudLocation = location;
};

/** Configures the Google Cloud location for the specified route type. */
export const setGoogleCloudLocationForRouteType = (routeType: string, location: string) => {
  globalGoogleCloudLocationsByRouteType[routeType] = location;
};
