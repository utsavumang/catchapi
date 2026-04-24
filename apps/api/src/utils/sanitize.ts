const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.startsWith('$'))
        .map(([key, val]) => [key, sanitizeValue(val)])
    );
  }

  return value;
};

export const sanitizeObject = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
  return sanitizeValue(obj) as Record<string, unknown>;
};
