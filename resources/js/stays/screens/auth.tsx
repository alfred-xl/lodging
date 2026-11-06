import clsx from 'clsx';
import {
    ArrowLeft,
    Check,
    Circle,
    CircleAlert,
    Eye,
    EyeOff,
    MailCheck,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import {
    accountStatus,
    createAccount,
    requestPasswordReset,
    sendVerificationCode,
    signInWithCode,
    signInWithPassword,
    verifyCode,
} from '../auth/mock-auth';
import { TextField } from '../components/text-field';
import { Button, IconButton } from '../components/ui';
import { goBack, Link, leaveAuth, navigate } from '../router';
import { useStore } from '../store';
import { APP_NAME } from '../theme';
import { PASSWORD_RULES, validateEmail } from '../validation';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
const WRONG_CODE = "That code isn't right. Check it and try again.";
const PROVIDERS = ['Google', 'Apple', 'Facebook'];

// Leaves the flow as soon as there's a signed-in user, then finishes what they started.
function useFinishWhenSignedIn(): void {
    const { user, authIntent, setAuthIntent, addSaved } = useStore();

    useEffect(() => {
        if (!user) {
            return;
        }

        leaveAuth(() => {
            setAuthIntent(null);

            if (authIntent?.type === 'save') {
                addSaved(authIntent.hotelId);
            }

            if (authIntent?.type === 'reserve') {
                navigate(authIntent.to);
            }
        });
    }, [user, authIntent, setAuthIntent, addSaved]);
}

function AuthLayout({
    canGoBack = true,
    children,
}: {
    canGoBack?: boolean;
    children: ReactNode;
}) {
    const { setAuthIntent } = useStore();

    useFinishWhenSignedIn();

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <header className="st-on-brand bg-st-brand st-safe-top text-st-on-dark">
                <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-1 px-1">
                    {canGoBack ? (
                        <IconButton
                            label="Go back"
                            onClick={() => goBack('/auth')}
                            className="hover:bg-st-action-hover"
                        >
                            <ArrowLeft className="size-6" aria-hidden />
                        </IconButton>
                    ) : (
                        <span />
                    )}
                    <p className="truncate text-center st-headline3">
                        {APP_NAME}
                    </p>
                    <IconButton
                        label="Close sign in"
                        onClick={() => {
                            setAuthIntent(null);
                            leaveAuth();
                        }}
                        className="hover:bg-st-action-hover"
                    >
                        <X className="size-6" aria-hidden />
                    </IconButton>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 px-4 py-6">
                {children}
            </main>
        </div>
    );
}

// Screens past the first need the email from step one, which a reload clears.
function useRequireDraft() {
    const { authDraft, user } = useStore();

    useEffect(() => {
        if (!authDraft && !user) {
            navigate('/auth', { replace: true });
        }
    }, [authDraft, user]);

    return authDraft;
}

export function AuthStartScreen() {
    const { authDraft, setAuthDraft } = useStore();
    const [email, setEmail] = useState(authDraft?.email ?? '');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (busy) {
            return;
        }

        const problem = validateEmail(email);
        setError(problem);

        if (problem) {
            input.current?.focus();

            return;
        }

        setBusy(true);

        const address = email.trim();
        const { exists, remote } = await accountStatus(address);

        // There's no real inbox yet, so database accounts sign in with their password.
        if (remote) {
            setAuthDraft({
                email: address,
                existing: true,
                remote: true,
                code: '',
                sentAt: 0,
            });
            navigate('/auth/password');

            return;
        }

        const code = await sendVerificationCode(address);

        setAuthDraft({
            email: address,
            existing: exists,
            code,
            sentAt: Date.now(),
        });
        navigate('/auth/verify');
    };

    return (
        <AuthLayout canGoBack={false}>
            <h1 className="st-headline2">Sign in or create an account</h1>
            <form
                noValidate
                onSubmit={(event) => void submit(event)}
                className="flex flex-col gap-4"
            >
                <TextField
                    id="auth-email"
                    label="Email address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    error={error}
                    inputRef={input}
                    onChange={(value) => {
                        setEmail(value);

                        if (error) {
                            setError(validateEmail(value));
                        }
                    }}
                />
                <Button type="submit" className="w-full" loading={busy}>
                    Continue with email
                </Button>
            </form>
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-st-border-soft" />
                <span className="st-small1 text-st-text-alt">
                    or use one of these options
                </span>
                <hr className="flex-1 border-st-border-soft" />
            </div>
            <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((provider) => (
                    <Button
                        key={provider}
                        variant="outline"
                        className="px-1 st-emphasized2"
                        aria-label={`Continue with ${provider}`}
                        onClick={() =>
                            toast(
                                `${provider} isn't connected yet. Use your email address for now.`,
                            )
                        }
                    >
                        {provider}
                    </Button>
                ))}
            </div>
            <p className="mt-auto pt-4 text-center st-small1 text-st-text-alt">
                By continuing, you agree to our{' '}
                <Link
                    to="/auth/info/terms-and-conditions"
                    className="text-st-link underline"
                >
                    Terms and conditions
                </Link>{' '}
                and{' '}
                <Link
                    to="/auth/info/privacy-statement"
                    className="text-st-link underline"
                >
                    Privacy statement
                </Link>
                .
            </p>
        </AuthLayout>
    );
}

