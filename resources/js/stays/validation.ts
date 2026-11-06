export function validateEmail(value: string): string | null {
    const trimmed = value.trim();

    if (trimmed === '') {
        return 'Enter an email address, such as sam@example.com.';
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? null
        : 'This email address is missing part of it. Use the format sam@example.com.';
}

export const PASSWORD_RULES = [
    {
        label: 'At least 8 characters',
        test: (value: string) => value.length >= 8,
    },
    {
        label: 'Upper and lower case letters',
        test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    { label: 'At least one number', test: (value: string) => /\d/.test(value) },
];
