import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Box, Button, Chip, CircularProgress, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import Close from '@mui/icons-material/Close';
import { css } from '@emotion/react';
import Folder from '@mui/icons-material/Folder';
import Group from '@mui/icons-material/Group';
import Person from '@mui/icons-material/Person';
import Bolt from '@mui/icons-material/Bolt';
import Lan from '@mui/icons-material/Lan';
import WarningAmber from '@mui/icons-material/WarningAmber';
import StatusBadge from '../common/StatusBadge.jsx';
import { getProjectStatus, getSeverity, healthStatus } from '../../config/riskLabels.js';
import { paths as defaultPaths } from '../../config/paths.js';
import { TOPBAR_HEIGHT } from '../../config/constants.js';
import { dotTravel, glowPulse } from '../../config/animations.js';

/**
 * EngineeringRelationshipGraph — interactive relationship map for a project.
 *
 * Renders Project → Team → Person → Skills → Systems → Risk as an SVG-backed
 * graph (no external graph library): curved connectors with a relationship
 * strength badge, a persistent pulse on risky connections, a slow red glow on
 * the risk node, moving dots that flow along the active path when a node is
 * hovered, hover highlighting of connected nodes, and a click-through detail
 * drawer per node type.
 *
 * `data` is the enriched relationship chain from the dashboard adapter
 * ({ project, teams, people, skills, systems, risks }). `fetchPersonDetail` is
 * optional (an async `(id) => Person`) and enriches the person drawer with
 * role/expertise when available.
 */

const VIEW_W = 1000;
const VIEW_H = 450;

// The relationship spine, in flow order — hovering a node animates dots along
// the downstream sub-path toward risk ("this relationship is causing attention").
const CHAIN = ['project', 'team', 'person', 'skills', 'systems', 'risk'];

// Node layout (center coordinates in the VIEW_W × VIEW_H space, pixel size).
// Node layout (center coordinates in the VIEW_W × VIEW_H space, pixel size).
// All relationship cards (team, person, skills, systems, risk) share one size
// so the grid reads evenly; project is deliberately larger.
const NODE_POS = {
  project: { x: 150, y: 220, w: 212, h: 170 },
  team: { x: 430, y: 76, w: 170, h: 96 },
  person: { x: 430, y: 252, w: 170, h: 96 },
  skills: { x: 690, y: 76, w: 170, h: 96 },
  systems: { x: 690, y: 252, w: 170, h: 96 },
  risk: { x: 880, y: 380, w: 230, h: 96 },
};

const NODE_META = {
  project: { key: 'project', label: 'Project', icon: Folder, color: 'var(--primary)', lighter: 'var(--primary-lighter)' },
  team: { key: 'team', label: 'Engineering team', icon: Group, color: 'var(--violet)', lighter: 'var(--violet-lighter)' },
  person: { key: 'person', label: 'Engineers', icon: Person, color: 'var(--teal)', lighter: 'var(--teal-lighter)' },
  skills: { key: 'skills', label: 'Skills', icon: Bolt, color: 'var(--info)', lighter: 'var(--info-lighter)' },
  systems: { key: 'systems', label: 'Systems', icon: Lan, color: 'var(--primary)', lighter: 'var(--primary-lighter)' },
  risk: { key: 'risk', label: 'Risk', icon: WarningAmber, color: 'var(--red)', lighter: 'var(--red-lighter)' },
};

// The primary relationship spine, with a strength number + small label.
// `curve` is the perpendicular bow (px); positive bows one way, negative the other.
const EDGE_DEFS = [
  { from: 'project', to: 'team', kind: 'ownership', strength: 94, curve: 50 },
  { from: 'team', to: 'person', kind: 'membership', strength: 88, curve: 0 },
  { from: 'person', to: 'skills', kind: 'expertise', strength: 79, curve: -50 },
  { from: 'skills', to: 'systems', kind: 'mapped', strength: 84, curve: 0 },
  { from: 'systems', to: 'risk', kind: 'exposure', strength: 72, curve: -60, risky: true },
];

