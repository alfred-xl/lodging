<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained();
            $table->string('reference')->unique();
            $table->string('status');
            $table->string('room_name');
            $table->string('rate');
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedTinyInteger('rooms')->default(1);
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);
            $table->string('guest_name');
            $table->string('contact_email');
            $table->string('benefits')->nullable();
            $table->unsignedInteger('total_minor');
            $table->char('currency', 3);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
