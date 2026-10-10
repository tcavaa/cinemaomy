"use client";

import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { initialFormState, type FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

type FormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

const FormContext = createContext<{ state: FormState; pending: boolean }>({
  state: initialFormState,
  pending: false,
});

export const useActionFormState = () => useContext(FormContext);

type ActionFormProps = Omit<ComponentProps<"form">, "action" | "onSubmit"> & {
  action: FormAction;
  resetOnSuccess?: boolean;
  onSuccess?: (state: FormState) => void;
};

/**
 * Form bound to a Server Action. After hydration it submits through a
 * transition (so React does not wipe the inputs when validation fails); before
 * hydration the native `action` still POSTs to the Server Action, so values
 * never end up in the URL.
 */
export function ActionForm({ action, resetOnSuccess, onSuccess, children, ...props }: ActionFormProps) {
  const [state, dispatch, pending] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (state.status !== "success") return;
    if (resetOnSuccess) formRef.current?.reset();
    onSuccessRef.current?.(state);
  }, [state, resetOnSuccess]);

  return (
    <FormContext.Provider value={{ state, pending }}>
      <form
        ref={formRef}
        action={dispatch}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
          const formData = new FormData(event.currentTarget, submitter);
          startTransition(() => dispatch(formData));
        }}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
  arrow,
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  arrow?: boolean;
  name?: string;
  value?: string;
}) {
  const { pending } = useActionFormState();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      arrow={arrow && !pending}
      disabled={pending}
      aria-busy={pending}
      className={className}
      name={name}
      value={value}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}

export function FormMessage({ className }: { className?: string }) {
  const { state } = useActionFormState();
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "border-l-2 py-1 pl-3 font-ui text-[0.92rem]",
        state.status === "error" ? "border-vermilion text-vermilion" : "border-[#3d6b45] text-[#2f5536]",
        className,
      )}
    >
      {state.message}
    </p>
  );
}

/**
 * Field wrapper that picks its validation error from the surrounding <ActionForm>.
 * `htmlFor` defaults to `name`; pass it when the control's id differs.
 */
export function FormField({
  name,
  htmlFor,
  label,
  hint,
  className,
  children,
}: {
  name: string;
  htmlFor?: string;
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const { state } = useActionFormState();
  return (
    <Field label={label} htmlFor={htmlFor ?? name} hint={hint} error={state.fieldErrors?.[name]} className={className}>
      {children}
    </Field>
  );
}
