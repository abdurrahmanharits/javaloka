<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class SharedRoutePropsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_receive_shared_navigation_routes(): void
    {
        $response = $this
            ->withHeaders($this->inertiaHeaders())
            ->get(route('home'));

        $response
            ->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('props.routes.home', route('home'))
            ->assertJsonPath('props.routes.login', route('login'))
            ->assertJsonPath('props.routes.products', route('products.index'))
            ->assertJsonPath('props.routes.contact', route('contact'));
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
