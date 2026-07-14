import type { LocalCart } from "@lib/types/global";
import { convertToLocale } from "@lib/utils/money";

interface DeliveryStepProps {
  cart: LocalCart;
  mode: "edit" | "read" | "inactive";
  onContinue: () => void;
  onEdit?: () => void;
}

const CheckCircle = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 bg-black rounded-full shrink-0">
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
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-400">Delivery</h2>
      </div>
    );
  }

  if (mode === "read") {
    return (
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Delivery <CheckCircle />
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-gray-600">Standard shipping</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h2 className="text-2xl font-bold mb-6">Delivery</h2>
      <p className="text-sm text-gray-500 mb-4">
        Standard shipping (demo).
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
