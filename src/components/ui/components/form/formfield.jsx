import React from 'react';
import { AlertCircle } from 'lucide-react';

export function FormField({
  id,
  label,
  required = false,
  helperText,
  error,
  children,
  className = ''
}) {
  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <span id={id ? `${id}-error` : undefined} className="form-error" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </span>
      ) : helperText ? (
        <span id={id ? `${id}-helper` : undefined} className="form-helper">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export function ValidationError({ message }) {
  if (!message) return null;
  return (
    <span className="form-error" role="alert">
      <AlertCircle size={14} aria-hidden="true" />
      {message}
    </span>
  );
}

export default FormField;
