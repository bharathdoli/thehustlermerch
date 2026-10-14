"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ORANGE, usePalette } from "@/src/lib/palette";
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

const ADDRESS_FIELDS: {
  key: Exclude<keyof NewAddress, "isDefault">;
  label: string;
  wide?: boolean;
  numeric?: boolean;
  maxLength?: number;
}[] = [
  { key: "recipientName", label: "Recipient name *" },
  { key: "recipientPhone", label: "Phone number *", numeric: true, maxLength: 10 },
  { key: "addressLine1", label: "Address line 1 *", wide: true },
  { key: "addressLine2", label: "Address line 2" },
  { key: "landmark", label: "Landmark" },
  { key: "city", label: "City *" },
  { key: "state", label: "State *" },
  { key: "pincode", label: "Pincode *", numeric: true, maxLength: 6 },
  { key: "country", label: "Country" },
];

function fmt(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CheckoutPage() {
  const colors = usePalette();
  const toast = useToast();

  const { items, cartTotal, loading: cartLoading } = useCart();

  /* ================= ADDRESS STATE ================= */

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  /* ================= COUPON STATE ================= */

  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [applyingCouponId, setApplyingCouponId] = useState<string | null>(null);

  /* ================= ORDER STATE ================= */

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  /* ================= LOAD ADDRESSES ================= */

  async function loadAddresses() {
    try {
      setAddressLoading(true);
      setAddressError(null);

      const response = await fetch("/api/customers/addresses", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to load addresses.");
      }

      const addressList: Address[] = Array.isArray(data) ? data : [];
      setAddresses(addressList);

      // Select the default address, or the first one if there is no default.
      const defaultAddress = addressList.find((address) => address.isDefault);

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.addressId);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].addressId);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load addresses.";
      setAddressError(message);
      toast.error(message);
    } finally {
      setAddressLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  /* ================= COUPON UI ================= */

  function handleShowCoupons() {
    setShowCoupons((previous) => !previous);
    setCouponError(null);
  }

  /* ================= ADDRESS FORM ================= */

  function updateAddressField(field: keyof NewAddress, value: string | boolean) {
    setNewAddress((previous) => ({ ...previous, [field]: value }));
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
      setAddressError("Please fill all required address fields.");
      toast.error("Please fill all required address fields.");
      return;
    }

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

      const response = await fetch("/api/customers/addresses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to add address.");
      }

      setAddresses((previous) => [...previous, data]);
      setSelectedAddressId(data.addressId);
      setNewAddress(EMPTY_ADDRESS);
      setShowAddressForm(false);

      toast.success("Address added and selected.");
    } catch (error) {
      console.error("Failed to add address:", error);
      const message =
        error instanceof Error ? error.message : "Failed to add address.";
      setAddressError(message);
      toast.error(message);
    } finally {
      setSavingAddress(false);
    }
  }

  /* ================= APPLY COUPON ================= */

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cartTotal }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Invalid coupon.");
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
      const message = error instanceof Error ? error.message : "Invalid coupon.";
      setSelectedCoupon(null);
      setDiscount(0);
      setCouponError(message);
      toast.error(message);
    } finally {
      setApplyingCouponId(null);
    }
  }

  function removeCoupon() {
    setSelectedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError(null);
    toast.info("Coupon removed.");
  }

  /* ================= PLACE ORDER ================= */

  async function handlePayment() {
    if (!selectedAddressId) {
      setAddressError("Please select a delivery address before payment.");
      toast.error("Please select a delivery address before payment.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError(null);

      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          ...(selectedCoupon ? { couponCode: selectedCoupon.code } : {}),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to place order.");
      }

      toast.success("Order placed successfully!");
      alert(`Order placed! Order ID: ${data.orderId}`);

      window.location.href = `/orders/${data.orderId}`;
    } catch (error) {
      console.error("Failed to place order:", error);
      const message =
        error instanceof Error ? error.message : "Failed to place order.";
      setOrderError(message);
      toast.error(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPlacingOrder(false);
    }
  }

  const finalTotal = Math.max(0, cartTotal - discount);

  /* ================= SHARED STYLES (same look as the account page) ================= */

  const pageBg = { backgroundColor: colors.bg, color: colors.text };
  const eyebrowClass = "text-[11px] font-medium uppercase tracking-[0.25em]";
  const h1Class =
    "mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl";
  const h2Class =
    "font-display text-2xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-3xl";
  const labelClass = "text-[11px] font-medium uppercase tracking-[0.2em]";
  const inputClass =
    "mt-2 w-full border px-4 py-3 text-base outline-none transition focus:border-[#0e0e0e] sm:text-sm";
  const inputStyle = {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    color: colors.text,
  };
  const primaryBtnClass =
    "px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50";
  const primaryBtnStyle = { backgroundColor: colors.text, color: colors.bg };
  const outlineBtnClass =
    "border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-70";
  const outlineBtnStyle = { borderColor: colors.lineStrong, color: colors.text };

  /* ================= EMPTY CART ================= */

  if (!cartLoading && items.length === 0) {
    return (
      <div style={pageBg} className="min-h-[70vh]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
          <span className={eyebrowClass} style={{ color: ORANGE }}>
            Checkout
          </span>

          <h1 className={h1Class} style={{ color: colors.text }}>
            Cart is empty
          </h1>

          <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>
            Add a product to your cart before proceeding to checkout.
          </p>

          <Link
            href="/products"
            className={`${primaryBtnClass} mt-8 inline-block`}
            style={primaryBtnStyle}
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <div style={pageBg} className="min-h-[70vh]">
      <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-10 sm:px-8 sm:py-16">
        {/* HEADER */}
        <div>
          <span className={eyebrowClass} style={{ color: ORANGE }}>
            Checkout
          </span>

          <h1 className={h1Class} style={{ color: colors.text }}>
            Complete your order
          </h1>

          <p className="mt-4 max-w-xl text-sm" style={{ color: colors.textMuted }}>
            Review your products, select a delivery address and apply a coupon
            before payment.
          </p>
        </div>

        {addressError && (
          <div
            className="mt-6 break-words border p-4 text-xs"
            style={{ borderColor: ORANGE, color: ORANGE }}
          >
            {addressError}
          </div>
        )}

        {orderError && (
          <div
            className="mt-6 break-words border p-4 text-xs"
            style={{ borderColor: ORANGE, color: ORANGE }}
          >
            {orderError}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12">
          {/* ================= LEFT SIDE ================= */}
          <div className="min-w-0 space-y-12 lg:col-span-8">
            {/* CART ITEMS */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={h2Class} style={{ color: colors.text }}>
                  Your items
                </h2>

                <span className="text-xs" style={{ color: colors.textMuted }}>
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="border" style={{ borderColor: colors.line }}>
                {items.map((item, index) => {
                  const product = item.variant?.product;
                  const productName = product?.productName ?? "Product";
                  const productImage = product?.productImage ?? "";
                  const colour = item.variant?.colour ?? "N/A";
                  const size = item.variant?.size ?? "One Size";
                  const quantity = Number(item.quantity);
                  const unitPrice = Number(item.unitPrice);
                  const itemTotal = quantity * unitPrice;

                  return (
                    <div
                      key={item.itemId}
                      className="flex gap-4 p-4 max-[380px]:flex-col sm:p-5"
                      style={{
                        borderTop:
                          index === 0 ? "none" : `1px solid ${colors.line}`,
                      }}
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="h-24 w-20 shrink-0 object-cover sm:h-28 sm:w-24"
                          style={{ backgroundColor: colors.panel }}
                        />
                      ) : (
                        <div
                          className="flex h-24 w-20 shrink-0 items-center justify-center sm:h-28 sm:w-24"
                          style={{ backgroundColor: colors.panel }}
                        >
                          <span
                            className="text-center text-[8px] uppercase tracking-wider"
                            style={{ color: colors.textMuted }}
                          >
                            Image
                            <br />
                            unavailable
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3
                          className="break-words text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          {productName}
                        </h3>

                        <div
                          className="mt-2 space-y-1 text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          <p>Colour: {colour}</p>
                          <p>Size: {size}</p>
                          <p>Quantity: {quantity}</p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs" style={{ color: colors.textMuted }}>
                            {quantity} × {fmt(unitPrice)}
                          </span>

                          <span className="text-sm font-semibold" style={{ color: ORANGE }}>
                            {fmt(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* DELIVERY ADDRESS */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className={eyebrowClass} style={{ color: ORANGE }}>
                    Delivery
                  </span>
                  <h2 className={`${h2Class} mt-1.5`} style={{ color: colors.text }}>
                    Delivery address
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                    Select where you want your order delivered.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddressForm((previous) => !previous)}
                  className={outlineBtnClass}
                  style={outlineBtnStyle}
                >
                  {showAddressForm ? "Cancel" : "+ Add address"}
                </button>
              </div>

              {/* ADDRESS LIST */}
              {addressLoading ? (
                <div
                  className="mt-5 border p-6 text-center text-xs"
                  style={{ borderColor: colors.line, color: colors.textMuted }}
                >
                  Loading addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div
                  className="mt-5 border p-6 text-center"
                  style={{ borderColor: colors.line }}
                >
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    You don&apos;t have any saved addresses.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:underline"
                    style={{ color: ORANGE }}
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {addresses.map((address) => {
                    const selected = selectedAddressId === address.addressId;

                    return (
                      <button
                        type="button"
                        key={address.addressId}
                        onClick={() => {
                          setSelectedAddressId(address.addressId);
                          if (!selected) toast.info("Delivery address selected.");
                        }}
                        className="w-full border p-4 text-left transition"
                        style={{
                          borderColor: selected ? ORANGE : colors.line,
                          backgroundColor: selected ? `${ORANGE}0D` : colors.bg,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="text-sm font-semibold"
                                style={{ color: colors.text }}
                              >
                                {address.recipientName}
                              </span>

                              {address.isDefault && (
                                <span
                                  className="border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em]"
                                  style={{ borderColor: ORANGE, color: ORANGE }}
                                >
                                  Default
                                </span>
                              )}
                            </div>

                            <p
                              className="mt-2 break-words text-sm leading-relaxed"
                              style={{ color: colors.textMuted }}
                            >
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                              {address.landmark && `, ${address.landmark}`}
                              <br />
                              {address.city}, {address.state} - {address.pincode}
                              <br />
                              {address.country}
                            </p>

                            <p className="mt-2 text-xs" style={{ color: colors.textMuted }}>
                              {address.recipientPhone}
                            </p>
                          </div>

                          {/* RADIO */}
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              borderColor: selected ? ORANGE : colors.lineStrong,
                            }}
                          >
                            {selected && (
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: ORANGE }}
                              />
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ADD ADDRESS FORM */}
              {showAddressForm && (
                <div
                  className="mt-5 p-5 sm:p-6"
                  style={{ backgroundColor: colors.panel }}
                >
                  <h3
                    className="text-[11px] font-medium uppercase tracking-[0.25em]"
                    style={{ color: ORANGE }}
                  >
                    New address
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {ADDRESS_FIELDS.map((field) => (
                      <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                        <label
                          htmlFor={`addr-${field.key}`}
                          className={labelClass}
                          style={{ color: colors.textMuted }}
                        >
                          {field.label}
                        </label>
                        <input
                          id={`addr-${field.key}`}
                          value={newAddress[field.key]}
                          onChange={(e) => updateAddressField(field.key, e.target.value)}
                          inputMode={field.numeric ? "numeric" : undefined}
                          maxLength={field.maxLength}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>

                  <label className="mt-5 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => updateAddressField("isDefault", e.target.checked)}
                      style={{ accentColor: colors.text }}
                    />
                    <span style={{ color: colors.textMuted }}>
                      Make this my default address
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddAddress}
                    disabled={savingAddress}
                    className={`${primaryBtnClass} mt-5 w-full sm:w-auto`}
                    style={primaryBtnStyle}
                  >
                    {savingAddress ? "Saving..." : "Save address"}
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <aside className="min-w-0 lg:col-span-4">
            <div
              className="p-5 sm:p-6 lg:sticky lg:top-6"
              style={{ backgroundColor: colors.panel }}
            >
              <h2
                className="text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: colors.textMuted }}
              >
                Order summary
              </h2>

              {/* SUBTOTAL */}
              <div className="mt-5 flex items-center justify-between text-sm">
                <span style={{ color: colors.textMuted }}>Subtotal</span>
                <span className="font-semibold" style={{ color: colors.text }}>
                  {fmt(cartTotal)}
                </span>
              </div>

              {/* COUPONS */}
              <div className="mt-5 border-t pt-5" style={{ borderColor: colors.lineStrong }}>
                <div className="flex items-center justify-between">
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.2em]"
                    style={{ color: colors.textMuted }}
                  >
                    Coupons
                  </p>

                  {selectedCoupon && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] font-medium uppercase tracking-[0.2em] hover:underline"
                      style={{ color: colors.textMuted }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {selectedCoupon ? (
                  <div
                    className="mt-3 border p-3"
                    style={{ borderColor: ORANGE, backgroundColor: colors.bg }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="break-all text-xs font-semibold uppercase"
                        style={{ color: ORANGE }}
                      >
                        {selectedCoupon.code}
                      </span>

                      <span className="text-xs font-semibold" style={{ color: ORANGE }}>
                        -{fmt(discount)}
                      </span>
                    </div>

                    {selectedCoupon.description && (
                      <p
                        className="mt-1 break-words text-xs"
                        style={{ color: colors.textMuted }}
                      >
                        {selectedCoupon.description}
                      </p>
                    )}

                    <p className="mt-2 text-[11px]" style={{ color: colors.textMuted }}>
                      Coupon applied successfully.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleShowCoupons}
                      className={`${outlineBtnClass} mt-3 w-full`}
                      style={outlineBtnStyle}
                    >
                      {showCoupons ? "Hide coupon" : "Apply coupon"}
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
                          className="text-[11px] font-medium uppercase tracking-[0.2em]"
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
                            className="min-w-0 flex-1 border px-3 py-3 text-base uppercase outline-none transition focus:border-[#0e0e0e] sm:text-xs"
                            style={{
                              borderColor: colors.lineStrong,
                              backgroundColor: colors.bg,
                              color: colors.text,
                            }}
                          />

                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={applyingCouponId === "input"}
                            className="shrink-0 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-full"
                            style={primaryBtnStyle}
                          >
                            {applyingCouponId === "input" ? "..." : "Apply"}
                          </button>
                        </div>

                        {couponError && (
                          <p className="mt-3 text-xs" style={{ color: ORANGE }}>
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
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span style={{ color: colors.textMuted }}>Discount</span>
                  <span className="font-semibold" style={{ color: ORANGE }}>
                    - {fmt(discount)}
                  </span>
                </div>
              )}

              {/* TOTAL */}
              <div
                className="mt-5 flex items-center justify-between border-t pt-5"
                style={{ borderColor: colors.lineStrong }}
              >
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  Total
                </span>

                <span className="text-xl font-bold" style={{ color: ORANGE }}>
                  {fmt(finalTotal)}
                </span>
              </div>

              <p className="mt-2 text-[11px]" style={{ color: colors.textMuted }}>
                Shipping &amp; taxes will be handled at the next step.
              </p>

              {/* PAYMENT BUTTON */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={placingOrder}
                className={`${primaryBtnClass} mt-6 w-full`}
                style={primaryBtnStyle}
              >
                {placingOrder
                  ? "Placing order..."
                  : `Proceed to payment · ${fmt(finalTotal)}`}
              </button>

              <Link
                href="/cart"
                className="mt-3 block text-center text-[11px] font-medium uppercase tracking-[0.2em] transition hover:opacity-100"
                style={{ color: colors.textMuted, opacity: 0.9 }}
              >
                ← Back to cart
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}