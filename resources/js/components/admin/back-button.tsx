import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("cursor-pointer", className)}
            aria-label="Go back"
            onClick={() => window.history.back()}
        >
            <ArrowLeft />
        </Button>
    );
}
