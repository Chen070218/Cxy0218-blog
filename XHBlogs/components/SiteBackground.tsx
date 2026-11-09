/**
 * Site background: a quiet desk surface.
 *
 * Dark: near-black with a lavender glow top-left and a cyan glow top-right.
 * Light: paper white with the same two tints at low opacity.
 * Static CSS only — no images, no canvas, no per-frame work.
 */
export default function SiteBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f6f6fa] dark:bg-[#0b0b10]" aria-hidden="true">
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            'radial-gradient(960px 480px at 15% -10%, rgba(167,139,250,0.14), rgba(0,0,0,0) 60%), radial-gradient(800px 416px at 90% 0%, rgba(103,232,249,0.10), rgba(0,0,0,0) 55%)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'radial-gradient(980px 520px at 14% -12%, rgba(167,139,250,0.30), rgba(0,0,0,0) 60%), radial-gradient(820px 440px at 90% -4%, rgba(103,232,249,0.16), rgba(0,0,0,0) 55%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_38%,rgba(0,0,0,0.45)_100%)] opacity-30 dark:opacity-100" />
    </div>
  );
}
