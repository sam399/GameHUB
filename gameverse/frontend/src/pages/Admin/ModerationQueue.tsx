import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModerationQueue = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await axios.get('/api/moderation/queue');
    setReports(data.data);
  };

  const handleResolve = async (id: string, action: string) => {
    if(!window.confirm(`Are you sure you want to ${action}?`)) return;
    try {
      await axios.put(`/api/moderation/resolve/${id}`, { action });
      fetchReports(); // Refresh list
    } catch (err) {
      alert('Error resolving report');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">🛡️ Moderation Queue</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">Type</th>
            <th className="p-2">Reason</th>
            <th className="p-2">Reporter</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report: any) => (
            <tr key={report._id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="p-2 text-yellow-400">{report.targetType}</td>
              <td className="p-2">{report.reason}</td>
              <td className="p-2 text-gray-400">{report.reporter.username}</td>
              <td className="p-2 space-x-2">
                <button 
                  onClick={() => handleResolve(report._id, 'DELETE_CONTENT')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                >
                  Delete Content
                </button>
                <button 
                  onClick={() => handleResolve(report._id, 'DISMISS')}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                >
                  Dismiss
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reports.length === 0 && <p className="mt-4 text-center text-gray-500">All clear! No pending reports.</p>}
    </div>
  );
};

export default ModerationQueue;