<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountLookupController extends Controller
{
    /**
     * Tell the sign-in flow whether an email address already has an account.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);

        return response()->json([
            'exists' => User::query()->where('email', $validated['email'])->exists(),
        ]);
    }
}
