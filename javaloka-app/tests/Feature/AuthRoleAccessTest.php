<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_is_redirected_to_admin_dashboard(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);
    }

    public function test_non_admin_accounts_cannot_log_in_from_the_admin_login_page(): void
    {
        $customer = User::create([
            'name' => 'Customer Test',
            'email' => 'customer@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        $response = $this
            ->from(route('login'))
            ->post(route('login.store'), [
                'email' => $customer->email,
                'password' => 'password123',
            ]);

        $response
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_non_admin_users_are_redirected_away_from_admin_dashboard(): void
    {
        $customer = User::create([
            'name' => 'Customer Test',
            'email' => 'customer@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->get(route('admin.dashboard'));

        $response->assertRedirect(route('home'));
    }
}
