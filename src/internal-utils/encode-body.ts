import type { AnyBody, HttpRequestType } from 'yaschema-api';

import type { EncodedRequestBody } from '../api-fetch/types/EncodedRequestBody';

type RequestBodyEncoder = (body: AnyBody) => EncodedRequestBody;

const encodersByRequestType: Record<HttpRequestType, RequestBodyEncoder> = {
  'form-data': () => undefined,
  json: JSON.stringify
};

export const encodeBody = ({ requestType = 'json', body }: { requestType: HttpRequestType | undefined; body: AnyBody }) =>
  encodersByRequestType[requestType](body);
