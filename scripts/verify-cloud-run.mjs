import assert from 'assert';

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.API_URL || '',
    username: process.env.SMOKE_TEST_USERNAME || 'sponsor.admin@demo.com',
    password: process.env.SMOKE_TEST_PASSWORD || 'Demo@123',
    token: process.env.SMOKE_TEST_TOKEN || '',
    verbose: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--base-url' && next) {
      args.baseUrl = next;
      i += 1;
      continue;
    }
    if (current === '--username' && next) {
      args.username = next;
      i += 1;
      continue;
    }
    if (current === '--password' && next) {
      args.password = next;
      i += 1;
      continue;
    }
    if (current === '--token' && next) {
      args.token = next;
      i += 1;
      continue;
    }
    if (current === '--verbose') {
      args.verbose = true;
      continue;
    }
    if (current === '--help' || current === '-h') {
      args.help = true;
    }
  }

  return args;
}

function usage() {
  console.log([
    'Usage:',
    '  node scripts/verify-cloud-run.mjs --base-url https://YOUR-SERVICE-URL [--username USER --password PASS]',
    '',
    'Environment variables:',
    '  API_URL, SMOKE_TEST_USERNAME, SMOKE_TEST_PASSWORD, SMOKE_TEST_TOKEN',
    '',
    'Checks:',
    '  - GET /health',
    '  - POST /api/auth/login',
    '  - GET /api/v1/system/deployment-readiness',
    '  - POST /api/literature/search',
    '  - POST /api/v1/activities/execute for:',
    '    product_appraisal, product_monograph, slide_deck, scientific_newsletter, lit_review'
  ].join('\n'));
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await readJson(response);
  return { response, body };
}

function makeHeaders(token, extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

function printStep(label) {
  console.log(`\n${label}`);
}

function assertSuccess(response, body, message) {
  assert.ok(response.ok, `${message} (status ${response.status})`);
  return body;
}

async function login(baseUrl, username, password) {
  const { response, body } = await requestJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ username, password })
  });

  assertSuccess(response, body, 'Login failed');
  assert.ok(body.token, 'Login response must include a token');
  return body.token;
}

async function testHealth(baseUrl) {
  printStep('1. Health');
  const { response, body } = await requestJson(`${baseUrl}/health`);
  assert.strictEqual(response.status, 200, 'Health endpoint should return 200');
  assert.strictEqual(body.status, 'PASS', 'Health endpoint should return PASS');
  console.log('[PASS] /health');
}

async function testDeploymentReadiness(baseUrl, token) {
  printStep('2. Deployment readiness');
  const { response, body } = await requestJson(`${baseUrl}/api/v1/system/deployment-readiness`, {
    headers: makeHeaders(token)
  });
  assertSuccess(response, body, 'Deployment readiness check failed');
  assert.strictEqual(body.success, true, 'Deployment readiness should return success=true');
  assert.ok(body.data && typeof body.data === 'object', 'Deployment readiness payload should include data');
  console.log('[PASS] /api/v1/system/deployment-readiness');
}

async function testLiteratureSearch(baseUrl, token) {
  printStep('3. Literature search');
  const payload = {
    query: 'remimazolam procedural sedation',
    topic: 'remimazolam',
    molecule: 'remimazolam',
    indication: 'procedural sedation',
    databases: ['Europe PMC', 'PubMed'],
    openAccessOnly: true,
    maxResults: 5
  };

  const { response, body } = await requestJson(`${baseUrl}/api/literature/search`, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify(payload)
  });

  assertSuccess(response, body, 'Literature search failed');
  assert.ok(Array.isArray(body.results), 'Literature search should return results array');
  assert.ok(body.results.length > 0, 'Literature search should return at least one result');
  console.log(`[PASS] /api/literature/search returned ${body.results.length} results`);
}

async function testActivity(baseUrl, token, activityType, input, minLength = 300) {
  const label = `4.${activityType}`;
  printStep(`4. ${activityType}`);
  const { response, body } = await requestJson(`${baseUrl}/api/v1/activities/execute`, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify({ activityType, input })
  });

  assertSuccess(response, body, `${activityType} execution failed`);
  assert.strictEqual(body.verdict, 'PASS', `${activityType} should return verdict PASS`);
  assert.ok(typeof body.documentText === 'string' && body.documentText.length >= minLength, `${activityType} should return a substantive documentText payload`);
  console.log(`[PASS] ${activityType} -> ${body.title}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  if (!args.baseUrl) {
    throw new Error('A base URL is required. Pass --base-url or set API_URL.');
  }

  const baseUrl = String(args.baseUrl).replace(/\/+$/, '');

  console.log('========================================================');
  console.log('MEDICOMARKETOS CLOUD RUN SMOKE TEST');
  console.log('========================================================');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`User: ${args.username}`);

  await testHealth(baseUrl);

  const token = args.token || await login(baseUrl, args.username, args.password);
  console.log('[PASS] Authentication');

  await testDeploymentReadiness(baseUrl, token);
  await testLiteratureSearch(baseUrl, token);

  await testActivity(baseUrl, token, 'product_appraisal', {
    molecule: 'remimazolam',
    brand: 'Byfavo',
    indication: 'procedural sedation',
    geography: 'India',
    competitors: 'midazolam, propofol',
    objective: 'medical affairs appraisal for launch readiness',
    prompt: 'Prepare a governed appraisal with competitive positioning, safety, and evidence gaps.'
  });

  await testActivity(baseUrl, token, 'product_monograph', {
    molecule: 'remimazolam',
    brand: 'Byfavo',
    indication: 'procedural sedation',
    geography: 'India',
    prompt: 'Draft a controlled product monograph with label-aligned sections.'
  });

  await testActivity(baseUrl, token, 'slide_deck', {
    molecule: 'remimazolam',
    indication: 'procedural sedation',
    geography: 'India',
    audience: 'medical affairs and field teams',
    objective: 'scientific slide deck outline'
  });

  await testActivity(baseUrl, token, 'scientific_newsletter', {
    topic: 'medical affairs update on remimazolam',
    geography: 'India',
    audience: 'medical affairs team',
    objective: 'scientific newsletter for launch readiness'
  });

  await testActivity(baseUrl, token, 'lit_review', {
    topic: 'remimazolam procedural sedation',
    question: 'What does the evidence show for efficacy and safety?',
    population: 'Adults undergoing procedural sedation',
    intervention: 'remimazolam',
    comparator: 'midazolam and propofol',
    outcomes: 'sedation success, recovery time, respiratory events'
  });

  console.log('\n========================================================');
  console.log('ALL CLOUD RUN SMOKE TESTS PASSED');
  console.log('========================================================');
}

main().catch(err => {
  console.error('\n[FAIL]', err.message);
  process.exit(1);
});
