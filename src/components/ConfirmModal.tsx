import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      onClose={onCancel}
    >
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h2>

        <p className="mt-4 text-sm leading-7 text-slate-400">{message}</p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary-modern rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary-modern rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}