const AVATAR_COLORS = ['#2563EB', '#0F9F8A', '#D88A12', '#7C5CE0', '#D14343', '#0DA6D6', '#3385F0', '#099F69'];

const PHASE_PROGRESS = { design: 25, implementation: 60, testing: 75, release: 90, complete: 100 };

const toPct = (coord, total) => `${(coord / total) * 100}%`;

function initialsOf(name) {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function avatarColor(id) {
  let hash = 0;
  for (const ch of id ?? '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Exit point on a node's box boundary along the direction toward a target. */
function boundaryPoint(cx, cy, halfW, halfH, tx, ty) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const t = Math.min(
    absDx > 0 ? halfW / absDx : Infinity,
    absDy > 0 ? halfH / absDy : Infinity,
  );
  return { x: cx + t * dx, y: cy + t * dy };
}

/** Quadratic bezier path between two nodes, bowed perpendicular to the axis. */
function edgeGeometry(fromPos, toPos, curve) {
  const start = boundaryPoint(fromPos.x, fromPos.y, fromPos.w / 2, fromPos.h / 2, toPos.x, toPos.y);
  const end = boundaryPoint(toPos.x, toPos.y, toPos.w / 2, toPos.h / 2, fromPos.x, fromPos.y);
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const control = { x: mx - (dy / len) * curve, y: my + (dx / len) * curve };
  // Label sits at the bezier midpoint t = 0.5.
  const label = {
    x: 0.25 * start.x + 0.5 * control.x + 0.25 * end.x,
    y: 0.25 * start.y + 0.5 * control.y + 0.25 * end.y,
  };
  return {
    start,
    end,
    label,
    d: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
  };
}

function NodeHeader({ meta }) {
  const Icon = meta.icon;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, minWidth: 0 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-control)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: meta.lighter,
          color: meta.color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 14 }} />
      </Box>
      <TruncatedText
        text={meta.label}
        short={10.5}
        long={9.5}
        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'text.secondary', minWidth: 0 }}
      />
    </Box>
  );
}

function NodeCard({ pos, meta, dimmed, hovered, onClick, onMouseEnter, onMouseLeave, ariaLabel, glow, children }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        position: 'absolute',
        left: toPct(pos.x, VIEW_W),
        top: toPct(pos.y, VIEW_H),
        width: pos.w,
        height: pos.h,
        transform: 'translate(-50%, -50%)',
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 'var(--radius-card)',
        outline: `1px solid ${hovered ? meta.color : glow ? 'var(--red-lighter)' : 'var(--border)'}`,
        boxShadow: glow ? 'var(--shadow-card)' : hovered ? 'var(--shadow-float)' : 'var(--shadow-card)',
        ...(glow ? { animation: `${glowPulse} 3s ease-in-out infinite` } : {}),
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'inherit',
        opacity: dimmed ? 0.35 : 1,
        transition: 'opacity 150ms ease, box-shadow 150ms ease, outline-color 150ms ease',
        zIndex: hovered ? 2 : 1,
        '&:focus-visible': { outline: '2px solid var(--primary)', outlineOffset: 2 },
        '&:hover': { boxShadow: 'var(--shadow-float)' },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Ellipsis-aware text: renders at the normal font size first, drops to the
 * smaller size only when it genuinely doesn't fit (so all node titles stay
 * visually consistent), and shows an MUI tooltip whenever it's still truncated.
 */
