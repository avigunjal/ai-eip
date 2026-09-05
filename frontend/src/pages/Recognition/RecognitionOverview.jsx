import { Box, Grid, Typography } from '@mui/material';
import EmptyState from '../../components/common/EmptyState.jsx';
import RecognitionKpis from './components/RecognitionKpis.jsx';
import FeaturedAwardHero from './components/FeaturedAwardHero.jsx';
import RecognitionPhilosophy from './components/RecognitionPhilosophy.jsx';
import RecognitionCategories from './components/RecognitionCategories.jsx';
import RecentRecognitionList from './components/RecentRecognitionList.jsx';
import RecognitionTrends from './components/RecognitionTrends.jsx';
import TopContributors from './components/TopContributors.jsx';

/**
 * Overview tab — the complete Recognition dashboard (spec sections 6-12).
 * Desktop: KPI strip, hero + philosophy, category cards, then recent
 * recognition (left) next to trends + top contributors (right).
 */
const RecognitionOverview = ({ derived, onNavigate, onApproved, onOpenDetail }) => {
  if (derived.isEmpty) {
    return (
      <EmptyState
        title="No recognition yet"
        description="Public recognition will appear here as contributions are verified with evidence."
      />
    );
  }

  const { kpis, items, awardLevels, trends, contributors } = derived;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <RecognitionKpis kpis={kpis} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <FeaturedAwardHero />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RecognitionPhilosophy />
        </Grid>
      </Grid>

      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Recognition Categories</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mt: 0.25 }}>
          Different milestones. One purpose — celebrate meaningful contributions.
        </Typography>
        <RecognitionCategories levels={awardLevels} onNavigate={onNavigate} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RecentRecognitionList items={items} onApproved={onApproved} onOpenDetail={onOpenDetail} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <RecognitionTrends data={trends} />
            <TopContributors contributors={contributors} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecognitionOverview;