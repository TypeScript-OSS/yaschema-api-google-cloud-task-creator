const globalGoogleCloudServiceAccountEmailsByRouteType: Record<string, string> = {};
let globalDefaultGoogleCloudServiceAccountEmail = '';

/** Removes the Google Cloud service account email configuration for the specified route type, which will cause the default Google Cloud
 * service account email to be used unless a subsequent reconfiguration is made for the specified route type */
export const clearGoogleCloudServiceAccountEmailForRouteType = (routeType: string) => {
  delete globalGoogleCloudServiceAccountEmailsByRouteType[routeType];
};

/** Gets the default Google Cloud service account email that will be used in cases where no Google Cloud service account email has been
 * specifically configured for a given route type */
export const getDefaultGoogleCloudServiceAccountEmail = () => globalDefaultGoogleCloudServiceAccountEmail;

/**
 * Gets the Google Cloud service account email for the specified route type.
 *
 * If a Google Cloud service account email wasn't configured for the specified route type, the default Google Cloud service account email
 * will be returned.
 */
export const getGoogleCloudServiceAccountEmailForRouteType = (routeType: string) =>
  globalGoogleCloudServiceAccountEmailsByRouteType[routeType] ?? globalDefaultGoogleCloudServiceAccountEmail;

/** Sets the default Google Cloud service account email that will be used in cases where no Google Cloud service account email has been
 * specifically configured for a given route type */
export const setDefaultGoogleCloudServiceAccountEmail = (serviceAccountEmail: string) => {
  globalDefaultGoogleCloudServiceAccountEmail = serviceAccountEmail;
};

/** Configures the Google Cloud service account email for the specified route type. */
export const setGoogleCloudServiceAccountEmailForRouteType = (routeType: string, serviceAccountEmail: string) => {
  globalGoogleCloudServiceAccountEmailsByRouteType[routeType] = serviceAccountEmail;
};
