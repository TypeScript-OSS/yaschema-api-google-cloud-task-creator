const globalGoogleCloudProjectsByRouteType: Record<string, string> = {};
let globalDefaultGoogleCloudProject = '';

/** Removes the Google Cloud project configuration for the specified route type, which will cause the default Google Cloud project to be
 * used unless a subsequent reconfiguration is made for the specified route type */
export const clearGoogleCloudProjectForRouteType = (routeType: string) => {
  delete globalGoogleCloudProjectsByRouteType[routeType];
};

/** Gets the default Google Cloud project that will be used in cases where no Google Cloud project has been specifically configured for a
 * given route type */
export const getDefaultGoogleCloudProject = () => globalDefaultGoogleCloudProject;

/**
 * Gets the Google Cloud project for the specified route type.
 *
 * If a Google Cloud project wasn't configured for the specified route type, the default Google Cloud project will be returned.
 */
export const getGoogleCloudProjectForRouteType = (routeType: string) =>
  globalGoogleCloudProjectsByRouteType[routeType] ?? globalDefaultGoogleCloudProject;

/** Sets the default Google Cloud project that will be used in cases where no Google Cloud project has been specifically configured for a
 * given route type */
export const setDefaultGoogleCloudProject = (project: string) => {
  globalDefaultGoogleCloudProject = project;
};

/** Configures the Google Cloud project for the specified route type. */
export const setGoogleCloudProjectForRouteType = (routeType: string, project: string) => {
  globalGoogleCloudProjectsByRouteType[routeType] = project;
};
