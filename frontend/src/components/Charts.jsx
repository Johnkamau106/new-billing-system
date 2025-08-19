// src/components/Charts.jsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

function Charts({ revenueTrend, userGrowth }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Revenue Trend (This Week)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">User Growth (Monthly)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default Charts;
