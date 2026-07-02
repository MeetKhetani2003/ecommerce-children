"use client";

import { useRef, useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import dynamic from "next/dynamic";

const BarcodeComponent = dynamic(() => import("react-barcode"), { ssr: false });

interface OrderBarcodeProps {
  orderId: string;
  customerName?: string;
  phone?: string;
  width?: number;
  height?: number;
  fontSize?: number;
}

export default function OrderBarcode({ 
  orderId, 
  customerName = "", 
  phone = "", 
  width = 1.2, 
  height = 50, 
  fontSize = 11 
}: OrderBarcodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector("canvas");
    if (!canvas) {
      alert("Barcode image not fully rendered yet. Please try again.");
      return;
    }
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `barcode_${orderId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download barcode:", err);
    }
  };

  const handlePrint = () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector("canvas");
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print the barcode label.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Barcode Label - ${orderId}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 30px;
              margin: 0;
              text-align: center;
              background-color: #ffffff;
            }
            .label-card {
              border: 2px solid #1a0f1c;
              border-radius: 12px;
              padding: 20px;
              width: 320px;
              background: white;
            }
            .title {
              font-size: 15px;
              font-weight: 800;
              color: #8B1D8F;
              margin-bottom: 2px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .subtitle {
              font-size: 10px;
              color: #6B5A6F;
              margin-bottom: 15px;
            }
            .barcode-img {
              margin: 10px 0;
              max-width: 100%;
            }
            .info {
              font-size: 11.5px;
              color: #1a0f1c;
              margin-top: 12px;
              text-align: left;
              border-top: 1px dashed #eeddf0;
              padding-top: 12px;
              line-height: 1.4;
            }
            @media print {
              body { padding: 0; background: none; }
              .label-card { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="title">Saheli Shrungar</div>
            <div class="subtitle">Fancy Dress costume label</div>
            <img class="barcode-img" src="${dataUrl}" alt="Barcode" />
            <div class="info">
              <strong>Order ID:</strong> ${orderId}<br/>
              ${customerName ? `<strong>Customer:</strong> ${customerName}<br/>` : ""}
              ${phone ? `<strong>Phone:</strong> ${phone}<br/>` : ""}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!mounted) {
    return <div className="h-[90px] w-[180px] bg-gray-50 animate-pulse rounded-lg" />;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="bg-white p-2 rounded-xl border border-gray-100 flex items-center justify-center">
        <BarcodeComponent 
          value={orderId} 
          width={width} 
          height={height} 
          fontSize={fontSize} 
          format="CODE128" 
          renderer="canvas" 
        />
      </div>
      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-[11px] font-bold text-[#8B1D8F] hover:underline"
          title="Download Barcode Image"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Save</span>
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 text-[11px] font-bold text-[#8B1D8F] hover:underline"
          title="Print Barcode Label"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Label</span>
        </button>
      </div>
    </div>
  );
}