// import.meta.env.DEV is false in production builds, which removes this from the bundle.
function DevCodeBanner({ code }: { code: string }) {
    return (
        <p
            role="note"
            className="rounded-st-sm border border-dashed border-st-border bg-st-surface-alt p-2 st-small1"
        >
            <strong>Development only:</strong> your mock code is{' '}
            <strong>{code}</strong>
        </p>
    );
}

function CodeBoxes({
    digits,
    error,
    disabled,
    labelledBy,
    inputs,
    onChange,
}: {
    digits: string[];
    error: boolean;
    disabled: boolean;
    labelledBy: string;
    inputs: React.RefObject<(HTMLInputElement | null)[]>;
    onChange: (digits: string[]) => void;
}) {
    const fillFrom = (start: number, text: string) => {
        const incoming = text.replace(/\D/g, '').slice(0, CODE_LENGTH - start);
        const next = [...digits];

        incoming.split('').forEach((digit, offset) => {
            next[start + offset] = digit;
        });
        onChange(next);

        const focusAt = Math.min(start + incoming.length, CODE_LENGTH - 1);
        inputs.current[focusAt]?.focus();
    };

    return (
        <div
            role="group"
            aria-labelledby={labelledBy}
            aria-describedby={error ? 'code-error' : undefined}
            className="grid grid-cols-6 gap-2"
        >
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                    aria-invalid={error}
                    disabled={disabled}
                    value={digit}
                    // onInput, because onChange skips retyping the digit already in the box.
                    onChange={() => undefined}
                    onInput={(event) => {
                        const value = event.currentTarget.value;

                        if (value === '') {
                            const next = [...digits];
                            next[index] = '';
                            onChange(next);
                        } else {
                            // Keeps the newest digit, and handles autofill typing the whole code.
                            fillFrom(
                                index,
                                value.length > 2 ? value : value.slice(-1),
                            );
                        }
                    }}
                    onPaste={(event) => {
                        event.preventDefault();
                        fillFrom(index, event.clipboardData.getData('text'));
                    }}
                    onKeyDown={(event) => {
                        if (
                            event.key === 'Backspace' &&
                            digit === '' &&
                            index > 0
                        ) {
                            inputs.current[index - 1]?.focus();
                        }
                    }}
                    onFocus={(event) => event.target.select()}
                    className={clsx(
                        'aspect-square w-full max-w-12 rounded-st-sm border bg-st-surface text-center st-headline3 st-transition',
                        error ? 'border-st-danger' : 'border-st-border',
                    )}
                />
            ))}
        </div>
    );
}

