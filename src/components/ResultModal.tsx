import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useVoteStore, selectResult } from "../store/useVoteStore";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResultModal({ isOpen, onClose }: ResultModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const result = useVoteStore(useShallow(selectResult));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const winner = result.winner;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      onClose={onClose}
    >

      {/* Stop clicks inside modal from propagating to parent dialog close handler */}
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>    
        <h3 className="text-2xl font-bold tracking-tight text-slate-100">Election Result</h3>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-4">
            <span className="text-sm font-medium text-slate-400">🏆 Winner</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400">
                {winner ? capitalize(winner) : "—"}
              </span>
              {result.isTied && winner && (
                <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  Tied
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-4">
            <span className="text-sm font-medium text-slate-400">Winner's Votes</span>
            <span className="font-bold text-slate-100">
              {winner ? String(result.winnerVotes) : "0"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-amber-500/10 p-4">
            <span className="text-sm font-medium text-slate-400">Total Votes</span>
            <span className="font-bold text-amber-400">{String(result.totalVotes)}</span>
          </div>
        </div>

        <button type="button" onClick={onClose} className="btn-primary-modern mt-8 w-full rounded-lg py-3 font-medium">
          Close
        </button>
      </div>
    </dialog>
  );
}