import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colors for the Pie Chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-white p-8">Loading Analytics...</div>;
  if (error || !stats) return <div className="text-red-400 p-8">{error || 'Analytics unavailable'}</div>;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold text-text-primary">System Analytics</h2>

      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-secondary p-6 rounded-lg shadow border border-border">
          <h3 className="text-text-muted text-sm uppercase">Total Users</h3>
          <p className="text-4xl font-bold text-brand">{stats.counts.users}</p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-lg shadow border border-border">
          <h3 className="text-text-muted text-sm uppercase">Total Reviews</h3>
          <p className="text-4xl font-bold text-green-500">{stats.counts.reviews}</p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-lg shadow border border-border">
          <h3 className="text-text-muted text-sm uppercase">Active Events</h3>
          <p className="text-4xl font-bold text-blue-400">{stats.counts.activeEvents}</p>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart A: User Growth (Bar Chart) */}
        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold text-text-primary mb-4">New User Registrations (Monthly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                />
                <Bar dataKey="users" fill="#8884d8" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Genre Distribution (Pie Chart) */}
        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold text-text-primary mb-4">Game Library by Genre</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.genreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.charts.genreDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;