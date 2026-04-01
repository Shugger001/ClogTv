"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

const articleData = [
  { day: "Mon", views: 1800, engagement: 520 },
  { day: "Tue", views: 2400, engagement: 710 },
  { day: "Wed", views: 2100, engagement: 620 },
  { day: "Thu", views: 2950, engagement: 840 },
  { day: "Fri", views: 3300, engagement: 940 },
];

export function OverviewCharts() {
  return (
    <section className="density-grid grid lg:grid-cols-2">
      <article className="ui-card density-card">
        <h3 className="text-sm uppercase tracking-[0.2em] text-red-300">Views per article</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={articleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
      <article className="ui-card density-card">
        <h3 className="text-sm uppercase tracking-[0.2em] text-red-300">User engagement</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={articleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="engagement" stroke="#b91c1c" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
