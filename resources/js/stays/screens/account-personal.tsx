import clsx from 'clsx';
import { CircleAlert, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { toast } from 'sonner';
import { COUNTRIES, flagFor, GENDER_LABELS, splitPhone } from '../account-data';
import type {
    AccountDetails,
    FieldErrors,
    Gender,
    ProfileChanges,
} from '../account-data';
import { AccountGate, Avatar } from '../components/account-ui';
import { SheetFooter } from '../components/sheet';
import { TextField } from '../components/text-field';
import { Button, TopBar } from '../components/ui';
import { formatLong, todayIso } from '../format';
import { goBack, Link } from '../router';
import { useStore } from '../store';

const BACK = '/personal-details';

function DetailRow({
    label,
    to,
    value,
    placeholder,
    children,
}: {
    label: string;
    to: string;
    value?: ReactNode;
    placeholder: string;
    children?: ReactNode;
}) {
    return (
        <div className="px-4 py-3">
            <Link
                to={to}
                className="-mx-4 flex flex-col gap-1 px-4 py-2 st-transition hover:bg-st-surface-alt"
            >
                <span className="flex items-center justify-between gap-3 st-body1">
                    {label}
                    <ChevronRight className="size-5 shrink-0" aria-hidden />
                </span>
                {value ? (
                    <span className="st-emphasized1 break-words">{value}</span>
                ) : (
                    <span className="st-body1 text-st-text-alt">
                        {placeholder}
                    </span>
                )}
            </Link>
            {children}
        </div>
    );
}

function SectionIntro({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="px-4 pt-8 pb-1">
            <h2 id={id} className="st-headline3">
                {title}
            </h2>
            <p className="pt-1 st-body1 text-st-text-alt">{children}</p>
        </div>
    );
}

function addressText(account: AccountDetails): string | undefined {
    const { address } = account;

    return address
        ? [address.line, address.city, address.postcode, address.country]
              .filter(Boolean)
              .join(', ')
        : undefined;
}

function PersonalDetails({ account }: { account: AccountDetails }) {
    const edit = (field: string) => `/edit-profile/${field}`;

    return (
        <main className="pb-10">
            <p className="px-4 pt-4 st-body1 text-st-text-alt">
                We'll remember this information to make it faster when you book.
            </p>
            <DetailRow
                label="Name"
                to={edit('name')}
                value={`${account.firstName} ${account.lastName}`.trim()}
                placeholder="Enter your name"
            />
            <DetailRow
                label="Gender"
                to={edit('gender')}
                value={
                    account.gender ? GENDER_LABELS[account.gender] : undefined
                }
                placeholder="Select your gender"
            />
            <DetailRow
                label="Date of birth"
                to={edit('date-of-birth')}
                value={
                    account.dateOfBirth
                        ? formatLong(account.dateOfBirth)
                        : undefined
                }
                placeholder="Enter your date of birth"
            />
            <DetailRow
                label="Passport details"
                to={edit('passport')}
                value={
                    account.passport
                        ? `Ending ${account.passport.lastDigits} · ${account.passport.country}`
                        : undefined
                }
                placeholder="Not provided"
            />

            <section aria-labelledby="contact-details">
                <SectionIntro id="contact-details" title="Contact details">
                    Properties or providers you book with will use this
                    information if they need to contact you.
                </SectionIntro>
                <DetailRow
                    label="Email address"
                    to={edit('email')}
                    value={account.email}
                    placeholder="Add your email address"
                >
                    {account.emailVerified && (
                        <span className="inline-block rounded-st-sm border border-st-success px-1.5 st-body2 text-st-success">
                            Verified
                        </span>
                    )}
                    <p className="pt-2 st-body2 text-st-text-alt">
                        This is the email address you use to sign in. It's also
                        where we send your booking confirmations.
                    </p>
                    <div className="mt-4 rounded-st-md border border-st-border-soft p-4">
                        <p className="st-body2">
                            Unable to access your email? If you added a mobile
                            phone number for one of your previous completed
                            stays, you can change your email address using
                            mobile phone verification.
                        </p>
                        <Link
                            to="/info/email-phone-verification"
                            className="mt-2 inline-flex min-h-11 items-center st-emphasized2 text-st-link hover:underline"
                        >
                            Change email with phone verification
                        </Link>
                    </div>
                </DetailRow>
                <DetailRow
                    label="Phone number"
                    to={edit('phone')}
                    value={
                        account.phone ? (
                            <span className="flex items-center gap-3">
                                <span aria-hidden className="st-headline3">
                                    {flagFor(account.phone)}
                                </span>
                                {account.phone}
                            </span>
                        ) : undefined
                    }
                    placeholder="Add your phone number"
                >
                    <p className="pt-1 st-body2 text-st-text-alt">
                        Properties or attractions will use this number if they
                        need to contact you. This number can also be used as an
                        alternative sign-in method in case there is an issue
                        with your email.
                    </p>
                </DetailRow>
                <DetailRow
                    label="Address"
                    to={edit('address')}
                    value={addressText(account)}
                    placeholder="Add your address"
                />
            </section>

            <section aria-labelledby="how-you-appear">
                <SectionIntro id="how-you-appear" title="How you appear">
                    This information will be shown next to reviews you write and
                    any forum posts you make.
                </SectionIntro>
                <div className="px-4 py-3">
                    <Link
                        to={edit('photo')}
                        className="-mx-4 flex flex-col gap-3 px-4 py-2 st-transition hover:bg-st-surface-alt"
                    >
                        <span className="flex items-center justify-between gap-3 st-body1">
                            Profile picture
                            <ChevronRight
                                className="size-5 shrink-0"
                                aria-hidden
                            />
                        </span>
                        <Avatar
                            firstName={account.firstName}
                            lastName={account.lastName}
                            url={account.avatarUrl}
                            className="size-16"
                        />
                    </Link>
                </div>
                <DetailRow
                    label="Display name"
                    to={edit('display-name')}
                    value={account.displayName ?? undefined}
                    placeholder="Choose a display name"
                />
                <DetailRow
                    label="Nationality"
                    to={edit('nationality')}
                    value={account.nationality ?? undefined}
                    placeholder="Select your nationality"
                />
            </section>
        </main>
    );
}

export function PersonalDetailsScreen() {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Personal details" fallback="/" />
            <AccountGate>
                {(account) => <PersonalDetails account={account} />}
            </AccountGate>
        </div>
    );
}