function TruncatedText({ text, short = 11, long = 10, sx }) {
  const ref = useRef(null);
  const [small, setSmall] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const size = small ? long : short;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fits = el.scrollWidth <= el.clientWidth + 1;
    if (!fits && !small) {
      setSmall(true);
      setTruncated(false);
    } else {
      setTruncated(!fits);
    }
  }, [text, size, small]);

  const label = (
    <Typography
      ref={ref}
      sx={{
        fontSize: size,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {text}
    </Typography>
  );
  return truncated ? <Tooltip title={text} arrow>{label}</Tooltip> : label;
}

function ItemList({ items, max = 2, truncate = true }) {
  if (!items.length) return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>None</Typography>;
  const shown = items.slice(0, max);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, minWidth: 0 }}>
      {shown.map((item) =>
        truncate ? (
          <TruncatedText key={item.id} text={item.name} sx={{ fontWeight: 600, color: 'text.primary', minWidth: 0, lineHeight: 1.2 }} />
        ) : (
          <Typography key={item.id} sx={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, color: 'text.primary', minWidth: 0 }}>
            {item.name}
          </Typography>
        ),
      )}
      {items.length > max && (
        <Typography sx={{ fontSize: 10, lineHeight: 1.2, color: 'text.secondary' }}>+{items.length - max} more</Typography>
      )}
    </Box>
  );
}

function ProjectNodeContent({ project }) {
  const phasePct = PHASE_PROGRESS[project.phase] ?? 0;
  return (
    <>
      <NodeHeader meta={NODE_META.project} />
      <Typography
        sx={{
          fontSize: 12.5,
          lineHeight: 1.3,
          fontWeight: 700,
          color: 'text.primary',
          overflowWrap: 'anywhere',
        }}
      >
        {project.name}
      </Typography>
      {project.healthScore != null && (
        <Box sx={{ mt: 0.75 }}>
          <StatusBadge config={healthStatus(project.healthScore)} />
        </Box>
      )}
      {project.owner && (
        <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mt: 0.75 }}>
          Owner · {project.owner}
        </Typography>
      )}
      {project.phase && (
        <Box sx={{ mt: 0.75 }}>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', textTransform: 'capitalize' }}>{project.phase}</Typography>
          <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'var(--surface-subtle)', mt: 0.5, overflow: 'hidden' }}>
            <Box sx={{ width: `${phasePct}%`, height: '100%', bgcolor: 'var(--primary)', borderRadius: 2 }} />
          </Box>
        </Box>
      )}
    </>
  );
}

function PersonAvatars({ people }) {
  const shown = people.slice(0, 3);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {shown.map((person) => (
        <Box
          key={person.id}
          title={person.name}
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            bgcolor: avatarColor(person.id),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            outline: '2px solid var(--surface)',
            flexShrink: 0,
          }}
        >
          {initialsOf(person.name)}
        </Box>
      ))}
      {people.length > 3 && <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>+{people.length - 3}</Typography>}
    </Box>
  );
}

