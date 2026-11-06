<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Http\Resources\Stays\AccountDetailsResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    /**
     * Replace the signed-in user's profile photo.
     */
    public function store(Request $request): AccountDetailsResource
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'photo.max' => 'Choose a photo smaller than 5 MB.',
        ]);

        $user = $request->user();
        $previous = $user->avatar_path;

        $user->forceFill(['avatar_path' => $request->file('photo')->store('avatars', 'public')])->save();

        if ($previous) {
            Storage::disk('public')->delete($previous);
        }

        return AccountController::details($user);
    }

    /**
     * Remove the signed-in user's profile photo.
     */
    public function destroy(Request $request): AccountDetailsResource
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->forceFill(['avatar_path' => null])->save();
        }

        return AccountController::details($user);
    }
}
