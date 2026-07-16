<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $appends = [
        'available_stock',
        'inventory_status',
    ];

    protected $fillable = [
        'name',
        'sku',
        'origin',
        'roast_level',
        'description_id',
        'description_en',
        'price',
        'weight',
        'tasting_notes',
        'image_path',
        'type',
        'stock',
        'reserved_stock',
        'low_stock_threshold',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'tasting_notes' => 'array',
        'price' => 'float',
        'stock' => 'float',
        'reserved_stock' => 'float',
        'low_stock_threshold' => 'float',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getAvailableStockAttribute(): float
    {
        return max(round((float) $this->stock - (float) $this->reserved_stock, 2), 0);
    }

    public function getInventoryStatusAttribute(): string
    {
        if (! $this->is_active) {
            return 'inactive';
        }

        if ($this->available_stock <= 0) {
            return 'out_of_stock';
        }

        if ($this->available_stock <= (float) $this->low_stock_threshold) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
