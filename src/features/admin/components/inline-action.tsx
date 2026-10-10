"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import { initialFormState, type FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  children: ReactNode;
  confirm?: string;
  className?: string;
  title?: string;
  variant?: "default" | "danger" | "quiet";
};

/**
 * A one-click action button (publish toggles, reordering, deletes) backed by a
 * Server Action. Optional confirmation; shows errors inline.
 */
export function InlineAction({ action, fields, children, confirm, className, title, variant = "default" }: Props) {
  const [state, dispatch, pending] = useActionState(action, initialFormState);

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        title={title}
        aria-label={title}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          const fd = new FormData();
          for (const [k, v] of Object.entries(fields)) fd.set(k, v);
          startTransition(() => dispatch(fd));
        }}
        className={cn(
          "inline-flex h-8 items-center justify-center gap-1.5 px-2.5 font-label text-[0.7rem] tracking-[0.08em] transition-colors disabled:opacity-40",
          variant === "danger" && "text-vermilion hover:bg-vermilion hover:text-cream",
          variant === "default" && "border border-ink/25 hover:border-ink",
          variant === "quiet" && "text-ink-2 hover:bg-ink/6 hover:text-ink",
          className,
        )}
      >
        {children}
      </button>
      {state.status === "error" && state.message && (
        <span role="alert" className="mt-1 max-w-56 font-ui text-[0.78rem] text-vermilion">
          {state.message}
        </span>
      )}
    </span>
  );
}
