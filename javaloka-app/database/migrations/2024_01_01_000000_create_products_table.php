<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('origin');
            $table->string('roast_level'); // light, medium, dark
            $table->text('description_id');
            $table->text('description_en');
            $table->decimal('price', 15, 2);
            $table->string('weight'); // e.g., "200g"
            $table->json('tasting_notes'); // Simpan sebagai array JSON
            $table->string('image_path')->nullable();
            $table->string('type')->default('single-origin'); // single-origin, blend
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};