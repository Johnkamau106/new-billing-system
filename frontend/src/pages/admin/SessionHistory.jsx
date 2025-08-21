import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { format } from 'date-fns';
import '../Clients.css'; // Reusing some client-related CSS

const SessionHistory = () => {
  const { data: sessions, isLoading, isError, error } = useQuery({
    queryKey: ['radiusSessions'],
    queryFn: () => api.get('/radius_sessions'),
  });

  if (isLoading) {
    return <div className="clients-list-page">Loading session history...</div>;
  }

  if (isError) {
    return <div className="clients-list-page">Error: {error.message}</div>;
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (seconds === 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let duration = '';
    if (h > 0) duration += `${h}h `;
    if (m > 0) duration += `${m}m `;
    if (s > 0 || duration === '') duration += `${s}s`;
    return duration.trim();
  };

  return (
    <div className="clients-list-page">
      <div className="clients-list-page__header">
        <h1 className="clients-list-page__title">Session History</h1>
      </div>

      {sessions.length === 0 ? (
        <p>No session data available.</p>
      ) : (
        <div className="sessions-table-container">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Session ID</th>
                <th>Start Time</th>
                <th>Stop Time</th>
                <th>Duration</th>
                <th>Data In</th>
                <th>Data Out</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.username}</td>
                  <td>{session.session_id}</td>
                  <td>{format(new Date(session.start_time), 'yyyy-MM-dd HH:mm:ss')}</td>
                  <td>{session.stop_time ? format(new Date(session.stop_time), 'yyyy-MM-dd HH:mm:ss') : 'Active'}</td>
                  <td>{formatDuration(session.session_time)}</td>
                  <td>{formatBytes(session.input_octets)}</td>
                  <td>{formatBytes(session.output_octets)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
