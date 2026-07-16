<?php

namespace Tests\Feature;

use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class InventoryServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_tracks_stock_receipt_reservation_release_and_fulfillment(): void
    {
        $service = app(InventoryService::class);
        $product = $this->makeProduct();

        $service->receive($product, 20.5, 'Initial stock', 'test:receive');
        $product->refresh();

        $this->assertEquals(20.5, $product->stock);
        $this->assertEquals(0.0, $product->reserved_stock);
        $this->assertEquals(20.5, $product->available_stock);

        $service->reserve($product, 5.25, 'Reserve for wholesale lead', 'test:reserve');
        $product->refresh();

        $this->assertEquals(20.5, $product->stock);
        $this->assertEquals(5.25, $product->reserved_stock);
        $this->assertEquals(15.25, $product->available_stock);

        $service->release($product, 2.1, 'Lead cancelled', 'test:release');
        $product->refresh();

        $this->assertEquals(3.15, $product->reserved_stock);
        $this->assertEquals(17.35, $product->available_stock);

        $service->fulfill($product, 3.15, 'Wholesale order shipped', 'test:fulfill');
        $product->refresh();

        $this->assertEquals(17.35, $product->stock);
        $this->assertEquals(0.0, $product->reserved_stock);
        $this->assertEquals(17.35, $product->available_stock);
        $this->assertCount(4, $product->stockMovements);
    }

    public function test_it_prevents_reserving_more_than_available_stock(): void
    {
        $this->expectException(InsufficientStockException::class);

        $service = app(InventoryService::class);
        $product = $this->makeProduct();

        $service->receive($product, 4.5, 'Initial stock');
        $service->reserve($product, 6, 'Too much reservation');
    }

    public function test_it_prevents_adjusting_stock_below_reserved_units(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $service = app(InventoryService::class);
        $product = $this->makeProduct();

        $service->receive($product, 10.5, 'Initial stock');
        $service->reserve($product, 4.75, 'Reserve stock');
        $service->adjustStock($product, 2.25, 'Broken count');
    }

    protected function makeProduct(): Product
    {
        return Product::create([
            'name' => 'Test Product',
            'sku' => 'TEST-PRODUCT-001',
            'origin' => 'Test Origin',
            'roast_level' => 'medium',
            'description_id' => 'Deskripsi uji.',
            'description_en' => 'Test description.',
            'price' => 50000,
            'weight' => '200g',
            'tasting_notes' => ['Chocolate'],
            'type' => 'single-origin',
            'stock' => 0,
            'reserved_stock' => 0,
            'low_stock_threshold' => 3,
            'is_active' => true,
        ]);
    }
}
