<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Http\Resources\Stays\AccountDetailsResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public const GENDERS = ['man', 'woman', 'non_binary', 'prefer_not_to_say'];

    /**
     * Show the signed-in user's profile, wallet, saved cards and payments.
     */
    public function show(Request $request): AccountDetailsResource
    {
        return self::details($request->user());
    }

    /**
     * Update the profile fields that were sent. Fields that weren't sent stay as they are.
     */
    public function update(Request $request): AccountDetailsResource
    {
        $validated = $request->validate([
            'first_name' => ['required_with:last_name', 'string', 'max:60'],
            'last_name' => ['required_with:first_name', 'string', 'max:60'],
            'display_name' => ['sometimes', 'nullable', 'string', 'max:40'],
            'gender' => ['sometimes', 'nullable', Rule::in(self::GENDERS)],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'after:1900-01-01', 'before:today'],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'nationality' => ['sometimes', 'nullable', 'string', 'max:60'],
            'address_line' => ['sometimes', 'nullable', 'string', 'max:120'],
            'address_city' => ['sometimes', 'nullable', 'required_with:address_line', 'string', 'max:60'],
            'address_postcode' => ['sometimes', 'nullable', 'string', 'max:12'],
            'address_country' => ['sometimes', 'nullable', 'required_with:address_line', 'string', 'max:60'],
            'passport_number' => ['sometimes', 'nullable', 'string', 'alpha_num:ascii', 'between:6,12'],
            'passport_country' => ['sometimes', 'nullable', 'required_with:passport_number', 'string', 'max:60'],
            'passport_expires_on' => ['sometimes', 'nullable', 'required_with:passport_number', 'date', 'after:today'],
        ], [
            'phone.regex' => 'Enter a phone number with its country code, like +447700900123.',
            'date_of_birth.before' => 'Your date of birth must be in the past.',
            'passport_expires_on.after' => 'This passport has expired. Enter one that is still valid.',
        ]);

        $user = $request->user();

        if (isset($validated['first_name'])) {
            $user->name = trim($validated['first_name']).' '.trim($validated['last_name']);
        }

        $user->fill(collect($validated)->except(['first_name', 'last_name'])->all())->save();

        return self::details($user);
    }

    /**
     * Load everything the account pages show, newest first.
     */
    public static function details(User $user): AccountDetailsResource
    {
        return AccountDetailsResource::make($user->load([
            'paymentCards' => fn ($query) => $query->latest('id'),
            'paymentTransactions' => fn ($query) => $query->latest('processed_at')->latest('id'),
        ]));
    }
}
