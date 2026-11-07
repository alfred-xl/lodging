<?php

namespace App\Models;

use Database\Factories\SupportMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A message sent to Customer Service from the Help Centre.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $email
 * @property string $message
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 */
#[Fillable(['user_id', 'email', 'message'])]
class SupportMessage extends Model
{
    /** @use HasFactory<SupportMessageFactory> */
    use HasFactory;

    /**
     * Get the account that sent the message, if they were signed in.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
