// Route path builders — single source of truth for links across the app.
export const paths = {
  root: '/',
  projects: '/projects',
  project: (id) => `/projects/${id}`,
  projectRisks: (id) => `/projects/${id}?tab=risks`,
  risks: '/risks',
  knowledge: '/knowledge',
  system: (id) => `/knowledge/${id}`,
  transferPlans: '/knowledge/transfer-plans',
  composer: '/composer',
  teams: '/teams',
  team: (id) => `/teams/${id}`,
  recognition: '/recognition',
  person: (id) => `/people/${id}`,
  insights: '/insights',
  settings: '/settings',
};
