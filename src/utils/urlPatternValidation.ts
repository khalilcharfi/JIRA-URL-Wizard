import { ValidationResult } from '../types/validation';

export const validateUrlPattern = (pattern: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for invalid characters
  if (/[^a-zA-Z0-9\-\._~:\/?#\[\]@!\$&'\(\)\*\+,;=]/.test(pattern)) {
    errors.push('URL pattern contains invalid characters');
  }

  // Check for base URL component
  if (!pattern.includes('{baseUrl}')) {
    errors.push('URL pattern must contain a base URL component');
  }

  // Check for issue prefix component
  if (!pattern.includes('{issuePrefix}')) {
    errors.push('URL pattern must contain an issue prefix component');
  }

  // Check for ticket number component
  if (!pattern.includes('{ticketNumber}')) {
    errors.push('URL pattern must contain a ticket number component');
  }

  // Check for adjacent separators
  if (/([^a-zA-Z0-9])\1/.test(pattern)) {
    errors.push('URL pattern cannot have adjacent separators');
  }

  // Check for leading symbols
  if (/^[^a-zA-Z0-9]/.test(pattern)) {
    errors.push('URL cannot start with symbols or dots');
  }

  // Check for valid domain format
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(pattern.split('/')[2])) {
    errors.push('Invalid domain format in URL pattern');
  }

  // Check for invalid domain labels (starting or ending with a dash)
  const domainLabels = pattern.split('/')[2]?.split('.') || [];
  for (const label of domainLabels) {
    if (label.startsWith('-')) {
      errors.push(`Invalid domain label "${label}": Labels cannot start with a dash`);
      break;
    }
    if (label.endsWith('-')) {
      errors.push(`Invalid domain label "${label}": Labels cannot end with a dash`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}; 