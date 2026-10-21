import React from 'react';

export function Input({
  id,
  type = 'text',
  error,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <input
      id={id}
      type={type}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
      {...props}
    />
  );
}

export function Textarea({
  id,
  rows = 3,
  error,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`textarea ${error ? 'textarea-error' : ''} ${className}`.trim()}
      {...props}
    />
  );
}

export function Select({
  id,
  options = [],
  placeholder = 'Select an option...',
  error,
  className = '',
  disabled = false,
  children,
  ...props
}) {
  return (
    <select
      id={id}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`select ${error ? 'select-error' : ''} ${className}`.trim()}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children ||
        options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
    </select>
  );
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label htmlFor={id} className={`checkbox-group ${disabled ? 'btn-disabled' : ''} ${className}`.trim()}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
        {...props}
      />
      {label && <span className="form-label" style={{ margin: 0 }}>{label}</span>}
    </label>
  );
}

export function Radio({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label htmlFor={id} className={`radio-group ${disabled ? 'btn-disabled' : ''} ${className}`.trim()}>
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="radio-input"
        {...props}
      />
      {label && <span className="form-label" style={{ margin: 0 }}>{label}</span>}
    </label>
  );
}
