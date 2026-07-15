<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/products', [ProductController::class, 'index'])->name('products.index');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'featuredProducts' => Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->get(),
    ]);
})->name('home');

Route::get('/about', function () {
    return Inertia::render('About/Index');
})->name('about');

Route::get('/contact', function (Request $request) {
    return Inertia::render('Contact/Index', [
        'selectedProduct' => (string) $request->query('product', ''),
    ]);
})->name('contact');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function (): void {
    Route::get('/', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::put('/products/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
    Route::delete('/products/{product}', [AdminController::class, 'destroyProduct'])->name('admin.products.destroy');
    Route::post('/accounts', [AdminController::class, 'storeUser'])->name('admin.accounts.store');
    Route::put('/accounts/{user}', [AdminController::class, 'updateUser'])->name('admin.accounts.update');
    Route::delete('/accounts/{user}', [AdminController::class, 'destroyUser'])->name('admin.accounts.destroy');
    Route::patch('/products/{product}/inventory', [AdminController::class, 'updateInventory'])
        ->name('admin.products.inventory.update');
});
