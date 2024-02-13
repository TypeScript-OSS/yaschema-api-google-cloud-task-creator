import type { ValidationMode } from 'yaschema';

let globalDefaultRequestValidation: ValidationMode = 'hard';

/** Gets the default validation mode for requests */
export const getDefaultRequestValidationMode = () => globalDefaultRequestValidation;

/** Sets the default validation mode for requests */
export const setDefaultRequestValidationMode = (mode: ValidationMode) => {
  globalDefaultRequestValidation = mode;
};
