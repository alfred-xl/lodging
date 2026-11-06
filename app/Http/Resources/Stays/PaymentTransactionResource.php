<?php

namespace App\Http\Resources\Stays;

use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PaymentTransaction
 */
class PaymentTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'description' => $this->description,
            'card_brand' => $this->card_brand,
            'card_last_four' => $this->card_last_four,
            'amount_minor' => $this->amount_minor,
            'currency' => $this->currency,
            'status' => $this->status,
            'processed_on' => $this->processed_at->toDateString(),
            // Local UK time without an offset, so the app shows it as recorded.
            'processed_at' => $this->processed_at->format('Y-m-d\TH:i'),
        ];
    }
}
