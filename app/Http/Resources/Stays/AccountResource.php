<?php

namespace App\Http\Resources\Stays;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @mixin User
 */
class AccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'first_name' => Str::before($this->name, ' '),
            'last_name' => Str::contains($this->name, ' ') ? Str::after($this->name, ' ') : '',
            'email' => $this->email,
            'avatar_url' => $this->avatar_path ? Storage::disk('public')->url($this->avatar_path) : null,
        ];
    }
}