const EngineeringRelationshipGraph = ({ data, paths = defaultPaths, fetchPersonDetail }) => {
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(VIEW_W);

  // The connector SVG stretches to the container width while the cards keep a
  // fixed pixel width, so connector endpoints are computed against the measured
  // width to stay glued to the card edges at any size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || VIEW_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const adjacency = useMemo(() => {
    const map = {};
    EDGE_DEFS.forEach((edge) => {
      (map[edge.from] ??= new Set()).add(edge.to);
      (map[edge.to] ??= new Set()).add(edge.from);
    });
    return map;
  }, []);

  const edges = useMemo(() => {
    const xScale = VIEW_W / width;
    return EDGE_DEFS.map((def) => {
      if (def.kind === 'ownership') {
        // Anchor to the exact centers of each card's facing edge so the
        // Project → Team line always touches both cards.
        const from = {
          x: NODE_POS.project.x + (NODE_POS.project.w / 2) * xScale,
          y: NODE_POS.project.y,
          w: 0,
          h: 0,
        };
        const to = {
          x: NODE_POS.team.x - (NODE_POS.team.w / 2) * xScale,
          y: NODE_POS.team.y,
          w: 0,
          h: 0,
        };
        return { ...def, ...edgeGeometry(from, to, def.curve) };
      }
      if (def.kind === 'exposure') {
        // Systems → Risk: exit the systems card's right-center and enter the
        // risk card's top-center.
        const from = {
          x: NODE_POS.systems.x + (NODE_POS.systems.w / 2) * xScale,
          y: NODE_POS.systems.y,
          w: 0,
          h: 0,
        };
        const to = {
          x: NODE_POS.risk.x,
          y: NODE_POS.risk.y - NODE_POS.risk.h / 2,
          w: 0,
          h: 0,
        };
        return { ...def, ...edgeGeometry(from, to, def.curve) };
      }
      if (def.kind === 'expertise') {
        // Person → Skills: exit the engineers card's right-center and enter
        // the skills card's left-center for a clean diagonal across the gap.
        const from = {
          x: NODE_POS.person.x + (NODE_POS.person.w / 2) * xScale,
          y: NODE_POS.person.y,
          w: 0,
          h: 0,
        };
        const to = {
          x: NODE_POS.skills.x - (NODE_POS.skills.w / 2) * xScale,
          y: NODE_POS.skills.y,
          w: 0,
          h: 0,
        };
        return { ...def, ...edgeGeometry(from, to, def.curve) };
      }
      const from = { ...NODE_POS[def.from], w: NODE_POS[def.from].w * xScale };
      const to = { ...NODE_POS[def.to], w: NODE_POS[def.to].w * xScale };
      return { ...def, ...edgeGeometry(from, to, def.curve) };
    });
  }, [width]);

  // Downstream sub-path from the hovered node toward risk; edges on it get
  // moving dots ("this relationship is causing attention").
  const activePath = useMemo(() => {
    if (!hover) return null;
    const index = CHAIN.indexOf(hover);
    return index === -1 ? null : new Set(CHAIN.slice(index));
  }, [hover]);

  if (!data) return null;

  const nodeDimmed = (key) => Boolean(hover) && hover !== key && !adjacency[hover]?.has(key);
  const edgeDimmed = (edge) => Boolean(hover) && hover !== edge.from && hover !== edge.to;
  const edgeActive = (edge) => Boolean(activePath) && activePath.has(edge.from) && activePath.has(edge.to);

  const handleSelect = (key) => setSelected(key);

  return (
    <Box>
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: 450,
          overflow: 'hidden',
          borderRadius: 'var(--radius-card)',
          bgcolor: 'var(--surface-subtle)',
          border: '1px dashed var(--border)',
        }}
      >
        {/* Connector layer */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {edges.map((edge, index) => {
            const active = edgeActive(edge);
            return (
              <g key={edge.kind}>
                <path
                  d={edge.d}
                  fill="none"
                  stroke={edge.risky ? 'var(--red)' : 'var(--border-strong)'}
                  strokeWidth={edge.risky ? 1.8 : 1.4}
                  strokeDasharray={edge.risky ? '5 4' : undefined}
                  opacity={edgeDimmed(edge) ? 0.2 : edge.risky ? 0.85 : active ? 0.85 : 0.65}
                  style={{ transition: 'opacity 150ms ease' }}
                />
                {active ? (
                  <circle
                    r={3.5}
                    fill="var(--primary)"
                    css={css({
                      offsetPath: `path('${edge.d}')`,
                      animation: `${dotTravel} ${2 + index * 0.2}s linear infinite`,
                      animationDelay: `${index * 0.3}s`,
                      opacity: 0.9,
                    })}
                  />
                ) : (
                  edge.risky && (
                    <circle
                      r={3.5}
                      fill="var(--red)"
                      css={css({
                        offsetPath: `path('${edge.d}')`,
                        animation: `${dotTravel} 2.6s linear infinite`,
                        opacity: 0.85,
                      })}
                    />
                  )
                )}
              </g>
            );
          })}
        </svg>

        {/* Strength + relationship labels */}
        {edges.map((edge) => (
          <Box
            key={edge.kind}
            sx={{
              position: 'absolute',
              left: toPct(edge.label.x, VIEW_W),
              top: toPct(edge.label.y, VIEW_H),
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5,
              px: 0.75,
              py: 0.25,
              borderRadius: 999,
              bgcolor: 'background.paper',
              outline: `1px solid ${edge.risky ? 'var(--red)' : 'var(--border)'}`,
              whiteSpace: 'nowrap',
              opacity: edgeDimmed(edge) ? 0.3 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
<Typography sx={{ fontSize: 11, fontWeight: 700, color: edge.risky ? 'var(--red)' : 'text.secondary' }}>
                {edge.strength}
              </Typography>
              <Typography sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'capitalize' }}>{edge.kind}</Typography>
          </Box>
        ))}

        {/* Node layer */}
        <NodeCard
          pos={NODE_POS.project}
          meta={NODE_META.project}
          dimmed={nodeDimmed('project')}
          hovered={hover === 'project'}
          onClick={() => handleSelect('project')}
          onMouseEnter={() => setHover('project')}
          onMouseLeave={() => setHover(null)}
          ariaLabel={`Project ${data.project.name}`}
        >
          <ProjectNodeContent project={data.project} />
        </NodeCard>

        <NodeCard
          pos={NODE_POS.team}
          meta={NODE_META.team}
          dimmed={nodeDimmed('team')}
          hovered={hover === 'team'}
          onClick={() => handleSelect('team')}
          onMouseEnter={() => setHover('team')}
          onMouseLeave={() => setHover(null)}
          ariaLabel="Engineering team"
        >
          <NodeHeader meta={NODE_META.team} />
          <ItemList items={data.teams} />
        </NodeCard>

        <NodeCard
          pos={NODE_POS.person}
          meta={NODE_META.person}
          dimmed={nodeDimmed('person')}
          hovered={hover === 'person'}
          onClick={() => handleSelect('person')}
          onMouseEnter={() => setHover('person')}
          onMouseLeave={() => setHover(null)}
          ariaLabel="Engineers"
        >
          <NodeHeader meta={NODE_META.person} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <PersonAvatars people={data.people} />
            <TruncatedText
              text={data.people.map((person) => person.name).join(', ')}
              short={11}
              long={10}
              sx={{ color: 'text.secondary', minWidth: 0 }}
            />
          </Box>
        </NodeCard>

        <NodeCard
          pos={NODE_POS.skills}
          meta={NODE_META.skills}
          dimmed={nodeDimmed('skills')}
          hovered={hover === 'skills'}
          onClick={() => handleSelect('skills')}
          onMouseEnter={() => setHover('skills')}
          onMouseLeave={() => setHover(null)}
          ariaLabel="Skills"
        >
          <NodeHeader meta={NODE_META.skills} />
          <TruncatedText
            text={data.skills.map((skill) => skill.name).join(' · ')}
            short={11}
            long={10}
            sx={{ fontWeight: 600, color: 'text.primary', minWidth: 0 }}
          />
        </NodeCard>

        <NodeCard
          pos={NODE_POS.systems}
          meta={NODE_META.systems}
          dimmed={nodeDimmed('systems')}
          hovered={hover === 'systems'}
          onClick={() => handleSelect('systems')}
          onMouseEnter={() => setHover('systems')}
          onMouseLeave={() => setHover(null)}
          ariaLabel="Systems"
        >
          <NodeHeader meta={NODE_META.systems} />
          <ItemList items={data.systems} />
        </NodeCard>

        <NodeCard
          pos={NODE_POS.risk}
          meta={NODE_META.risk}
          dimmed={nodeDimmed('risk')}
          hovered={hover === 'risk'}
          glow
          onClick={() => handleSelect('risk')}
          onMouseEnter={() => setHover('risk')}
          onMouseLeave={() => setHover(null)}
          ariaLabel="Risk"
        >
          <NodeHeader meta={NODE_META.risk} />
          <Typography
            sx={{
              fontSize: 11,
              lineHeight: 1.3,
              fontWeight: 600,
              color: 'text.primary',
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {data.risks[0]?.title ?? 'No risk'}
          </Typography>
          {data.risks.length > 1 && (
            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>+{data.risks.length - 1} more</Typography>
          )}
        </NodeCard>
      </Box>

      <NodeDetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        node={selected}
        data={data}
        paths={paths}
        fetchPersonDetail={fetchPersonDetail}
      />
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

/** Consistent drawer section: uppercase micro-label + content. */
function DrawerSection({ label, count, children }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', mb: 1 }}>
        {label}
        {count != null ? ` · ${count}` : ''}
      </Typography>
      {children}
    </Box>
  );
}

/** Consistent entity row: icon chip + title/subtitle + trailing action. */
function ItemRow({ icon, iconShape = 'square', iconBg, iconColor, title, subtitle, action, children }) {
  return (
    <Box sx={{ p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        {icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: iconShape === 'circle' ? '50%' : 'var(--radius-control)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: iconBg,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      {children && <Box sx={{ mt: 1.25 }}>{children}</Box>}
    </Box>
  );
}

function EntityLink({ to, children }) {
  return (
    <Link to={to} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
      {children}
    </Link>
  );
}

function NodeDetailDrawer({ open, onClose, node, data, paths, fetchPersonDetail }) {
  const [personData, setPersonData] = useState(null);
  const [personLoading, setPersonLoading] = useState(false);

  useEffect(() => {
    if (!open || node !== 'person') return;
    let active = true;
    setPersonData(null);
    setPersonLoading(true);
    if (fetchPersonDetail && data.people.length) {
      Promise.all(data.people.map((person) => fetchPersonDetail(person.id)))
        .then((details) => {
          if (!active) return;
          setPersonData(details);
          setPersonLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setPersonData(null);
          setPersonLoading(false);
        });
    } else {
      setPersonLoading(false);
    }
    return () => {
      active = false;
    };
  }, [open, node, data, fetchPersonDetail]);

  const meta = NODE_META[node];
  if (!meta) return null;
  const Icon = meta.icon;

  const areaName = (id) =>
    data.systems.find((area) => area.id === id)?.name ?? null;

  let footerAction = null;
  if (node === 'project') footerAction = { to: paths.project(data.project.id), label: 'Open project', icon: <Folder /> };
  else if (node === 'team' && data.teams.length) footerAction = { to: paths.team(data.teams[0].id), label: 'View team', icon: <Group /> };
  else if (node === 'person' && data.people.length) footerAction = { to: paths.person(data.people[0].id), label: 'View profile', icon: <Person /> };
  else if (node === 'skills' && data.skills.length) footerAction = { to: paths.composer, label: 'Match these skills', icon: <Bolt /> };
  else if (node === 'systems' && data.systems.length) footerAction = { to: paths.system(data.systems[0].id), label: `Open ${data.systems[0].name}`, icon: <Lan /> };
  else if (node === 'risk') footerAction = { to: paths.projectRisks(data.project.id), label: 'View in risk register', icon: <WarningAmber /> };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        root: { sx: { zIndex: (theme) => theme.zIndex.drawer + 2 } },
        paper: {
          sx: {
            width: { xs: '100%', sm: 420 },
            top: `${TOPBAR_HEIGHT}px`,
            height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header — icon + title + aligned close */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 2,
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-control)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: meta.lighter,
              color: meta.color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{meta.label}</Typography>
          <IconButton onClick={onClose} aria-label="Close drawer" sx={{ ml: 'auto', color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {node === 'project' && (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{data.project.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {data.project.healthScore != null && <StatusBadge config={healthStatus(data.project.healthScore)} />}
                {data.project.status && <StatusBadge config={getProjectStatus(data.project.status)} />}
              </Box>
              <DrawerSection label="Owner">
                <Typography sx={{ fontSize: 13.5 }}>{data.project.owner || '—'}</Typography>
              </DrawerSection>
              <DrawerSection label="Phase">
                <Typography sx={{ fontSize: 13.5, textTransform: 'capitalize' }}>{data.project.phase || '—'}</Typography>
              </DrawerSection>
            </>
          )}

          {node === 'team' && (
            <DrawerSection label="Engineering team" count={data.teams.length}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {data.teams.map((team) => (
                  <ItemRow
                    key={team.id}
                    icon={<Group />}
                    iconBg="var(--violet-lighter)"
                    iconColor="var(--violet)"
                    title={team.name}
                    action={<EntityLink to={paths.team(team.id)}>View team</EntityLink>}
                  />
                ))}
              </Box>
            </DrawerSection>
          )}

          {node === 'person' && (
            <>
              <DrawerSection label="Engineers" count={data.people.length}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {data.people.map((person, index) => {
                    const detail = personData?.[index];
                    return (
                      <ItemRow
                        key={person.id}
                        icon={initialsOf(person.name)}
                        iconShape="circle"
                        iconBg={avatarColor(person.id)}
                        iconColor="#fff"
                        title={person.name}
                        subtitle={personLoading ? 'Loading…' : detail ? detail.role : 'Engineer'}
                        action={<EntityLink to={paths.person(person.id)}>Profile</EntityLink>}
                      >
                        {personLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={14} thickness={5} />
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Loading skills…</Typography>
                          </Box>
                        ) : detail ? (
                          <>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(detail.expertise ?? []).map((entry) => (
                                <Chip
                                  key={entry.knowledgeAreaId}
                                  size="small"
                                  label={`${areaName(entry.knowledgeAreaId) ?? entry.knowledgeAreaId} · ${entry.level}`}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>
                              Knowledge ownership on {data.project.name}: {(detail.expertise ?? []).length} area{(detail.expertise ?? []).length === 1 ? '' : 's'}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                            {fetchPersonDetail ? 'Skills unavailable.' : 'Detailed skills are unavailable for this engineer.'}
                          </Typography>
                        )}
                      </ItemRow>
                    );
                  })}
                </Box>
              </DrawerSection>
              <DrawerSection label="Project">
                <EntityLink to={paths.project(data.project.id)}>{data.project.name}</EntityLink>
              </DrawerSection>
            </>
          )}

          {node === 'skills' && (
            <DrawerSection label="Skills" count={data.skills.length}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {data.skills.map((skill) => (
                  <Chip key={skill.id} size="small" label={skill.name} variant="outlined" />
                ))}
              </Box>
            </DrawerSection>
          )}

          {node === 'systems' && (
            <DrawerSection label="Systems" count={data.systems.length}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {data.systems.map((system) => (
                  <Chip key={system.id} size="small" label={system.name} variant="outlined" clickable component={Link} to={paths.system(system.id)} />
                ))}
              </Box>
            </DrawerSection>
          )}

          {node === 'risk' && (
            <>
              <DrawerSection label="Risks" count={data.risks.length}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {data.risks.map((risk) => (
                    <ItemRow
                      key={risk.id}
                      icon={<WarningAmber />}
                      iconBg="var(--red-lighter)"
                      iconColor="var(--red)"
                      title={risk.title}
                      subtitle={risk.category ? `${risk.category} risk${risk.score != null ? ` · score ${risk.score}` : ''}` : undefined}
                      action={risk.severity ? <StatusBadge config={getSeverity(risk.severity)} /> : undefined}
                    >
                      {(risk.evidence ?? []).length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {(risk.evidence ?? []).slice(0, 2).map((statement, i) => (
                            <Typography key={i} sx={{ fontSize: 12, color: 'text.secondary' }}>· {statement}</Typography>
                          ))}
                        </Box>
                      )}
                    </ItemRow>
                  ))}
                </Box>
              </DrawerSection>
              <DrawerSection label="Related systems" count={data.systems.length}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {data.systems.map((system) => (
                    <Chip key={system.id} size="small" label={system.name} variant="outlined" clickable component={Link} to={paths.system(system.id)} />
                  ))}
                </Box>
              </DrawerSection>
            </>
          )}
        </Box>

        {/* Footer — consistent primary action */}
        {footerAction && (
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button variant="contained" component={Link} to={footerAction.to} startIcon={footerAction.icon}>
              {footerAction.label}
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default EngineeringRelationshipGraph;