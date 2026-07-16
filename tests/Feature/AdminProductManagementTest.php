<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_product_with_initial_stock(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)->post(route('admin.products.store'), [
            'name' => 'Toraja Kalosi',
            'sku' => 'JVL-TORAJA-200',
            'origin' => 'Toraja',
            'roast_level' => 'dark',
            'type' => 'single-origin',
            'price' => 92000,
            'weight' => '200g',
            'description_id' => 'Deskripsi Indonesia.',
            'description_en' => 'English description.',
            'tasting_notes' => 'Chocolate, Spice, Earthy',
            'image_path' => '/assets/images/toraja.jpg',
            'stock' => 15.5,
            'low_stock_threshold' => 4.25,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response->assertRedirect();

        $product = Product::firstOrFail();

        $this->assertSame('JVL-TORAJA-200', $product->sku);
        $this->assertEquals(15.5, $product->stock);
        $this->assertTrue($product->is_featured);
        $this->assertSame(['Chocolate', 'Spice', 'Earthy'], $product->tasting_notes);
        $movement = $product->stockMovements()->firstOrFail();

        $this->assertSame('stock_in', $movement->type);
        $this->assertEquals(15.5, $movement->stock_after);
    }

    public function test_admin_can_update_and_delete_product_catalog_entry(): void
    {
        $admin = $this->makeAdmin();
        $product = Product::create([
            'name' => 'Old Product',
            'sku' => 'OLD-001',
            'origin' => 'Old Origin',
            'roast_level' => 'medium',
            'description_id' => 'Lama',
            'description_en' => 'Old',
            'price' => 75000,
            'weight' => '200g',
            'tasting_notes' => ['Chocolate'],
            'type' => 'single-origin',
            'stock' => 0,
            'reserved_stock' => 0,
            'low_stock_threshold' => 5,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($admin)->put(route('admin.products.update', $product), [
            'name' => 'Updated Product',
            'sku' => 'UPDATED-001',
            'origin' => 'Updated Origin',
            'roast_level' => 'light',
            'type' => 'blend',
            'price' => 81000,
            'weight' => '500g',
            'description_id' => 'Baru',
            'description_en' => 'New',
            'tasting_notes' => 'Floral, Citrus',
            'image_path' => '',
            'stock' => 0,
            'low_stock_threshold' => 3.5,
            'is_active' => false,
            'is_featured' => true,
        ])->assertRedirect();

        $product->refresh();

        $this->assertSame('Updated Product', $product->name);
        $this->assertSame('UPDATED-001', $product->sku);
        $this->assertSame('500g', $product->weight);
        $this->assertTrue($product->is_featured);
        $this->assertSame(['Floral', 'Citrus'], $product->tasting_notes);
        $this->assertFalse($product->is_active);

        $this->actingAs($admin)
            ->delete(route('admin.products.destroy', $product))
            ->assertRedirect();

        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    }

    protected function makeAdmin(): User
    {
        return User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);
    }
}
