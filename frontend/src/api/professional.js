const BASE = '/api/pro';

async function _req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const ensureProfessionalUser = (body) => _req('POST', '/users/ensure', body);
export const getProfessionalDashboard = (userId) => _req('GET', `/users/${userId}/dashboard`);
export const listResearchProjects = (userId) => _req('GET', `/research/projects?user_id=${userId}`);
export const createResearchProject = (body) => _req('POST', '/research/projects', body);
export const saveResearchNote = (body) => _req('POST', '/research/notes', body);
export const searchResearch = (q, userId) => _req('GET', `/research/search?q=${encodeURIComponent(q)}&user_id=${userId}`);
export const listAssessments = (userId) => _req('GET', `/assessments?user_id=${userId}`);
export const createAssessment = (body) => _req('POST', '/assessments', body);
export const listPortfolio = (userId) => _req('GET', `/portfolio?user_id=${userId}`);
export const createPortfolioItem = (body) => _req('POST', '/portfolio', body);
export const listCpd = (userId) => _req('GET', `/cpd?user_id=${userId}`);
export const createCpd = (body) => _req('POST', '/cpd', body);
export const listCareerPathways = () => _req('GET', '/career/pathways');
export const listProfessionalCourses = (params = '') => _req('GET', `/courses?${params}`);
export const listOrganizations = () => _req('GET', '/organizations');
export const createOrganization = (body) => _req('POST', '/organizations', body);
export const getLtiConfig = (orgId) => _req('GET', `/organizations/${orgId}/lti`);
export const draftResume = (body) => _req('POST', '/resume/draft', body);
