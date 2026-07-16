<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Throwable;

class ProductCatalog
{
    public static function active(): Collection
    {
        return static::safeQuery(fn (): Collection => Product::query()
            ->where('is_active', true)
            ->latest()
            ->get());
    }

    public static function featured(): Collection
    {
        return static::safeQuery(fn (): Collection => Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->get());
    }

    protected static function safeQuery(callable $resolver): Collection
    {
        try {
            if (! Schema::hasTable('products')) {
                return collect();
            }

            return $resolver();
        } catch (Throwable) {
            return collect();
        }
    }
}
