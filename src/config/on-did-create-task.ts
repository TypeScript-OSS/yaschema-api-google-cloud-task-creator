import type { GenericApiRequest, GenericHttpApi } from 'yaschema-api';

import type { Task } from '../types/Task';

interface OnDidCreateTaskHandlerArgs {
  api: GenericHttpApi;
  req: GenericApiRequest;
  reqId: string;
  task: Task;
}

let globalOnDidCreateTaskHandler: (args: OnDidCreateTaskHandlerArgs) => void = () => {};

/** Gets the configured function that will be called just after a task is created */
export const getOnDidCreateTaskHandler = () => globalOnDidCreateTaskHandler;

/** Sets the configured function that will be called just after a task is created */
export const setOnDidReceiveResponseHandler = (handler: (args: OnDidCreateTaskHandlerArgs) => void) => {
  globalOnDidCreateTaskHandler = handler;
};

/** Triggers the configured function that will be called just after a task is created */
export const triggerOnDidReceiveResponseHandler = (args: OnDidCreateTaskHandlerArgs) => {
  globalOnDidCreateTaskHandler(args);
};
