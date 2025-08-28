import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const Monitoring = () => {
    const [alerts, setAlerts] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const alertsResponse = await api.get('/monitoring/alerts');
                const onlineUsersResponse = await api.get('/monitoring/online-users');
                setAlerts(alertsResponse.data);
                setOnlineUsers(onlineUsersResponse.data);
            } catch (err) {
                setError('Failed to fetch monitoring data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Network Monitoring</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Recent Alerts</h2>
                    <div className="bg-white shadow rounded-lg p-4 h-96 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <p>No recent alerts.</p>
                        ) : (
                            <ul>
                                {alerts.map(alert => (
                                    <li key={alert.id} className="border-b last:border-b-0 py-2">
                                        <p className="font-medium">{alert.name.replace('_', ' ').toUpperCase()}</p>
                                        <p className="text-sm text-gray-600">{alert.payload}</p>
                                        <p className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Online Users ({onlineUsers.length})</h2>
                    <div className="bg-white shadow rounded-lg p-4 h-96 overflow-y-auto">
                        {onlineUsers.length === 0 ? (
                            <p>No users are currently online.</p>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left">Username</th>
                                        <th className="text-left">Session Time (s)</th>
                                        <th className="text-left">Start Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {onlineUsers.map(user => (
                                        <tr key={user.session_id}>
                                            <td>{user.username}</td>
                                            <td>{user.session_time}</td>
                                            <td>{new Date(user.start_time).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Monitoring;
