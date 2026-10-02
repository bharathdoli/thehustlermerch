"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
import { useCart } from "@/src/context/CartContext";
import { useToast } from "@/src/context/ToastContext";

type Address = {
  addressId: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
  isDefault: boolean;
};

type Coupon = {
  couponId: string;
  code: string;
  description?: string | null;
  discountType?: string;
  discountValue?: number | string;
  minOrderAmount?: number | string | null;
  maxDiscountAmount?: number | string | null;
  isActive?: boolean;
  usageLimit?: number | null;
  usageCount?: number;
  expiresAt?: string | null;
};

type CouponValidationResponse = {
  coupon: Coupon;
  discountAmount: number | string;
};

type NewAddress = {
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY_ADDRESS: NewAddress = {
  recipientName: "",
  recipientPhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

function fmt(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getMinOrder(coupon: Coupon) {
  return Number(coupon.minOrderAmount ?? 0);
}

export default function CheckoutPage() {
  const { colors } = useTheme();
  const toast = useToast();

  const {
    items,
    cartTotal,
    loading: cartLoading,
  } = useCart();

  /*
   * ================================================================
   * ADDRESS STATE
   * ================================================================
   */

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const [addressLoading, setAddressLoading] =
    useState(true);

  const [addressError, setAddressError] =
    useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [newAddress, setNewAddress] =
    useState<NewAddress>(EMPTY_ADDRESS);

  const [savingAddress, setSavingAddress] =
    useState(false);

  /*
   * ================================================================
   * COUPON STATE
   * ================================================================
   */

  const [showCoupons, setShowCoupons] = useState(false);

  const [couponCode, setCouponCode] = useState("");

  const [couponError, setCouponError] = useState<string | null>(null);

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const [discount, setDiscount] = useState(0);

  const [applyingCouponId, setApplyingCouponId] = useState<string | null>(null);

  /*
   * ================================================================
   * LOAD ADDRESSES
   * ================================================================
   */

  async function loadAddresses() {
    try {
      setAddressLoading(true);
      setAddressError(null);

      const response = await fetch(
        "/api/customers/addresses",
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Failed to load addresses."
        );
      }

      const addressList: Address[] =
        Array.isArray(data) ? data : [];

      setAddresses(addressList);

      /*
       * Automatically select default address.
       * If there is no default address, select
       * the first available address.
       */
      const defaultAddress =
        addressList.find(
          (address) => address.isDefault
        );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.addressId
        );
      } else if (addressList.length > 0) {
        setSelectedAddressId(
          addressList[0].addressId
        );
      }
    } catch (error) {
      console.error(
        "Failed to load addresses:",
        error
      );

      setAddressError(
        error instanceof Error
          ? error.message
          : "Failed to load addresses."
      );

      toast.error(
        error instanceof Error ? error.message : "Failed to load addresses."
      );
    } finally {
      setAddressLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  /*
   * ================================================================
   * COUPON UI
   * Customers use POST /api/coupons/validate directly.
   * GET /api/coupons is admin-only.
   * ================================================================
   */

  function handleShowCoupons() {
    setShowCoupons((previous) => !previous);
    setCouponError(null);
  }

  /*
   * ================================================================
   * ADDRESS FORM
   * ================================================================
   */

  function updateAddressField(
    field: keyof NewAddress,
    value: string | boolean
  ) {
    setNewAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleAddAddress() {
    if (
      !newAddress.recipientName.trim() ||
      !newAddress.recipientPhone.trim() ||
      !newAddress.addressLine1.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim()
    ) {
      setAddressError(
        "Please fill all required address fields."
      );

      toast.error("Please fill all required address fields.");

      return;
    }

    // Extra validation
    if (!/^\d{10}$/.test(newAddress.recipientPhone.trim())) {
      setAddressError("Enter a valid 10-digit phone number.");
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(newAddress.pincode.trim())) {
      setAddressError("Enter a valid 6-digit pincode.");
      toast.error("Enter a valid 6-digit pincode.");
      return;
    }

    try {
      setSavingAddress(true);
      setAddressError(null);

      const response = await fetch(
        "/api/customers/addresses",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAddress),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Failed to add address."
        );
      }

      /*
       * Add new address to the existing list.
       */
      setAddresses((previous) => [
        ...previous,
        data,
      ]);

      /*
       * Automatically select newly created address.
       */
      setSelectedAddressId(data.addressId);

      setNewAddress(EMPTY_ADDRESS);
      setShowAddressForm(false);

      toast.success("Address added and selected.");
    } catch (error) {
      console.error(
        "Failed to add address:",
        error
      );

      setAddressError(
        error instanceof Error
          ? error.message
          : "Failed to add address."
      );

      toast.error(
        error instanceof Error ? error.message : "Failed to add address."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  /*
   * ================================================================
   * APPLY COUPON
   *
   * Backend response:
   *
   * {
   *   coupon,
   *   discountAmount
   * }
   * ================================================================
   */

  async function handleApplyCoupon() {
    const code = couponCode.trim();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      toast.error("Please enter a coupon code.");
      return;
    }

    try {
      setApplyingCouponId("input");
      setCouponError(null);

      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, subtotal: cartTotal }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          "Invalid coupon.";
        throw new Error(message);
      }

      const validation = data as CouponValidationResponse;
      const discountAmount = Number(validation.discountAmount ?? 0);

      setSelectedCoupon(validation.coupon);
      setDiscount(Math.min(Math.max(discountAmount, 0), cartTotal));
      setCouponError(null);
      setShowCoupons(false);
      toast.success(`Coupon ${validation.coupon.code} applied.`);
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      setSelectedCoupon(null);
      setDiscount(0);
      setCouponError(
        error instanceof Error ? error.message : "Invalid coupon."
      );
      toast.error(error instanceof Error ? error.message : "Invalid coupon.");
    } finally {
      setApplyingCouponId(null);
    }
  }

  /*
   * ================================================================
   * REMOVE COUPON
   * ================================================================
   */

  function removeCoupon() {
    setSelectedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError(null);
    toast.info("Coupon removed.");
  }

  /*
   * ================================================================
   * PAYMENT BUTTON
   *
   * For now this is only UI.
   * Orders/payment will be connected later.
   * ================================================================
   */

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  async function handlePayment() {
    if (!selectedAddressId) {
      setAddressError(
        "Please select a delivery address before payment."
      );

      toast.error("Please select a delivery address before payment.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError(null);

      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          ...(selectedCoupon ? { couponCode: selectedCoupon.code } : {}),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to place order."
        );
      }

      // data.orderId is what you need to test reviews against —
      // reviews require a real orderId per your Reviews model.
      toast.success("Order placed successfully!");
      alert(`Order placed! Order ID: ${data.orderId}`);

      // Simplest redirect for now, since this is a test wire-up:
      window.location.href = `/orders/${data.orderId}`;
    } catch (error) {
      console.error("Failed to place order:", error);
      setOrderError(
        error instanceof Error ? error.message : "Failed to place order."
      );
      toast.error(error instanceof Error ? error.message : "Failed to place order.");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPlacingOrder(false);
    }
  }

  /*
   * ================================================================
   * FINAL TOTAL
   * ================================================================
   */

  const finalTotal = Math.max(
    0,
    cartTotal - discount
  );

  /*
   * ================================================================
   * EMPTY CART
   * ================================================================
   */

  if (
    !cartLoading &&
    items.length === 0
  ) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Checkout
        </span>

        <h1
          className="mt-2 font-display text-4xl uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          Cart is empty
        </h1>

        <p
          className="mt-3 text-sm"
          style={{
            color: colors.textMuted,
          }}
        >
          Add a product to your cart before
          proceeding to checkout.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-block px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest"
          style={{
            backgroundColor: SIGNAL,
            color: "#131210",
          }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  /*
   * ================================================================
   * PAGE
   * ================================================================
   */

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden px-5 py-10 sm:px-8 sm:py-14">
      {/* ========================================================== */}
      {/* HEADER                                                      */}
      {/* ========================================================== */}

      <div
        className="border-b pb-6"
        style={{
          borderColor: colors.line,
        }}
      >
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Checkout
        </span>

        <h1
          className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl"
          style={{ color: colors.text }}
        >
          Complete Your Order
        </h1>

        <p
          className="mt-3 max-w-xl text-sm"
          style={{
            color: colors.textMuted,
          }}
        >
          Review your products, select a delivery
          address and apply a coupon before payment.
        </p>
      </div>

      {/* GLOBAL ADDRESS ERROR */}

      {addressError && (
        <div
          className="mt-6 break-words border p-4 font-mono text-xs"
          style={{
            borderColor: SIGNAL,
            color: SIGNAL,
          }}
        >
          {addressError}
        </div>
      )}

      {orderError && (
        <div
          className="mt-6 break-words border p-4 font-mono text-xs"
          style={{ borderColor: SIGNAL, color: SIGNAL }}
        >
          {orderError}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-12">
        {/* ======================================================== */}
        {/* LEFT SIDE                                                 */}
        {/* ======================================================== */}

        <div className="min-w-0 space-y-8 lg:col-span-8">
          {/* ====================================================== */}
          {/* CART ITEMS                                               */}
          {/* ====================================================== */}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="font-display text-2xl uppercase"
                style={{
                  color: colors.text,
                }}
              >
                Your Items
              </h2>

              <span
                className="font-mono text-[11px]"
                style={{
                  color: colors.textMuted,
                }}
              >
                {items.length} item
                {items.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div
              className="border"
              style={{
                borderColor: colors.line,
              }}
            >
              {items.map((item, index) => {
                /*
                 * Cart API structure:
                 *
                 * item
                 * ├── itemId
                 * ├── quantity
                 * ├── unitPrice
                 * └── variant
                 *      ├── colour
                 *      ├── size
                 *      └── product
                 */

                const product =
                  item.variant?.product;

                const productName =
                  product?.productName ??
                  "Product";

                const productImage =
                  product?.productImage ??
                  "";

                const colour =
                  item.variant?.colour ??
                  "N/A";

                const size =
                  item.variant?.size ??
                  "One Size";

                const quantity = Number(
                  item.quantity
                );

                const unitPrice = Number(
                  item.unitPrice
                );

                const itemTotal =
                  quantity * unitPrice;

                return (
                  <div
                    key={item.itemId}
                    className="flex gap-4 p-4 max-[380px]:flex-col sm:p-5"
                    style={{
                      borderTop:
                        index === 0
                          ? "none"
                          : `1px solid ${colors.line}`,
                    }}
                  >
                    {/* IMAGE */}

                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="h-24 w-20 shrink-0 object-cover grayscale sm:h-28 sm:w-24"
                      />
                    ) : (
                      <div
                        className="flex h-24 w-20 shrink-0 items-center justify-center sm:h-28 sm:w-24"
                        style={{
                          backgroundColor:
                            colors.panel,
                        }}
                      >
                        <span
                          className="text-center font-mono text-[8px]"
                          style={{
                            color:
                              colors.textMuted,
                          }}
                        >
                          IMAGE
                          <br />
                          UNAVAILABLE
                        </span>
                      </div>
                    )}

                    {/* DETAILS */}

                    <div className="min-w-0 flex-1">
                      <h3
                        className="break-words text-sm font-semibold"
                        style={{
                          color:
                            colors.text,
                        }}
                      >
                        {productName}
                      </h3>

                      <div
                        className="mt-2 space-y-1 font-mono text-[11px]"
                        style={{
                          color:
                            colors.textMuted,
                        }}
                      >
                        <p>
                          Colour: {colour}
                        </p>

                        <p>
                          Size: {size}
                        </p>

                        <p>
                          Quantity:{" "}
                          {quantity}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className="font-mono text-xs"
                          style={{
                            color:
                              colors.textMuted,
                          }}
                        >
                          {quantity} ×{" "}
                          {fmt(unitPrice)}
                        </span>

                        <span
                          className="font-mono text-sm font-bold"
                          style={{
                            color: SIGNAL,
                          }}
                        >
                          {fmt(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ====================================================== */}
          {/* DELIVERY ADDRESS                                         */}
          {/* ====================================================== */}

          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2
                  className="font-display text-2xl uppercase"
                  style={{
                    color: colors.text,
                  }}
                >
                  Delivery Address
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color:
                      colors.textMuted,
                  }}
                >
                  Select where you want your order
                  delivered.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddressForm(
                    (previous) =>
                      !previous
                  )
                }
                className="border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition hover:opacity-80"
                style={{
                  borderColor: SIGNAL,
                  color: SIGNAL,
                }}
              >
                {showAddressForm
                  ? "Cancel"
                  : "+ Add Address"}
              </button>
            </div>

            {/* ADDRESS LIST */}

            {addressLoading ? (
              <div
                className="mt-5 border p-6 text-center font-mono text-xs"
                style={{
                  borderColor:
                    colors.line,
                  color:
                    colors.textMuted,
                }}
              >
                Loading addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div
                className="mt-5 border p-6 text-center"
                style={{
                  borderColor:
                    colors.line,
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color:
                      colors.textMuted,
                  }}
                >
                  You don't have any saved
                  addresses.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddressForm(
                      true
                    )
                  }
                  className="mt-3 font-mono text-[10px] uppercase tracking-widest"
                  style={{
                    color: SIGNAL,
                  }}
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {addresses.map(
                  (address) => {
                    const selected =
                      selectedAddressId ===
                      address.addressId;

                    return (
                      <button
                        type="button"
                        key={
                          address.addressId
                        }
                        onClick={() => {
                          setSelectedAddressId(
                            address.addressId
                          );
                          if (!selected) {
                            toast.info("Delivery address selected.");
                          }
                        }}
                        className="w-full border p-4 text-left transition"
                        style={{
                          borderColor:
                            selected
                              ? SIGNAL
                              : colors.line,
                          backgroundColor:
                            selected
                              ? `${SIGNAL}08`
                              : colors.panel,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="text-sm font-semibold"
                                style={{
                                  color:
                                    colors.text,
                                }}
                              >
                                {
                                  address.recipientName
                                }
                              </span>

                              {address.isDefault && (
                                <span
                                  className="border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                                  style={{
                                    borderColor:
                                      SIGNAL,
                                    color:
                                      SIGNAL,
                                  }}
                                >
                                  Default
                                </span>
                              )}
                            </div>

                            <p
                              className="mt-2 break-words text-sm leading-relaxed"
                              style={{
                                color:
                                  colors.textMuted,
                              }}
                            >
                              {
                                address.addressLine1
                              }

                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}

                              {address.landmark &&
                                `, ${address.landmark}`}

                              <br />

                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}

                              <br />

                              {
                                address.country
                              }
                            </p>

                            <p
                              className="mt-2 font-mono text-[11px]"
                              style={{
                                color:
                                  colors.textMuted,
                              }}
                            >
                              {
                                address.recipientPhone
                              }
                            </p>
                          </div>

                          {/* RADIO */}

                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              borderColor:
                                selected
                                  ? SIGNAL
                                  : colors.lineStrong,
                            }}
                          >
                            {selected && (
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    SIGNAL,
                                }}
                              />
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* ADD ADDRESS FORM                                      */}
            {/* ==================================================== */}

            {showAddressForm && (
              <div
                className="mt-5 border p-4 sm:p-5"
                style={{
                  borderColor:
                    colors.line,
                  backgroundColor:
                    colors.panel,
                }}
              >
                <h3
                  className="font-mono text-[11px] uppercase tracking-widest"
                  style={{
                    color: SIGNAL,
                  }}
                >
                  New Address
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    value={
                      newAddress.recipientName
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "recipientName",
                        e.target.value
                      )
                    }
                    placeholder="Recipient Name *"
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.recipientPhone
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "recipientPhone",
                        e.target.value
                      )
                    }
                    placeholder="Phone Number *"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.addressLine1
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "addressLine1",
                        e.target.value
                      )
                    }
                    placeholder="Address Line 1 *"
                    className="w-full border px-3 py-3 text-base outline-none sm:col-span-2 sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.addressLine2
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "addressLine2",
                        e.target.value
                      )
                    }
                    placeholder="Address Line 2"
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.landmark
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "landmark",
                        e.target.value
                      )
                    }
                    placeholder="Landmark"
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={newAddress.city}
                    onChange={(e) =>
                      updateAddressField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City *"
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.state
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="State *"
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.pincode
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "pincode",
                        e.target.value
                      )
                    }
                    placeholder="Pincode *"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />

                  <input
                    value={
                      newAddress.country
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Country"
                    className="w-full border px-3 py-3 text-base outline-none sm:text-sm"
                    style={{
                      borderColor:
                        colors.lineStrong,
                      backgroundColor:
                        colors.bg,
                      color: colors.text,
                    }}
                  />
                </div>

                <label className="mt-4 flex items-center gap-2 font-mono text-[11px]">
                  <input
                    type="checkbox"
                    checked={
                      newAddress.isDefault
                    }
                    onChange={(e) =>
                      updateAddressField(
                        "isDefault",
                        e.target.checked
                      )
                    }
                  />

                  <span
                    style={{
                      color:
                        colors.textMuted,
                    }}
                  >
                    Make this my default
                    address
                  </span>
                </label>

                <button
                  type="button"
                  onClick={
                    handleAddAddress
                  }
                  disabled={
                    savingAddress
                  }
                  className="mt-5 w-full px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition disabled:opacity-50 sm:w-auto"
                  style={{
                    backgroundColor: SIGNAL,
                    color: "#131210",
                  }}
                >
                  {savingAddress
                    ? "Saving..."
                    : "Save Address"}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE                                                */}
        {/* ======================================================== */}

        <aside className="min-w-0 lg:col-span-4">
          <div
            className="sticky top-6 border p-4 max-lg:static sm:p-5 lg:top-6"
            style={{
              borderColor: colors.line,
              backgroundColor:
                colors.panel,
            }}
          >
            <h2
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{
                color:
                  colors.textMuted,
              }}
            >
              Order Summary
            </h2>

            {/* SUBTOTAL */}

            <div className="mt-5 flex items-center justify-between font-mono text-sm">
              <span
                style={{
                  color:
                    colors.textMuted,
                }}
              >
                Subtotal
              </span>

              <span
                style={{
                  color: colors.text,
                }}
              >
                {fmt(cartTotal)}
              </span>
            </div>

            {/* ==================================================== */}
            {/* COUPONS                                               */}
            {/* ==================================================== */}

            <div
              className="mt-5 border-t pt-5"
              style={{
                borderColor:
                  colors.line,
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="font-mono text-[11px] uppercase tracking-widest"
                  style={{
                    color:
                      colors.textMuted,
                  }}
                >
                  Coupons
                </p>

                {selectedCoupon && (
                  <button
                    type="button"
                    onClick={
                      removeCoupon
                    }
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      color:
                        colors.textMuted,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* APPLIED COUPON */}

              {selectedCoupon ? (
                <div
                  className="mt-3 border p-3"
                  style={{
                    borderColor: SIGNAL,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="break-all font-mono text-xs font-bold uppercase"
                      style={{
                        color: SIGNAL,
                      }}
                    >
                      {
                        selectedCoupon.code
                      }
                    </span>

                    <span
                      className="font-mono text-xs font-bold"
                      style={{
                        color: SIGNAL,
                      }}
                    >
                      -{fmt(discount)}
                    </span>
                  </div>

                  {selectedCoupon.description && (
                    <p
                      className="mt-1 break-words text-xs"
                      style={{
                        color:
                          colors.textMuted,
                      }}
                    >
                      {
                        selectedCoupon.description
                      }
                    </p>
                  )}

                  <p
                    className="mt-2 font-mono text-[10px]"
                    style={{
                      color:
                        colors.textMuted,
                    }}
                  >
                    Coupon applied successfully.
                  </p>
                </div>
              ) : (
                <>
                  {/* APPLY COUPON */}

                  <button
                    type="button"
                    onClick={handleShowCoupons}
                    className="mt-3 w-full border px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:opacity-80"
                    style={{
                      borderColor: SIGNAL,
                      color: SIGNAL,
                    }}
                  >
                    {showCoupons ? "Hide Coupon" : "Apply Coupon"}
                  </button>

                  {showCoupons && (
                    <div
                      className="mt-3 border p-4"
                      style={{
                        borderColor: colors.lineStrong,
                        backgroundColor: colors.bg,
                      }}
                    >
                      <p
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: colors.textMuted }}
                      >
                        Have a coupon code?
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 sm:flex-nowrap">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleApplyCoupon();
                          }}
                          placeholder="ENTER COUPON CODE"
                          className="min-w-0 flex-1 border px-3 py-3 font-mono text-base uppercase outline-none sm:text-xs"
                          style={{
                            borderColor: colors.lineStrong,
                            backgroundColor: colors.panel,
                            color: colors.text,
                          }}
                        />

                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={applyingCouponId === "input"}
                          className="shrink-0 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-full"
                          style={{
                            backgroundColor: SIGNAL,
                            color: "#131210",
                          }}
                        >
                          {applyingCouponId === "input" ? "..." : "Apply"}
                        </button>
                      </div>

                      {couponError && (
                        <p
                          className="mt-3 font-mono text-[10px]"
                          style={{ color: SIGNAL }}
                        >
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}

                </>
              )}
            </div>

            {/* DISCOUNT */}

            {discount > 0 && (
              <div className="mt-4 flex items-center justify-between font-mono text-sm">
                <span
                  style={{
                    color:
                      colors.textMuted,
                  }}
                >
                  Discount
                </span>

                <span
                  style={{
                    color: SIGNAL,
                  }}
                >
                  - {fmt(discount)}
                </span>
              </div>
            )}

            {/* TOTAL */}

            <div
              className="mt-5 flex items-center justify-between border-t pt-5"
              style={{
                borderColor:
                  colors.line,
              }}
            >
              <span
                className="font-mono text-sm font-bold"
                style={{
                  color: colors.text,
                }}
              >
                Total
              </span>

              <span
                className="font-mono text-xl font-bold"
                style={{
                  color: SIGNAL,
                }}
              >
                {fmt(finalTotal)}
              </span>
            </div>

            <p
              className="mt-2 font-mono text-[10px]"
              style={{
                color:
                  colors.textMuted,
                opacity: 0.7,
              }}
            >
              Shipping & taxes will be handled
              at the next step.
            </p>

            {/* ==================================================== */}
            {/* PAYMENT BUTTON                                        */}
            {/* ==================================================== */}

            <button
              type="button"
              onClick={handlePayment}
              disabled={placingOrder}
              className="mt-6 w-full py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-50 sm:text-xs"
              style={{
                backgroundColor: SIGNAL,
                color: "#131210",
              }}
            >
              {placingOrder
                ? "Placing Order..."
                : `Proceed to Payment · ${fmt(finalTotal)}`}
            </button>

            <Link
              href="/cart"
              className="mt-3 block text-center font-mono text-[10px] uppercase tracking-widest transition hover:opacity-100"
              style={{
                color:
                  colors.textMuted,
              }}
            >
              ← Back to Cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}