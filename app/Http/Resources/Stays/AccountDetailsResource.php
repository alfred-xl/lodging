<?php

namespace App\Http\Resources\Stays;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * Everything the My account pages show. The passport number itself is never sent back.
 *
 * @mixin User
 */
class AccountDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...AccountResource::make($this->resource)->toArray($request),
            'email_verified' => $this->email_verified_at !== null,
            'display_name' => $this->display_name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'phone' => $this->phone,
            'nationality' => $this->nationality,
            'address' => $this->address_line ? [
                'line' => $this->address_line,
                'city' => $this->address_city,
                'postcode' => $this->address_postcode,
                'country' => $this->address_country,
            ] : null,
            'passport' => $this->passport_number ? [
                'last_digits' => Str::substr($this->passport_number, -3),
                'country' => $this->passport_country,
                'expires_on' => $this->passport_expires_on?->toDateString(),
            ] : null,
            'wallet' => [
                'credit_minor' => $this->wallet_credit_minor,
                'currency' => 'GBP',
            ],
            'cards' => PaymentCardResource::collection($this->whenLoaded('paymentCards')),
            'transactions' => PaymentTransactionResource::collection($this->whenLoaded('paymentTransactions')),
        ];
    }
}
