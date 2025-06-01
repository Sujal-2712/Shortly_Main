import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function Location({ stats }) {
    if (!stats.length) {
        return (
            <div className="flex justify-center items-center h-full text-lg font-semibold text-gray-500">
                No Data Available!!
            </div>
        );
    }

    const counts = stats.reduce((acc, item) => {
        if (acc[item.city]) {
            acc[item.city] += 1;
        } else {
            acc[item.city] = 1;
        }

        return acc;
    }, {});

    const data = Object.entries(counts).map(([city, count]) => ({
        city,
        count
    }));

    return (
        <div className="w-full p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">City-wise Data</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip labelStyle={{ color: "green" }} />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