// Editing

function SelectField({
    id,
    label,
    error,
    children,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
    id: string;
    label: string;
    error: string | null;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="st-strong2">
                {label}
            </label>
            <select
                id={id}
                aria-invalid={error !== null}
                aria-describedby={error ? `${id}-error` : undefined}
                className={clsx(
                    'min-h-12 w-full rounded-st-sm border bg-st-surface px-3 st-body1',
                    error ? 'border-st-danger' : 'border-st-border',
                )}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p
                    id={`${id}-error`}
                    className="flex items-start gap-1 st-small1 text-st-danger"
                >
                    <CircleAlert
                        className="mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                    />
                    {error}
                </p>
            )}
        </div>
    );
}

function CountryOptions({ placeholder }: { placeholder: string }) {
    return (
        <>
            <option value="">{placeholder}</option>
            {COUNTRIES.map(({ name }) => (
                <option key={name} value={name}>
                    {name}
                </option>
            ))}
        </>
    );
}

// Saves on submit, then returns to Personal details. `check` returns errors found
// before anything is sent.
function EditForm({
    title,
    intro,
    changes,
    check,
    onRemove,
    children,
}: {
    title: string;
    intro?: string;
    changes: () => ProfileChanges;
    check?: () => FieldErrors;
    onRemove?: ProfileChanges;
    children: (
        errors: FieldErrors,
        clear: (field: string) => void,
    ) => ReactNode;
}) {
    const { saveProfile } = useStore();
    const [errors, setErrors] = useState<FieldErrors>({});
    const [busy, setBusy] = useState<'save' | 'remove' | null>(null);

    const submit = async (payload: ProfileChanges, kind: 'save' | 'remove') => {
        setBusy(kind);
        const failed = await saveProfile(payload);
        setBusy(null);

        if (failed) {
            setErrors(failed);

            return;
        }

        toast(kind === 'save' ? 'Your details have been saved.' : 'Removed.');
        goBack(BACK);
    };

    const clear = (field: string) =>
        setErrors((current) => ({ ...current, [field]: '', form: '' }));

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <TopBar title={title} fallback={BACK} />
            <form
                noValidate
                className="flex flex-1 flex-col"
                onSubmit={(event) => {
                    event.preventDefault();
                    const found = check?.() ?? {};

                    if (Object.values(found).some(Boolean)) {
                        setErrors(found);

                        return;
                    }

                    void submit(changes(), 'save');
                }}
            >
                <main className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6">
                    {intro && (
                        <p className="st-body2 text-st-text-alt">{intro}</p>
                    )}
                    {children(errors, clear)}
                    {errors.form && (
                        <p role="alert" className="st-body2 text-st-danger">
                            {errors.form}
                        </p>
                    )}
                </main>
                <SheetFooter className="sticky bottom-0 flex flex-col gap-2 pb-3">
                    <Button
                        type="submit"
                        className="w-full"
                        loading={busy === 'save'}
                    >
                        Save
                    </Button>
                    {onRemove && (
                        <Button
                            variant="outlineDanger"
                            className="w-full"
                            loading={busy === 'remove'}
                            onClick={() => void submit(onRemove, 'remove')}
                        >
                            Remove
                        </Button>
                    )}
                </SheetFooter>
            </form>
        </div>
    );
}

