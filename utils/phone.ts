export const PHONE_PREFIX = '+998';
export const PHONE_LOCAL_LENGTH = 9;

/**
 * Extracts the 9-digit local number from arbitrary pasted/typed input,
 * stripping a duplicated country code (e.g. pasting "998901234567" or
 * "+998901234567" into a field that already assumes the +998 prefix).
 */
export function normalizePhoneInput(value: string): string {
  let digits = value.replace(/[^0-9]/g, '');
  if (digits.startsWith('998') && digits.length > PHONE_LOCAL_LENGTH) {
    digits = digits.slice(3);
  }
  return digits.slice(0, PHONE_LOCAL_LENGTH);
}

/** Builds the full "+998XXXXXXXXX" phone from a 9-digit local number. */
export function toFullPhone(localDigits: string): string {
  return localDigits ? `${PHONE_PREFIX}${localDigits}` : '';
}

/**
 * Normalizes a full phone-number field (one that displays "+998..." inline)
 * from arbitrary pasted/typed input to a clean "+998XXXXXXXXX" string.
 */
export function normalizeFullPhoneInput(value: string): string {
  return toFullPhone(normalizePhoneInput(value));
}
