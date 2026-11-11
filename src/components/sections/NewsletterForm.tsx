'use client';

import { useState, type FormEvent } from 'react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'loading' | 'success' | 'error';

/** Email capture: a square field fused to a square button, with inline, screen-reader-friendly feedback. */
export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setStatus('success');
      setMessage('You’re on the list.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex max-w-lg">
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="Your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby="newsletter-status"
          className="h-14 w-full min-w-0 flex-1 border border-ink bg-white px-5 text-base text-ink placeholder:text-ink-soft focus:outline-none focus-visible:bg-mist"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 border border-l-0 border-ink bg-ink px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors duration-500 hover:bg-white hover:text-ink disabled:opacity-60 sm:px-8"
        >
          {status === 'loading' ? <Loader /> : null}
          Subscribe
        </button>
      </div>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={cn('label mt-4 min-h-4', status === 'error' ? 'text-red-700' : 'text-ink')}
      >
        {message}
      </p>
    </form>
  );
}
