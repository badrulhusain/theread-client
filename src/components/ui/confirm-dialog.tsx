import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1b1511]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#ded3c4] bg-[#fbf7ef] p-5 shadow-xl">
        <h2 className="font-serif text-xl font-semibold text-[#231b17]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#74685f]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
