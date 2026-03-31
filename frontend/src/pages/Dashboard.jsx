import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, GraduationCap, DollarSign, ArrowUpRight, TrendingUp, CalendarCheck, BookOpen } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

const mockRevenueData = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Apr', total: 2400 },
  { name: 'May', total: 2800 },
  { name: 'Jun', total: 3200 },
];

const mockAttendanceData = [
  { name: 'Mon', present: 95 },
  { name: 'Tue', present: 92 },
  { name: 'Wed', present: 88 },
  { name: 'Thu', present: 96 },
  { name: 'Fri', present: 91 },
  { name: 'Sat', present: 82 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard?action=stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 md:w-96 rounded-lg mb-2" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Here's what is happening with your institute today.</p>
        </div>
        <div className="bg-card px-5 py-2.5 rounded-full border border-border shadow-sm text-sm font-semibold flex items-center gap-2.5 text-foreground hover:shadow-md transition-shadow">
          <CalendarCheck className="w-4 h-4 text-primary" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Premium KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm overflow-hidden relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-blue-50/10 dark:to-blue-900/10">
          <div className="absolute inset-x-0 -bottom-2 h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black tracking-tight">{stats?.total_students || 0}</div>
            <p className="text-xs font-semibold mt-2 flex items-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm overflow-hidden relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-emerald-50/10 dark:to-emerald-900/10">
          <div className="absolute inset-x-0 -bottom-2 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fees Collected</CardTitle>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black tracking-tight">${stats?.fees_collected || 0}</div>
            <p className="text-xs font-semibold mt-2 flex items-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.5% this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm overflow-hidden relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-rose-50/10 dark:to-rose-900/10">
          <div className="absolute inset-x-0 -bottom-2 h-1/2 bg-gradient-to-t from-rose-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Fees</CardTitle>
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black tracking-tight">${stats?.pending_fees || 0}</div>
            <p className="text-xs font-semibold mt-2 flex items-center text-rose-600 dark:text-rose-400">
              Action required
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm overflow-hidden relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-purple-50/10 dark:to-purple-900/10">
          <div className="absolute inset-x-0 -bottom-2 h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black tracking-tight">{stats?.total_courses || 0}</div>
            <p className="text-xs font-semibold mt-2 flex items-center text-purple-600 dark:text-purple-400">
              Across 12 batches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly fee collection trends</CardDescription>
              </div>
              <div className="bg-muted px-3 py-1 rounded-md text-xs font-medium">Last 6 Months</div>
            </div>
          </CardHeader>
          <CardContent className="pl-0 pb-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Average present percentage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
