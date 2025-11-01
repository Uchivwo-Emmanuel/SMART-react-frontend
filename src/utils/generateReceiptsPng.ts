// src/utils/generateReceiptPng.ts
import html2canvas from "html2canvas";
import type { ReactElement } from "react";

export const generateAndDownloadReceiptPng = async (
  receiptElement: ReactElement,
  filename: string,
): Promise<void> => {
  const container = document.createElement("div");
  // ✅ Critical: Isolate from global styles
  container.style.all = "initial"; // Reset all inherited styles
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "384px";
  container.style.fontFamily =
    "ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', monospace"; // Safe monospace
  container.style.fontSize = "12px";
  container.style.color = "#000000";
  container.style.backgroundColor = "#ffffff";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.border = "none";
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  const rootElement = document.createElement("div");
  rootElement.style.all = "inherit"; // Inherit only safe styles
  container.appendChild(rootElement);

  const { createRoot } = await import("react-dom/client");
  const root = createRoot(rootElement);

  try {
    root.render(receiptElement);
    await new Promise((resolve) => setTimeout(resolve, 150)); // Slight delay for safety

    const canvas = await html2canvas(rootElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false, // Reduce noise
      ignoreElements: (element) => element.tagName === "SCRIPT", // Extra safety
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    });
  } catch (error) {
    console.error("Receipt generation failed:", error);
    throw error;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};
