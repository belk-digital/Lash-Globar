'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { CONTACT_EMAIL } from '@/lib/site';

const TOPICS = [
  'Order question',
  'Product advice',
  'Returns & exchanges',
  'Wholesale & press',
  'Something else',
] as const;

const fieldClass =
  'w-full border border-ink bg-white px-4 py-3.5 text-base text-ink transition-colors placeholder:text-ink-soft hover:bg-mist focus:bg-mist focus:outline-none';

const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-[0.1em]';

/** Contact form that composes a `mailto:` link - no server or email service required. */
export function ContactForm() {
  const id = useId();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const topic = String(data.get('topic') ?? '');
    const message = String(data.get('message') ?? '').trim();

    const subject = `[${topic}] Message from ${name}`;
    const body = `${message}\n\n${name}\n${email}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setSent(true);
    toast({
      title: 'Opening your email app…',
      description: `If nothing opens, write to us at ${CONTACT_EMAIL}.`,
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            Name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-topic`} className={labelClass}>
          Topic
        </label>
        <select id={`${id}-topic`} name="topic" defaultValue={TOPICS[0]} className={fieldClass}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className={labelClass}>
          Message
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg">
          Send message
        </Button>
        <p className="label text-ink-soft" role="status">
          {sent
            ? 'Your email app should open with your message ready.'
            : 'This opens your email app.'}
        </p>
      </div>
    </form>
  );
}
