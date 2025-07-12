import React, { useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const AddInvoiceForm = ({ onInvoiceSaved }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    products: [{ name: "", quantity: 1, price: 0, disabled: false }],
    tax: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleProductChange = (index, key, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][key] = value;
    setFormData({ ...formData, products: updatedProducts });
  };

  const addProductRow = () => {
    const updatedProducts = formData.products.map((product) => ({
      ...product,
      disabled: true,
    }));
    setFormData({
      ...formData,
      products: [
        ...updatedProducts,
        { name: "", quantity: 1, price: 0, disabled: false },
      ],
    });
  };

  const deleteProductRow = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const total = formData.products.reduce(
        (sum, product) => sum + product.quantity * product.price,
        0
      );
      const taxAmount = (total * formData.tax) / 100;
      const invoice = { ...formData, total: total + taxAmount };
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/invoices/add`,
        invoice
      );
      if (response.status === 201) {
        toast.success("Invoice saved successfully!");
        setFormData({
          customerName: "",
          customerEmail: "",
          products: [{ name: "", quantity: 1, price: 0, disabled: false }],
          tax: 0,
        });
        onInvoiceSaved(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-10 px-4 sm:px-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-[#0a1d3e] mb-6 text-center">
          Create New Invoice
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name */}
          <div>
            <label className="block text-[#0a1d3e] font-semibold mb-2">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a1d3e] text-gray-800"
              required
            />
          </div>

          {/* Customer Email */}
          <div>
            <label className="block text-[#0a1d3e] font-semibold mb-2">
              Customer Email
            </label>
            <input
              type="email"
              placeholder="Enter customer email"
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a1d3e] text-gray-800"
              required
            />
          </div>

          {/* Product Inputs */}
          <div>
            <h3 className="text-[#0a1d3e] font-semibold mb-3">Products</h3>
            {formData.products.map((product, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 mb-4"
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={(e) =>
                    handleProductChange(index, "name", e.target.value)
                  }
                  disabled={product.disabled}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a1d3e] text-gray-800"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={product.quantity}
                  onChange={(e) =>
                    handleProductChange(index, "quantity", e.target.value)
                  }
                  disabled={product.disabled}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a1d3e] text-gray-800"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                  disabled={product.disabled}
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a1d3e] text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => deleteProductRow(index)}
                  className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            {/* Add Product Button */}
            <button
              type="button"
              onClick={addProductRow}
              className="mt-2 inline-block text-[#0a1d3e] border-2 border-[#0a1d3e] rounded-md px-5 py-2 hover:bg-[#0a1d3e] hover:text-white transition font-semibold"
            >
              + Add Product
            </button>
          </div>

          {/* Tax Input */}
          <div>
            <label className="block text-[#0a1d3e] font-semibold mb-2">
              Tax (%)
            </label>
            <input
              type="number"
              placeholder="Enter tax percentage"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a1d3e] text-gray-800"
              required
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0a1d3e] text-white px-6 py-3 rounded-lg hover:bg-[#132c5e] transition text-lg font-semibold"
          >
            {isLoading ? "Saving..." : "Save Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInvoiceForm;
