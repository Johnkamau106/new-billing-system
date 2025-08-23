import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Invoice = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await fetch(`/api/invoices/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setInvoice(data);
                } else {
                    console.error('Failed to fetch invoice');
                }
            } catch (error) {
                console.error('Error fetching invoice:', error);
            }
        };

        fetchInvoice();
    }, [id]);

    if (!invoice) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Invoice #{invoice.id}</h1>
                    <span className={`text-lg font-semibold ${invoice.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                        {invoice.status}
                    </span>
                </div>
                <div className="mb-4">
                    <p><strong>Client ID:</strong> {invoice.client_id}</p>
                    <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-2">Invoice Items</h2>
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Description</th>
                                <th className="py-3 px-6 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {invoice.items.map(item => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left">{item.description}</td>
                                    <td className="py-3 px-6 text-right">${item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Payments</h2>
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Payment ID</th>
                                <th className="py-3 px-6 text-right">Amount</th>
                                <th className="py-3 px-6 text-center">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {invoice.payments.map(payment => (
                                <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left">{payment.id}</td>
                                    <td className="py-3 px-6 text-right">${payment.amount.toFixed(2)}</td>
                                    <td className="py-3 px-6 text-center">{new Date(payment.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
