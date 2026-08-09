import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface RentalItemForm {
  productId: string;
  quantity: number;
  price: number;
}

const CreateRental = () => {
  const navigate = useNavigate();

  const [customerId, setCustomerId] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [items, setItems] =
    useState<RentalItemForm[]>([
      {
        productId: "",
        quantity: 1,
        price: 0,
      },
    ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(
      items.filter((_, itemIndex) =>
        itemIndex !== index,
      ),
    );
  };

  const updateItem = (
    index: number,
    field: keyof RentalItemForm,
    value: string | number,
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const total = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.price,
    0,
  );

  const handleSubmit = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!customerId || !startDate || !endDate) {
      toast.error(
        "Please complete the rental information.",
      );
      return;
    }

    toast.success(
      "Rental form validated successfully.",
    );

    // Backend API call will be connected here.
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/rentals")}
          className="mb-5 flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft size={17} />
          Back to rentals
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Create Rental
          </h1>

          <p className="mt-1 text-text-muted">
            Create a new rental transaction.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Rental information */}
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Rental Information
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Customer ID">
                <input
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                  placeholder="Customer ID"
                  className="input"
                />
              </FormField>

              <FormField label="Start Date">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="input"
                />
              </FormField>

              <FormField label="End Date">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  className="input"
                />
              </FormField>
            </div>
          </section>

          {/* Items */}
          <section className="rounded-xl border border-border bg-surface p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Rental Items
                </h2>

                <p className="text-sm text-text-muted">
                  Add products to this rental.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2"
              >
                <Plus size={17} />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-lg border border-border bg-background p-4 md:grid-cols-[1fr_120px_160px_auto]"
                >
                  <input
                    placeholder="Product ID"
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "productId",
                        e.target.value,
                      )
                    }
                    className="input"
                  />

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        Number(e.target.value),
                      )
                    }
                    className="input"
                    placeholder="Quantity"
                  />

                  <input
                    type="number"
                    min={0}
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        Number(e.target.value),
                      )
                    }
                    className="input"
                    placeholder="Price"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(index)
                      }
                      className="flex items-center justify-center rounded-lg border border-error/30 p-2 text-error hover:bg-error/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-5">
              <div className="text-right">
                <p className="text-sm text-text-muted">
                  Estimated Total
                </p>

                <p className="mt-1 text-2xl font-bold text-primary">
                  ₹
                  {total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/rentals")}
              className="rounded-lg border border-border px-5 py-2.5 font-medium hover:bg-surface-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-glow"
            >
              Create Rental
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium">
      {label}
    </span>

    {children}
  </label>
);

export default CreateRental;