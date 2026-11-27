<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One editable, permanent delivery address per user.
     */
    public function up(): void
    {
        Schema::create('user_delivery_information', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(User::class)
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
        Schema::dropIfExists('user_delivery_information');
    }
};
