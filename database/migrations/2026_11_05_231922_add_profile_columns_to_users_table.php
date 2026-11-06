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
        Schema::table('users', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('name');
            $table->string('gender')->nullable()->after('avatar_path');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('phone')->nullable()->after('date_of_birth');
            $table->string('nationality')->nullable()->after('phone');
            $table->string('address_line')->nullable()->after('nationality');
            $table->string('address_city')->nullable()->after('address_line');
            $table->string('address_postcode')->nullable()->after('address_city');
            $table->string('address_country')->nullable()->after('address_postcode');
            $table->text('passport_number')->nullable()->after('address_country');
            $table->string('passport_country')->nullable()->after('passport_number');
            $table->date('passport_expires_on')->nullable()->after('passport_country');
            $table->unsignedInteger('wallet_credit_minor')->default(0)->after('passport_expires_on');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'display_name',
                'gender',
                'date_of_birth',
                'phone',
                'nationality',
                'address_line',
                'address_city',
                'address_postcode',
                'address_country',
                'passport_number',
                'passport_country',
                'passport_expires_on',
                'wallet_credit_minor',
            ]);
        });
    }
};
