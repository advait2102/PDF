import React, { useEffect, useState } from 'react';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Simulate reading from localStorage with sample data since localStorage isn't available
     try {
      const localLogs = JSON.parse(localStorage.getItem('pdftron-auditlog') || '[]');
      const enrichedLogs = localLogs.map(log => ({ ...log, user: 'Guest', currentPage: log.page || '-', document: log.document || 'N/A' }));
      setLogs(enrichedLogs);
    } catch {
      setLogs([]);
    }
  }, []);
    
    
  const clearLogs = () => {
    
    localStorage.removeItem('pdftron-auditlog');
    setLogs([]);
  };
  return (
    <div className="p-6">
      <h2 className="font-bold text-lg text-base mb-4">PDF File Manager Audit Log</h2>
      <button
        onClick={clearLogs}
        className=" bg-blue-500 mb-4 px-4 py-2 text-white border-none rounded cursor-pointer hover:bg-blue-700 transition-colors"
      >
        Clear All Logs
      </button>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden \">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-gray-800 font-semibold bg-gray-50 border-none text-left">Date</th>
                <th className="px-4 py-2.5 text-gray-800 font-semibold bg-gray-50 border-none text-left">User</th>
                <th className="px-4 py-2.5 text-gray-800 font-semibold bg-gray-50 border-none text-left">Current Page</th>
                <th className="px-4 py-2.5 text-gray-800 font-semibold bg-gray-50 border-none text-left">Document</th>
                <th className="px-4 py-2.5 text-gray-800 font-semibold bg-gray-50 border-none text-left">Event</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 p-4">No activity yet</td>
                </tr>
              )}
              {logs.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800 border-none">{log.date}</td>
                  <td className="px-4 py-2 text-gray-800 border-none">{log.user}</td>
                  <td className="px-4 py-2 text-gray-800 border-none">{log.currentPage}</td>
                  <td className="px-4 py-2 text-gray-800 border-none">{log.document}</td>
                  <td className="px-4 py-2 text-gray-800 border-none">{log.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;