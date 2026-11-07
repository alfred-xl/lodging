<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportMessageController extends Controller
{
    /**
     * Save a message for Customer Service. Signed-in accounts send from their own email.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'email' => [$user ? 'nullable' : 'required', 'email', 'max:255'],
        ], [
            'message.required' => 'Write a message before sending.',
            'message.max' => 'Keep your message under 2,000 characters.',
        ]);

        $message = SupportMessage::query()->create([
            'user_id' => $user?->id,
            'email' => $user?->email ?? $validated['email'],
            'message' => trim($validated['message']),
        ]);

        return response()->json(['data' => [
            'id' => $message->id,
            'email' => $message->email,
        ]], 201);
    }
}
