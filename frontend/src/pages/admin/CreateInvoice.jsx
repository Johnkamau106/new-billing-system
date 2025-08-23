import React, { useState } from 'react';

const CreateInvoice = () => {
    const [clientId, setClientId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState([{ description: '', amount: '' }]);

    const handleItemChange = (index, event) => {
        const values = [...items];
        values[index][event.target.name] = event.target.value;
        setItems(values);
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', amount: '' }]);
    };

    const handleRemoveItem = (index) => {
        const values = [...items];
        values.splice(index, 1);
        setItems(values);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const invoiceData = {
            client_id: clientId,
            due_date: dueDate,
            items: items.map(item => ({ ...item, amount: parseFloat(item.amount) }))
        };

        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                alert('Invoice created successfully!');
                // Clear form
                setClientId('');
                setDueDate('');
                setItems([{ description: '', amount: '' }]);
            } else {
                const errorData = await response.json();
                alert(`Failed to create invoice: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('An error occurred while creating the invoice.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientId">
                        Client ID
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="clientId"
                        type="text"
                        placeholder="Client ID"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                        Due Date
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </div>

                <h2 className="text-xl font-bold mb-2">Invoice Items</h2>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-2 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            placeholder="Description"
                            name="description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                        <input
                            className="shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 mr-2 leading-tight focus:outline-none focus:shadow-outline"
                            type="number"
                            placeholder="Amount"
                            name="amount"
                            value={item.amount}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                        <button type="button" onClick={() => handleRemoveItem(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddItem} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                    Add Item
                </button>

                <div className="flex items-center justify-between">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Create Invoice
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;
