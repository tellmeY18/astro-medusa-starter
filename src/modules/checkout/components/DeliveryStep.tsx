import type { LocalCart } from "@lib/types/global";
import { convertToLocale } from "@lib/utils/money";

interface DeliveryStepProps {
  cart: LocalCart;
  mode: "edit" | "read" | "inactive";
  onContinue: () => void;
  onEdit?: () => void;
}

const CheckCircle = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 bg-bark rounded-full shrink-0">
    <svg
      className="w-3 h-3 text-white"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export const DeliveryStep = ({
  cart,
  mode,
  onContinue,
  onEdit,
}: DeliveryStepProps) => {
  if (mode === "inactive") {
    return (
      <div className="border-t border-bark/15 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-bark/40">Delivery</h2>
      </div>
    );
  }

  if (mode === "read") {
    return (
      <div className="border-t border-bark/15 pt-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Delivery <CheckCircle />
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-bark hover:underline text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-bark/70">Standard shipping</p>
      </div>
    );
  }

  return (
    <div className="border-t border-bark/15 pt-6 mt-6">
      <h2 className="text-2xl font-bold mb-6">Delivery</h2>
      <p className="text-sm text-bark/60 mb-4">
        Standard shipping (demo).
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="bg-bark text-cream py-3 px-8 rounded-md hover:bg-bark/85 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
