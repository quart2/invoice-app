import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaRegFilePdf } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";

const PastInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/invoices/all`
      );
      if (Array.isArray(response.data)) {
        setInvoices(response.data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setInvoices([]);
    }
  };

  const confirmDeleteInvoice = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowModal(true);
  };

  const deleteInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/invoices/${selectedInvoiceId}`
      );
      setInvoices((prev) =>
        prev.filter((invoice) => invoice._id !== selectedInvoiceId)
      );
      if (response.status === 200) toast.success("Invoice deleted");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.text(`Invoice ID : ${invoice._id}`, 20, 20);
    doc.text(`Customer Name : ${invoice.customerName}`, 20, 30);
    doc.text(`Customer Email : ${invoice.customerEmail}`, 20, 40);
    doc.text(
      `Invoice Date : ${new Date(invoice.createdAt).toLocaleDateString()}`,
      20,
      50
    );

    const tableColumnHeaders = [
      "Product Name",
      "Quantity",
      "Price ($)",
      "Total ($)",
    ];

    let subtotal = 0;

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

    const taxAmount = (subtotal * invoice.tax) / 100;
    const grandTotal = subtotal + taxAmount;

    doc.autoTable({
      startY: 60,
      head: [tableColumnHeaders],
      body: tableRows,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, finalY);
    doc.text(`Tax (${invoice.tax}%): $${taxAmount.toFixed(2)}`, 20, finalY + 10);
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 20, finalY + 20);

    doc.save(`invoice_${invoice._id}.pdf`);
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f0f4f8] min-h-screen">
      <div className="max-w-full sm:max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-semibold text-[#0a1d3e] text-center py-4 border-b border-gray-300">
          Past Invoices
        </h1>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-[#e2e8f0] text-[#0a1d3e]">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr
                  key={invoice._id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-[#f7fafc]" : "bg-white"
                  } hover:bg-[#dbeafe]`}
                >
                  <td className="px-4 py-3 font-medium text-[#0a1d3e]">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-3">{invoice.customerEmail}</td>
                  <td className="px-4 py-3 font-bold text-green-700">
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => downloadPDF(invoice)}
                      className="bg-[#0a1d3e] text-white py-2 px-3 rounded-md hover:bg-[#132c5e] transition"
                    >
                      <FaRegFilePdf className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDeleteInvoice(invoice._id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <FaTrashCan className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No invoices found. Start creating your first invoice!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600">
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteInvoice}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastInvoices;
