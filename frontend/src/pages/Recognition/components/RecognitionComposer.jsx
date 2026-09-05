import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { createRecognition } from '../../../api/recognition.js';
import { getPeople } from '../../../data/service.js';
import { useActionStore } from '../../../store/actionStore.js';
import { useToast } from '../../../hooks/useToast.js';
import { CONTRIBUTION_DIMENSIONS } from '../data/awardLevels.js';

/**
 * Recognition composer modal (spec section 14). Keeps the existing backend
 * contract (personId + type + summary). Not overbuilt during this UI phase —
 * award level, evidence, project and impact arrive with the next phase.
 */
const RecognitionComposer = ({ open, onClose, onSubmitted }) => {
  const people = getPeople();
  const { markRecognized, unmarkRecognized } = useActionStore();
  const toast = useToast();
  const [composer, setComposer] = useState({ personId: '', type: 'delivery', summary: '' });
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(composer.personId) && composer.summary.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const draftId = `draft-${Date.now()}`;
      markRecognized(draftId);
      await createRecognition({ personId: composer.personId, type: composer.type, summary: composer.summary });
      toast('Recognition sent', { actionLabel: 'Undo', action: () => unmarkRecognized(draftId) });
      setComposer({ personId: '', type: 'delivery', summary: '' });
      onClose();
      onSubmitted?.();
    } catch (err) {
      toast(err.message ?? 'Could not send recognition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nominate / Create Recognition</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <TextField
          select
          label="Person"
          value={composer.personId}
          onChange={(e) => setComposer((c) => ({ ...c, personId: e.target.value }))}
        >
          {people.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecognitionComposer;