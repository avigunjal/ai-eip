import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import AvatarGroup from '../../components/common/AvatarGroup.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { getPeople } from '../../data/service.js';
import { fetchRecognitionFeed, createRecognition } from '../../api/recognition.js';
import { useData } from '../../hooks/useData.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { formatRelative } from '../../config/dates.js';
import { useActionStore } from '../../store/actionStore.js';
import { useToast } from '../../hooks/useToast.js';

const TYPE_LABEL = {
  reliability: 'Reliability',
  mentorship: 'Mentorship',
  delivery: 'Delivery',
  knowledge_sharing: 'Knowledge sharing',
};

/**
 * Recognition — impact feed emphasizing evidence and context (not a leaderboard),
 * plus a recognition composer modal.
 *
 * REMAINING (extend later):
 *  - impact composition bars (count by type) as a Recharts chart
 *  - collaboration network (desktop only)
 *  - link each recognition to its evidence (`evidenceIds`)
 */
const Recognition = () => {
  const { data: feed = [], loading, error, retry } = useData(fetchRecognitionFeed);
  const people = getPeople();
  const { markRecognized, unmarkRecognized } = useActionStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [composer, setComposer] = useState({ personId: '', type: 'delivery', summary: '' });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;

  const personOf = (id) => people.find((p) => p.id === id);
  const visible = feed.filter((r) => r.visibility === 'public');

  const handleSubmit = async () => {
    try {
      const draftId = `draft-${Date.now()}`;
      markRecognized(draftId);
      await createRecognition({ personId: composer.personId, type: composer.type, summary: composer.summary });
      toast('Recognition sent', { actionLabel: 'Undo', action: () => unmarkRecognized(draftId) });
      setOpen(false);
      setComposer({ personId: '', type: 'delivery', summary: '' });
      retry();
    } catch (err) {
      toast(err.message ?? 'Could not send recognition');
    }
  };

  const counts = {
    reliability: feed.filter((r) => r.type === 'reliability').length,
    mentorship: feed.filter((r) => r.type === 'mentorship').length,
    delivery: feed.filter((r) => r.type === 'delivery').length,
  };

  return (
    <Box>
      <PageHeader
        title="Recognition"
        subtitle="Impact feed, recognition highlights, and contribution analytics."
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            New recognition
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={6} sm={3}><MetricCard label="Total events" value={feed.length} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Reliability" value={counts.reliability} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Mentorship" value={counts.mentorship} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Delivery" value={counts.delivery} /></Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 3, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontWeight: 600 }}>Impact feed</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          {visible.length === 0 && <EmptyState title="No public recognition yet" />}
          {visible.map((r) => {
            const p = personOf(r.personId);
            return (
              <Box key={r.id} sx={{ display: 'flex', gap: 1.5, p: 2, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)' }}>
                {p && <AvatarGroup people={[p]} max={1} size={36} />}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    {r.person?.name ?? p?.name ?? 'Team member'}
                    <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, ml: 1 }}>
                      {TYPE_LABEL[r.type]} · {formatRelative(r.occurredAt)}
                    </Typography>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.25 }}>{r.summary}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Recognition composer */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send recognition</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select label="Person" value={composer.personId} onChange={(e) => setComposer({ ...composer, personId: e.target.value })}
          >
            {people.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
          <TextField
            select label="Type" value={composer.type} onChange={(e) => setComposer({ ...composer, type: e.target.value })}
          >
            {Object.entries(TYPE_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
          <TextField
            label="What did they do?" multiline minRows={3} value={composer.summary}
            onChange={(e) => setComposer({ ...composer, summary: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!composer.personId || !composer.summary.trim()} onClick={handleSubmit}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recognition;
