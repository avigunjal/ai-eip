import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Dialog, DialogContent, Divider, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, TextField, Typography,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import Folder from '@mui/icons-material/Folder';
import Group from '@mui/icons-material/Group';
import Person from '@mui/icons-material/Person';
import MenuBook from '@mui/icons-material/MenuBook';
import { useUiStore } from '../../store/uiStore.js';
import { getProjects, getPeople, getTeams, getKnowledgeAreas } from '../../data/service.js';
import { paths } from '../../config/paths.js';
import { sidebarLinks, iconMap } from '../../routes/sitemap.js';

/**
 * ⌘K command palette: quick navigation to sidebar sections plus fuzzy search
 * over projects, systems, teams, and people.
 *
 * REMAINING (extend later):
 *  - keyboard navigation (arrow keys) + highlighting matches
 *  - fuzzy scoring / ranking, grouping by type with section headers
 *  - global actions (e.g. "New risk", "Export")
 */
const CommandPalette = () => {
  const { commandPaletteOpen, closeCommandPalette } = useUiStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (commandPaletteOpen) setQuery('');
  }, [commandPaletteOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const match = (s) => s.toLowerCase().includes(q);
    return [
      ...getProjects().filter((p) => match(p.name)).map((p) => ({ id: p.id, label: p.name, sub: 'Project', to: paths.project(p.id), icon: Folder })),
      ...getKnowledgeAreas().filter((k) => match(k.name)).map((k) => ({ id: k.id, label: k.name, sub: 'System', to: paths.system(k.id), icon: MenuBook })),
      ...getTeams().filter((t) => match(t.name)).map((t) => ({ id: t.id, label: t.name, sub: 'Team', to: paths.team(t.id), icon: Group })),
      ...getPeople().filter((p) => match(p.name)).map((p) => ({ id: p.id, label: p.name, sub: 'Person', to: paths.person(p.id), icon: Person })),
    ].slice(0, 12);
  }, [query]);

  const go = (to) => {
    navigate(to);
    closeCommandPalette();
  };

  return (
    <Dialog open={commandPaletteOpen} onClose={closeCommandPalette} fullWidth maxWidth="sm">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 }}>
        <Search color="disabled" />
        <TextField
          autoFocus
          fullWidth
          placeholder="Search projects, systems, teams, people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
        />
        <IconButton onClick={closeCommandPalette} aria-label="Close search">
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      <DialogContent sx={{ p: 1 }}>
        {query === '' ? (
          <>
            <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
              Navigate
            </Typography>
            <List dense>
              {sidebarLinks.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <ListItemButton key={link.to} onClick={() => go(link.to)}>
                    <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={link.name} />
                  </ListItemButton>
                );
              })}
            </List>
          </>
        ) : results.length === 0 ? (
          <Typography sx={{ px: 2, py: 2, color: 'text.secondary' }}>No results for “{query}”.</Typography>
        ) : (
          <List dense>
            {results.map((r) => (
              <ListItemButton key={`${r.sub}-${r.id}`} onClick={() => go(r.to)}>
                <ListItemIcon><r.icon fontSize="small" /></ListItemIcon>
                <ListItemText primary={r.label} secondary={r.sub} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
