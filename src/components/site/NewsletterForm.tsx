'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { subscribeAction, type ActionResult } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-quiet shrink-0 disabled:opacity-40">
      {pending ? 'Joining…' : 'Subscribe'}
      <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
        <path d="M0 4.5h14M10 1l4 3.5L10 8" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}

export default function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(subscribeAction, null);

  return (
    <div>
      <form action={formAction} className="flex items-end gap-4 border-b border-ink pb-1">
        <input type="hidden" name="source" value={source} />
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className="field !border-0 flex-1"
        />
        <Submit />
      </form>

      <p
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-xs ${state?.ok ? 'text-ink' : 'text-sale'}`}
      >
        {state?.message ?? ''}
      </p>
    </div>
  );
}
