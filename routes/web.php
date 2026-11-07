<?php

use App\Http\Controllers\Stays\AccountController;
use App\Http\Controllers\Stays\AccountLookupController;
use App\Http\Controllers\Stays\AppIconController;
use App\Http\Controllers\Stays\AvatarController;
use App\Http\Controllers\Stays\ManifestController;
use App\Http\Controllers\Stays\PaymentCardController;
use App\Http\Controllers\Stays\PropertyController;
use App\Http\Controllers\Stays\SessionController;
use App\Http\Controllers\Stays\TripController;
use Illuminate\Support\Facades\Route;

// The booking app is the whole site. Old /stays links still work.
Route::view('/', 'stays')->name('home');
Route::redirect('stays', '/')->name('stays');
Route::get('manifest.webmanifest', ManifestController::class)->name('stays.manifest');
Route::get('favicon.svg', [AppIconController::class, 'svg'])->name('app-icon.svg');
Route::get('favicon.ico', [AppIconController::class, 'ico'])->name('app-icon.ico');
Route::get('apple-touch-icon.png', [AppIconController::class, 'png'])->name('app-icon.apple');
Route::get('app-icon-{size}.png', [AppIconController::class, 'png'])->whereNumber('size')->name('app-icon.png');
Route::get('stays/session', [SessionController::class, 'show'])->name('stays.session.show');
Route::post('stays/session', [SessionController::class, 'store'])->name('stays.session.store');
Route::delete('stays/session', [SessionController::class, 'destroy'])->name('stays.session.destroy');
Route::post('stays/account-lookups', [AccountLookupController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('stays.account-lookups.store');
Route::get('stays/properties', [PropertyController::class, 'index'])->name('stays.properties.index');
Route::get('stays/trips', [TripController::class, 'index'])
    ->middleware('auth')
    ->name('stays.trips.index');
Route::middleware('auth')->prefix('stays/account')->name('stays.account.')->group(function () {
    Route::get('/', [AccountController::class, 'show'])->name('show');
    Route::patch('/', [AccountController::class, 'update'])->name('update');
    Route::post('avatar', [AvatarController::class, 'store'])->name('avatar.store');
    Route::delete('avatar', [AvatarController::class, 'destroy'])->name('avatar.destroy');
    Route::post('cards', [PaymentCardController::class, 'store'])->name('cards.store');
    Route::delete('cards/{card}', [PaymentCardController::class, 'destroy'])->whereNumber('card')->name('cards.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
