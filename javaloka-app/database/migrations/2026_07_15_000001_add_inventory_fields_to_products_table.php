<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable()->after('name');
            $table->unsignedInteger('stock')->default(0)->after('type');
            $table->unsignedInteger('reserved_stock')->default(0)->after('stock');
            $table->unsignedInteger('low_stock_threshold')->default(5)->after('reserved_stock');
            $table->boolean('is_active')->default(true)->after('low_stock_threshold');
        });

        DB::table('products')
            ->orderBy('id')
            ->get()
            ->each(function (object $product): void {
                if (! $product->sku) {
                    DB::table('products')
                        ->where('id', $product->id)
                        ->update([
                            'sku' => sprintf('PRD-%04d', $product->id),
                        ]);
                }
            });

        Schema::table('products', function (Blueprint $table) {
            $table->unique('sku');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropColumn([
                'sku',
                'stock',
                'reserved_stock',
                'low_stock_threshold',
                'is_active',
            ]);
        });
    }
};
