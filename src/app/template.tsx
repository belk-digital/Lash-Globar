/**
 * Re-mounts on every navigation, so the page content eases in (CSS-only: no hydration needed,
 * and it plays on first load too). The panels keep the canvas gap via this flex wrapper.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex flex-col gap-frame">{children}</div>;
}
