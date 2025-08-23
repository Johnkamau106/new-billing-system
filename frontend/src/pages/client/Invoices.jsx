import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        // Fetch invoices from the API
        const fetchInvoices = async () => {
            try {
                const response = await fetch('/api/invoices');
                if (response.ok) {
                    const data = await response.json();
                    setInvoices(data);
                } else {
                    console.error('Failed to fetch invoices');
                }
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };

        fetchInvoices();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Invoices</h1>
            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Invoice ID</th>
                            <th className="py-3 px-6 text-center">Due Date</th>
                            <th className="py-3 px-6 text-center">Status</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {invoices.map(invoice => (
                            <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{invoice.id}</td>
                                <td className="py-3 px-6 text-center">{new Date(invoice.due_date).toLocaleDateString()}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`bg-${invoice.status === 'paid' ? 'green' : 'red'}-200 text-${invoice.status === 'paid' ? 'green' : 'red'}-600 py-1 px-3 rounded-full text-xs`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <Link to={`/client/invoices/${invoice.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Invoices;