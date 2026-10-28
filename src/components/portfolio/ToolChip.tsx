/** Small pill used for tool/material names in the case study. */
export function ToolChip({ label }: { label: string }) {
  return (
    <li className="rounded-full border border-border bg-surface px-3 py-1 text-caption text-foreground-secondary" dir="ltr">
      {label}
    </li>
  );
}