function required(value: string, message: string): string {
    return value.trim() ? '' : message;
}

function NameForm({ account }: { account: AccountDetails }) {
    const [first, setFirst] = useState(account.firstName);
    const [last, setLast] = useState(account.lastName);

    return (
        <EditForm
            title="Name"
            intro="Make sure this matches the name on your ID."
            changes={() => ({
                first_name: first.trim(),
                last_name: last.trim(),
            })}
            check={() => ({
                first_name: required(first, 'Enter your first name.'),
                last_name: required(last, 'Enter your last name.'),
            })}
        >
            {(errors, clear) => (
                <>
                    <TextField
                        id="first-name"
                        label="First name(s)"
                        autoComplete="given-name"
                        value={first}
                        error={errors.first_name || null}
                        onChange={(value) => {
                            setFirst(value);
                            clear('first_name');
                        }}
                    />
                    <TextField
                        id="last-name"
                        label="Last name(s)"
                        autoComplete="family-name"
                        value={last}
                        error={errors.last_name || null}
                        onChange={(value) => {
                            setLast(value);
                            clear('last_name');
                        }}
                    />
                </>
            )}
        </EditForm>
    );
}

function GenderForm({ account }: { account: AccountDetails }) {
    const [gender, setGender] = useState<Gender | null>(account.gender);

    return (
        <EditForm title="Gender" changes={() => ({ gender })}>
            {(errors) => (
                <fieldset className="flex flex-col">
                    <legend className="sr-only">Gender</legend>
                    {(Object.keys(GENDER_LABELS) as Gender[]).map((option) => (
                        <label
                            key={option}
                            className="flex min-h-14 cursor-pointer items-center justify-between gap-3 border-b border-st-border-soft st-body1"
                        >
                            {GENDER_LABELS[option]}
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === option}
                                onChange={() => setGender(option)}
                                className="size-5 shrink-0 accent-st-action"
                            />
                        </label>
                    ))}
                    {errors.gender && (
                        <p className="pt-2 st-small1 text-st-danger">
                            {errors.gender}
                        </p>
                    )}
                </fieldset>
            )}
        </EditForm>
    );
}

