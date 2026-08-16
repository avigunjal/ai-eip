import { Component } from 'react';
import { Box, Typography } from '@mui/material';
import BarChart from '@mui/icons-material/BarChart';

/**
 * Local error boundary for chart rendering.
 *
 * Recharts' ResponsiveContainer can throw transiently while measuring its
 * container (e.g. on the first paint after a navigation, before layout has
 * settled). Without this boundary the error would bubble to the router's
 * `errorElement` and replace the whole page with the "out of bounds" screen.
 * Here it degrades to a small fallback and keeps the rest of the page alive.
 *
 * The boundary resets whenever it receives new chart content (navigation to a
 * different entity), so a one-off failure doesn't permanently disable charts.
 */
class ChartBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, children: props.children };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.children !== state.children) {
      return { error: null, children: props.children };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <BarChart fontSize="small" />
          <Typography component="span" sx={{ fontSize: 13 }}>
            Chart unavailable — use the data table toggle above.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ChartBoundary;