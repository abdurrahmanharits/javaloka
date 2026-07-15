<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $products = Product::query()
            ->latest()
            ->get();
        $users = User::query()
            ->where('role', 'admin')
            ->latest()
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $recentMovements = StockMovement::query()
            ->with('product:id,name,sku')
            ->latest()
            ->take(10)
            ->get();

        $activeProducts = $products->where('is_active', true);
        $featuredProducts = $products->where('is_featured', true);
        $lowStockProducts = $activeProducts->filter(fn (Product $product) => $product->inventory_status === 'low_stock');
        $outOfStockProducts = $activeProducts->filter(fn (Product $product) => $product->inventory_status === 'out_of_stock');

        return Inertia::render('Admin/Dashboard', [
            'products' => $products,
            'users' => $users,
            'recentMovements' => $recentMovements,
            'stats' => [
                'total_products' => $products->count(),
                'active_products' => $activeProducts->count(),
                'low_stock_products' => $lowStockProducts->count(),
                'out_of_stock_products' => $outOfStockProducts->count(),
                'featured_products' => $featuredProducts->count(),
                'total_units' => round($products->sum('stock'), 2),
                'reserved_units' => round($products->sum('reserved_stock'), 2),
                'total_accounts' => $users->count(),
            ],
        ]);
    }

    public function updateInventory(
        Request $request,
        Product $product,
        InventoryService $inventoryService
    ): RedirectResponse {
        $validated = $request->validate([
            'stock' => ['required', 'numeric', 'min:0'],
            'low_stock_threshold' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $inventoryService->adjustStock(
                product: $product,
                newStock: (float) $validated['stock'],
                note: $validated['note'] ?: 'Manual inventory adjustment',
                reference: 'admin-adjustment'
            );
        } catch (\InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'stock' => $exception->getMessage(),
            ]);
        }

        $product->forceFill([
            'low_stock_threshold' => round((float) $validated['low_stock_threshold'], 2),
            'is_active' => (bool) $validated['is_active'],
        ])->save();

        return back()->with('success', 'Inventaris produk berhasil diperbarui.');
    }

    public function storeProduct(
        Request $request,
        InventoryService $inventoryService
    ): RedirectResponse {
        $validated = $this->validateCatalogPayload($request);

        $product = Product::create([
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'origin' => $validated['origin'],
            'roast_level' => $validated['roast_level'],
            'description_id' => $validated['description_id'],
            'description_en' => $validated['description_en'],
            'price' => (float) $validated['price'],
            'weight' => $validated['weight'],
            'tasting_notes' => $this->parseTastingNotes($validated['tasting_notes']),
            'image_path' => $validated['image_path'] ?: null,
            'type' => $validated['type'],
            'low_stock_threshold' => round((float) $validated['low_stock_threshold'], 2),
            'is_active' => (bool) $validated['is_active'],
            'is_featured' => (bool) $validated['is_featured'],
            'stock' => 0,
            'reserved_stock' => 0,
        ]);

        if ((float) $validated['stock'] > 0) {
            $inventoryService->receive(
                product: $product,
                quantity: (float) $validated['stock'],
                note: 'Initial stock from product creation',
                reference: 'admin-create-product'
            );
        }

        return back()->with('success', 'Produk baru berhasil ditambahkan.');
    }

    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validateCatalogPayload($request, $product);

        $product->update([
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'origin' => $validated['origin'],
            'roast_level' => $validated['roast_level'],
            'description_id' => $validated['description_id'],
            'description_en' => $validated['description_en'],
            'price' => (float) $validated['price'],
            'weight' => $validated['weight'],
            'tasting_notes' => $this->parseTastingNotes($validated['tasting_notes']),
            'image_path' => $validated['image_path'] ?: null,
            'type' => $validated['type'],
            'low_stock_threshold' => round((float) $validated['low_stock_threshold'], 2),
            'is_active' => (bool) $validated['is_active'],
            'is_featured' => (bool) $validated['is_featured'],
        ]);

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroyProduct(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $this->validateAccountPayload($request);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'admin',
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Akun admin baru berhasil ditambahkan.');
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        if (! $user->isAdmin()) {
            return back()->with('error', 'Akun non-admin tidak lagi dikelola dari panel ini.');
        }

        $validated = $this->validateAccountPayload($request, $user);

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'admin',
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);

        return back()->with('success', 'Data akun admin berhasil diperbarui.');
    }

    public function destroyUser(Request $request, User $user): RedirectResponse
    {
        if (! $user->isAdmin()) {
            return back()->with('error', 'Akun non-admin tidak lagi dikelola dari panel ini.');
        }

        if ((int) $request->user()?->id === (int) $user->id) {
            return back()->with('error', 'Akun admin yang sedang dipakai tidak bisa dihapus.');
        }

        if ($user->isAdmin() && User::query()->where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Minimal harus ada satu akun admin aktif.');
        }

        $user->delete();

        return back()->with('success', 'Akun berhasil dihapus.');
    }

    protected function validateCatalogPayload(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($product?->id),
            ],
            'origin' => ['required', 'string', 'max:255'],
            'roast_level' => ['required', Rule::in(['light', 'medium', 'dark'])],
            'type' => ['required', Rule::in(['single-origin', 'blend'])],
            'price' => ['required', 'numeric', 'min:0'],
            'weight' => ['required', 'string', 'max:50'],
            'description_id' => ['required', 'string'],
            'description_en' => ['required', 'string'],
            'tasting_notes' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:2048'],
            'stock' => ['required', 'numeric', 'min:0'],
            'low_stock_threshold' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
        ]);
    }

    protected function validateAccountPayload(Request $request, ?User $user = null): array
    {
        $passwordRules = $user
            ? ['nullable', 'string', 'min:8', 'confirmed']
            : ['required', 'string', 'min:8', 'confirmed'];

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'password' => $passwordRules,
        ]);
    }

    protected function parseTastingNotes(?string $notes): array
    {
        if (! $notes) {
            return [];
        }

        return collect(explode(',', $notes))
            ->map(fn (string $note) => trim($note))
            ->filter()
            ->values()
            ->all();
    }
}
