<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $inventoryService = app(InventoryService::class);

        $gayoNatural = Product::create([
            'name' => 'Gayo Natural',
            'sku' => 'JVL-GAYO-200',
            'origin' => 'Aceh Gayo',
            'roast_level' => 'medium',
            'description_id' => 'Kopi natural process dari Dataran Tinggi Gayo dengan karakter buah tropis.',
            'description_en' => 'Natural process coffee from the Gayo Highlands with tropical fruit character.',
            'price' => 85000,
            'weight' => '200g',
            'tasting_notes' => ['Strawberry', 'Dark Chocolate', 'Wine-like'],
            'type' => 'single-origin',
            'low_stock_threshold' => 1.2,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $inventoryService->receive(
            product: $gayoNatural,
            quantity: 4.8,
            note: 'Initial seed inventory',
            reference: 'seed:gayo-natural'
        );

        $floresBajawa = Product::create([
            'name' => 'Flores Bajawa',
            'sku' => 'JVL-FLORES-200',
            'origin' => 'Flores, NTT',
            'roast_level' => 'light',
            'description_id' => 'Arabika washed dengan profil cerah dan sweetness gula aren.',
            'description_en' => 'Washed Arabica with bright profile and brown sugar sweetness.',
            'price' => 80000,
            'weight' => '200g',
            'tasting_notes' => ['Citrus', 'Brown Sugar', 'Cedar'],
            'type' => 'single-origin',
            'low_stock_threshold' => 1.0,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $inventoryService->receive(
            product: $floresBajawa,
            quantity: 2.4,
            note: 'Initial seed inventory',
            reference: 'seed:flores-bajawa'
        );
    }
}
