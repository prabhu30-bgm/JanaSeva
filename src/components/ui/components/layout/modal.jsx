import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '540px'
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div
        className="modal-container"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dialog-title"
      >
        <div className="modal-header">
          <h2 id="modal-dialog-title" className="modal-title">
            {title}
          </h2>
          <Button
            variant="tertiary"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '4px', minHeight: '32px' }}
          >
            <X size={20} aria-hidden="true" />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Table({
  columns = [],
  data = [],
  children,
  className = '',
  keyExtractor = (item, index) => item.id || index
}) {
  return (
    <div className={`table-container ${className}`.trim()}>
      <table className="table">
        {columns.length > 0 && (
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {children ||
            data.map((row, rIdx) => (
              <tr key={keyExtractor(row, rIdx)}>
                {columns.map((col, cIdx) => (
                  <td key={col.key || cIdx}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = ''
}) {
  return (
    <nav className={`pagination ${className}`.trim()} aria-label="Pagination Navigation">
      <span>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>
      <div className="pagination-controls">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          aria-label="Previous Page"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          aria-label="Next Page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
