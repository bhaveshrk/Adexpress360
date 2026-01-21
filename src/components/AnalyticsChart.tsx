import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { getAdStatsHistory } from '../lib/analytics';
import { Loader2 } from 'lucide-react';

interface AnalyticsChartProps {
    adId: string;
    totalViews: number;
    totalCalls: number;
}

interface DailyStat {
    date: string;
    views_count: number;
    calls_count: number;
}

export function AnalyticsChart({ adId }: AnalyticsChartProps) {
    const [data, setData] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const stats = await getAdStatsHistory(adId);
            setData(stats || []);
            setLoading(false);
        };

        fetchData();
    }, [adId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (data.length === 0 && totalViews === 0 && totalCalls === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-center p-6">
                <p className="text-gray-500 font-medium">No analytics data yet</p>
                <p className="text-xs text-gray-400 mt-1">Views and calls will appear here once your ad gets traction.</p>
            </div>
        );
    }

    // Format dates for display
    const formattedData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-900/50">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50">
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider mb-1">Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCalls}</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-center p-6 border-dashed">
                    <p className="text-gray-500 font-medium">Detailed history starts today</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                        Your total views are counted, but daily breakdown charts will begin populating from tomorrow as new views come in.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 ml-2">Views Overview</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views_count"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                        name="Views"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Only show Calls chart if there are any calls */}
                    {data.some(d => d.calls_count > 0) && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 ml-2">Calls & Interactions</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="calls_count" fill="#10B981" radius={[4, 4, 0, 0]} name="Calls" barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    )}
        </>
    )
}
        </div >
    );
}
