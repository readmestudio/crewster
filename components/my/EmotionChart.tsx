'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyCheckIn } from '@/types';
import { format } from 'date-fns';

interface EmotionChartProps {
  checkIns: DailyCheckIn[];
}

export default function EmotionChart({ checkIns }: EmotionChartProps) {
  const data = checkIns.map((checkIn) => ({
    date: format(new Date(checkIn.date), 'MM/dd'),
    intensity: checkIn.intensity,
    emotion: checkIn.emotion,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">감정 변화</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#facc15"
            strokeWidth={2}
            dot={{ fill: '#facc15', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
