<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class GuestAuthPageAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_renders_for_guests(): void
    {
        $response = $this
            ->withHeaders($this->inertiaHeaders())
            ->get(route('login'));

        $response
            ->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'Auth/Login');
    }

    public function test_register_page_is_not_available_anymore(): void
    {
        $this->get('/register')->assertNotFound();
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
