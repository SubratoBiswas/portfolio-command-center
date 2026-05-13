/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// Trinamix Portfolio Command Center — seed script
// Run: npm run db:seed  (after `npx prisma migrate dev` once)
//
// Mirrors the frontend src/data/seed.ts so the app behaves identically
// against either the mock layer or the real backend.
// =============================================================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysOut = (n: number) => new Date(Date.now() + n * 86400000);

async function main() {
  console.log('🌱 Seeding Trinamix Portfolio Command Center…');

  // Wipe in dependency-safe order (only entities this script populates).
  await prisma.extractionJob.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.workstream.deleteMany();
  await prisma.resourceAllocation.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.capabilityOnProduct.deleteMany();
  await prisma.accelerator.deleteMany();
  await prisma.capability.deleteMany();
  await prisma.project.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.location.deleteMany();

  // ===========================================================================
  // Locations
  // ===========================================================================
  const locs = await Promise.all([
    prisma.location.create({ data: { id: 'l-usc', name: 'US Central',         region: 'US',   type: 'office',      timezone: 'America/Chicago' } }),
    prisma.location.create({ data: { id: 'l-usp', name: 'US Pacific',         region: 'US',   type: 'office',      timezone: 'America/Los_Angeles' } }),
    prisma.location.create({ data: { id: 'l-blr', name: 'Bengaluru',          region: 'IN',   type: 'office',      timezone: 'Asia/Kolkata' } }),
    prisma.location.create({ data: { id: 'l-off', name: 'Offshore Delivery',  region: 'IN',   type: 'offshore',    timezone: 'Asia/Kolkata' } }),
    prisma.location.create({ data: { id: 'l-cli', name: 'Client Site',        region: 'US',   type: 'client_site', timezone: 'America/New_York' } }),
    prisma.location.create({ data: { id: 'l-rem', name: 'Remote',             region: 'US',   type: 'remote',      timezone: 'America/New_York' } }),
  ]);
  console.log(`  ✓ ${locs.length} locations`);

  // ===========================================================================
  // Resources (mix of US + India, realistic Trinamix roles)
  // ===========================================================================
  const R = (id: string, name: string, role: string, level: string, locationId: string, skills: string[], cap = 40) =>
    prisma.resource.create({
      data: {
        id, name, role, level, locationId,
        initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        email: name.toLowerCase().replace(/\s+/g, '.') + '@trinamix.ai',
        skills, weeklyCapacityHours: cap, timeOffHours: 0, active: true,
      },
    });

  const res = await Promise.all([
    R('r-viral',    'Viral Shah',        'Portfolio Lead',          'director',  'l-usc', ['leadership','strategy','client-mgmt']),
    R('r-shubhy',   'Shubhy Iyer',       'Delivery Director',       'director',  'l-blr', ['delivery','program-mgmt']),
    R('r-nischay',  'Nischay Patel',     'Principal AI Engineer',   'principal', 'l-usc', ['llm','rag','extraction','python']),
    R('r-prantik',  'Prantik Roy',       'Solution Architect',      'principal', 'l-blr', ['architecture','llm','cloud']),
    R('r-dushyant', 'Dushyant Kumar',    'AI Engineer',             'senior',    'l-blr', ['llm','agents','python']),
    R('r-subrato',  'Subrato Banerjee',  'Data Engineer',           'senior',    'l-blr', ['data-pipelines','snowflake','dbt']),
    R('r-ranu',     'Ranu Sharma',       'UI Engineer',             'senior',    'l-blr', ['react','typescript','design-systems']),
    R('r-meera',    'Meera Krishnan',    'Product Owner',           'senior',    'l-usc', ['product','discovery']),
    R('r-arjun',    'Arjun Mehta',       'AI Engineer',             'mid',       'l-off', ['llm','prompts','python']),
    R('r-kavya',    'Kavya Reddy',       'Data Engineer',           'mid',       'l-off', ['snowflake','python']),
    R('r-rahul',    'Rahul Verma',       'Engagement Lead',         'senior',    'l-usp', ['client-mgmt','presales']),
    R('r-anika',    'Anika Desai',       'AI Engineer',             'mid',       'l-off', ['llm','agents']),
  ]);
  console.log(`  ✓ ${res.length} resources`);

  // ===========================================================================
  // Clients (Trinamix accounts)
  // ===========================================================================
  const C = (id: string, name: string, industry: string, region: string, logoColor: string, status = 'active') =>
    prisma.client.create({ data: { id, name, industry, region, logoColor, status } });

  const clients = await Promise.all([
    C('c-roku',  'Roku',           'Media & Streaming', 'US-West', '#7E22CE'),
    C('c-sono',  'Sonoco',         'Packaging',         'US-East', '#0F766E'),
    C('c-alb',   'Albertsons',     'Grocery Retail',    'US',      '#1D4ED8'),
    C('c-kemet', 'KEMET / Yageo',  'Electronics Mfg',   'US/TW',   '#B45309'),
    C('c-gev',   'GE Vernova',     'Energy / Utility',  'US',      '#059669'),
    C('c-cisco', 'Cisco',          'Networking',        'US-West', '#0891B2'),
    C('c-orcl',  'Oracle',         'Enterprise SW',     'US',      '#DC2626'),
    C('c-dex',   'Dexcom',         'Med Devices',       'US-West', '#2563EB'),
    C('c-mlw',   'Milwaukee Tool', 'Industrial',        'US',      '#EF4444'),
    C('c-bloom', 'Bloom Energy',   'Clean Energy',      'US-West', '#16A34A'),
  ]);
  console.log(`  ✓ ${clients.length} clients`);

  // ===========================================================================
  // Capabilities (reusable AI building blocks)
  // ===========================================================================
  const CAP = (id: string, name: string, description: string, maturity: string, dependsOn: string[] = []) =>
    prisma.capability.create({ data: { id, name, description, maturity, reusePotential: 70, dependsOn } });

  const caps = await Promise.all([
    CAP('cap-doc-x',  'Document Extraction Engine', 'LLM-driven structured extraction from PDF/DOCX with span citations.', 'production'),
    CAP('cap-scrape', 'Web Scraping',               'Resilient extractor for catalogs, pricing, news.',                    'pilot'),
    CAP('cap-agents', 'Agent Orchestration',        'Multi-agent planner/executor with tool registry.',                    'pilot'),
    CAP('cap-wflow',  'Workflow Automation',        'Trigger/condition/action DAGs for back-office tasks.',                'production'),
    CAP('cap-oraapi', 'Oracle API Connector',       'Auth + paginated read/write for Oracle Fusion/EBS.',                  'production'),
    CAP('cap-kg',     'Knowledge Graph',            'Entity-resolved graph store with semantic search.',                   'prototype'),
    CAP('cap-sem',    'Semantic Layer',             'Universal metric/entity layer over warehouse.',                       'pilot',     ['cap-kg']),
    CAP('cap-docproc','Document Processing',        'OCR/normalization/chunking pipeline.',                                'production',['cap-doc-x']),
    CAP('cap-dash',   'Dashboarding',               'Auto-layout, drill-down, embeddable.',                                'production'),
    CAP('cap-opt',    'Optimization Engine',        'MIP / heuristic solver wrapper.',                                     'pilot'),
    CAP('cap-fc',     'Forecasting Engine',         'Hierarchical TS + ML hybrid.',                                        'production'),
  ]);
  console.log(`  ✓ ${caps.length} capabilities`);

  // ===========================================================================
  // Products
  // ===========================================================================
  const P = (
    id: string, name: string, shortName: string, bucket: string,
    vision: string, problem: string, target: string,
    maturity: string, archStatus: string, aiR: number, delR: number,
    ownerId: string, tags: string[],
  ) =>
    prisma.product.create({
      data: { id, name, shortName, strategicBucket: bucket, vision, problem, targetUsers: target,
        maturity, architectureStatus: archStatus, aiReadiness: aiR, deliveryReadiness: delR,
        ownerId, tags },
    });

  const prods = await Promise.all([
    P('p-doc',  'Documantra',           'Doc',   'GenAI',        'Turn any contract or document into structured, audit-ready data.', 'Manual document review is slow and inconsistent.', 'Legal, procurement, ops', 'beta',    'approved',     85, 70, 'r-nischay', ['extraction','contracts','llm']),
    P('p-ps',   'Price Sense AI',       'PSai',  'Data',         'Continuous competitive pricing insight from web + first-party.',    'Pricing teams react days late to competitor moves.', 'Pricing, category mgmt',  'ga',      'implemented',  80, 85, 'r-meera',   ['scraping','pricing','grocery']),
    P('p-ariv', 'Ariv',                 'Ariv',  'GenAI',        'Conversational interface over your enterprise apps.',               'Users hop between 6+ tools.', 'Knowledge workers',  'beta',    'approved',     70, 60, 'r-prantik', ['rag','search','chat']),
    P('p-opt',  'Optrix',               'Optx',  'Optimization', 'Decision engine for supply-chain and inventory.',                   'Planners over-buy or stock out.', 'Supply chain, ops',  'mvp',     'reviewed',     55, 45, 'r-meera',   ['optimization','supply-chain']),
    P('p-wb',   'AI Agent Workbench',   'WB',    'Automation',   'Build/operate AI agents that automate back-office work.',           'Custom agents take months to ship.', 'Eng, ops',          'mvp',     'reviewed',     65, 50, 'r-dushyant',['agents','platform','llm']),
    P('p-ct',   'Control Tower',        'CT',    'Data',         'Live operating picture across products and clients.',               'Leadership rebuilds the same dashboards.', 'Execs, PMOs',  'mvp',     'reviewed',     60, 60, 'r-viral',   ['dashboards','operations']),
    P('p-conn', 'Universal Connector',  'Conn',  'Automation',   'Pre-built connectors to Oracle/Salesforce/Snowflake/etc.',          'Every project burns weeks on integration.', 'Eng',         'beta',    'approved',     75, 80, 'r-prantik', ['connectors','integration']),
    P('p-mdm',  'AI in MDM',            'MDM',   'Data',         'AI-assisted master data management.',                               'MDM tools are rules-heavy and brittle.', 'Data teams',    'concept', 'draft',        40, 30, 'r-subrato', ['mdm','data-quality']),
    P('p-sno',  'SNO',                  'SNO',   'Optimization', 'Strategic network optimization.',                                   'Network designs are stale by 3 years.', 'Ops, finance',  'mvp',     'reviewed',     50, 45, 'r-meera',   ['network','optimization']),
    P('p-meio', 'MEIO',                 'MEIO',  'Optimization', 'Multi-echelon inventory optimization.',                             'Inventory pools aren\'t coordinated.', 'Planning, supply', 'beta', 'approved',     70, 65, 'r-meera',   ['inventory','optimization']),
    P('p-camp', 'Campaign Planning',    'Camp',  'GenAI',        'AI-assisted marketing campaign design + measurement.',              'Plans + measurement live in different tools.', 'Marketing', 'concept','draft',         45, 35, 'r-rahul',   ['marketing','planning']),
    P('p-buy',  'Investment Buy',       'IB',    'Optimization', 'Investment buying optimizer for promo planning.',                   'Buyers over-commit on deal volume.', 'Buying, merch',     'mvp',     'reviewed',     55, 50, 'r-meera',   ['buying','optimization']),
  ]);
  console.log(`  ✓ ${prods.length} products`);

  // Capability ↔ Product
  const cop = [
    ['p-doc','cap-doc-x'], ['p-doc','cap-docproc'],
    ['p-ps','cap-scrape'], ['p-ps','cap-fc'],
    ['p-ariv','cap-agents'], ['p-ariv','cap-kg'], ['p-ariv','cap-sem'],
    ['p-opt','cap-opt'], ['p-opt','cap-fc'],
    ['p-wb','cap-agents'], ['p-wb','cap-wflow'],
    ['p-ct','cap-dash'], ['p-ct','cap-sem'],
    ['p-conn','cap-oraapi'],
    ['p-mdm','cap-kg'],
    ['p-meio','cap-opt'], ['p-meio','cap-fc'],
    ['p-sno','cap-opt'],
    ['p-camp','cap-fc'],
    ['p-buy','cap-opt'],
  ];
  await Promise.all(cop.map(([productId, capabilityId]) =>
    prisma.capabilityOnProduct.create({ data: { productId, capabilityId } })
  ));
  console.log(`  ✓ ${cop.length} capability↔product links`);

  // ===========================================================================
  // Opportunities ($9.22M pipeline)
  // ===========================================================================
  const O = (
    id: string, name: string, clientId: string, productId: string | null,
    value: number, probability: number, stage: string, ownerId: string,
    expectedCloseDate: Date, lastInteraction: Date, nextSteps: string,
    importance: string, source: string, description: string, capIds: string[],
  ) =>
    prisma.opportunity.create({
      data: {
        id, name, clientId, productId, value, probability, stage, ownerId,
        expectedCloseDate, lastInteractionAt: lastInteraction, nextSteps,
        strategicImportance: importance, source, description,
        requiredCapabilityIds: capIds,
      },
    });

  const opps = await Promise.all([
    O('o-roku-doc',   'Roku — Documantra Legal Review',     'c-roku',  'p-doc', 850_000,  65, 'negotiate', 'r-rahul',  daysOut(45),  daysAgo(14), 'Get exec sponsor commitment; close legal review',   'high', 'inbound', 'POC complete; moving toward enterprise rollout.',          ['cap-doc-x','cap-docproc']),
    O('o-sono-mdm',   'Sonoco — AI in MDM',                  'c-sono',  'p-mdm', 1_200_000, 40, 'propose',   'r-viral',  daysOut(90),  daysAgo(6),  'Finalize phase-1 scoping doc',                       'high', 'rfp',     'RFP win; entering scoping.',                               ['cap-kg','cap-docproc']),
    O('o-alb-ps',     'Albertsons — Price Sense rollout',    'c-alb',   'p-ps',  2_400_000, 70, 'negotiate', 'r-meera',  daysOut(30),  daysAgo(3),  'MSA red-line review with procurement',               'critical','expansion','Existing customer; scaling to 1,400 stores.',           ['cap-scrape','cap-fc']),
    O('o-kemet-opt',  'KEMET — Optrix pilot',                'c-kemet', 'p-opt', 480_000,   55, 'propose',   'r-prantik',daysOut(60),  daysAgo(5),  'Data assessment kickoff',                            'medium','referral','Pilot, then expansion.',                                  ['cap-opt','cap-fc']),
    O('o-gev-wb',     'GE Vernova — AI Workbench',           'c-gev',   'p-wb',  1_650_000, 35, 'discover',  'r-viral',  daysOut(120), daysAgo(7),  'Reference architecture review',                      'high', 'partnership','Joint exploration on agent platform.',                  ['cap-agents','cap-wflow']),
    O('o-cisco-mdm',  'Cisco — MDM POC',                     'c-cisco', 'p-mdm', 380_000,   20, 'qualify',   'r-rahul',  daysOut(90),  daysAgo(18), 'Reignite — need exec sponsor',                       'medium','inbound', 'Lead has gone quiet; risk of close-lost.',                ['cap-kg']),
    O('o-orcl-conn',  'Oracle — Connector OEM',              'c-orcl',  'p-conn',900_000,   50, 'propose',   'r-prantik',daysOut(75),  daysAgo(4),  'Co-sell motion review with Oracle CSM',              'high', 'partnership','Embed our Oracle connector in their AI Cloud.',         ['cap-oraapi']),
    O('o-dex-ariv',   'Dexcom — Ariv knowledge assistant',   'c-dex',   'p-ariv',520_000,   45, 'propose',   'r-meera',  daysOut(60),  daysAgo(8),  'Security architecture review',                       'medium','inbound', 'Internal R&D copilot.',                                    ['cap-agents','cap-kg']),
    O('o-mlw-ct',     'Milwaukee — Control Tower',           'c-mlw',   'p-ct',  340_000,   30, 'qualify',   'r-rahul',  daysOut(100), daysAgo(9),  'Discovery workshops',                                'low',  'inbound', 'Early discovery.',                                         ['cap-dash','cap-sem']),
    O('o-bloom-meio', 'Bloom Energy — MEIO',                 'c-bloom', 'p-meio',460_000,   60, 'negotiate', 'r-meera',  daysOut(40),  daysAgo(2),  'Final commercial review',                            'medium','expansion','Expanding existing MEIO contract.',                       ['cap-opt','cap-fc']),
    O('o-roku-ariv',  'Roku — Ariv pilot',                   'c-roku',  'p-ariv',180_000,   25, 'qualify',   'r-rahul',  daysOut(75),  daysAgo(14), 'Restart conversation',                              'low',  'inbound', 'Stalled — need executive nudge.',                          ['cap-agents']),
    O('o-alb-buy',    'Albertsons — Investment Buy',         'c-alb',   'p-buy', 260_000,   50, 'propose',   'r-meera',  daysOut(60),  daysAgo(6),  'Pilot scope agreement',                              'medium','expansion','Cross-sell into buying team.',                            ['cap-opt']),
    O('o-sono-doc',   'Sonoco — Documantra invoices',        'c-sono',  'p-doc', 290_000,   55, 'propose',   'r-viral',  daysOut(60),  daysAgo(4),  'Scope POC',                                          'medium','expansion','Add invoice extraction to existing engagement.',          ['cap-doc-x','cap-docproc']),
    O('o-gev-camp',   'GE Vernova — Campaign Planning',      'c-gev',   'p-camp',180_000,   25, 'qualify',   'r-rahul',  daysOut(120), daysAgo(11), 'Discovery',                                          'low',  'inbound', 'Marketing exploring.',                                     ['cap-fc']),
    O('o-bloom-sno',  'Bloom — SNO refresh',                 'c-bloom', 'p-sno', 140_000,   65, 'negotiate', 'r-meera',  daysOut(35),  daysAgo(3),  'SOW signoff',                                        'medium','expansion','Network re-design.',                                      ['cap-opt']),
  ]);
  console.log(`  ✓ ${opps.length} opportunities`);

  // ===========================================================================
  // Projects (12, with RAG, some red/yellow)
  // ===========================================================================
  const PR = (
    id: string, name: string, code: string, type: string, clientId: string,
    productId: string | null, status: string, rag: string,
    ownerId: string, startDate: Date, endDate: Date,
    scope: string, charter: string, weeklyStatus: string,
    resourceIds: string[],
  ) =>
    prisma.project.create({
      data: { id, name, code, type, clientId, productId, status, rag, ownerId,
        startDate, endDate, scope, charter, weeklyStatus, resourceIds },
    });

  const projs = await Promise.all([
    PR('pr-roku-doc',     'Roku — Documantra POC',      'TX-ROKU-001', 'delivery', 'c-roku',  'p-doc',  'at_risk',     'orange', 'r-nischay', daysAgo(45),  daysOut(30),  'Extract indemnification, termination, and SLA clauses across 200 contracts.', 'Prove ≥85% extraction accuracy on Roku\'s clause taxonomy in 8 weeks.', 'Accuracy at 78%; tuning underway.',                ['r-nischay','r-arjun','r-ranu']),
    PR('pr-alb-ps',       'Albertsons — Price Sense GA','TX-ALB-PS-2', 'delivery', 'c-alb',   'p-ps',   'on_track',    'green',  'r-meera',   daysAgo(60),  daysOut(60),  'Roll out PSai to 1,400 stores with weekly competitor reads.',                  'Operationalize PSai for all banners.',                                  'Pilots green; rollout per plan.',                  ['r-meera','r-subrato','r-kavya','r-ranu']),
    PR('pr-kemet-optrix', 'KEMET — Optrix pilot',       'TX-KEMET-001','delivery', 'c-kemet', 'p-opt',  'in_progress', 'yellow', 'r-prantik', daysAgo(20),  daysOut(75),  'Inventory + buy optimization for 3 product lines.',                            'Show 12% inventory reduction in 12 weeks.',                              'Data assessment week starting.',                   ['r-prantik','r-kavya','r-anika']),
    PR('pr-bloom-meio',   'Bloom — MEIO cutover',       'TX-BLM-MEIO', 'delivery', 'c-bloom', 'p-meio', 'in_progress', 'yellow', 'r-meera',    daysAgo(30),  daysOut(20),  'Cutover from legacy planning system.',                                         'Replace incumbent planning system; co-exist for 2 weeks.',               'Subrato dual-booked with Albertsons.',             ['r-meera','r-subrato','r-anika']),
    PR('pr-wb-platform',  'AI Workbench platform v1',   'TX-WB-PLT-1', 'rd',       'c-roku',  'p-wb',   'blocked',     'red',    'r-dushyant', daysAgo(50),  daysOut(60),  'Build the v1 platform: agent runtime, tool registry, observability.',          'Ship platform foundation that supports 3 internal teams.',               'Blocked on semantic-layer beta; planning workaround.', ['r-dushyant','r-prantik','r-arjun']),
    PR('pr-sono-mdm',     'Sonoco — MDM scoping',       'TX-SONO-MDM', 'delivery', 'c-sono',  'p-mdm',  'in_progress', 'green',  'r-viral',    daysAgo(10),  daysOut(50),  'Phase 1 scoping for AI-in-MDM rollout.',                                       'Define data domains, success metrics, MVP scope.',                       'On track.',                                        ['r-viral','r-meera','r-subrato']),
    PR('pr-orcl-conn',    'Oracle — Connector OEM POC', 'TX-ORCL-OEM', 'delivery', 'c-orcl',  'p-conn', 'in_progress', 'green',  'r-prantik',  daysAgo(15),  daysOut(45),  'POC of Trinamix Universal Connector inside Oracle AI Cloud.',                  'Demo working integration end-to-end.',                                   'On track for milestone 2.',                        ['r-prantik','r-dushyant']),
    PR('pr-camp-pilot',   'Campaign Planning pilot',    'TX-CAMP-PIL', 'rd',       'c-gev',   'p-camp', 'blocked',     'red',    'r-viral',    daysAgo(35),  daysOut(60),  'Internal pilot of Campaign Planning product.',                                 'Validate forecasting approach.',                                         'Stalled on forecasting decision.',                 ['r-rahul','r-arjun']),
    PR('pr-dex-ariv',     'Dexcom — Ariv discovery',    'TX-DEX-ARV',  'delivery', 'c-dex',   'p-ariv', 'in_progress', 'green',  'r-meera',    daysAgo(8),   daysOut(40),  'Discovery + sec review.',                                                      'Map use cases and security guardrails.',                                 'Sec workshop scheduled.',                          ['r-meera','r-arjun']),
    PR('pr-gev-wb',       'GE Vernova — WB POC',        'TX-GEV-WB',   'delivery', 'c-gev',   'p-wb',   'not_started', 'yellow', 'r-viral',    daysOut(15),  daysOut(75),  'Joint POC of Agent Workbench.',                                                'Build 2 agents on GEV stack.',                                           'Awaiting kickoff.',                                ['r-prantik','r-dushyant']),
    PR('pr-roku-ariv',    'Roku — Ariv pilot',          'TX-ROKU-ARV', 'delivery', 'c-roku',  'p-ariv', 'not_started', 'yellow', 'r-rahul',    daysOut(20),  daysOut(80),  'Pilot Ariv for Roku internal teams.',                                          'Show productivity uplift in 6 weeks.',                                   'Pending sponsor confirmation.',                    ['r-rahul','r-arjun']),
    PR('pr-mlw-ct',       'Milwaukee — Control Tower',  'TX-MLW-CT',   'delivery', 'c-mlw',   'p-ct',   'in_progress', 'green',  'r-rahul',    daysAgo(5),   daysOut(70),  'Discovery + design.',                                                          'Define exec dashboard set.',                                             'Workshops underway.',                              ['r-rahul','r-ranu']),
  ]);
  console.log(`  ✓ ${projs.length} projects`);

  // ===========================================================================
  // Milestones (one per project, plus a few extra)
  // ===========================================================================
  const M = (id: string, name: string, projectId: string, dueDate: Date, status: string, ownerId?: string) =>
    prisma.milestone.create({ data: { id, name, projectId, dueDate, status, ownerId } });

  const ms = await Promise.all([
    M('m-roku-1',     'Clause taxonomy locked',      'pr-roku-doc',     daysAgo(20), 'done',        'r-nischay'),
    M('m-roku-2',     'Accuracy ≥85% on test set',   'pr-roku-doc',     daysOut(10), 'in_progress', 'r-nischay'),
    M('m-roku-3',     'Production cutover',          'pr-roku-doc',     daysOut(28), 'not_started', 'r-nischay'),
    M('m-alb-1',      'Pilot 50 stores',             'pr-alb-ps',       daysAgo(15), 'done',        'r-meera'),
    M('m-alb-2',      'Region 1 rollout',            'pr-alb-ps',       daysOut(14), 'in_progress', 'r-meera'),
    M('m-alb-3',      'Full GA',                     'pr-alb-ps',       daysOut(55), 'not_started', 'r-meera'),
    M('m-kemet-1',    'Data assessment',             'pr-kemet-optrix', daysOut(7),  'in_progress', 'r-prantik'),
    M('m-kemet-2',    'Model build',                 'pr-kemet-optrix', daysOut(35), 'not_started', 'r-prantik'),
    M('m-bloom-1',    'Cutover',                     'pr-bloom-meio',   daysOut(18), 'at_risk',     'r-meera'),
    M('m-wb-1',       'Agent runtime alpha',         'pr-wb-platform',  daysAgo(7),  'done',        'r-dushyant'),
    M('m-wb-2',       'Tool registry v1',            'pr-wb-platform',  daysOut(14), 'blocked',     'r-dushyant'),
    M('m-orcl-1',     'Auth flow integration',       'pr-orcl-conn',    daysAgo(2),  'done',        'r-prantik'),
    M('m-orcl-2',     'End-to-end demo',             'pr-orcl-conn',    daysOut(25), 'in_progress', 'r-prantik'),
  ]);
  console.log(`  ✓ ${ms.length} milestones`);

  // ===========================================================================
  // Risks (12, including conflict + duplication risks)
  // ===========================================================================
  const RK = (
    id: string, title: string, description: string, severity: string,
    likelihood: number, impact: number, status: string, ownerId: string,
    mitigation: string, opts: { productId?: string; projectId?: string } = {},
  ) =>
    prisma.risk.create({
      data: { id, title, description, severity, likelihood, impact, status, ownerId, mitigation,
        productId: opts.productId, projectId: opts.projectId, identifiedAt: daysAgo(Math.floor(Math.random() * 20) + 1) },
    });

  const risks = await Promise.all([
    RK('rk-1',  'Nischay overallocated across Documantra, Workbench, Roku POC', 'Principal AI Engineer on 3 high-priority efforts in same window.', 'critical', 0.8, 5, 'mitigating', 'r-shubhy', 'Offload extraction work to Arjun; bring contractor for Workbench.', { productId: 'p-doc' }),
    RK('rk-2',  'Subrato dual-booked: Bloom MEIO and Albertsons Price Sense',    'Conflict on cutover week.',                                          'high',     0.8, 4, 'mitigating', 'r-shubhy', 'Shift Subrato to Albertsons; route Bloom to Kavya for cutover.',    { projectId: 'pr-bloom-meio' }),
    RK('rk-3',  'Roku procurement freeze',                                       'Q3 budget freeze rumored at Roku.',                                  'high',     0.5, 4, 'open',       'r-viral',  'Accelerate signature; explore departmental budget alternatives.',   {}),
    RK('rk-4',  'Documantra accuracy below threshold for Roku POC',              'Indemnification clauses at 78% accuracy; target 85%.',                'critical', 0.8, 5, 'mitigating', 'r-nischay','Prompt tuning + few-shot examples; consider clause-specific tune.', { projectId: 'pr-roku-doc' }),
    RK('rk-5',  'GE Vernova: build vs buy debate',                               'Internal team pitching build-it-ourselves alternative.',             'high',     0.5, 4, 'mitigating', 'r-viral',  'Bring case studies; offer build-with-us model.',                    {}),
    RK('rk-6',  'KEMET data quality unknown',                                    'No data assessment yet; could blow pilot timeline.',                 'medium',   0.5, 3, 'mitigating', 'r-prantik','Run data assessment in week 1 before model build.',                 { projectId: 'pr-kemet-optrix' }),
    RK('rk-7',  'Cisco opportunity going stale',                                 '18 days no contact; risk of close-lost.',                            'medium',   0.8, 3, 'open',       'r-rahul',  'Escalate to Viral; one final push for exec sponsor.',               {}),
    RK('rk-8',  'Workbench orchestration depends on Semantic Layer beta',        'Critical path dependency, semantic layer not GA.',                   'high',     0.5, 4, 'open',       'r-dushyant','Run orchestration v1 against stub semantic layer; parallelize.',   { projectId: 'pr-wb-platform' }),
    RK('rk-9',  'Campaign Planning architectural decision blocked',              'Forecasting approach undecided; project stalled.',                   'high',     0.8, 4, 'open',       'r-viral',  'Force decision this week; default to hierarchical TS if no signal.',{ projectId: 'pr-camp-pilot' }),
    RK('rk-10', 'Documantra and Control Tower duplicate document processing',    'Two products extracting same documents; consolidation needed.',      'medium',   0.8, 3, 'open',       'r-nischay','Pull document processing into shared accelerator.',                 { productId: 'p-doc' }),
    RK('rk-11', 'AI Engineer hiring lagging — Workbench team',                   'Need 1 more senior AI engineer to hit Workbench beta.',              'high',     0.5, 4, 'mitigating', 'r-shubhy', 'Active interviewing; contractor backstop identified.',              { productId: 'p-wb' }),
    RK('rk-12', 'Universal Connector and Workbench overlap on tool registry',    'Both teams designing tool framework; duplicate work.',               'medium',   0.8, 3, 'open',       'r-rahul',  'Architecture sync this week; align on shared registry.',            { productId: 'p-conn' }),
  ]);
  console.log(`  ✓ ${risks.length} risks`);

  // ===========================================================================
  // Issues (a few open)
  // ===========================================================================
  const issues = await Promise.all([
    prisma.issue.create({ data: { id: 'is-1', title: 'Roku VPN intermittent',            description: 'Engineers losing access mid-day.',                 severity: 'medium',   status: 'in_progress', ownerId: 'r-prantik', projectId: 'pr-roku-doc',  raisedAt: daysAgo(3) } }),
    prisma.issue.create({ data: { id: 'is-2', title: 'KEMET data export pipeline broken', description: 'Daily export missing rows.',                                    severity: 'high',     status: 'open',        ownerId: 'r-kavya',   projectId: 'pr-kemet-optrix', raisedAt: daysAgo(1) } }),
    prisma.issue.create({ data: { id: 'is-3', title: 'Workbench observability gap',     description: 'Can\'t trace agent runs end-to-end.',                            severity: 'medium',   status: 'open',        ownerId: 'r-dushyant', projectId: 'pr-wb-platform', raisedAt: daysAgo(5) } }),
    prisma.issue.create({ data: { id: 'is-4', title: 'Ariv RAG eval drift',             description: 'Eval scores dropped after embedding model swap.',                 severity: 'high',     status: 'in_progress', ownerId: 'r-arjun',   projectId: 'pr-dex-ariv',  raisedAt: daysAgo(2) } }),
    prisma.issue.create({ data: { id: 'is-5', title: 'Bloom legacy API throttling',     description: 'Cutover blocked on rate limits.',                                severity: 'high',     status: 'open',        ownerId: 'r-subrato', projectId: 'pr-bloom-meio', raisedAt: daysAgo(4) } }),
  ]);
  console.log(`  ✓ ${issues.length} issues`);

  // ===========================================================================
  // Decisions
  // ===========================================================================
  const D = (id: string, title: string, context: string, decision: string, rationale: string, status: string, decidedBy: string, alts: string[], opts: { productId?: string; projectId?: string; opportunityId?: string } = {}) =>
    prisma.decision.create({
      data: { id, title, context, decision, rationale, status, decidedBy, alternatives: alts,
        productId: opts.productId, projectId: opts.projectId, opportunityId: opts.opportunityId, decidedAt: daysAgo(Math.floor(Math.random() * 30) + 1) },
    });

  const decs = await Promise.all([
    D('d-1', 'Use Claude for Documantra extraction',  'Choosing primary LLM for clause extraction.', 'Claude as primary; OpenAI as fallback.', 'Claude scored higher on legal-clause eval; cost similar.', 'decided', 'r-nischay', ['OpenAI only', 'Dual-vendor abstraction'], { productId: 'p-doc' }),
    D('d-2', 'Workbench tool registry: build vs adopt','Standardize on tool definition format.',     'Adopt OpenAI function-call schema with our wrapper.', 'Largest ecosystem; minimal proprietary lock-in.',           'decided', 'r-prantik', ['Custom DSL','MCP only'], { productId: 'p-wb' }),
    D('d-3', 'Albertsons: weekly vs daily refresh',    'Tradeoff cost vs freshness.',                'Weekly for low-velocity, daily for top 10% SKUs.',    'Cost-curve breakpoint; satisfies category mgmt.',           'decided', 'r-meera',  ['Daily for all','Weekly for all'], { projectId: 'pr-alb-ps' }),
    D('d-4', 'Roku POC scope expansion?',              'Roku asking to add 3 more clause types.',    'Hold scope; address in phase 2.',                     'Phase 1 still working through accuracy.',                   'decided', 'r-viral',  ['Expand now','Decline entirely'], { opportunityId: 'o-roku-doc' }),
    D('d-5', 'Campaign Planning forecasting approach', 'Hierarchical TS vs deep-learning.',          'Pending.',                                            'Awaiting data assessment.',                                 'pending', 'r-viral',  ['Hierarchical TS','DeepAR','Hybrid'], { projectId: 'pr-camp-pilot' }),
    D('d-6', 'KEMET data exchange method',             'How will KEMET share data?',                 'Snowflake share over secure listing.',                'Avoid building custom ETL.',                                'decided', 'r-prantik', ['SFTP','API','Snowflake share'], { projectId: 'pr-kemet-optrix' }),
    D('d-7', 'Workbench beta access list',             'Open beta vs gated.',                        'Gated beta with 5 design partners.',                  'Get high-signal feedback before broader release.',          'decided', 'r-meera',  ['Open beta','Internal only'], { productId: 'p-wb' }),
  ]);
  console.log(`  ✓ ${decs.length} decisions`);

  // ===========================================================================
  // Allocations (intentional overloads)
  // ===========================================================================
  const AL = (resourceId: string, projectId: string, role: string, hoursPerWeek: number, weeks = 8) =>
    prisma.resourceAllocation.create({
      data: { resourceId, projectId, role, hoursPerWeek, startDate: daysAgo(7), endDate: daysOut(weeks * 7), confidence: 'committed' },
    });

  // Nischay heavily overloaded (50hrs)
  await Promise.all([
    AL('r-nischay',  'pr-roku-doc',     'Tech lead',           24),
    AL('r-nischay',  'pr-wb-platform',  'Architect',           14),
    AL('r-nischay',  'pr-orcl-conn',    'Consulting',           12),
    // Subrato dual-booked
    AL('r-subrato',  'pr-alb-ps',       'Data eng lead',       22),
    AL('r-subrato',  'pr-bloom-meio',   'Cutover lead',        24),
    // Healthy
    AL('r-prantik',  'pr-kemet-optrix', 'Solution architect',  20),
    AL('r-prantik',  'pr-orcl-conn',    'Lead',                16),
    AL('r-dushyant', 'pr-wb-platform',  'Tech lead',           32),
    AL('r-dushyant', 'pr-orcl-conn',    'Eng',                  8),
    AL('r-meera',    'pr-alb-ps',       'PO',                  16),
    AL('r-meera',    'pr-bloom-meio',   'PO',                   8),
    AL('r-meera',    'pr-sono-mdm',     'PO',                  10),
    AL('r-meera',    'pr-dex-ariv',     'PO',                   6),
    AL('r-arjun',    'pr-roku-doc',     'AI eng',              18),
    AL('r-arjun',    'pr-dex-ariv',     'AI eng',              12),
    AL('r-arjun',    'pr-camp-pilot',   'AI eng',               8),
    AL('r-kavya',    'pr-kemet-optrix', 'Data eng',            18),
    AL('r-kavya',    'pr-alb-ps',       'Data eng',            16),
    AL('r-ranu',     'pr-roku-doc',     'UI',                  16),
    AL('r-ranu',     'pr-alb-ps',       'UI',                  18),
    AL('r-ranu',     'pr-mlw-ct',       'UI',                   6),
    AL('r-rahul',    'pr-mlw-ct',       'Engagement',          20),
    AL('r-anika',    'pr-kemet-optrix', 'AI eng',              16),
    AL('r-anika',    'pr-bloom-meio',   'AI eng',              16),
    AL('r-viral',    'pr-sono-mdm',     'Exec sponsor',         8),
    AL('r-shubhy',   'pr-wb-platform',  'Delivery oversight',   6),
  ]);
  console.log(`  ✓ 26 resource allocations`);

  // ===========================================================================
  // Tasks (sample — kanban-ready)
  // ===========================================================================
  const T = (id: string, title: string, status: string, priority: string, assigneeId: string, projectId: string, dueDate?: Date, ai = false) =>
    prisma.task.create({
      data: { id, title, status, priority, assigneeId, projectId, dueDate, aiSourced: ai, effortHours: 8 },
    });

  await Promise.all([
    T('t-1',  'Build clause-type prompt eval harness',     'in_progress', 'p1', 'r-nischay', 'pr-roku-doc', daysOut(5)),
    T('t-2',  'Run 100-doc accuracy benchmark',            'not_started', 'p1', 'r-arjun',   'pr-roku-doc', daysOut(8)),
    T('t-3',  'Region 1 store onboarding playbook',        'in_progress', 'p2', 'r-meera',   'pr-alb-ps',   daysOut(10)),
    T('t-4',  'Snowflake share with KEMET',                'blocked',     'p1', 'r-kavya',   'pr-kemet-optrix', daysOut(3)),
    T('t-5',  'Bloom cutover runbook',                     'in_progress', 'p1', 'r-meera',   'pr-bloom-meio', daysOut(7)),
    T('t-6',  'Tool registry v1 spec',                     'blocked',     'p1', 'r-dushyant','pr-wb-platform', daysOut(7)),
    T('t-7',  'Agent observability prototype',             'in_progress', 'p2', 'r-dushyant','pr-wb-platform', daysOut(14)),
    T('t-8',  'Oracle auth integration tests',             'done',        'p2', 'r-prantik', 'pr-orcl-conn'),
    T('t-9',  'Dexcom security architecture doc',          'in_progress', 'p1', 'r-meera',   'pr-dex-ariv', daysOut(10)),
    T('t-10', 'Sonoco scoping interview round 1',          'done',        'p2', 'r-viral',   'pr-sono-mdm'),
    T('t-11', 'Sonoco scoping interview round 2',          'in_progress', 'p2', 'r-viral',   'pr-sono-mdm', daysOut(6)),
    T('t-12', 'Albertsons exec readout deck',              'not_started', 'p2', 'r-meera',   'pr-alb-ps',   daysOut(5)),
    T('t-13', 'Roku indemnification prompt tuning',        'in_progress', 'p0', 'r-nischay', 'pr-roku-doc', daysOut(4)),
    T('t-14', 'Workbench planner improvements',            'not_started', 'p2', 'r-arjun',   'pr-wb-platform', daysOut(20)),
    T('t-15', 'Milwaukee discovery synthesis',             'in_progress', 'p2', 'r-rahul',   'pr-mlw-ct',   daysOut(8)),
    // AI-sourced from transcripts
    T('t-16', 'Follow up with Roku procurement on MSA',    'not_started', 'p1', 'r-rahul',   'pr-roku-doc', daysOut(3), true),
    T('t-17', 'Schedule exec sponsor sync — Roku',         'not_started', 'p0', 'r-viral',   'pr-roku-doc', daysOut(2), true),
  ]);
  console.log(`  ✓ 17 tasks`);

  // ===========================================================================
  // Action items
  // ===========================================================================
  const AI = (id: string, title: string, status: string, source: string, assigneeId: string, opts: { projectId?: string; opportunityId?: string; productId?: string; dueDate?: Date; reviewed?: boolean; confidence?: string } = {}) =>
    prisma.actionItem.create({
      data: {
        id, title, status, source, assigneeId,
        projectId: opts.projectId, opportunityId: opts.opportunityId, productId: opts.productId,
        dueDate: opts.dueDate, reviewed: opts.reviewed ?? (source === 'manual'),
        confidence: opts.confidence,
      },
    });

  await Promise.all([
    AI('ai-1',  'Send revised pricing to Albertsons procurement', 'open',        'manual',       'r-meera',  { opportunityId: 'o-alb-ps',     dueDate: daysOut(2) }),
    AI('ai-2',  'Get Roku exec sponsor confirmation',             'open',        'ai_extracted', 'r-viral',  { opportunityId: 'o-roku-doc',  dueDate: daysOut(3), confidence: 'high' }),
    AI('ai-3',  'Draft Sonoco phase-1 scoping doc',                'in_progress', 'manual',       'r-meera',  { projectId: 'pr-sono-mdm',     dueDate: daysOut(5) }),
    AI('ai-4',  'Schedule KEMET data assessment kickoff',          'open',        'manual',       'r-prantik',{ projectId: 'pr-kemet-optrix', dueDate: daysOut(2) }),
    AI('ai-5',  'Reignite Cisco MDM — exec ping',                  'open',        'manual',       'r-rahul',  { opportunityId: 'o-cisco-mdm', dueDate: daysOut(1) }),
    AI('ai-6',  'Workbench: align on tool registry with Connector','open',        'ai_extracted', 'r-prantik',{ productId: 'p-wb',            dueDate: daysOut(4), confidence: 'medium' }),
    AI('ai-7',  'Bloom cutover dry-run',                           'open',        'manual',       'r-meera',  { projectId: 'pr-bloom-meio',   dueDate: daysOut(10) }),
    AI('ai-8',  'Oracle co-sell motion review',                    'open',        'manual',       'r-prantik',{ opportunityId: 'o-orcl-conn', dueDate: daysOut(5) }),
    AI('ai-9',  'Documantra/Control Tower consolidation proposal', 'open',        'ai_extracted', 'r-nischay',{ productId: 'p-doc',           dueDate: daysOut(10), confidence: 'high' }),
    AI('ai-10', 'Hire 1 senior AI engineer for Workbench',         'in_progress', 'manual',       'r-shubhy', { productId: 'p-wb',            dueDate: daysOut(30) }),
    AI('ai-11', 'Roku — push for MSA red-line',                    'open',        'ai_extracted', 'r-rahul',  { opportunityId: 'o-roku-doc',  dueDate: daysOut(3), confidence: 'high' }),
    AI('ai-12', 'Dexcom — circulate security guardrails draft',    'open',        'manual',       'r-meera',  { projectId: 'pr-dex-ariv',     dueDate: daysOut(7) }),
  ]);
  console.log(`  ✓ 12 action items`);

  // ===========================================================================
  // Meetings + transcript (Roku Documantra Legal Review)
  // ===========================================================================
  const meeting = await prisma.meeting.create({
    data: {
      id: 'mt-1',
      title: 'Roku — Documantra Legal Review',
      scheduledAt: daysAgo(2),
      durationMin: 45,
      attendeeIds: ['r-nischay', 'r-rahul', 'r-viral'],
      clientId: 'c-roku',
      agenda: 'Review accuracy and discuss MSA path',
      notes: 'See transcript for detail.',
    },
  });

  await prisma.transcript.create({
    data: {
      id: 'tr-1',
      title: 'Roku — Documantra Legal Review',
      meetingId: meeting.id,
      source: 'zoom',
      uploadedAt: daysAgo(2),
      uploadedBy: 'r-rahul',
      status: 'uploaded',
      rawText:
`[00:00] Rahul Verma: Thanks everyone for joining. Let's start with the accuracy update.
[00:05] Nischay Patel: We're at 78% on indemnification clauses. Target is 85%. The risk is that we slip the demo window.
[00:18] Rahul Verma: We need to confirm the exec sponsor commitment by end of week — I'll follow up with procurement tomorrow.
[01:02] Viral Shah: Let's decide: we hold the scope as-is for phase 1, address the additional clause types in phase 2.
[01:10] Nischay Patel: Agreed. I'll loop in Arjun to take over the 100-doc benchmark.
[01:25] Rahul Verma: Open question — do we have budget signal? There's a rumor of a Q3 procurement freeze at Roku.
[01:34] Viral Shah: Critical that we accelerate signature. Risk: if the freeze lands, the deal stalls.
[01:48] Rahul Verma: Action: Viral to schedule exec sync this week. Action: I'll push for MSA red-line by Thursday.
[02:05] Nischay Patel: There's an opportunity to upsell — phase 2 could be ~$400K for additional clause types.
[02:30] Viral Shah: Decision: go with Claude as primary LLM, OpenAI as fallback. Confirmed by eval results.`,
    },
  });
  console.log(`  ✓ 1 meeting + 1 transcript`);

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
