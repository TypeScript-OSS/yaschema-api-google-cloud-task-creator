import type { AnyBody, HttpRequestType } from 'yaschema-api';

type RequestBodyEncoder = (body: AnyBody) => Buffer | undefined;

const encodersByRequestType: Record<HttpRequestType, RequestBodyEncoder> = {
  'form-data': () => undefined,
  json: (body) => Buffer.from(JSON.stringify(body), 'utf-8')
};

export const encodeBody = ({ requestType = 'json', body }: { requestType: HttpRequestType | undefined; body: AnyBody }) =>
  encodersByRequestType[requestType](body);
