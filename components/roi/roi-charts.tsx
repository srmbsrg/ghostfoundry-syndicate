'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

interface ROIChartsProps {
  results: {
    monthlySavingsHours: number;
    monthlyCostSavings: number;
    annualCostSavings: number;
    netMonthlySavings: number;
    syndicateCost: number;
  };
  inputs: {
    employees: number;
    departments: number;
    monthlySpend: number;
    weeklyHours: number;
  };
}

export default function ROICharts({ results, inputs }: ROIChartsProps) {
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const cumulativeSavings = results?.netMonthlySavings ? results.netMonthlySavings * month : 0;
    return {
      month: `M${month}`,
      savings: cumulativeSavings,
    };
  });

  const breakdownData = [
    { name: 'Time Savings', value: results?.monthlyCostSavings ?? 0, color: '#22d3ee' },
    { name: 'Syndicate Cost', value: results?.syndicateCost ?? 0, color: '#8b5cf6' },
  ];

  const comparisonData = [
    { name: 'Manual Ops', current: inputs?.weeklyHours ?? 0, withSyndicate: Math.round((inputs?.weeklyHours ?? 0) * 0.35) },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Cumulative Savings Over Time */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cumulative Savings (12 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [formatCurrency(value), 'Net Savings']}
              />
              <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#22d3ee" 
                strokeWidth={2}
                fill="url(#savingsGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Cost Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {breakdownData?.map?.((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color ?? '#ccc'} />
                )) ?? []}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend 
                verticalAlign="top" 
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hours Comparison */}
      <div className="glass-card rounded-xl p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Hours: Before vs After Syndicate</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical">
              <XAxis 
                type="number" 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }}
                formatter={(value: number) => [`${value} hours`, '']}
              />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="current" name="Current (Manual)" fill="#f87171" radius={[0, 4, 4, 0]} />
              <Bar dataKey="withSyndicate" name="With Syndicate" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