export function AuthVerifyScreen() {
    const { setAuthDraft, signIn } = useStore();
    const draft = useRequireDraft();
    const [digits, setDigits] = useState<string[]>(() =>
        Array.from({ length: CODE_LENGTH }, () => ''),
    );
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [resent, setResent] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);

        return () => window.clearInterval(timer);
    }, []);

    if (!draft) {
        return <AuthLayout>{null}</AuthLayout>;
    }

    const secondsLeft = Math.max(
        0,
        RESEND_SECONDS - Math.floor((now - draft.sentAt) / 1000),
    );

    const check = async (code: string) => {
        if (busy) {
            return;
        }

        if (code.length < CODE_LENGTH) {
            setError(`Enter all ${CODE_LENGTH} digits of the code we sent.`);
            inputs.current[digits.indexOf('')]?.focus();

            return;
        }

        setBusy(true);
        setError(null);

        if (!(await verifyCode(draft.email, code))) {
            setBusy(false);
            setError(WRONG_CODE);
            setDigits(digits.map(() => ''));
            requestAnimationFrame(() => inputs.current[0]?.focus());

            return;
        }

        if (draft.existing) {
            const user = await signInWithCode(draft.email);

            if (user) {
                signIn(user);
            }
        } else {
            navigate('/auth/profile');
        }
    };

    return (
        <AuthLayout>
            <h1 id="verify-title" className="st-headline2">
                Verify your email address
            </h1>
            <p className="st-body2">
                We sent a verification code to <strong>{draft.email}</strong>
            </p>
            {import.meta.env.DEV && <DevCodeBanner code={draft.code} />}
            <form
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    void check(digits.join(''));
                }}
                className="flex flex-col gap-3"
            >
                <CodeBoxes
                    digits={digits}
                    error={error !== null}
                    disabled={busy}
                    labelledBy="verify-title"
                    inputs={inputs}
                    onChange={(next) => {
                        setDigits(next);
                        setError(null);

                        if (next.every((digit) => digit !== '')) {
                            void check(next.join(''));
                        }
                    }}
                />
                {error && (
                    <p
                        id="code-error"
                        role="alert"
                        className="flex items-start gap-1 st-small1 text-st-danger"
                    >
                        <CircleAlert
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden
                        />
                        {error}
                    </p>
                )}
                <Button type="submit" className="w-full" loading={busy}>
                    Verify email
                </Button>
            </form>
            <div className="flex flex-col items-start">
                {secondsLeft > 0 ? (
                    <p className="flex min-h-11 items-center st-body2 text-st-text-alt">
                        Resend code in {secondsLeft}s
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            void sendVerificationCode(draft.email).then(
                                (code) => {
                                    setAuthDraft({
                                        ...draft,
                                        code,
                                        sentAt: Date.now(),
                                    });
                                    setNow(Date.now());
                                    setResent(true);
                                },
                            );
                        }}
                        className="min-h-11 cursor-pointer st-emphasized2 text-st-link underline"
                    >
                        Resend code
                    </button>
                )}
                {resent && (
                    <p role="status" className="st-small1 text-st-success">
                        We sent a new code.
                    </p>
                )}
                {draft.existing && (
                    <Link
                        to="/auth/password"
                        className="inline-flex min-h-11 items-center st-emphasized2 text-st-link underline"
                    >
                        Use a password instead
                    </Link>
                )}
            </div>
        </AuthLayout>
    );
}

export function AuthPasswordScreen() {
    const { signIn } = useStore();
    const draft = useRequireDraft();
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    if (!draft) {
        return <AuthLayout>{null}</AuthLayout>;
    }

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (busy) {
            return;
        }

        if (password === '') {
            setError('Enter your password to sign in.');
            input.current?.focus();

            return;
        }

        setBusy(true);
        setError(null);

        const result = await signInWithPassword(draft.email, password);

        if (typeof result === 'string') {
            setBusy(false);
            setError(result);
            input.current?.focus();
        } else {
            signIn(result);
        }
    };

    return (
        <AuthLayout>
            <h1 className="st-headline2">Enter your password</h1>
            <p className="st-body2">
                Signing in as <strong>{draft.email}</strong>
            </p>
            <form
                noValidate
                onSubmit={(event) => void submit(event)}
                className="flex flex-col gap-4"
            >
                {/* Lets password managers match the saved login to this email. */}
                <input
                    type="email"
                    name="username"
                    autoComplete="username"
                    value={draft.email}
                    readOnly
                    hidden
                />
                <TextField
                    id="auth-password"
                    label="Password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    error={error}
                    inputRef={input}
                    onChange={(value) => {
                        setPassword(value);
                        setError(null);
                    }}
                    trailing={
                        <PasswordToggle
                            visible={visible}
                            onToggle={() => setVisible(!visible)}
                        />
                    }
                />
                <Button type="submit" className="w-full" loading={busy}>
                    Sign in
                </Button>
            </form>
            <Link
                to="/auth/forgot"
                className="inline-flex min-h-11 items-center self-start st-emphasized2 text-st-link underline"
            >
                Forgot your password?
            </Link>
        </AuthLayout>
    );
}

function PasswordToggle({
    visible,
    onToggle,
}: {
    visible: boolean;
    onToggle: () => void;
}) {
    const Icon = visible ? EyeOff : Eye;

    return (
        <IconButton
            label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={onToggle}
            className="text-st-text-alt"
        >
            <Icon className="size-5" aria-hidden />
        </IconButton>
    );
}

