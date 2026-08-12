"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import { Banner } from "./ui";

export default function SignInForm({
  labels,
}: {
  labels: { email: string; password: string; submit: string };
}) {
  const [state, action] = useActionState<ActionState, FormData>(signIn, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          {labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          dir="ltr"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          dir="ltr"
        />
      </div>
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      <SubmitButton className="btn-primary w-full">{labels.submit}</SubmitButton>
    </form>
  );
}
