import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function Devices({ stats }) {
    if (!stats.length) {
        return (
            <div className="flex justify-center items-center h-full text-lg font-semibold text-gray-500">
                No Data Available!!
            </div>
        );
    }

    const counts = stats.reduce((acc, item) => {
        if (acc[item.device]) {
            acc[item.device] += 1;
        } else {
            acc[item.device] = 1;
        }
        return acc;
    }, {});

    const data = Object.entries(counts).map(([device, count]) => ({
        device,
        count
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="w-full p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">Device Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        labelLine={false}
                        label={({ device, percent }) => {
                            return `${device} : ${(percent * 100).toFixed(0)}%`;
                        }}
                        dataKey="count"
                        fill="#82ca9d"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
