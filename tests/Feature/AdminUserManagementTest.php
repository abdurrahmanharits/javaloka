<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_admin_accounts(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->post(route('admin.accounts.store'), [
                'name' => 'Admin Baru',
                'email' => 'admin-baru@example.com',
                'role' => 'customer',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertRedirect();

        $account = User::where('email', 'admin-baru@example.com')->firstOrFail();

        $this->assertSame('admin', $account->role);
        $this->assertTrue(Hash::check('password123', $account->password));

        $this->actingAs($admin)
            ->put(route('admin.accounts.update', $account), [
                'name' => 'Supervisor Baru',
                'email' => 'supervisor@example.com',
                'role' => 'customer',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->assertRedirect();

        $account->refresh();

        $this->assertSame('Supervisor Baru', $account->name);
        $this->assertSame('supervisor@example.com', $account->email);
        $this->assertSame('admin', $account->role);
        $this->assertTrue(Hash::check('newpassword123', $account->password));

        $this->actingAs($admin)
            ->delete(route('admin.accounts.destroy', $account))
            ->assertRedirect();

        $this->assertDatabaseMissing('users', [
            'id' => $account->id,
        ]);
    }

    public function test_admin_cannot_delete_the_account_that_is_currently_in_use(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->delete(route('admin.accounts.destroy', $admin))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => 'admin',
        ]);
    }

    public function test_admin_dashboard_only_lists_admin_accounts(): void
    {
        $admin = $this->makeAdmin();
        User::create([
            'name' => 'Customer Lama',
            'email' => 'customer-lama@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('stats.total_accounts', 1)
            ->has('users', 1)
        );
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
