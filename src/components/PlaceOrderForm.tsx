// src/components/PlaceOrderForm.tsx
import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FiPlus, FiTrash2, FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchItems,
  fetchItem,
  placeOrder,
  type ItemOption,
  type PlaceOrderRequest,
  PaymentMethodDto,
  type TransactionResponse,
} from "../api/transactions";
import OrderConfirmationModal, {
  type CartItem,
} from "./OrderConfirmationModal";
import ReceiptTemplate from "./ReceiptTemplate";
import { generateAndDownloadReceiptPng } from "../utils/generateReceiptsPng.ts";

export default function PlaceOrderForm() {
  const [items, setItems] = useState<ItemOption[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDto>(
    PaymentMethodDto.CASH,
  );
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch items
  useEffect(() => {
    fetchItems()
      .then((res) => setItems(res.data))
      .catch(() => toast.error("Failed to load items"));
  }, []);

  // Selection state
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);
  const [selectedPack, setSelectedPack] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  // Stock
  const [availableStock, setAvailableStock] = useState<number>(0);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setAvailableStock(0);
      return;
    }
    setStockLoading(true);
    fetchItem(selectedItem.id)
      .then((res) => setAvailableStock(res.data.totalQuantity ?? 0))
      .catch(() => {
        setAvailableStock(0);
        toast.error("Could not load stock");
      })
      .finally(() => setStockLoading(false));
  }, [selectedItem]);

  const packTypes = selectedItem?.packs.map((p) => p.type) ?? [];

  const addToCart = async () => {
    if (!selectedItem || !selectedPack) return;

    const exists = cart.some(
      (c) => c.item.id === selectedItem.id && c.packType === selectedPack,
    );
    if (exists) {
      toast.error("Pack already in cart");
      return;
    }

    const { data } = await fetchItem(selectedItem.id);
    const pack = data.packs.find((p) => p.type === selectedPack);
    if (!pack) {
      toast.error("Pack not found");
      return;
    }

    const lineTotal = pack.sellingPrice * qty;
    setCart((prev) => [
      ...prev,
      {
        item: { id: data.id, name: data.name },
        packType: selectedPack,
        qty,
        unitPrice: pack.sellingPrice,
        lineTotal,
      },
    ]);
    setSelectedItem(null);
    setSelectedPack("");
    setQty(1);
  };

  const removeFromCart = (index: number) =>
    setCart((prev) => prev.filter((_, i) => i !== index));

  const handleConfirmOrder = async (axiosResponse: {
    data: TransactionResponse;
  }) => {
    const transaction = axiosResponse.data;

    const receiptElement = (
      <ReceiptTemplate
        customerName={customerName.trim()}
        customerPhone={customerPhone.trim() || undefined}
        customerEmail={customerEmail.trim() || undefined}
        customerAddress={customerAddress.trim() || undefined}
        paymentMethod={paymentMethod}
        notes={notes.trim() || undefined}
        items={cart.map((c) => ({
          name: c.item.name,
          packType: c.packType,
          qty: c.qty,
          unitPrice: c.unitPrice,
          lineTotal: c.lineTotal,
        }))}
        subtotal={subtotal}
        discount={discount}
        discountAmount={discountAmount}
        total={total}
        transactionReference={transaction.transactionReference}
        timestamp={transaction.createdOn}
      />
    );

    await generateAndDownloadReceiptPng(
      receiptElement,
      `receipt-${transaction.transactionReference}`,
    );
  };

  const submitOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name required");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const request: PlaceOrderRequest = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      paymentMethod,
      items: cart.map((c) => ({
        itemId: c.item.id,
        packType: c.packType,
        quantity: c.qty,
      })),
      discountPercentage: discount || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      // ✅ Step 1: Place order
      const response = await placeOrder(request);
      toast.success("Order placed successfully!"); // 👈 Show success immediately

      // ✅ Step 2: Try to generate receipt — but don't fail the order if it breaks
      try {
        await handleConfirmOrder(response);
      } catch (receiptError) {
        console.error("Receipt generation failed:", receiptError);
        toast.error(
          "Order saved, but receipt download failed. You can reprint later.",
        );
        // Optionally: show a "Reprint Receipt" button
      }

      // ✅ Step 3: Reset form
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setPaymentMethod(PaymentMethodDto.CASH);
      setDiscount(0);
      setNotes("");
      setIsModalOpen(false);
    } catch (err: any) {
      // ❌ Only show "Order failed" if the ORDER itself failed
      toast.error(err.response?.data?.message || "Order placement failed");
    }
  };

  const subtotal = cart.reduce((sum, c) => sum + c.lineTotal, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const isValid = cart.length > 0 && customerName.trim() !== "";

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Place New Order
      </h2>

      {/* Add to cart row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
        {/* Item */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Item
          </label>
          <Listbox
            value={selectedItem}
            onChange={async (it) => {
              setSelectedItem(it);
              setSelectedPack("");
              if (!it) return;
              const raw = await fetchItem(it.id);
              setSelectedItem(raw.data);
            }}
          >
            <div className="relative">
              <Listbox.Button className="relative w-full bg-white border border-slate-300 rounded-lg shadow-sm pl-3 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                <span className="block truncate text-slate-800">
                  {selectedItem?.name || "Select item"}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="w-4 h-4 text-slate-400" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-sm ring-1 ring-slate-300 overflow-auto focus:outline-none">
                  {items.map((it) => (
                    <Listbox.Option
                      key={it.id}
                      value={it}
                      className={({ active }) =>
                        `cursor-default select-none relative py-2.5 pl-3 pr-9 ${
                          active
                            ? "text-white bg-emerald-600"
                            : "text-slate-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`block truncate ${
                            selected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {it.name}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Pack */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pack
          </label>
          <Listbox
            value={selectedPack}
            onChange={setSelectedPack}
            disabled={!selectedItem}
          >
            <div className="relative">
              <Listbox.Button className="relative w-full bg-white border border-slate-300 rounded-lg shadow-sm pl-3 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                <span className="block truncate text-slate-800">
                  {selectedPack || "Select pack"}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="w-4 h-4 text-slate-400" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-sm ring-1 ring-slate-300 overflow-auto focus:outline-none">
                  {packTypes.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-slate-500">
                      No packs available
                    </div>
                  ) : (
                    packTypes.map((pt) => (
                      <Listbox.Option
                        key={pt}
                        value={pt}
                        className={({ active }) =>
                          `cursor-default select-none relative py-2.5 pl-3 pr-9 ${
                            active
                              ? "text-white bg-emerald-600"
                              : "text-slate-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <span
                            className={`block truncate ${
                              selected ? "font-semibold" : "font-normal"
                            }`}
                          >
                            {pt}
                          </span>
                        )}
                      </Listbox.Option>
                    ))
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Qty
          </label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={addToCart}
            disabled={!selectedItem || !selectedPack}
            className="flex items-center gap-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-60 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {selectedItem && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          {stockLoading ? (
            <span className="text-slate-500">Loading stock…</span>
          ) : (
            <>
              <span className="text-slate-600">Available:</span>
              <span className="font-semibold text-emerald-600">
                {availableStock} items
              </span>
              {qty > availableStock && (
                <span className="text-red-600">⚠️ Exceeds available stock</span>
              )}
            </>
          )}
        </div>
      )}

      {/* Cart Table */}
      {cart.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Pack
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Line Total
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {cart.map((c, idx) => (
                <tr key={`${c.item.id}-${c.packType}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                    {c.item.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {c.packType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {c.qty}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    ₦{c.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    ₦{c.lineTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Customer Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Payment & Notes
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethodDto)
              }
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            >
              {Object.values(PaymentMethodDto).map((pm) => (
                <option key={pm} value={pm}>
                  {pm.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2.5 px-3"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-slate-200 pt-4 mb-6">
        <div className="flex justify-between text-sm text-slate-700">
          <span>Subtotal</span>
          <span>₦{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-700">
          <span>Discount ({discount}%)</span>
          <span>-₦{discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-900 mt-2">
          <span>Total</span>
          <span className="text-emerald-600">₦{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!isValid}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-60 transition-colors"
        >
          Review & Place Order
        </button>
      </div>

      <OrderConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={submitOrder}
        customerName={customerName}
        customerPhone={customerPhone || undefined}
        customerEmail={customerEmail || undefined}
        customerAddress={customerAddress || undefined}
        paymentMethod={paymentMethod}
        notes={notes || undefined}
        cart={cart}
        subtotal={subtotal}
        discount={discount}
        discountAmount={discountAmount}
        total={total}
      />
    </div>
  );
}
