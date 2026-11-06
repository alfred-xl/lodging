<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use Database\Factories\PaymentTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $booking_id
 * @property string $category
 * @property string $description
 * @property string $card_brand
 * @property string $card_last_four
 * @property int $amount_minor
 * @property string $currency
 * @property TransactionStatus $status
 * @property Carbon $processed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Booking|null $booking
 */
#[Fillable([
    'user_id',
    'booking_id',
    'category',
    'description',
    'card_brand',
    'card_last_four',
    'amount_minor',
    'currency',
    'status',
    'processed_at',
])]
class PaymentTransaction extends Model
{
    /** @use HasFactory<PaymentTransactionFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TransactionStatus::class,
            'processed_at' => 'datetime',
        ];
    }

    /**
     * Get the user who paid.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the booking the payment was for.
     *
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
