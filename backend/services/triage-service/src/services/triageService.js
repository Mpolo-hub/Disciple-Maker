const crypto = require('crypto');
const { recordAudit } = require('@employee-health/shared');

const sessions = new Map();

const protocols = [
  {
    id: 'respiratory-01',
    name: 'Troubles respiratoires',
    triggers: ['essoufflement', 'respiration difficile'],
    escalation: ['douleur thoracique', 'perte de connaissance']
  },
  {
    id: 'covid-rapid',
    name: 'Suspicion Covid-19',
    triggers: ['fievre', 'toux', 'perte odorat'],
    escalation: ['difficulte respirer']
  }
];

function getProtocols() {
  return protocols;
}

async function startSession({ userId, symptoms }) {
  const id = crypto.randomUUID();
  const matchedProtocols = protocols.filter((protocol) =>
    symptoms.some((symptom) => protocol.triggers.some((trigger) => symptom.toLowerCase().includes(trigger)))
  );
  const session = {
    id,
    userId,
    symptoms,
    protocol: matchedProtocols[0]?.id || 'general',
    steps: [],
    status: 'in_progress',
    recommendation: null,
    createdAt: new Date().toISOString()
  };
  sessions.set(id, session);
  await recordAudit({ userId, action: 'symptom_session_start', resourceType: 'symptom_assessment', resourceId: id, metadata: { symptoms } });
  return session;
}

function determineRecommendation(session) {
  const hasSevereSymptom = session.steps.some((step) => step.answer === true && step.stepId === 'severe');
  if (hasSevereSymptom || session.symptoms.some((s) => ['douleur thoracique', 'perte de connaissance'].includes(s.toLowerCase()))) {
    return 'emergency';
  }
  if (session.symptoms.some((s) => ['fievre', 'toux'].includes(s.toLowerCase()))) {
    return 'teleconsultation';
  }
  return 'self_care';
}

async function submitResponse(id, { stepId, answer }) {
  const session = sessions.get(id);
  if (!session) {
    const error = new Error('Session not found');
    error.status = 404;
    throw error;
  }
  session.steps.push({ stepId, answer, timestamp: new Date().toISOString() });
  session.recommendation = determineRecommendation(session);
  if (session.recommendation === 'emergency') {
    session.status = 'escalated';
  }
  await recordAudit({ userId: session.userId, action: 'symptom_session_update', resourceType: 'symptom_assessment', resourceId: id, metadata: { stepId, answer } });
  return session;
}

async function getSession(id) {
  return sessions.get(id) || null;
}

module.exports = {
  getProtocols,
  startSession,
  submitResponse,
  getSession
};
