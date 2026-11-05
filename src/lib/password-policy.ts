export interface PasswordRequirement {
  id: string;
  label: string;
  isMet: (password: string) => boolean;
}

const countMatches = (password: string, pattern: RegExp) => password.match(pattern)?.length ?? 0;

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "Entre 12 et 25 caractères",
    isMet: (password) => {
      const length = Array.from(password).length;
      return length >= 12 && length <= 25;
    },
  },
  {
    id: "uppercase",
    label: "Au moins 2 lettres majuscules",
    isMet: (password) => countMatches(password, /[A-Z]/g) >= 2,
  },
  {
    id: "lowercase",
    label: "Au moins 2 lettres minuscules",
    isMet: (password) => countMatches(password, /[a-z]/g) >= 2,
  },
  {
    id: "digit",
    label: "Au moins 2 chiffres",
    isMet: (password) => countMatches(password, /[0-9]/g) >= 2,
  },
  {
    id: "special",
    label: "Au moins 2 caractères spéciaux",
    isMet: (password) => countMatches(password, /[\p{P}\p{S}]/gu) >= 2,
  },
];

export function isPasswordPolicyValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.isMet(password));
}

export function getPasswordPolicyError(password: string): string | null {
  const unmetRequirement = PASSWORD_REQUIREMENTS.find(
    (requirement) => !requirement.isMet(password),
  );
  return unmetRequirement
    ? `Le mot de passe doit respecter le critère : ${unmetRequirement.label.toLowerCase()}.`
    : null;
}
