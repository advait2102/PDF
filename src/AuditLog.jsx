import React, { useEffect, useState } from 'react';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Read from localStorage instead of public JSON
    try {
      const localLogs = JSON.parse(localStorage.getItem('pdftron-auditlog') || '[]');
      setLogs(localLogs);
    } catch {
      setLogs([]);
    }
  }, []);

  return (
    <div style={{ padding: 22 }}>
      <h2 style={{ fontWeight: 500, fontSize: 16, marginBottom: 14 }}>PDF File manager Audit Log</h2>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', overflow: 'auto', padding: 0, minHeight: 80 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 16px', color: '#222', fontWeight: 600, background: '#f7f8fa', border: 'none' }}>Date</th>
              <th style={{ padding: '10px 16px', color: '#222', fontWeight: 600, background: '#f7f8fa', border: 'none' }}>Page</th>
              <th style={{ padding: '10px 16px', color: '#222', fontWeight: 600, background: '#f7f8fa', border: 'none' }}>Event</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No activity yet</td></tr>
            )}
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td style={{ padding: '8px 16px', color: '#222', border: 'none' }}>{log.date}</td>
                <td style={{ padding: '8px 16px', color: '#222', border: 'none' }}>{log.page}</td>
                <td style={{ padding: '8px 16px', color: '#222', border: 'none' }}>{log.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
