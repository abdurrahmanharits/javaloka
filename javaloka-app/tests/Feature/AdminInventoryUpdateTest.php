<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInventoryUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_inventory_update_records_adjustment_and_updates_threshold(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $product = Product::create([
            'name' => 'Inventory Product',
            'sku' => 'INV-PRODUCT-001',
            'origin' => 'Bandung',
            'roast_level' => 'medium',
            'description_id' => 'Deskripsi inventaris.',
            'description_en' => 'Inventory description.',
            'price' => 70000,
            'weight' => '200g',
            'tasting_notes' => ['Cocoa'],
            'type' => 'single-origin',
            'stock' => 5.5,
            'reserved_stock' => 0,
            'low_stock_threshold' => 2.25,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch(route('admin.products.inventory.update', $product), [
            'stock' => 14.75,
            'low_stock_threshold' => 4.5,
            'is_active' => false,
            'note' => 'Cycle count correction',
        ]);

        $response->assertRedirect();

        $product->refresh();

        $this->assertEquals(14.75, $product->stock);
        $this->assertEquals(4.5, $product->low_stock_threshold);
        $this->assertFalse($product->is_active);
        $movement = $product->stockMovements()->latest()->firstOrFail();

        $this->assertSame('adjusted', $movement->type);
        $this->assertEquals(5.5, $movement->stock_before);
        $this->assertEquals(14.75, $movement->stock_after);
        $this->assertSame('Cycle count correction', $movement->note);
    }
}
