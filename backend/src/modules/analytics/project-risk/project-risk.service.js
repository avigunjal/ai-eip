// Project risk scoring engine.
// TODO: combine signals (delayed PRs, blocked tickets, coverage) into a risk score.

export function scoreProjectRisk(project, signals = []) {
  const openSignals = signals.filter((signal) => signal.status !== 'mitigated');
  const weighted = openSignals.map((signal) => Number(signal.score ?? (signal.probability * signal.impact * signal.urgency * 100)));
  const score = weighted.length ? Math.round(Math.min(100, weighted.reduce((total, value) => total + value, 0) / weighted.length)) : 0;
  const confidence = openSignals.length ? Math.round(openSignals.reduce((total, item) => total + Number(item.confidence || 0), 0) / openSignals.length) : 0;
  const drivers = [...openSignals].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 3).map((risk) => ({
    riskId: risk.id, title: risk.title, category: risk.category, severity: risk.severity, score: Number(risk.score),
  }));
  return { score, confidence, drivers };
}
