import { useState } from "react";
import { useVoteStore } from "./store/useVoteStore";
import VoteForm from "./components/VoteForm";
import VoteCount from "./components/VoteCount";
import ResultModal from "./components/ResultModal";
import ConfirmModal from "./components/ConfirmModal";

interface ToastState {
  type: "success" | "error";
  message: string;
}

export default function App() {
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => undefined,
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastLeaving, setToastLeaving] = useState(false);

  const resetVotes = useVoteStore((state) => state.reset);

  const showToast = (type: "success" | "error", message: string) => {
    setToastLeaving(false);
    setToast({ type, message });
    window.setTimeout(() => {
      setToastLeaving(true);
      window.setTimeout(() => setToast(null), 200);
    }, 2600);
  };

  const openResetConfirm = () => {
    setConfirmState({
      open: true,
      title: "Reset all votes?",
      message: "This will clear all saved votes and results. This action cannot be undone.",
      onConfirm: () => {
        resetVotes();
        setIsResultOpen(false);
        setConfirmState((current) => ({ ...current, open: false }));
        showToast("success", "Votes reset successfully.");
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="card-modern w-full max-w-3xl p-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-amber-400">HoH Voting System</h1>
            <p className="text-sm text-slate-400">Select your choice and submit your vote</p>
          </div>
          <button
            type="button"
            onClick={openResetConfirm}
            className="btn-secondary-modern rounded-lg px-4 py-2 text-sm"
          >
            ↻ Reset
          </button>
        </div>

        <VoteForm showToast={showToast} />

        <div className="mt-12 flex items-center justify-between gap-6 rounded-xl bg-slate-900 p-6">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsResultOpen(true)}
              aria-haspopup="dialog"
              aria-controls="result-dialog"
              className="flex size-16 items-center justify-center rounded-xl bg-slate-800 text-2xl shadow-sm transition hover:shadow-md"
            >
              🗳️
            </button>
            <span className="text-xs font-medium text-slate-400">View Results</span>
          </div>

          <VoteCount />
        </div>
      </div>

      <ResultModal isOpen={isResultOpen} onClose={() => setIsResultOpen(false)} />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Yes, continue"
        cancelText="Cancel"
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((current) => ({ ...current, open: false }))}
      />

      {toast && (
        <div
          className={`toast toast-end toast-bottom z-50 toast-enter transition-opacity duration-200 ${
            toastLeaving ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}