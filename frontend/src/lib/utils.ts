// Utility file

// We removed tailwind-merge and clsx
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
