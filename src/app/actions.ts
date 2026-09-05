'use server';

import { z } from 'zod';
import { execute, isReachable } from '@/lib/db';

export interface ActionResult {
  ok: boolean;
  message?: string;
}

// Cart mutations go through /api/cart rather than server actions, so that the
// header badge, the drawer and the bag page all read one client-side source of
// truth instead of racing each other's revalidations.

export async function subscribeAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email(),
      source: z.string().max(60).default('footer'),
    })
    .safeParse({
      email: formData.get('email'),
      source: formData.get('source') ?? 'footer',
    });

  if (!parsed.success) return { ok: false, message: 'That email address does not look right.' };

  if (await isReachable()) {
    try {
      await execute(
        `INSERT INTO newsletter_subscribers (email, source) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE source = VALUES(source)`,
        [parsed.data.email, parsed.data.source],
      );
    } catch {
      return { ok: false, message: 'Something went wrong. Please try again.' };
    }
  } else {
    // No database yet — accept the address rather than showing an error, and
    // leave a trace in the server log so nothing is silently lost in dev.
    console.info('[newsletter] no DATABASE_URL; not persisted:', parsed.data.email);
  }

  return { ok: true, message: 'You are on the list.' };
}

export async function contactAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(200),
      email: z.string().trim().toLowerCase().email(),
      subject: z.string().trim().max(300).optional(),
      message: z.string().trim().min(10).max(5000),
      // Honeypot: a real person never fills a field they cannot see.
      company: z.string().max(0).optional().or(z.literal('')),
    })
    .safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject') ?? '',
      message: formData.get('message'),
      company: formData.get('company') ?? '',
    });

  if (!parsed.success) {
    return { ok: false, message: 'Please add your name, a valid email and a message of at least 10 characters.' };
  }

  if (await isReachable()) {
    try {
      await execute(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [parsed.data.name, parsed.data.email, parsed.data.subject || null, parsed.data.message],
      );
    } catch {
      return { ok: false, message: 'Something went wrong. Please email us directly.' };
    }
  } else {
    console.info('[contact] no DATABASE_URL; not persisted:', parsed.data.email);
  }

  return { ok: true, message: 'Thanks — we will come back to you within one business day.' };
}
