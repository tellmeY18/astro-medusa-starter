import { zodResolver } from "@hookform/resolvers/zod";
import { updateCartAddress } from "@lib/stores/cart";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AddressFields,
  type AddressValues,
  type CheckoutFormValues,
  type RegionCountry,
} from "./AddressFields";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  company: z.string(),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  province: z.string(),
});

const billingSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  company: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  province: z.string(),
});

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Enter a valid email address",
      ),
    phone: z.string(),
    billingSameAsShipping: z.boolean(),
    shipping: addressSchema,
    billing: billingSchema,
  })
  .superRefine(({ billingSameAsShipping, billing }, ctx) => {
    if (billingSameAsShipping) return;
    const required: [keyof typeof billing, string][] = [
      ["firstName", "First name is required"],
      ["lastName", "Last name is required"],
      ["address", "Address is required"],
      ["postalCode", "Postal code is required"],
      ["city", "City is required"],
      ["country", "Country is required"],
    ];
    for (const [field, message] of required) {
      if (!billing[field].trim()) {
        ctx.addIssue({ code: "custom", path: ["billing", field], message });
      }
    }
  });

const EMPTY_ADDRESS: AddressValues = {
  firstName: "",
  lastName: "",
  address: "",
  company: "",
  postalCode: "",
  city: "",
  country: "",
  province: "",
};

interface ShippingAddressStepProps {
  countries: RegionCountry[];
  countryCode: string;
  mode: "edit" | "read";
  onContinue?: () => void;
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

export const ShippingAddressStep = ({
  countries,
  countryCode,
  mode,
  onContinue,
  onEdit,
}: ShippingAddressStepProps) => {
  const [submitError, setSubmitError] = useState("");
  const cartInitialized = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      billingSameAsShipping: true,
      shipping: { ...EMPTY_ADDRESS, country: countryCode },
      billing: { ...EMPTY_ADDRESS },
    },
  });

  useEffect(() => {
    if (cartInitialized.current) return;
    cartInitialized.current = true;
    // Could pre-fill from cart state if available
  }, []);

  const billingSameAsShipping = watch("billingSameAsShipping");

  const onSubmit = async (data: CheckoutFormValues) => {
    setSubmitError("");
    try {
      const shippingAddress: Record<string, string> = {
        first_name: data.shipping.firstName,
        last_name: data.shipping.lastName,
        address_1: data.shipping.address,
        postal_code: data.shipping.postalCode,
        city: data.shipping.city,
        country_code: data.shipping.country,
      };

      await updateCartAddress({
        email: data.email,
        shipping_address: shippingAddress,
        billing_address: data.billingSameAsShipping
          ? shippingAddress
          : {
              first_name: data.billing.firstName,
              last_name: data.billing.lastName,
              address_1: data.billing.address,
              postal_code: data.billing.postalCode,
              city: data.billing.city,
              country_code: data.billing.country,
            },
      });

      onContinue?.();
    } catch {
      setSubmitError("Failed to save address. Please try again.");
    }
  };

  if (mode === "read") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Shipping Address <CheckCircle />
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-bark hover:underline text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-bark/70">Address saved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>

      <div className="space-y-4">
        <AddressFields
          prefix="shipping"
          register={register}
          errors={errors.shipping ?? {}}
          countries={countries}
        />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("billingSameAsShipping")}
            className="w-4 h-4 accent-bark"
          />
          <span className="text-sm">Billing address same as shipping address</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="email"
              placeholder="Email*"
              autoComplete="email"
              {...register("email")}
              className={`w-full border-bark/25 rounded px-4 py-3 text-sm outline-none focus:border-bark/70 transition-colors ${
                errors.email ? "border-red-400" : "border-bark/25"
              }`}
            />
            <p className="text-red-500 text-xs mt-1 min-h-4">
              {errors.email?.message ?? ""}
            </p>
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone"
              autoComplete="tel"
              {...register("phone")}
              className="w-full border-bark/25 rounded px-4 py-3 text-sm outline-none focus:border-bark/70 transition-colors"
            />
            <p className="min-h-4 mt-1" />
          </div>
        </div>

        {!billingSameAsShipping && (
          <div className="pt-4 border-t border-bark/15">
            <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
            <AddressFields
              prefix="billing"
              register={register}
              errors={errors.billing ?? {}}
              countries={countries}
            />
          </div>
        )}

        {submitError && (
          <p className="text-red-500 text-sm">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-bark text-cream py-3 px-8 rounded-md hover:bg-bark/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </form>
  );
};
