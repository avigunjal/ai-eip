import { Box } from '@mui/material';
import Inbox from '@mui/icons-material/Inbox';
import Paid from '@mui/icons-material/Paid';
import TrendingDown from '@mui/icons-material/TrendingDown';
import MetricCard from '../../../components/common/MetricCard.jsx';
import SparkleIcon from '../../../components/ui/SparkleIcon.jsx';
import { KPI_SUMMARY } from '../data/decisions.js';

const CARD_ACCOUNTS = {
  decisions: { icon: Inbox, bg: 'var(--primary-lighter)', color: 'var(--primary)' },
  value: { icon: Paid, bg: 'var(--teal-lighter)', color: 'var(--teal)' },
  riskReduction: { icon: TrendingDown, bg: 'var(--amber-lighter)', color: 'var(--amber)' },
  aiConfidence: { icon: SparkleIcon, bg: 'var(--ai-lighter)', color: 'var(--ai)' },
};

/**
 * Compact KPI strip (spec section 5): a dashboard-like row of four short
 * stat cards. The currency figure renders statically because the count-up
 * animation rounds to whole numbers.
 */
const DecisionSummaryCards = ({ decisions }) => {
  const cards = [
    { key: 'decisions', label: 'Decisions', value: decisions.length, detail: `${KPI_SUMMARY.newInLast30Days} new in 30 days` },
    { key: 'value', label: 'Potential value', value: KPI_SUMMARY.estimatedValue, detail: `Across ${decisions.length} decisions`, help: 'Estimated business/delivery value, not guaranteed revenue.' },
    { key: 'riskReduction', label: 'Risk reduction', value: KPI_SUMMARY.riskReductionPct, detail: 'If acted on' },
    { key: 'aiConfidence', label: 'AI confidence', value: KPI_SUMMARY.aiConfidencePct, detail: 'Across decisions' },
  ];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {cards.map((card) => {
        const account = CARD_ACCOUNTS[card.key];
        const Icon = account.icon;
        return (
          <Box key={card.key} sx={{ flex: { xs: '1 1 100%', sm: '1 1 42%', lg: '1 1 0' }, minWidth: 0 }}>
            <MetricCard
              compact
              label={card.label}
              value={card.value}
              animate={card.key !== 'value'}
              detail={card.detail}
              help={card.help}
              icon={<Icon />}
              iconBg={account.bg}
              iconColor={account.color}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default DecisionSummaryCards;