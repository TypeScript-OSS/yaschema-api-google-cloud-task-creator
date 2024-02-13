import type { GenericApiRequest, GenericHttpApi } from 'yaschema-api';

interface OnWillCreateTaskHandlerArgs {
  api: GenericHttpApi;
  req: GenericApiRequest;
  reqId: string;
}

let globalOnWillCreateTaskHandler: (args: OnWillCreateTaskHandlerArgs) => void = () => {};

/** Gets the configured function that will be called just before a task is created */
export const getOnWillCreateTaskHandler = () => globalOnWillCreateTaskHandler;

/** Sets the configured function that will be called just before a task is created */
export const setOnWillRequestHandler = (handler: (args: OnWillCreateTaskHandlerArgs) => void) => {
  globalOnWillCreateTaskHandler = handler;
};

/** Triggers the configured function that will be called just before a task is created */
export const triggerOnWillRequestHandler = (args: OnWillCreateTaskHandlerArgs) => {
  globalOnWillCreateTaskHandler(args);
};
