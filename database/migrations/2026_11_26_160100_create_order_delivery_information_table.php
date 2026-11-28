<?php

use App\Models\Order;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A frozen copy of the delivery details attached to a single order.
     * Later edits to the user's saved address must never change past orders.
     */
    public function up(): void
    {
        Schema::create('order_delivery_information', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Order::class)
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('country');
            $table->string('name', 120);
            $table->string('company', 120)->nullable();
            $table->string('address', 160);
            $table->string('city', 80);
            $table->string('postal_code', 20)->nullable();
            $table->string('phone', 30);
            $table->string('email', 120);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_delivery_information');
    }
};
