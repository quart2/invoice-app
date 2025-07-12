import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const InvoicePreview = ({ invoice }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header details
    doc.text(`Invoice ID : ${invoice._id}`, 20, 20);
    doc.text(`Customer Name : ${invoice.customerName}`, 20, 30);
    doc.text(`Customer Email : ${invoice.customerEmail}`, 20, 40);
    doc.text(
      `Invoice Date : ${new Date(invoice.createdAt).toLocaleDateString()}`,
      20,
      50
    );

    // Table headers
    const tableColumnHeaders = [
      "Product Name",
      "Quantity",
      "Price ($)",
      "Total ($)",
    ];

    let subtotal = 0;

    // Product rows with total per item
    const tableRows = invoice.products.map((product) => {
      const total = product.quantity * product.price;
      subtotal += total;
      return [
        product.name,
        product.quantity,
        product.price.toFixed(2),
        total.toFixed(2),
      ];
    });

    // Tax and Grand Total
    const taxAmount = (subtotal * invoice.tax) / 100;
    const grandTotal = subtotal + taxAmount;

    // Render table
    doc.autoTable({
      startY: 60,
      head: [tableColumnHeaders],
      body: tableRows,
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, finalY);
    doc.text(`Tax (${invoice.tax}%): $${taxAmount.toFixed(2)}`, 20, finalY + 10);
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 20, finalY + 20);

    doc.save(`invoice_${invoice._id}.pdf`);
  };

  // For preview UI
  const subtotal = invoice.products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );
  const taxAmount = (subtotal * invoice.tax) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Invoice Preview
        </h2>
        <div className="mb-4 space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Invoice ID:</span> {invoice._id}
          </p>
          <p>
            <span className="font-semibold">Customer Name:</span>{" "}
            {invoice.customerName}
          </p>
          <p>
            <span className="font-semibold">Customer Email:</span>{" "}
            {invoice.customerEmail}
          </p>
          <p>
            <span className="font-semibold">Invoice Date:</span>{" "}
            {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Tax Rate:</span> {invoice.tax}%
          </p>
          <p>
            <span className="font-semibold">Grand Total:</span> $
            {grandTotal.toFixed(2)}
          </p>
        </div>
        <button
          onClick={generatePDF}
          className="w-full bg-blue-900 text-white px-4 py-3 rounded-md hover:bg-blue-800 transition font-semibold text-lg"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview;
