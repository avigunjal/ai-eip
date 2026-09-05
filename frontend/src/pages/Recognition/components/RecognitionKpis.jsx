import { Grid } from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import People from '@mui/icons-material/People';
import BarChart from '@mui/icons-material/BarChart';
import Star from '@mui/icons-material/Star';
import MetricCard from '../../../components/common/MetricCard.jsx';

const CARD_ACCOUNTS = {
  total: { icon: EmojiEvents, bg: 'var(--primary-lighter)', color: 'var(--primary)' },
  people: { icon: People, bg: 'var(--teal-lighter)', color: 'var(--teal)' },
  projects: { icon: BarChart, bg: 'var(--info-lighter)', color: 'var(--info)' },
  evidence: { icon: Star, bg: 'var(--amber-lighter)', color: 'var(--amber)' },
};

/** Four KPI cards (spec section 6) derived from the live recognition feed. */
const RecognitionKpis = ({ kpis }) => (
  <Grid container spacing={2}>
    {kpis.map((k) => {
      const account = CARD_ACCOUNTS[k.key];
      const Icon = account?.icon ?? Star;
      return (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={k.key}>
          <MetricCard
            label={k.label}
            value={k.value}
            delta={k.delta}
            detail={k.detail}
            help={k.help}
            icon={<Icon />}
            iconBg={account?.bg}
            iconColor={account?.color}
          />
        </Grid>
      );
    })}
  </Grid>
);

export default RecognitionKpis;