import { useState } from "react";
import { useVoteStore } from "../store/useVoteStore";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface VoteFormProps {
  showToast: (type: "success" | "error", message: string) => void;
}

export default function VoteForm({ showToast }: VoteFormProps) {
  const candidates = useVoteStore((state) => state.candidates);
  const castVote = useVoteStore((state) => state.castVote);
  const [voterName, setVoterName] = useState("");
  const [candidate, setCandidate] = useState("");
  const [errors, setErrors] = useState<{ name?: string; candidate?: string }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: { name?: string; candidate?: string } = {};
    if (!voterName.trim()) nextErrors.name = "Please enter your name.";
    if (!candidate) nextErrors.candidate = "Please choose a candidate.";
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.candidate) return;

    const vote = castVote(voterName, candidate);
    if (vote.success) {
      showToast("success", "Your vote has been recorded.");
      setVoterName("");
      setCandidate("");
      setErrors({});
    } else if (vote.reason === "already-voted") {
      setErrors({ name: "This voter has already voted." });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="voter-name" className="mb-2 block text-sm font-semibold text-slate-300">
            Your Name
          </label>
          <input
            id="voter-name"
            name="voter-name"
            type="text"
            placeholder="Enter your name"
            value={voterName}
            onChange={(e) => {
              setVoterName(e.target.value);
              if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
            }}
            aria-invalid={Boolean(errors.name)}
            className={`input-modern w-full ${errors.name ? "input-modern-error" : ""}`}
          />
          {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="candidate" className="mb-2 block text-sm font-semibold text-slate-300">
            Choose Candidate
          </label>
          <select
            id="candidate"
            name="candidate"
            value={candidate}
            onChange={(e) => {
              setCandidate(e.target.value);
              if (errors.candidate) setErrors((current) => ({ ...current, candidate: undefined }));
            }}
            aria-invalid={Boolean(errors.candidate)}
            className={`input-modern w-full ${errors.candidate ? "input-modern-error" : ""}`}
          >
            <option value="" disabled>
              Select a candidate
            </option>
            {candidates.map((c) => (
              <option key={c} value={c}>
                {capitalize(c)}
              </option>
            ))}
          </select>
          {errors.candidate && <p className="field-error" role="alert">{errors.candidate}</p>}
        </div>
      </div>

      <button type="submit" className="btn-primary-modern w-full px-6 py-3 text-base">
        Submit Vote
      </button>
    </form>
  );
}