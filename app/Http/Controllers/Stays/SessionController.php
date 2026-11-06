<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Http\Resources\Stays\AccountResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    /**
     * Show who is signed in. Calling it also refreshes the CSRF cookie before signing in.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(['user' => $user ? AccountResource::make($user) : null]);
    }

    /**
     * Sign in to the app, replacing any account already signed in on this browser.
     */
    public function store(Request $request): AccountResource
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = 'stays-login|'.Str::lower($validated['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'email' => 'Too many attempts. Wait '.RateLimiter::availableIn($throttleKey).' seconds, then try again.',
            ])->status(429);
        }

        $credentials = ['email' => $validated['email'], 'password' => $validated['password']];

        if (! Auth::validate($credentials)) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => "That password isn't right. Check it and try again, or use Forgot your password.",
            ]);
        }

        $user = User::query()->where('email', $validated['email'])->sole();

        // Signing in here must not skip a second factor the account has turned on.
        if ($user->two_factor_confirmed_at !== null) {
            throw ValidationException::withMessages([
                'email' => "This account uses two-factor authentication, which the app doesn't support yet.",
            ]);
        }

        RateLimiter::clear($throttleKey);

        Auth::guard('web')->logout();
        Auth::guard('web')->login($user, remember: true);
        $request->session()->regenerate();

        return AccountResource::make($user);
    }

    /**
     * Sign out of the app.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
