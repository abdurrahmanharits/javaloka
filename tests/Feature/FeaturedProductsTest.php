<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class FeaturedProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_receives_only_active_featured_products(): void
    {
        $featured = Product::create([
            'name' => 'Featured Product',
            'sku' => 'FEATURED-001',
            'origin' => 'Aceh',
            'roast_level' => 'medium',
            'description_id' => 'Deskripsi featured.',
            'description_en' => 'Featured description.',
            'price' => 85000,
            'weight' => '200g',
            'tasting_notes' => ['Chocolate'],
            'type' => 'single-origin',
            'stock' => 3.5,
            'reserved_stock' => 0,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => true,
        ]);

        Product::create([
            'name' => 'Inactive Featured',
            'sku' => 'FEATURED-002',
            'origin' => 'Toraja',
            'roast_level' => 'dark',
            'description_id' => 'Deskripsi inactive.',
            'description_en' => 'Inactive description.',
            'price' => 90000,
            'weight' => '500g',
            'tasting_notes' => ['Spice'],
            'type' => 'single-origin',
            'stock' => 2,
            'reserved_stock' => 0,
            'low_stock_threshold' => 1,
            'is_active' => false,
            'is_featured' => true,
        ]);

        Product::create([
            'name' => 'Active Regular',
            'sku' => 'REGULAR-001',
            'origin' => 'Flores',
            'roast_level' => 'light',
            'description_id' => 'Deskripsi regular.',
            'description_en' => 'Regular description.',
            'price' => 78000,
            'weight' => '200g',
            'tasting_notes' => ['Citrus'],
            'type' => 'single-origin',
            'stock' => 4,
            'reserved_stock' => 0,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $response = $this
            ->withHeaders($this->inertiaHeaders())
            ->get(route('home'));

        $response
            ->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonCount(1, 'props.featuredProducts')
            ->assertJsonPath('props.featuredProducts.0.id', $featured->id)
            ->assertJsonPath('props.featuredProducts.0.is_featured', true);
    }

    protected function inertiaHeaders(): array
    {
        $request = Request::create('/', 'GET');
        $version = app(HandleInertiaRequests::class)->version($request);

        return array_filter([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
            'X-Inertia-Version' => $version,
        ]);
    }
}
