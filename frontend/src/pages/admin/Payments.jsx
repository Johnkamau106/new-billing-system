import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const Payments = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: payments, isLoading } = useQuery(
    ['payments', dateRange, filterMethod],
    () => fetch(`/api/payments?range=${dateRange}&method=${filterMethod}`).then(res => res.json())
  );

  const filteredPayments = payments?.filter(payment =>
    payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalAmount = (payments) => {
    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  const downloadReceipt = (paymentId) => {
    window.open(`/api/payments/${paymentId}/receipt`, '_blank');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Payments</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer or transaction ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />

        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="all">All Methods</option>
          <option value="mpesa">M-Pesa</option>
          <option value="cash">Cash</option>
          <option value="bank">Bank Transfer</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Payments ({dateRange})</div>
          <div className="text-2xl font-semibold">
            KES {getTotalAmount(filteredPayments).toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">M-Pesa Payments</div>
          <div className="text-2xl font-semibold">
            KES {getTotalAmount(
              filteredPayments?.filter(p => p.method === 'mpesa')
            ).toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Other Payments</div>
          <div className="text-2xl font-semibold">
            KES {getTotalAmount(
              filteredPayments?.filter(p => p.method !== 'mpesa')
            ).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading payments...</div>
        ) : !filteredPayments?.length ? (
          <div className="p-4 text-center text-gray-500">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(payment.timestamp), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${payment.method === 'mpesa' ? 'bg-green-100 text-green-800' :
                          payment.method === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'}`}>
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      KES {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/invoices/${payment.invoiceId}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        {payment.invoiceNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => downloadReceipt(payment.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
