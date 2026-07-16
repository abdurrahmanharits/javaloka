<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InventoryService
{
    public function receive(
        Product $product,
        float $quantity,
        ?string $note = null,
        ?string $reference = null,
        array $metadata = []
    ): Product {
        $quantity = $this->normalizeQuantity($quantity);
        $this->ensurePositiveQuantity($quantity);

        return DB::transaction(function () use ($product, $quantity, $note, $reference, $metadata) {
            $lockedProduct = $this->lockProduct($product);

            $stockBefore = (float) $lockedProduct->stock;
            $reservedBefore = (float) $lockedProduct->reserved_stock;

            $lockedProduct->forceFill([
                'stock' => $this->normalizeQuantity($stockBefore + $quantity),
            ])->save();

            $this->recordMovement(
                product: $lockedProduct,
                type: 'stock_in',
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: (float) $lockedProduct->stock,
                reservedBefore: $reservedBefore,
                reservedAfter: (float) $lockedProduct->reserved_stock,
                note: $note,
                reference: $reference,
                metadata: $metadata
            );

            return $lockedProduct->fresh();
        });
    }

    public function reserve(
        Product $product,
        float $quantity,
        ?string $note = null,
        ?string $reference = null,
        array $metadata = []
    ): Product {
        $quantity = $this->normalizeQuantity($quantity);
        $this->ensurePositiveQuantity($quantity);

        return DB::transaction(function () use ($product, $quantity, $note, $reference, $metadata) {
            $lockedProduct = $this->lockProduct($product);

            if ($lockedProduct->available_stock < $quantity) {
                throw new InsufficientStockException('Available stock is insufficient for this reservation.');
            }

            $stockBefore = (float) $lockedProduct->stock;
            $reservedBefore = (float) $lockedProduct->reserved_stock;

            $lockedProduct->forceFill([
                'reserved_stock' => $this->normalizeQuantity($reservedBefore + $quantity),
            ])->save();

            $this->recordMovement(
                product: $lockedProduct,
                type: 'reserved',
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: (float) $lockedProduct->stock,
                reservedBefore: $reservedBefore,
                reservedAfter: (float) $lockedProduct->reserved_stock,
                note: $note,
                reference: $reference,
                metadata: $metadata
            );

            return $lockedProduct->fresh();
        });
    }

    public function release(
        Product $product,
        float $quantity,
        ?string $note = null,
        ?string $reference = null,
        array $metadata = []
    ): Product {
        $quantity = $this->normalizeQuantity($quantity);
        $this->ensurePositiveQuantity($quantity);

        return DB::transaction(function () use ($product, $quantity, $note, $reference, $metadata) {
            $lockedProduct = $this->lockProduct($product);

            if ((float) $lockedProduct->reserved_stock < $quantity) {
                throw new InvalidArgumentException('Reserved stock cannot be released below zero.');
            }

            $stockBefore = (float) $lockedProduct->stock;
            $reservedBefore = (float) $lockedProduct->reserved_stock;

            $lockedProduct->forceFill([
                'reserved_stock' => $this->normalizeQuantity($reservedBefore - $quantity),
            ])->save();

            $this->recordMovement(
                product: $lockedProduct,
                type: 'released',
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: (float) $lockedProduct->stock,
                reservedBefore: $reservedBefore,
                reservedAfter: (float) $lockedProduct->reserved_stock,
                note: $note,
                reference: $reference,
                metadata: $metadata
            );

            return $lockedProduct->fresh();
        });
    }

    public function fulfill(
        Product $product,
        float $quantity,
        ?string $note = null,
        ?string $reference = null,
        array $metadata = []
    ): Product {
        $quantity = $this->normalizeQuantity($quantity);
        $this->ensurePositiveQuantity($quantity);

        return DB::transaction(function () use ($product, $quantity, $note, $reference, $metadata) {
            $lockedProduct = $this->lockProduct($product);

            if ((float) $lockedProduct->stock < $quantity) {
                throw new InsufficientStockException('Physical stock is insufficient for fulfillment.');
            }

            if ((float) $lockedProduct->reserved_stock < $quantity) {
                throw new InvalidArgumentException('Reserved stock is insufficient for fulfillment.');
            }

            $stockBefore = (float) $lockedProduct->stock;
            $reservedBefore = (float) $lockedProduct->reserved_stock;

            $lockedProduct->forceFill([
                'stock' => $this->normalizeQuantity($stockBefore - $quantity),
                'reserved_stock' => $this->normalizeQuantity($reservedBefore - $quantity),
            ])->save();

            $this->recordMovement(
                product: $lockedProduct,
                type: 'stock_out',
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: (float) $lockedProduct->stock,
                reservedBefore: $reservedBefore,
                reservedAfter: (float) $lockedProduct->reserved_stock,
                note: $note,
                reference: $reference,
                metadata: $metadata
            );

            return $lockedProduct->fresh();
        });
    }

    public function adjustStock(
        Product $product,
        float $newStock,
        ?string $note = null,
        ?string $reference = null,
        array $metadata = []
    ): Product {
        $newStock = $this->normalizeQuantity($newStock);

        if ($newStock < 0) {
            throw new InvalidArgumentException('Stock cannot be negative.');
        }

        return DB::transaction(function () use ($product, $newStock, $note, $reference, $metadata) {
            $lockedProduct = $this->lockProduct($product);
            $reservedBefore = (float) $lockedProduct->reserved_stock;

            if ($newStock < $reservedBefore) {
                throw new InvalidArgumentException('Physical stock cannot be lower than reserved stock.');
            }

            $stockBefore = (float) $lockedProduct->stock;

            if ($stockBefore === $newStock) {
                return $lockedProduct->fresh();
            }

            $lockedProduct->forceFill([
                'stock' => $newStock,
            ])->save();

            $this->recordMovement(
                product: $lockedProduct,
                type: 'adjusted',
                quantity: $this->normalizeQuantity(abs($newStock - $stockBefore)),
                stockBefore: $stockBefore,
                stockAfter: (float) $lockedProduct->stock,
                reservedBefore: $reservedBefore,
                reservedAfter: (float) $lockedProduct->reserved_stock,
                note: $note,
                reference: $reference,
                metadata: array_merge($metadata, [
                    'direction' => $newStock > $stockBefore ? 'increase' : 'decrease',
                ])
            );

            return $lockedProduct->fresh();
        });
    }

    protected function lockProduct(Product $product): Product
    {
        return Product::query()
            ->whereKey($product->getKey())
            ->lockForUpdate()
            ->firstOrFail();
    }

    protected function recordMovement(
        Product $product,
        string $type,
        float $quantity,
        float $stockBefore,
        float $stockAfter,
        float $reservedBefore,
        float $reservedAfter,
        ?string $note = null,
        ?string $reference = null,
        array $metadata = []
    ): StockMovement {
        return $product->stockMovements()->create([
            'type' => $type,
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'reserved_before' => $reservedBefore,
            'reserved_after' => $reservedAfter,
            'note' => $note,
            'reference' => $reference,
            'metadata' => $metadata ?: null,
        ]);
    }

    protected function ensurePositiveQuantity(float $quantity): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Quantity must be greater than zero.');
        }
    }

    protected function normalizeQuantity(float $quantity): float
    {
        return round($quantity, 2);
    }
}