function DateOfBirthForm({ account }: { account: AccountDetails }) {
    const [date, setDate] = useState(account.dateOfBirth ?? '');

    return (
        <EditForm
            title="Date of birth"
            intro="Some properties need this to confirm your age at check-in."
            changes={() => ({ date_of_birth: date })}
            check={() => ({
                date_of_birth: required(date, 'Enter your date of birth.'),
            })}
            onRemove={account.dateOfBirth ? { date_of_birth: null } : undefined}
        >
            {(errors, clear) => (
                <TextField
                    id="date-of-birth"
                    label="Date of birth"
                    type="date"
                    autoComplete="bday"
                    min="1900-01-02"
                    max={todayIso()}
                    value={date}
                    error={errors.date_of_birth || null}
                    onChange={(value) => {
                        setDate(value);
                        clear('date_of_birth');
                    }}
                />
            )}
        </EditForm>
    );
}

function PassportForm({ account }: { account: AccountDetails }) {
    const [number, setNumber] = useState('');
    const [country, setCountry] = useState(account.passport?.country ?? '');
    const [expires, setExpires] = useState(account.passport?.expiresOn ?? '');

    return (
        <EditForm
            title="Passport details"
            intro={
                account.passport
                    ? `Saved passport ending ${account.passport.lastDigits}. Enter the number again to replace it.`
                    : 'Save your passport to check in faster where properties ask for it. Only the last 3 digits are ever shown.'
            }
            changes={() => ({
                passport_number: number.replace(/\s/g, '').toUpperCase(),
                passport_country: country,
                passport_expires_on: expires,
            })}
            check={() => ({
                passport_number: /^[A-Za-z0-9]{6,12}$/.test(
                    number.replace(/\s/g, ''),
                )
                    ? ''
                    : 'Enter the 6 to 12 letters and numbers of your passport number.',
                passport_country: required(
                    country,
                    'Select the issuing country.',
                ),
                passport_expires_on: required(
                    expires,
                    'Enter the expiry date.',
                ),
            })}
            onRemove={
                account.passport
                    ? {
                          passport_number: null,
                          passport_country: null,
                          passport_expires_on: null,
                      }
                    : undefined
            }
        >
            {(errors, clear) => (
                <>
                    <TextField
                        id="passport-number"
                        label="Passport number"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        value={number}
                        error={errors.passport_number || null}
                        onChange={(value) => {
                            setNumber(value);
                            clear('passport_number');
                        }}
                    />
                    <SelectField
                        id="passport-country"
                        label="Issuing country"
                        value={country}
                        error={errors.passport_country || null}
                        onChange={(event) => {
                            setCountry(event.target.value);
                            clear('passport_country');
                        }}
                    >
                        <CountryOptions placeholder="Select a country" />
                    </SelectField>
                    <TextField
                        id="passport-expiry"
                        label="Expiry date"
                        type="date"
                        min={todayIso()}
                        value={expires}
                        error={errors.passport_expires_on || null}
                        onChange={(value) => {
                            setExpires(value);
                            clear('passport_expires_on');
                        }}
                    />
                </>
            )}
        </EditForm>
    );
}

function EmailScreen({ account }: { account: AccountDetails }) {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Email address" fallback={BACK} />
            <main className="flex flex-col gap-3 px-4 pt-4">
                <p className="st-emphasized1 break-words">{account.email}</p>
                {account.emailVerified && (
                    <p>
                        <span className="inline-block rounded-st-sm border border-st-success px-1.5 st-body2 text-st-success">
                            Verified
                        </span>
                    </p>
                )}
                <p className="st-body2 text-st-text-alt">
                    This is the email address you use to sign in, so changing it
                    needs a verification step. That step isn't part of this
                    prototype yet.
                </p>
            </main>
        </div>
    );
}

