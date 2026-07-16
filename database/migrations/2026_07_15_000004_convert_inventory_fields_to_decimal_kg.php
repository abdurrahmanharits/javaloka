<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('stock', 10, 2)->default(0)->change();
            $table->decimal('reserved_stock', 10, 2)->default(0)->change();
            $table->decimal('low_stock_threshold', 10, 2)->default(5)->change();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
            $table->decimal('stock_before', 10, 2)->change();
            $table->decimal('stock_after', 10, 2)->change();
            $table->decimal('reserved_before', 10, 2)->default(0)->change();
            $table->decimal('reserved_after', 10, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('stock')->default(0)->change();
            $table->unsignedInteger('reserved_stock')->default(0)->change();
            $table->unsignedInteger('low_stock_threshold')->default(5)->change();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->change();
            $table->unsignedInteger('stock_before')->change();
            $table->unsignedInteger('stock_after')->change();
            $table->unsignedInteger('reserved_before')->default(0)->change();
            $table->unsignedInteger('reserved_after')->default(0)->change();
        });
    }
};
