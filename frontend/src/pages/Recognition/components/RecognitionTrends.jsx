import { Box, MenuItem, TextField, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Surface from '../../../components/styled/Surface.jsx';
import { CONTRIBUTION_DIMENSIONS } from '../data/awardLevels.js';

const RANGES = ['Last 6 months'];

/**
 * Stacked bar chart of recognition activity by month and contribution
 * dimension (spec section 11). Derived from the feed in recognitionAdapter;
 * provides context rather than dominating the page.
 */
const RecognitionTrends = ({ data }) => (
  <Surface sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Recognition Trends</Typography>
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
          Recognition activity by contribution dimension
        </Typography>
      </Box>
      <TextField
        select
        size="small"
        value={RANGES[0]}
        sx={{
          minWidth: 150,
          flexShrink: 0,
          '& .MuiInputBase-root': { fontSize: 12.5, bgcolor: 'background.default' },
        }}
      >
        {RANGES.map((r) => (
          <MenuItem key={r} value={r} sx={{ fontSize: 12.5 }}>
            {r}
          </MenuItem>
        ))}
      </TextField>
    </Box>

    <Box sx={{ mt: 2, flex: 1, minHeight: 240 }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap="32%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-table)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(112,128,97,0.08)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              fontSize: 12.5,
              boxShadow: 'var(--shadow-float)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12.5 }} iconSize={9} iconType="circle" />
          {CONTRIBUTION_DIMENSIONS.map((d) => (
            <Bar key={d.key} dataKey={d.key} name={d.label} stackId="a" fill={d.color} maxBarSize={30} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </Surface>
);

export default RecognitionTrends;