export function AuthForgotScreen() {
    const { authDraft } = useStore();
    const [email, setEmail] = useState(authDraft?.email ?? '');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const input = useRef<HTMLInputElement>(null);

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (busy) {
            return;
        }

        const problem = validateEmail(email);
        setError(problem);

        if (problem) {
            input.current?.focus();

            return;
        }

        setBusy(true);
        await requestPasswordReset(email);
        setBusy(false);
        setSentTo(email.trim());
    };

    if (sentTo) {
        return (
            <AuthLayout>
                <div
                    role="status"
                    className="flex flex-col items-center gap-2 rounded-st-md bg-st-success-tint p-4 text-center"
                >
                    <MailCheck className="size-8 text-st-success" aria-hidden />
                    <h1 className="st-headline3">Check your email</h1>
                    <p className="st-body2">
                        If there's an account for <strong>{sentTo}</strong>,
                        we'd send it a reset link.
                    </p>
                    <p className="st-small1 text-st-text-alt">
                        This is a prototype, so no email was sent.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => goBack('/auth')}
                >
                    Back to sign in
                </Button>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <h1 className="st-headline2">Forgot your password?</h1>
            <p className="st-body2">
                Enter your email address and we'll send you a link to reset it.
            </p>
            <form
                noValidate
                onSubmit={(event) => void submit(event)}
                className="flex flex-col gap-4"
            >
                <TextField
                    id="forgot-email"
                    label="Email address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    error={error}
                    inputRef={input}
                    onChange={(value) => {
                        setEmail(value);

                        if (error) {
                            setError(validateEmail(value));
                        }
                    }}
                />
                <Button type="submit" className="w-full" loading={busy}>
                    Send reset link
                </Button>
            </form>
        </AuthLayout>
    );
}

export function AuthProfileScreen() {
    const { signIn } = useStore();
    const draft = useRequireDraft();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [errors, setErrors] = useState<{
        firstName: string | null;
        lastName: string | null;
        password: string | null;
    }>({ firstName: null, lastName: null, password: null });
    const [busy, setBusy] = useState(false);
    const firstInput = useRef<HTMLInputElement>(null);
    const lastInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    if (!draft) {
        return <AuthLayout>{null}</AuthLayout>;
    }

    const rulesMet = PASSWORD_RULES.every((rule) => rule.test(password));

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (busy) {
            return;
        }

        const next = {
            firstName:
                firstName.trim() === '' ? 'Enter your first name.' : null,
            lastName: lastName.trim() === '' ? 'Enter your last name.' : null,
            password:
                password !== '' && !rulesMet
                    ? 'Add what the rules below are missing, or leave this blank.'
                    : null,
        };

        setErrors(next);

        if (next.firstName) {
            firstInput.current?.focus();

            return;
        }

        if (next.lastName) {
            lastInput.current?.focus();

            return;
        }

        if (next.password) {
            passwordInput.current?.focus();

            return;
        }

        setBusy(true);
        signIn(
            await createAccount({
                email: draft.email,
                firstName,
                lastName,
                password,
            }),
        );
    };

    return (
        <AuthLayout>
            <h1 className="st-headline2">Finish your profile</h1>
            <p className="st-body2">
                You're creating an account for <strong>{draft.email}</strong>
            </p>
            <form
                noValidate
                onSubmit={(event) => void submit(event)}
                className="flex flex-col gap-4"
            >
                <TextField
                    id="profile-first"
                    label="First name"
                    type="text"
                    autoComplete="given-name"
                    autoCapitalize="words"
                    value={firstName}
                    error={errors.firstName}
                    inputRef={firstInput}
                    onChange={(value) => {
                        setFirstName(value);
                        setErrors({ ...errors, firstName: null });
                    }}
                />
                <TextField
                    id="profile-last"
                    label="Last name"
                    type="text"
                    autoComplete="family-name"
                    autoCapitalize="words"
                    value={lastName}
                    error={errors.lastName}
                    inputRef={lastInput}
                    onChange={(value) => {
                        setLastName(value);
                        setErrors({ ...errors, lastName: null });
                    }}
                />
                <TextField
                    id="profile-password"
                    label="Password (optional)"
                    type={visible ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    error={errors.password}
                    inputRef={passwordInput}
                    describedBy="password-rules"
                    onChange={(value) => {
                        setPassword(value);
                        setErrors({ ...errors, password: null });
                    }}
                    trailing={
                        <PasswordToggle
                            visible={visible}
                            onToggle={() => setVisible(!visible)}
                        />
                    }
                />
                <ul id="password-rules" className="flex flex-col gap-1">
                    {PASSWORD_RULES.map((rule) => {
                        const met = rule.test(password);
                        const Icon = met ? Check : Circle;

                        return (
                            <li
                                key={rule.label}
                                className={clsx(
                                    'flex items-center gap-1 st-small1',
                                    met
                                        ? 'text-st-success'
                                        : 'text-st-text-alt',
                                )}
                            >
                                <Icon
                                    className="size-3.5 shrink-0"
                                    aria-hidden
                                />
                                {rule.label}
                                <span className="sr-only">
                                    {met ? ', met' : ', not met yet'}
                                </span>
                            </li>
                        );
                    })}
                </ul>
                <Button type="submit" className="w-full" loading={busy}>
                    Create account
                </Button>
            </form>
        </AuthLayout>
    );
}
