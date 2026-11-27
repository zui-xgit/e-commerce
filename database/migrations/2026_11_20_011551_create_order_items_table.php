<?php

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();

             // Nullable so old orders survive if a product is removed.
            $table->foreignIdFor(Product::class)->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->unsignedBigInteger('price');
            $table->unsignedInteger('quantity');

             $table->unsignedInteger('confirmed_quantity')
                ->default(0);

            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('rating', 3, 2)->default(0);

            $table->string('brand')->nullable();
            $table->string('thumbnail')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
