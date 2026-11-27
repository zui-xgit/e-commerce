<?php

use App\Models\Order;
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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();

            $table->string('method');                       // mpesa, tigopesa
            $table->string('phone');                        // number that approves the payment
            $table->unsignedBigInteger('amount');
            $table->string('status')->default('pending');   // pending, paid, failed, timed_out

            $table->string('reference')->nullable()->index(); // gateway transaction id
            $table->string('failure_reason')->nullable();
            $table->json('gateway_response')->nullable();     // raw callback, useful for debugging
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
