import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { createRecognition } from '../../../api/recognition.js';
import { getPeople, getProjects, getKnowledgeAreas } from '../../../data/service.js';
import { useActionStore } from '../../../store/actionStore.js';
import { useToast } from '../../../hooks/useToast.js';
import { CONTRIBUTION_DIMENSIONS } from '../data/awardLevels.js';

/**
 * Recognition composer modal — "human submits a nomination" starts the
 * Recognition Intelligence loop. Captures who, what and the optional related
 * context (project/system + related work reference). A submission is a
 * nomination, never an approved recognition: it routes to the Governance
 * Queue for evidence review, deterministic evaluation and human approval.
 */
const RecognitionComposer = ({ open, onClose, onSubmitted }) => {
  const people = getPeople();
  const projects = getProjects();
  const areas = getKnowledgeAreas();
  const relatedScope = [
    ...projects.map((p) => ({ kind: 'project', id: p.id, label: p.name })),
    ...areas.map((a) => ({ kind: 'system', id: a.id, label: `${a.name} (System)` })),
  ];
  const { markRecognized, unmarkRecognized } = useActionStore();
  const toast = useToast();
  const [person, setPerson] = useState(null);
  const [relatedContext, setRelatedContext] = useState(null);
  const [composer, setComposer] = useState({ type: 'delivery', summary: '', relatedWork: '' });
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(person) && composer.summary.trim().length > 0;

  const reset = () => {
    setPerson(null);
    setRelatedContext(null);
    setComposer({ type: 'delivery', summary: '', relatedWork: '' });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const draftId = `draft-${Date.now()}`;
      markRecognized(draftId);
      await createRecognition({
        personId: person.id,
        type: composer.type,
        summary: composer.summary.trim(),
        projectId: relatedContext?.kind === 'project' ? relatedContext.id : null,
        knowledgeAreaId: relatedContext?.kind === 'system' ? relatedContext.id : null,
        relatedWork: composer.relatedWork.trim() || null,
      });
      toast('Nomination submitted for evidence review', { actionLabel: 'Undo', action: () => unmarkRecognized(draftId) });
      reset();
      onClose();
      onSubmitted?.();
    } catch (err) {
      toast(err.message ?? 'Could not submit nomination');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nominate / Create Recognition</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Autocomplete
          options={people}
          getOptionLabel={(p) => p.name}
          value={person}
          onChange={(_, p) => setPerson(p)}
          renderInput={(params) => (
            <TextField {...params} label="Recognize a person" placeholder="Search and select an engineer..." />
          )}
        />
        <TextField
          select
          label="Contribution type"
          value={composer.type}
          onChange={(e) => setComposer((c) => ({ ...c, type: e.target.value }))}
        >
          {CONTRIBUTION_DIMENSIONS.map((d) => (
            <MenuItem key={d.key} value={d.key}>
              {d.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="What did they do?"
          multiline
          minRows={3}
          value={composer.summary}
          onChange={(e) => setComposer((c) => ({ ...c, summary: e.target.value }))}
          placeholder="Describe the specific contribution, outcome, or impact you observed..."
          helperText="Be specific. AI-EIP will use this as a starting point and validate it against available engineering evidence."
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Related context (optional)</Typography>
          <Autocomplete
            options={relatedScope}
            getOptionLabel={(o) => o.label}
            value={relatedContext}
            onChange={(_, o) => setRelatedContext(o)}
            renderInput={(params) => <TextField {...params} placeholder="Project or system..." />}
          />
          <TextField
            value={composer.relatedWork}
            onChange={(e) => setComposer((c) => ({ ...c, relatedWork: e.target.value }))}
            placeholder="Jira ticket / PR / Document / Incident..."
          />
        </Box>

        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.5 }}>
          AI-EIP will validate available engineering evidence before making a recommendation.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          Submit for Evidence Review →
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecognitionComposer;