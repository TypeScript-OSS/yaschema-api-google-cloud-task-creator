export type CreateTaskResult =
  | { ok: true; createdNewTask: boolean; error?: undefined }
  | { ok: false; error?: undefined }
  | { ok: false; error: string };
