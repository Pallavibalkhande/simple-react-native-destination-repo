import { Platform } from 'react-native';

/**
 * Checks if the given value is not null, undefined, empty string, empty array, or empty object.
 * @param value The value to check.
 * @returns True if the value is considered present, false otherwise.
 */
export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
};

/**
 * Validates an email address using a RFC 5322 compliant regular expression.
 * @param email The email string to validate.
 * @returns True if the email is valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
  if (!isRequired(email)) return false;
  const emailRegex =
    // eslint-disable-next-line no-useless-escape
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates a password.
 * Default policy: minimum length, at least one uppercase, one lowercase, one digit, and one special character.
 * @param password The password string to validate.
 * @param options Optional configuration for validation.
 * @returns True if the password meets the criteria, false otherwise.
 */
export const isValidPassword = (
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  },
): boolean => {
  if (!isRequired(password)) return false;

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
  } = options ?? {};

  if (password.length < minLength) return false;

  const patterns: RegExp[] = [];
  if (requireUppercase) patterns.push(/[A-Z]/);
  if (requireLowercase) patterns.push(/[a-z]/);
  if (requireNumber) patterns.push(/[0-9]/);
  if (requireSpecialChar) patterns.push(/[^A-Za-z0-9]/);

  return patterns.every((regex) => regex.test(password));
};

/**
 * Validates a phone number.
 * Supports international format with optional leading '+' and spaces/hyphens.
 * @param phone The phone number string to validate.
 * @returns True if the phone number is valid, false otherwise.
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!isRequired(phone)) return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^\+?[1-9]\d{6,14}$/; // E.164 format (7 to 15 digits)
  return phoneRegex.test(cleaned);
};

/**
 * Validates a URL.
 * Accepts http, https, ftp protocols.
 * @param url The URL string to validate.
 * @returns True if the URL is valid, false otherwise.
 */
export const isValidUrl = (url: string): boolean => {
  if (!isRequired(url)) return false;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(url.trim());
};

/**
 * Validates a username.
 * Allows alphanumeric characters, underscores, and hyphens.
 * Length must be between 3 and 16 characters.
 * @param username The username string to validate.
 * @returns True if the username is valid, false otherwise.
 */
export const isValidUsername = (username: string): boolean => {
  if (!isRequired(username)) return false;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
  return usernameRegex.test(username.trim());
};

/**
 * Platform-specific validator for iOS bundle identifiers.
 * Must follow reverse-DNS notation and contain only alphanumeric characters, hyphens, and periods.
 * @param bundleId The bundle identifier string.
 * @returns True if valid for iOS, false otherwise.
 */
export const isValidIOSBundleId = (bundleId: string): boolean => {
  if (Platform.OS !== 'ios') return true;
  if (!isRequired(bundleId)) return false;
  const bundleIdRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  return bundleIdRegex.test(bundleId.trim());
};

/**
 * Platform-specific validator for Android package names.
 * Must follow Java package naming conventions.
 * @param packageName The Android package name string.
 * @returns True if valid for Android, false otherwise.
 */
export const isValidAndroidPackageName = (packageName: string): boolean => {
  if (Platform.OS !== 'android') return true;
  if (!isRequired(packageName)) return false;
  const packageRegex = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
  return packageRegex.test(packageName.trim());
};