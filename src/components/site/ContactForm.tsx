'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { contactAction, type ActionResult } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-ink mt-8">
      {pending ? 'Sending…' : 'Send message'}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(contactAction, null);

  if (state?.ok) {
    return (
      <div className="border border-line p-8">
        <p className="font-display text-2xl">Message sent.</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-7">
      {/* Honeypot — hidden from people, tempting to bots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="u-label">
            Name
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className="field mt-2" />
        </div>
        <div>
          <label htmlFor="email" className="u-label">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field mt-2" />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="u-label">
          Subject <span className="normal-case tracking-normal text-ink-400">(optional)</span>
        </label>
        <input id="subject" name="subject" type="text" className="field mt-2" />
      </div>

      <div>
        <label htmlFor="message" className="u-label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          className="field mt-2 resize-y"
          placeholder="Include your rig's joint angle and size if you're asking about fitment."
        />
      </div>

      <div>
        <Submit />
        <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-xs text-sale">
          {state && !state.ok ? state.message : ''}
        </p>
      </div>
    </form>
  );
}