function PhoneForm({ account }: { account: AccountDetails }) {
    const initial = account.phone ? splitPhone(account.phone) : null;
    const [dial, setDial] = useState(initial?.dial ?? '+44');
    const [number, setNumber] = useState(initial?.number ?? '');
    // A leading 0 is the national trunk prefix, which isn't dialled after a country code.
    const full = () => `${dial}${number.replace(/\D/g, '').replace(/^0+/, '')}`;

    return (
        <EditForm
            title="Phone number"
            intro="Properties or attractions will use this number if they need to contact you."
            changes={() => ({ phone: full() })}
            check={() => ({
                phone: /^\+[1-9]\d{6,14}$/.test(full())
                    ? ''
                    : 'Enter a valid phone number.',
            })}
            onRemove={account.phone ? { phone: null } : undefined}
        >
            {(errors, clear) => (
                <div className="flex gap-2">
                    <div className="w-32 shrink-0">
                        <SelectField
                            id="phone-country"
                            label="Country code"
                            value={dial}
                            error={null}
                            onChange={(event) => setDial(event.target.value)}
                        >
                            {/* Codes shared by several countries are listed once. */}
                            {COUNTRIES.filter(
                                (country, index) =>
                                    COUNTRIES.findIndex(
                                        (other) => other.dial === country.dial,
                                    ) === index,
                            ).map(({ name, dial: code, flag }) => (
                                <option key={code} value={code}>
                                    {flag} {code} {name}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                    <div className="min-w-0 flex-1">
                        <TextField
                            id="phone-number"
                            label="Phone number"
                            type="tel"
                            autoComplete="tel-national"
                            value={number}
                            error={errors.phone || null}
                            onChange={(value) => {
                                setNumber(value);
                                clear('phone');
                            }}
                        />
                    </div>
                </div>
            )}
        </EditForm>
    );
}

function AddressForm({ account }: { account: AccountDetails }) {
    const [line, setLine] = useState(account.address?.line ?? '');
    const [city, setCity] = useState(account.address?.city ?? '');
    const [postcode, setPostcode] = useState(account.address?.postcode ?? '');
    const [country, setCountry] = useState(
        account.address?.country ?? 'United Kingdom',
    );

    return (
        <EditForm
            title="Address"
            changes={() => ({
                address_line: line.trim(),
                address_city: city.trim(),
                address_postcode: postcode.trim().toUpperCase(),
                address_country: country,
            })}
            check={() => ({
                address_line: required(line, 'Enter your street address.'),
                address_city: required(city, 'Enter your town or city.'),
                address_country: required(country, 'Select your country.'),
            })}
            onRemove={
                account.address
                    ? {
                          address_line: null,
                          address_city: null,
                          address_postcode: null,
                          address_country: null,
                      }
                    : undefined
            }
        >
            {(errors, clear) => (
                <>
                    <TextField
                        id="address-line"
                        label="Street address"
                        autoComplete="street-address"
                        value={line}
                        error={errors.address_line || null}
                        onChange={(value) => {
                            setLine(value);
                            clear('address_line');
                        }}
                    />
                    <TextField
                        id="address-city"
                        label="Town or city"
                        autoComplete="address-level2"
                        value={city}
                        error={errors.address_city || null}
                        onChange={(value) => {
                            setCity(value);
                            clear('address_city');
                        }}
                    />
                    <TextField
                        id="address-postcode"
                        label="Postcode"
                        autoComplete="postal-code"
                        value={postcode}
                        error={errors.address_postcode || null}
                        onChange={(value) => {
                            setPostcode(value);
                            clear('address_postcode');
                        }}
                    />
                    <SelectField
                        id="address-country"
                        label="Country"
                        autoComplete="country-name"
                        value={country}
                        error={errors.address_country || null}
                        onChange={(event) => {
                            setCountry(event.target.value);
                            clear('address_country');
                        }}
                    >
                        <CountryOptions placeholder="Select a country" />
                    </SelectField>
                </>
            )}
        </EditForm>
    );
}

function DisplayNameForm({ account }: { account: AccountDetails }) {
    const [name, setName] = useState(account.displayName ?? '');

    return (
        <EditForm
            title="Display name"
            intro="Shown next to reviews you write instead of your full name."
            changes={() => ({ display_name: name.trim() })}
            check={() => ({
                display_name: required(name, 'Enter a display name.'),
            })}
            onRemove={account.displayName ? { display_name: null } : undefined}
        >
            {(errors, clear) => (
                <TextField
                    id="display-name"
                    label="Display name"
                    autoComplete="nickname"
                    maxLength={40}
                    value={name}
                    error={errors.display_name || null}
                    onChange={(value) => {
                        setName(value);
                        clear('display_name');
                    }}
                />
            )}
        </EditForm>
    );
}

function NationalityForm({ account }: { account: AccountDetails }) {
    const [nationality, setNationality] = useState(account.nationality ?? '');

    return (
        <EditForm
            title="Nationality"
            changes={() => ({ nationality })}
            check={() => ({
                nationality: required(nationality, 'Select your nationality.'),
            })}
            onRemove={account.nationality ? { nationality: null } : undefined}
        >
            {(errors, clear) => (
                <SelectField
                    id="nationality"
                    label="Nationality"
                    value={nationality}
                    error={errors.nationality || null}
                    onChange={(event) => {
                        setNationality(event.target.value);
                        clear('nationality');
                    }}
                >
                    <CountryOptions placeholder="Select your nationality" />
                </SelectField>
            )}
        </EditForm>
    );
}

function PhotoScreen({ account }: { account: AccountDetails }) {
    const { savePhoto } = useStore();
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const save = async (photo: File | null) => {
        setBusy(photo ? 'upload' : 'remove');
        setError(null);
        const failed = await savePhoto(photo);
        setBusy(null);

        if (failed) {
            setError(Object.values(failed)[0] ?? null);

            return;
        }

        toast(photo ? 'Profile picture updated.' : 'Profile picture removed.');
    };

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <TopBar title="Profile picture" fallback={BACK} />
            <main className="flex flex-1 flex-col items-center gap-4 px-4 pt-8">
                <Avatar
                    key={account.avatarUrl}
                    firstName={account.firstName}
                    lastName={account.lastName}
                    url={account.avatarUrl}
                    className="size-36 st-headline1"
                />
                <p className="text-center st-body2 text-st-text-alt">
                    Shown next to reviews you write. Use a JPG, PNG or WebP
                    photo up to 5 MB.
                </p>
                {error && (
                    <p role="alert" className="st-body2 text-st-danger">
                        {error}
                    </p>
                )}
                <input
                    ref={input}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';

                        if (file) {
                            void save(file);
                        }
                    }}
                />
            </main>
            <SheetFooter className="sticky bottom-0 flex flex-col gap-2 pb-3">
                <Button
                    className="w-full"
                    loading={busy === 'upload'}
                    onClick={() => input.current?.click()}
                >
                    {account.avatarUrl ? 'Choose a new photo' : 'Add a photo'}
                </Button>
                {account.avatarUrl && (
                    <Button
                        variant="outlineDanger"
                        className="w-full"
                        loading={busy === 'remove'}
                        onClick={() => void save(null)}
                    >
                        Remove photo
                    </Button>
                )}
            </SheetFooter>
        </div>
    );
}

const EDITORS: Record<
    string,
    (props: { account: AccountDetails }) => ReactNode
> = {
    name: NameForm,
    gender: GenderForm,
    'date-of-birth': DateOfBirthForm,
    passport: PassportForm,
    email: EmailScreen,
    phone: PhoneForm,
    address: AddressForm,
    'display-name': DisplayNameForm,
    nationality: NationalityForm,
    photo: PhotoScreen,
};

export function EditProfileScreen({ field }: { field?: string }) {
    const { account } = useStore();
    const Editor = EDITORS[field ?? ''];

    if (!Editor) {
        return (
            <div className="min-h-full bg-st-surface">
                <TopBar title="Personal details" fallback={BACK} />
                <p className="p-4 st-body2 text-st-text-alt">
                    We can't find that detail.
                </p>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="min-h-full bg-st-surface">
                <TopBar title="Personal details" fallback={BACK} />
                <AccountGate>{() => null}</AccountGate>
            </div>
        );
    }

    return <Editor account={account} />;
}
