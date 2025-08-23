import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { format, parseISO } from 'date-fns';
import '../Clients.css'; // Reusing some client-related CSS

const SessionHistory = () => {
  const [usernameFilter, setUsernameFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const { data: sessions, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['radiusSessions', usernameFilter, startDateFilter, endDateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (usernameFilter) params.append('username', usernameFilter);
      if (startDateFilter) params.append('start_date', startDateFilter);
      if (endDateFilter) params.append('end_date', endDateFilter);
      
      const url = `/radius_sessions?${params.toString()}`;
      return api.get(url);
    },
  });

  const handleApplyFilters = () => {
    refetch();
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (usernameFilter) params.append('username', usernameFilter);
    if (startDateFilter) params.append('start_date', startDateFilter);
    if (endDateFilter) params.append('end_date', endDateFilter);
    
    // Construct the URL for the export endpoint
    const exportUrl = `/api/radius_sessions/export?${params.toString()}`;
    window.open(exportUrl, '_blank'); // Open in a new tab to trigger download
  };

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

  const totalInputOctets = sessions?.reduce((sum, session) => sum + session.input_octets, 0) || 0;
  const totalOutputOctets = sessions?.reduce((sum, session) => sum + session.output_octets, 0) || 0;
  const totalSessionTime = sessions?.reduce((sum, session) => sum + session.session_time, 0) || 0;

  return (
    <div className="clients-list-page">
      <div className="clients-list-page__header">
        <h1 className="clients-list-page__title">Session History</h1>
        <div className="filters-container">
          <input
            type="text"
            placeholder="Username"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            className="filter-input"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="filter-input"
          />
          <input
            type="date"
            placeholder="End Date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="filter-input"
          />
          <button onClick={handleApplyFilters} className="filter-button">Apply Filters</button>
          <button onClick={handleExportCsv} className="filter-button export-button">Export to CSV</button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading session history...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : sessions.length === 0 ? (
        <p>No session data available for the selected filters.</p>
      ) : (
        <>
          <div className="summary-stats">
            <p>Total Sessions: {sessions.length}</p>
            <p>Total Data Downloaded: {formatBytes(totalInputOctets)}</p>
            <p>Total Data Uploaded: {formatBytes(totalOutputOctets)}</p>
            <p>Total Session Time: {formatDuration(totalSessionTime)}</p>
          </div>
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
                    <td>{format(parseISO(session.start_time), 'yyyy-MM-dd HH:mm:ss')}</td>
                    <td>{session.stop_time ? format(parseISO(session.stop_time), 'yyyy-MM-dd HH:mm:ss') : 'Active'}</td>
                    <td>{formatDuration(session.session_time)}</td>
                    <td>{formatBytes(session.input_octets)}</td>
                    <td>{formatBytes(session.output_octets)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionHistory;
