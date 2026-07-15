<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@javaloka.test'],
            [
                'name' => 'Javaloka Admin',
                'password' => 'password123',
                'role' => 'admin',
            ]
        );
    }
}
