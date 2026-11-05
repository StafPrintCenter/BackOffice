import type { AdminMfaLoginMethod } from "@/data/auth";

const LABELS: Record<AdminMfaLoginMethod, string> = {
  email: "Recevoir un code par e-mail",
  totp: "Utiliser mon application d'authentification",
  recovery: "Utiliser un code de secours",
};

interface MfaMethodSwitcherProps {
  available: AdminMfaLoginMethod[];
  active: AdminMfaLoginMethod;
  disabled?: boolean;
  onSelect: (method: AdminMfaLoginMethod) => void;
}

export function MfaMethodSwitcher({
  available,
  active,
  disabled,
  onSelect,
}: MfaMethodSwitcherProps) {
  const otherMethods = available.filter((method) => method !== active);
  if (otherMethods.length === 0) return null;

  return (
    <div className="space-y-2 border-t pt-4 text-center">
      {otherMethods.map((method) => (
        <button
          key={method}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(method)}
          className="block w-full text-xs font-medium text-foreground underline underline-offset-4 disabled:opacity-50 cursor-pointer"
        >
          {LABELS[method]}
        </button>
      ))}
    </div>
  );
}
