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
        Schema::table('properties', function (Blueprint $table) {
            $table->string('country')->default('United Kingdom')->after('city');
            $table->string('area')->nullable()->after('country');
            $table->unsignedSmallInteger('position')->default(0)->after('area');
            $table->boolean('listed')->default(true)->after('position');
            $table->string('type')->default('Hotel');
            $table->unsignedTinyInteger('stars')->default(0);
            $table->boolean('preferred')->default(false);
            $table->decimal('review_score', 3, 1)->nullable();
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('nightly_price_minor')->nullable();
            $table->unsignedInteger('original_price_minor')->nullable();
            $table->string('currency', 3)->default('GBP');
            $table->string('deal')->nullable();
            $table->decimal('tax_rate', 4, 3)->default(0);
            $table->unsignedTinyInteger('left_at_price')->nullable();
            $table->decimal('distance_km', 4, 1)->nullable();
            $table->json('features')->nullable();
            $table->text('description')->nullable();

            $table->index(['listed', 'city']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['listed', 'city']);
            $table->dropColumn([
                'country', 'area', 'position', 'listed', 'type', 'stars', 'preferred', 'review_score',
                'review_count', 'nightly_price_minor', 'original_price_minor', 'currency', 'deal',
                'tax_rate', 'left_at_price', 'distance_km', 'features', 'description',
            ]);
        });
    }
};
