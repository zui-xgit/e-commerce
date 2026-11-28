<?php

use App\Models\Category;
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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique(); 
            $table->foreignIdFor(Category::class)->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();

            // Prices are stored as whole TZS amounts (no decimals).
            $table->unsignedBigInteger('price');
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('rating', 3, 2)->default(0);

            $table->string('brand')->nullable();
            $table->string('sku')->unique();
            $table->string('thumbnail')->nullable();
            $table->unsignedInteger('minimum_order_quantity')->default(1);
            $table->text('shipping_information')->nullable();
            $table->text('return_policy')->nullable();
            $table->text('warranty_information')->nullable();
            $table->json('reviews')->nullable();

            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            
            $table->timestamps();

            $table->index(['is_active', 'is_featured']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
