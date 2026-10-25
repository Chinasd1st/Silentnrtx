"use client";

import { type ReactNode, useId } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Small glyph shown in a tinted pill before the title. */
  icon?: ReactNode;
  /** Extra header controls, rendered to the left of the close button. */
  action?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  closeLabel?: string;
  children: ReactNode;
}

/**
 * Shared dialog shell: scrim, glass panel, header, scrollable body, optional
 * footer. Owns the portal, focus trap and Escape handling so callers only
 * describe their content.
 */
export function Modal({
  open,
  onClose,
  title,
  icon,
  action,
  footer,
  size = "sm",
  closeLabel = "Close",
  children,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useFocusTrap(open);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="modal-scrim absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        className={`modal-panel relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-card ${SIZES[size]}`}
      >
        <div
          className="flex shrink-0 items-center gap-3 border-b px-5 py-3.5"
          style={{ borderColor: "var(--md-divider)" }}
        >
          {icon && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--md-primary-012)", color: "var(--md-primary)" }}
            >
              {icon}
            </span>
          )}
          <h2
            id={titleId}
            className="font-heading text-base font-semibold truncate"
            style={{ color: "var(--md-text-primary)" }}
          >
            {title}
          </h2>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {action}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-colors duration-200 hover:bg-white/6"
              style={{ color: "var(--md-text-muted)" }}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        <div className="thin-scrollbar flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t px-5 py-3" style={{ borderColor: "var(--md-divider)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
