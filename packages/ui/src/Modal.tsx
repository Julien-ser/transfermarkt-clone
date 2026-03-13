import React from 'react';

export interface ModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  /**
   * Callback when the modal should close
   */
  onClose: () => void;
  /**
   * The title of the modal
   */
  title?: string;
  /**
   * The size of the modal
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /**
   * Whether to show a close button in the header
   * @default true
   */
  closeButton?: boolean;
  /**
   * Whether to close the modal when clicking outside
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to close the modal when pressing the Escape key
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Additional CSS classes for the modal content
   */
  className?: string;
  /**
   * Child elements (the modal content)
   */
  children?: React.ReactNode;
}

const sizeStyles = {
  small: 'max-w-md',
  medium: 'max-w-lg',
  large: 'max-w-2xl',
  fullscreen: 'max-w-full mx-4 h-[90vh]',
};

/**
 * A modal dialog component with overlay, close functionality, and keyboard support.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={closeModal}
 *   title="Modal Title"
 *   size="medium"
 * >
 *   <p>Modal content goes here.</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  closeButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  children,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-75 overflow-y-auto"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeStyles[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl ${className}`}
      >
        {(title || closeButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            {closeButton && (
              <button
                onClick={onClose}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className={`p-4 ${!title && !closeButton ? 'pt-4' : ''}`}>{children}</div>
      </div>
    </div>
  );
};
