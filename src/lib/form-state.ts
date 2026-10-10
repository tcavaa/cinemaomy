/** State returned by every form Server Action (consumed by <ActionForm>). Client-safe. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Bumped on every response so clients can react to repeated identical results. */
  at?: number;
};

export const initialFormState: FormState = { status: "idle" };
