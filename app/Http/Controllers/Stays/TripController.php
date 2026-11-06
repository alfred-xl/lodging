<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Http\Resources\Stays\AccountResource;
use App\Http\Resources\Stays\BookingResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TripController extends Controller
{
    /**
     * List the signed-in user's own bookings.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        return BookingResource::collection(
            $user->bookings()->with('property.images')->latest('check_in')->get(),
        )->additional(['user' => AccountResource::make($user)]);
    }
}
