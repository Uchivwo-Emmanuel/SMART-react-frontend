// src/components/ReceiptTemplate.tsx
import type { PaymentMethodDto } from "../api/transactions";

interface ReceiptItem {
  name: string;
  packType: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

interface ReceiptTemplateProps {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod: PaymentMethodDto;
  notes?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
  transactionReference: string;
  timestamp: string;
}

export default function ReceiptTemplate({
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  paymentMethod,
  notes,
  items,
  subtotal,
  discount,
  discountAmount,
  total,
  transactionReference,
  timestamp,
}: ReceiptTemplateProps) {
  const formattedTime = new Date(timestamp).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    hour12: true,
  });

  return (
    <div
      style={{
        width: "384px",
        fontFamily:
          "ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', monospace",
        fontSize: "12px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: "16px",
        margin: "0",
        lineHeight: 1.4,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
          YOUR BUSINESS NAME
        </div>
        <div>Lagos, Nigeria</div>
        <div>Tel: +234 XXX XXX XXXX</div>
        <div style={{ marginTop: "8px", fontSize: "10px", color: "#555555" }}>
          OFFICIAL RECEIPT
        </div>
        <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "4px" }}>
          Ref: {transactionReference}
        </div>
        <div style={{ fontSize: "10px", color: "#555555", marginTop: "4px" }}>
          {formattedTime}
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #999999",
          margin: "10px 0",
        }}
      />

      {/* Customer */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Customer:</div>
        <div>{customerName}</div>
        {customerPhone && <div>{customerPhone}</div>}
        {customerEmail && <div>{customerEmail}</div>}
        {customerAddress && <div>{customerAddress}</div>}
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #999999",
          margin: "10px 0",
        }}
      />

      {/* Items */}
      <div style={{ marginBottom: "10px" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <div>
              <div>{item.name}</div>
              <div style={{ fontSize: "10px", color: "#666666" }}>
                {item.packType} × {item.qty}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>₦{item.lineTotal.toFixed(2)}</div>
              <div style={{ fontSize: "10px", color: "#666666" }}>
                @{item.unitPrice.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #999999",
          margin: "10px 0",
        }}
      />

      {/* Totals */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>₦{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#0d9488", // teal, but as hex
            }}
          >
            <span>Discount ({discount.toFixed(1)}%)</span>
            <span>-₦{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            marginTop: "6px",
            paddingTop: "6px",
            borderTop: "1px solid #000000",
          }}
        >
          <span>TOTAL</span>
          <span>₦{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Payment Method</div>
        <div>{paymentMethod.replace(/_/g, " ")}</div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontWeight: "bold" }}>Notes</div>
          <div>{notes}</div>
        </div>
      )}

      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #999999",
          margin: "10px 0",
        }}
      />

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#555555" }}>
        Thank you for your patronage!
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "9px",
          color: "#777777",
          marginTop: "6px",
        }}
      >
        www.yourbusiness.ng
      </div>
    </div>
  );
}
