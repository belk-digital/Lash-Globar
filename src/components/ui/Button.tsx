import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader } from './Loader';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'solid' | 'outline' | 'lavender' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Stretch to the full width of its container. */
  block?: boolean;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href'> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

// Written out in full (not built with a template string) so Tailwind's content scan keeps them.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  solid: 'btn-solid',
  outline: 'btn-outline',
  lavender: 'btn-lavender',
  white: 'btn-white',
};

/** Class names for the rectangular button system (styles live in globals.css → .btn). */
export function buttonClasses(
  variant: ButtonVariant = 'solid',
  size: ButtonSize = 'md',
  block = false,
): string {
  return cn(
    'btn',
    VARIANT_CLASS[variant],
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'w-full',
  );
}

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/**
 * Rectangular, uppercase button. On hover the fill wipes up from the base and the label rolls
 * (the text slides out and an identical copy slides in) - a small, deliberate detail.
 * Renders a <button>, an internal <Link>, or an external <a> depending on `href`.
 */
function Label2({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <>
      {loading ? <Loader /> : null}
      <span className="btn-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </>
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, block, loading, href, ...rest } = props;
    const classes = cn(buttonClasses(variant, size, block), className);
    const inner = <Label2 loading={loading}>{children}</Label2>;
    return isExternal(href) ? (
      <a href={href} className={classes} aria-disabled={loading || undefined} {...rest}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={classes} aria-disabled={loading || undefined} {...rest}>
        {inner}
      </Link>
    );
  }

  const { variant, size, className, children, block, loading, type, disabled, ...rest } = props;
  return (
    <button
      type={type ?? 'button'}
      className={cn(buttonClasses(variant, size, block), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Label2 loading={loading}>{children}</Label2>
    </button>
  );
}
