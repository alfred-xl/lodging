<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $display_name
 * @property string|null $avatar_path
 * @property string|null $gender
 * @property Carbon|null $date_of_birth
 * @property string|null $phone
 * @property string|null $nationality
 * @property string|null $address_line
 * @property string|null $address_city
 * @property string|null $address_postcode
 * @property string|null $address_country
 * @property string|null $passport_number
 * @property string|null $passport_country
 * @property Carbon|null $passport_expires_on
 * @property int $wallet_credit_minor
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'password',
    'display_name',
    'gender',
    'date_of_birth',
    'phone',
    'nationality',
    'address_line',
    'address_city',
    'address_postcode',
    'address_country',
    'passport_number',
    'passport_country',
    'passport_expires_on',
])]
#[Hidden(['password', 'passport_number', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'date_of_birth' => 'date',
            'passport_number' => 'encrypted',
            'passport_expires_on' => 'date',
            'wallet_credit_minor' => 'integer',
        ];
    }

    /**
     * Get the bookings made by the user.
     *
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the payment cards the user has saved.
     *
     * @return HasMany<PaymentCard, $this>
     */
    public function paymentCards(): HasMany
    {
        return $this->hasMany(PaymentCard::class);
    }

    /**
     * Get the payments the user has made.
     *
     * @return HasMany<PaymentTransaction, $this>
     */
    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
