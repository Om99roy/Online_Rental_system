import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addressSchema,
  type AddressInput,
} from "../../lib/validation/address.schema";
import FormError from "../forms/FormError";

interface AddressFormProps {
  onSubmit: (data: AddressInput) => void;
  onCancel: () => void;
}

export default function AddressForm({ onSubmit, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border border-border rounded-xl p-4"
    >
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Label
        </label>
        <input
          placeholder="Home, Office..."
          {...register("name")}
          className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <FormError error={errors.name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Address line 1
        </label>
        <input
          {...register("addressLine1")}
          className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <FormError error={errors.addressLine1} />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Address line 2 (optional)
        </label>
        <input
          {...register("addressLine2")}
          className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            City
          </label>
          <input
            {...register("city")}
            className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <FormError error={errors.city} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            State
          </label>
          <input
            {...register("state")}
            className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <FormError error={errors.state} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Postal code
          </label>
          <input
            {...register("postalCode")}
            className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <FormError error={errors.postalCode} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <FormError error={errors.phone} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-surface-2 border border-border text-text rounded-lg py-2.5 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          disabled={isSubmitting}
          className="flex-1 bg-primary hover:bg-secondary transition-colors text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          Save address
        </button>
      </div>
    </form>
  );
}
