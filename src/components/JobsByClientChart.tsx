import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JobsByClientData {
  client: string;
  jobs: number;
}

interface JobsByClientChartProps {
  data: JobsByClientData[];
}

const JobsByClientChart: React.FC<JobsByClientChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="client"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
            }}
          />
          <Legend />
          <Bar dataKey="jobs" fill="#475569" name="Jobs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByClientChart;

