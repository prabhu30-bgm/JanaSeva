import React from 'react';

/**
 * Reusable Accessible Button Component
 * @param {'primary'|'secondary'|'tertiary'|'danger'|'accent'} variant
 * @param {'sm'|'md'|'lg'|'kiosk'} size
 * @param {boolean} isLoading
 * @param {boolean} disabled
 * @param {React.ReactNode} icon
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  className = '',
  type = 'button',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && (
            <span className="btn-icon" aria-hidden="true">
              {React.isValidElement(icon)
                ? icon
                : React.createElement(icon, {
                    size: size === 'sm' ? 14 : size === 'lg' || size === 'kiosk' ? 20 : 16
                  })}
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
