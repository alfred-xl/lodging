<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Active = 'active';
    case Past = 'past';
    case Cancelled = 'cancelled';
}
