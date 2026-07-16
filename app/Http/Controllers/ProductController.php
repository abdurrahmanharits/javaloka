<?php

namespace App\Http\Controllers;

use App\Support\ProductCatalog;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products' => ProductCatalog::active(),
        ]);
    }
}
