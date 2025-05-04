import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LoadData } from '../types';

interface LoadChartProps {
  data: LoadData[];
}

const LoadChart: React.FC<LoadChartProps> = ({ data }) => {
  // Сортируем данные по дате в хронологическом порядке
  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const chartData = sortedData.map(item => ({
    date: format(item.date, 'dd MMM', { locale: ru }),
    hours: item.hours,
    originalDate: item.date // сохраняем оригинальную дату для сортировки
  }));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: '#2A5A84', 
          fontWeight: 600, 
          mb: 2,
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}
      >
        График учебной нагрузки
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        height: 'calc(100% - 40px)', 
        flex: 1,
        position: 'relative'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(165, 199, 228, 0.15)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#5E7E99', fontSize: '0.75rem' }} 
              axisLine={{ stroke: 'rgba(165, 199, 228, 0.3)' }} 
            />
            <YAxis
              label={{ 
                value: 'Академически',
                angle: -90,
                position: 'insideLeft',
                fill: '#5E7E99',
                fontSize: '0.75rem',
                style: { textAnchor: 'middle' },
                offset: -5
              }}
              tick={{ fill: '#5E7E99', fontSize: '0.75rem' }}
              axisLine={{ stroke: 'rgba(165, 199, 228, 0.3)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #A5C7E4',
                borderRadius: '8px',
                color: '#333',
                boxShadow: '0 2px 10px rgba(165, 199, 228, 0.2)'
              }}
              formatter={(value) => [`${value} ч`, 'Нагрузка']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="hours" 
              fill="#A5C7E4" 
              name="Часы" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default LoadChart; 