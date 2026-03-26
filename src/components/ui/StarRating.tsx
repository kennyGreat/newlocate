import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(i + 1)}
            className={cn(
              "relative",
              interactive &&
                "cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                filled || partial ? "text-yellow-400" : "text-gray-300",
                filled && "fill-yellow-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
