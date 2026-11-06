<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Http\Resources\Stays\AccountDetailsResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PaymentCardController extends Controller
{
    public const BRANDS = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Maestro'];

    private const MAX_CARDS = 10;

    /**
     * Save a card. The app sends only the brand, last four digits and expiry, never the number.
     */
    public function store(Request $request): AccountDetailsResource
    {
        $validated = $request->validate([
            'brand' => ['required', Rule::in(self::BRANDS)],
            'last_four' => ['required', 'digits:4'],
            'exp_month' => ['required', 'integer', 'between:1,12'],
            'exp_year' => ['required', 'integer', 'between:'.now()->year.','.(now()->year + 20)],
            'holder_name' => ['nullable', 'string', 'max:80'],
        ]);

        $user = $request->user();

        if (now()->startOfMonth()->greaterThan(now()->setDate($validated['exp_year'], $validated['exp_month'], 1))) {
            throw ValidationException::withMessages(['exp_month' => 'This card has expired.']);
        }

        if ($user->paymentCards()->count() >= self::MAX_CARDS) {
            throw ValidationException::withMessages(['brand' => 'You can save up to '.self::MAX_CARDS.' cards. Remove one first.']);
        }

        $user->paymentCards()->create($validated);

        return AccountController::details($user);
    }

    /**
     * Remove one of the signed-in user's own cards.
     */
    public function destroy(Request $request, int $card): AccountDetailsResource
    {
        $user = $request->user();

        $user->paymentCards()->findOrFail($card)->delete();

        return AccountController::details($user);
    }
}
