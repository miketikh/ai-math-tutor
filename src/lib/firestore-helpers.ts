/**
 * Firestore Helper Utilities
 *
 * Utilities to ensure data is properly formatted for Firestore operations.
 * Firestore does not allow `undefined` values - they must be omitted or converted to null.
 */

/**
 * Recursively removes all undefined values from an object.
 * This prevents Firestore errors when writing documents.
 *
 * @param obj - The object to clean
 * @returns A new object with all undefined values removed
 *
 * @example
 * const data = { name: "John", age: undefined, address: { city: "NYC", state: undefined } };
 * const cleaned = removeUndefined(data);
 * // Result: { name: "John", address: { city: "NYC" } }
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  if (obj === null || obj === undefined) {
    return {} as Partial<T>;
  }

  const cleaned: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // Skip undefined values entirely
      if (value === undefined) {
        continue;
      }

      // Pass through Firestore FieldValue sentinels (like serverTimestamp()) unchanged
      if (isFirestoreFieldValue(value)) {
        cleaned[key] = value;
        continue;
      }

      // Recursively clean nested objects
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !isDateObject(value)) {
        const cleanedNested = removeUndefined(value);
        // Only add if the nested object has properties
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      }
      // Handle arrays - filter out undefined elements and recursively clean objects
      else if (Array.isArray(value)) {
        const cleanedArray = value
          .filter((item: any) => item !== undefined)
          .map((item: any) => {
            // Pass through Firestore FieldValues unchanged
            if (isFirestoreFieldValue(item)) {
              return item;
            }
            if (item !== null && typeof item === 'object' && !Array.isArray(item) && !isDateObject(item)) {
              return removeUndefined(item);
            }
            return item;
          });
        cleaned[key] = cleanedArray;
      }
      // For all other values (primitives, Dates, etc.), include them as-is
      else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}

/**
 * Type guard to check if a value is a Date object
 */
function isDateObject(value: any): value is Date {
  return value instanceof Date ||
         (value !== null && typeof value === 'object' && value.constructor === Date);
}

/**
 * Type guard to check if a value is a Firestore FieldValue (like serverTimestamp())
 * These are sentinel values that Firestore replaces on the server side
 */
function isFirestoreFieldValue(value: any): boolean {
  return value !== null &&
         typeof value === 'object' &&
         (value.constructor?.name === 'FieldValue' ||
          value._methodName !== undefined); // FieldValue objects have _methodName property
}

/**
 * Type guard to check if a value is a plain object (not Date, Array, null)
 */
function isPlainObject(value: any): value is Record<string, any> {
  return value !== null &&
         typeof value === 'object' &&
         !Array.isArray(value) &&
         !isDateObject(value);
}
