import type { AnyHeaders, HttpRequestType } from 'yaschema-api';

const defaultContentTypeByRequestType: Record<HttpRequestType, string | undefined> = {
  'form-data': undefined, // Not supported
  json: 'application/json'
};

/** Converts headers from the format expected by yaschema-api to the format expected by `fetch` */
export const convertHeadersForGoogleCloudCreateTaskRequest = ({
  requestType = 'json',
  headers
}: {
  requestType: HttpRequestType | undefined;
  headers: AnyHeaders;
}) => {
  if (requestType === 'form-data') {
    throw new Error("form-data isn't supported with yaschema-api-google-cloud-task-creator");
  }

  const output = Object.entries(headers ?? {}).reduce((out: Record<string, string>, [key, value]) => {
    if (value === null || value === undefined) {
      return out; // Skipping
    }

    out[key.toLowerCase()] = String(value);
    return out;
  }, {});

  if (output['content-type'] === undefined) {
    const defaultContentType = defaultContentTypeByRequestType[requestType];
    if (defaultContentType !== undefined) {
      output['content-type'] = defaultContentType;
    }
  }

  return output;
};
