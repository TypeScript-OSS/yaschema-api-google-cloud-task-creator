import type { AnyBody, HttpRequestType } from 'yaschema-api';

type RequestBodyEncoder = (body: AnyBody) => Buffer | undefined;

const encodersByRequestType: Record<HttpRequestType, RequestBodyEncoder> = {
  binary: () => undefined, // Not supported
  'form-data': () => undefined, // Not supported
  json: (body) => Buffer.from(JSON.stringify(body), 'utf-8')
};

export const encodeBody = ({ requestType = 'json', body }: { requestType: HttpRequestType | undefined; body: AnyBody }) =>
  encodersByRequestType[requestType](body);
