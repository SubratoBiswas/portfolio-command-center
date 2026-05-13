// =============================================================================
// Seed data for AI Portfolio Command Center.
// Trinamix-style realistic mock data. Acts as the local mock backend until
// the NestJS API is wired up. Imported by every page.
// =============================================================================

import type {
  Location, Resource, Client, Product, Opportunity, Project, Task, Risk,
  ActionItem, Decision, Meeting, Transcript, Capability, Workstream,
  ResourceAllocation, RoadmapItem, Dependency, Issue, Milestone, OpenQuestion,
  LeadershipUpdate, ID,
} from '@/lib/types';

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysOut = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };
const daysAgo = (n: number) => daysOut(-n);

// -----------------------------------------------------------------------------
// Locations
// -----------------------------------------------------------------------------
export const locations: Location[] = [
  { id: 'loc-uscentral', name: 'US Central',       timezone: 'America/Chicago',     region: 'US',   classification: 'onsite' },
  { id: 'loc-uspacific', name: 'US Pacific',       timezone: 'America/Los_Angeles', region: 'US',   classification: 'onsite' },
  { id: 'loc-india',     name: 'India — Bengaluru',timezone: 'Asia/Kolkata',        region: 'IN',   classification: 'offshore' },
  { id: 'loc-offshore',  name: 'Offshore Delivery',timezone: 'Asia/Kolkata',        region: 'IN',   classification: 'offshore' },
  { id: 'loc-client',    name: 'Client Site',      timezone: 'America/New_York',    region: 'US',   classification: 'client' },
  { id: 'loc-remote',    name: 'Remote',           timezone: 'America/Chicago',     region: 'US',   classification: 'remote' },
];

// -----------------------------------------------------------------------------
// Resources
// -----------------------------------------------------------------------------
export const resources: Resource[] = [
  { id: 'r-viral',    name: 'Viral Shah',       initials: 'VS', email: 'viral@trinamix.ai',    role: 'Portfolio Lead',          skills: ['Strategy','Product','Sales'],                           locationId: 'loc-uscentral', weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 220 },
  { id: 'r-shubhy',   name: 'Shubhy Iyer',      initials: 'SI', email: 'shubhy@trinamix.ai',   role: 'Delivery Director',       skills: ['Delivery','PMO','Client Success'],                       locationId: 'loc-uscentral', weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 200 },
  { id: 'r-nischay',  name: 'Nischay Patel',    initials: 'NP', email: 'nischay@trinamix.ai',  role: 'Principal AI Engineer',   skills: ['LLM','RAG','Python','Architecture','Embeddings'],        locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 130 },
  { id: 'r-prantik',  name: 'Prantik Roy',      initials: 'PR', email: 'prantik@trinamix.ai',  role: 'Solution Architect',      skills: ['Oracle','MDM','Architecture','Integration'],             locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 140 },
  { id: 'r-dushyant', name: 'Dushyant Kumar',   initials: 'DK', email: 'dushyant@trinamix.ai', role: 'AI Engineer',             skills: ['Python','RAG','Agents','LangGraph'],                     locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 4,  active: true, costRate: 110 },
  { id: 'r-subrato',  name: 'Subrato Banerjee', initials: 'SB', email: 'subrato@trinamix.ai',  role: 'Data Engineer',           skills: ['Snowflake','dbt','Airflow','Pipelines'],                 locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 100 },
  { id: 'r-ranu',     name: 'Ranu Sharma',      initials: 'RS', email: 'ranu@trinamix.ai',     role: 'UI Engineer',             skills: ['React','TypeScript','Design Systems'],                   locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 90  },
  { id: 'r-meera',    name: 'Meera Krishnan',   initials: 'MK', email: 'meera@trinamix.ai',    role: 'Delivery Lead',           skills: ['PMO','Scrum','Stakeholder Mgmt'],                        locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 115 },
  { id: 'r-arjun',    name: 'Arjun Mehta',      initials: 'AM', email: 'arjun@trinamix.ai',    role: 'AI Engineer',             skills: ['NLP','Extraction','Python'],                              locationId: 'loc-offshore',  weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 95  },
  { id: 'r-kavya',    name: 'Kavya Reddy',      initials: 'KR', email: 'kavya@trinamix.ai',    role: 'Data Engineer',           skills: ['Oracle','SQL','Snowflake'],                              locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 95  },
  { id: 'r-rahul',    name: 'Rahul Verma',      initials: 'RV', email: 'rahul@trinamix.ai',    role: 'Solution Architect',      skills: ['Cloud','OCI','Architecture','Security'],                 locationId: 'loc-uspacific', weeklyCapacityHours: 40, timeOffHours: 8,  active: true, costRate: 200 },
  { id: 'r-anika',    name: 'Anika Desai',      initials: 'AD', email: 'anika@trinamix.ai',    role: 'UI Engineer',             skills: ['React','Design','Tailwind'],                              locationId: 'loc-india',     weeklyCapacityHours: 40, timeOffHours: 0,  active: true, costRate: 85  },
];

// -----------------------------------------------------------------------------
// Clients
// -----------------------------------------------------------------------------
export const clients: Client[] = [
  { id: 'c-roku',       name: 'Roku',          industry: 'Media & Entertainment',  tier: 'strategic', region: 'US Pacific',  arr: 1_800_000, primaryOwnerId: 'r-viral',  logoColor: '#6F3FFF' },
  { id: 'c-sonoco',     name: 'Sonoco',        industry: 'Industrial Packaging',   tier: 'growth',    region: 'US Southeast',arr: 420_000,   primaryOwnerId: 'r-shubhy', logoColor: '#0E5F9F' },
  { id: 'c-albertsons', name: 'Albertsons',    industry: 'Retail / Grocery',       tier: 'strategic', region: 'US Pacific',  arr: 2_400_000, primaryOwnerId: 'r-viral',  logoColor: '#D4202C' },
  { id: 'c-kemet',      name: 'KEMET / Yageo', industry: 'Electronics Components', tier: 'growth',    region: 'US Southeast',arr: 680_000,   primaryOwnerId: 'r-shubhy', logoColor: '#C8102E' },
  { id: 'c-gev',        name: 'GE Vernova',    industry: 'Energy / Industrial',    tier: 'strategic', region: 'US Northeast',arr: 1_300_000, primaryOwnerId: 'r-viral',  logoColor: '#005EB8' },
  { id: 'c-cisco',      name: 'Cisco',         industry: 'Networking',             tier: 'maintain',  region: 'US Pacific',  arr: 240_000,   primaryOwnerId: 'r-rahul',  logoColor: '#1BA0D7' },
  { id: 'c-oracle',     name: 'Oracle',        industry: 'Enterprise Software',    tier: 'strategic', region: 'US Pacific',  arr: 0,         primaryOwnerId: 'r-viral',  logoColor: '#F80000' },
  { id: 'c-dexcom',     name: 'Dexcom',        industry: 'MedTech',                tier: 'growth',    region: 'US Pacific',  arr: 540_000,   primaryOwnerId: 'r-shubhy', logoColor: '#00A859' },
  { id: 'c-milwaukee',  name: 'Milwaukee Tool',industry: 'Industrial Tools',       tier: 'growth',    region: 'US Central',  arr: 380_000,   primaryOwnerId: 'r-viral',  logoColor: '#E4002B' },
  { id: 'c-bloom',      name: 'Bloom Energy',  industry: 'Clean Energy',           tier: 'growth',    region: 'US Pacific',  arr: 290_000,   primaryOwnerId: 'r-shubhy', logoColor: '#1B5E20' },
];

// -----------------------------------------------------------------------------
// Capabilities (reusable AI components)
// -----------------------------------------------------------------------------
export const capabilities: Capability[] = [
  { id: 'cap-extract',   name: 'Document Extraction Engine',   category: 'AI Core',         description: 'LLM-powered structured extraction from unstructured documents with confidence scoring.', maturity: 'flagship',     ownerId: 'r-nischay',  productIds: ['p-doc','p-ctrl','p-mdm'],         reusePotential: 'flagship', dependencyIds: [] },
  { id: 'cap-scrape',    name: 'Web Scraping & Enrichment',    category: 'Data Ingestion',  description: 'Headless scraping with rotating proxies, anti-bot, and structured enrichment pipelines.',  maturity: 'mature',       ownerId: 'r-subrato',  productIds: ['p-price','p-ariv'],               reusePotential: 'high',     dependencyIds: [] },
  { id: 'cap-agent',     name: 'Agent Orchestration',          category: 'AI Core',         description: 'Multi-step agent workflows with planner/executor pattern, tool calling, and memory.',     maturity: 'mature',       ownerId: 'r-dushyant', productIds: ['p-wb','p-ariv','p-ctrl'],         reusePotential: 'flagship', dependencyIds: [] },
  { id: 'cap-workflow',  name: 'Workflow Automation',          category: 'Execution',       description: 'DAG-based workflow runner with retries, observability, and human-in-the-loop pauses.',    maturity: 'mature',       ownerId: 'r-prantik',  productIds: ['p-wb','p-ctrl'],                  reusePotential: 'high',     dependencyIds: [] },
  { id: 'cap-oracle',    name: 'Oracle API Connector',         category: 'Integration',     description: 'Pre-built connectors for OCI services, Fusion apps, and Oracle Analytics Cloud.',          maturity: 'mature',       ownerId: 'r-rahul',    productIds: ['p-conn','p-mdm','p-sno'],         reusePotential: 'high',     dependencyIds: [] },
  { id: 'cap-kg',        name: 'Knowledge Graph',              category: 'AI Core',         description: 'Entity-relationship knowledge graph with semantic search and lineage tracking.',          maturity: 'beta',         ownerId: 'r-nischay',  productIds: ['p-ariv','p-mdm'],                 reusePotential: 'high',     dependencyIds: [] },
  { id: 'cap-semantic',  name: 'Semantic Layer',               category: 'AI Core',         description: 'Business glossary and metric layer that grounds LLM queries in trusted definitions.',     maturity: 'beta',         ownerId: 'r-prantik',  productIds: ['p-conn','p-wb','p-ctrl'],         reusePotential: 'flagship', dependencyIds: [] },
  { id: 'cap-doc',       name: 'Document Processing',          category: 'Data Ingestion',  description: 'OCR, layout-aware parsing, table extraction, multi-modal document understanding.',       maturity: 'mature',       ownerId: 'r-nischay',  productIds: ['p-doc','p-ctrl'],                 reusePotential: 'high',     dependencyIds: ['cap-extract'] },
  { id: 'cap-dashboard', name: 'Dashboarding Component',       category: 'UI',              description: 'Embeddable analytics dashboards with drilldown and saved views.',                          maturity: 'mature',       ownerId: 'r-ranu',     productIds: ['p-ctrl','p-mdm','p-sno','p-meio'],reusePotential: 'high',     dependencyIds: [] },
  { id: 'cap-optim',     name: 'Optimization Engine',          category: 'Optimization',    description: 'MIP/heuristic solvers for inventory, network, and assortment optimization.',               maturity: 'mature',       ownerId: 'r-prantik',  productIds: ['p-sno','p-meio','p-invest'],      reusePotential: 'medium',   dependencyIds: [] },
  { id: 'cap-forecast',  name: 'Forecasting Engine',           category: 'ML',              description: 'Time-series forecasting with hierarchical reconciliation and intermittent demand support.',maturity: 'mature',      ownerId: 'r-subrato',  productIds: ['p-sno','p-camp','p-invest'],      reusePotential: 'high',     dependencyIds: [] },
];

// -----------------------------------------------------------------------------
// Products
// -----------------------------------------------------------------------------
export const products: Product[] = [
  { id: 'p-doc',   name: 'Documantra',         shortName: 'Documantra',  vision: 'The fastest way to turn unstructured documents into structured operational data.',  problem: 'Enterprises lose weeks reading contracts, RFQs, and POs manually.', targetUsers: 'Ops, Procurement, Legal', maturity: 'beta',      roadmapStage: 'GA Q3 2026',    gtmStatus: 'in_market',  aiReadiness: 78, deliveryReadiness: 72, architectureStatus: 'approved', pricingModel: 'Per-document + platform', ownerId: 'r-nischay',  capabilityIds: ['cap-extract','cap-doc'],                       tags: ['extraction','contracts','rfq'],   strategicBucket: 'Flagship AI Products', createdAt: daysAgo(240) },
  { id: 'p-price', name: 'Price Sense AI',     shortName: 'Price Sense', vision: 'Real-time competitive pricing intelligence that drives margin.',                     problem: 'Pricing teams react too slowly to market moves and miss margin.',     targetUsers: 'Pricing, Category Mgrs',  maturity: 'mvp',       roadmapStage: 'Beta with Albertsons', gtmStatus: 'planning', aiReadiness: 62, deliveryReadiness: 58, architectureStatus: 'reviewed', pricingModel: 'SaaS subscription',       ownerId: 'r-viral',   capabilityIds: ['cap-scrape','cap-forecast'],                  tags: ['pricing','retail','competitive'], strategicBucket: 'Flagship AI Products', createdAt: daysAgo(180) },
  { id: 'p-ariv',  name: 'Ariv',               shortName: 'Ariv',        vision: 'Conversational analytics on top of your enterprise knowledge graph.',                 problem: 'Business users can\'t self-serve answers across siloed systems.',     targetUsers: 'Business Analysts, Execs',maturity: 'beta',      roadmapStage: 'GA Pilot',      gtmStatus: 'planning',   aiReadiness: 70, deliveryReadiness: 55, architectureStatus: 'evolving', pricingModel: 'Per-seat',                ownerId: 'r-dushyant',capabilityIds: ['cap-agent','cap-kg','cap-scrape'],            tags: ['conversational','analytics'],     strategicBucket: 'Flagship AI Products', createdAt: daysAgo(150) },
  { id: 'p-optr',  name: 'Optrix',             shortName: 'Optrix',      vision: 'AI-driven supply network optimization for complex multi-tier manufacturers.',         problem: 'Network planners juggle Excel for what-if scenarios.',                targetUsers: 'Supply Chain Planners',   maturity: 'mvp',       roadmapStage: 'Pilot — KEMET',  gtmStatus: 'planning',  aiReadiness: 55, deliveryReadiness: 60, architectureStatus: 'reviewed', pricingModel: 'Implementation + SaaS',   ownerId: 'r-prantik', capabilityIds: ['cap-optim','cap-forecast','cap-oracle'],      tags: ['supply','optimization'],          strategicBucket: 'Supply AI',            createdAt: daysAgo(120) },
  { id: 'p-wb',    name: 'AI Agent Workbench', shortName: 'Workbench',   vision: 'A no-code workbench to design, deploy, and govern enterprise AI agents.',             problem: 'Teams reinvent agent infrastructure for every use case.',             targetUsers: 'AI Engineers, IT',        maturity: 'beta',      roadmapStage: 'GA Q4 2026',    gtmStatus: 'planning',   aiReadiness: 80, deliveryReadiness: 65, architectureStatus: 'approved', pricingModel: 'Platform + usage',        ownerId: 'r-nischay', capabilityIds: ['cap-agent','cap-workflow','cap-semantic'],    tags: ['agents','platform','no-code'],    strategicBucket: 'AI Platform',          createdAt: daysAgo(200) },
  { id: 'p-ctrl',  name: 'Control Tower',      shortName: 'Control Twr', vision: 'Operational control tower for end-to-end visibility and AI-driven exceptions.',       problem: 'Ops teams firefight exceptions without root-cause context.',          targetUsers: 'Ops, Customer Service',   maturity: 'beta',      roadmapStage: 'GA Sonoco Q2',  gtmStatus: 'in_market',  aiReadiness: 72, deliveryReadiness: 68, architectureStatus: 'approved', pricingModel: 'Implementation + SaaS',   ownerId: 'r-shubhy',  capabilityIds: ['cap-extract','cap-doc','cap-dashboard','cap-agent','cap-workflow','cap-semantic'], tags: ['visibility','exceptions'], strategicBucket: 'Supply AI', createdAt: daysAgo(160) },
  { id: 'p-conn',  name: 'Universal Connector',shortName: 'Connector',   vision: 'A single integration fabric for AI agents to reach any enterprise system.',           problem: 'Every AI initiative pays the integration tax repeatedly.',            targetUsers: 'AI Engineers, IT',        maturity: 'mvp',       roadmapStage: 'Beta',          gtmStatus: 'planning',   aiReadiness: 50, deliveryReadiness: 45, architectureStatus: 'evolving', pricingModel: 'Platform',                ownerId: 'r-rahul',   capabilityIds: ['cap-oracle','cap-semantic'],                  tags: ['integration','connectors'],       strategicBucket: 'AI Platform',          createdAt: daysAgo(90) },
  { id: 'p-mdm',   name: 'AI in MDM',          shortName: 'AI in MDM',   vision: 'LLM-powered master data: better matching, dedup, classification, governance.',        problem: 'Rule-based MDM hits a ceiling and never reaches the long tail.',     targetUsers: 'Data Stewards, IT',       maturity: 'beta',      roadmapStage: 'Oracle co-sell',gtmStatus: 'planning',   aiReadiness: 75, deliveryReadiness: 60, architectureStatus: 'approved', pricingModel: 'License + impl',          ownerId: 'r-prantik', capabilityIds: ['cap-extract','cap-kg','cap-oracle','cap-dashboard'], tags: ['mdm','data-quality'],   strategicBucket: 'Data AI',              createdAt: daysAgo(170) },
  { id: 'p-sno',   name: 'Supply Network Opt.',shortName: 'SNO',         vision: 'End-to-end supply network design and operational planning.',                          problem: 'Network design is a once-a-year project; markets move monthly.',      targetUsers: 'S&OP, Planners',          maturity: 'mvp',       roadmapStage: 'Pilot',         gtmStatus: 'planning',   aiReadiness: 48, deliveryReadiness: 55, architectureStatus: 'reviewed', pricingModel: 'Implementation + SaaS',   ownerId: 'r-prantik', capabilityIds: ['cap-optim','cap-forecast','cap-oracle','cap-dashboard'], tags: ['supply','network'],   strategicBucket: 'Supply AI',            createdAt: daysAgo(140) },
  { id: 'p-meio',  name: 'MEIO',               shortName: 'MEIO',        vision: 'Multi-echelon inventory optimization with service-level intelligence.',                problem: 'Inventory targets are set once a year and overstated.',               targetUsers: 'Inventory Planners',      maturity: 'beta',      roadmapStage: 'GA',            gtmStatus: 'in_market',  aiReadiness: 60, deliveryReadiness: 70, architectureStatus: 'approved', pricingModel: 'Implementation + SaaS',   ownerId: 'r-subrato', capabilityIds: ['cap-optim','cap-dashboard'],                  tags: ['inventory','optimization'],       strategicBucket: 'Supply AI',            createdAt: daysAgo(220) },
  { id: 'p-camp',  name: 'Campaign Planning',  shortName: 'Campaign',    vision: 'AI-assisted promotional and campaign planning for retail.',                            problem: 'Campaign planners can\'t simulate trade-offs fast enough.',           targetUsers: 'Trade Marketing, Category',maturity: 'mvp',      roadmapStage: 'Pilot',         gtmStatus: 'planning',   aiReadiness: 45, deliveryReadiness: 50, architectureStatus: 'reviewed', pricingModel: 'SaaS',                    ownerId: 'r-viral',   capabilityIds: ['cap-forecast','cap-dashboard'],               tags: ['campaign','retail'],              strategicBucket: 'Retail AI',            createdAt: daysAgo(100) },
  { id: 'p-invest',name: 'Investment Buy',     shortName: 'Inv. Buy',    vision: 'AI-driven opportunistic procurement and inventory investment optimization.',           problem: 'Buyers miss commodity-buy windows for lack of signal aggregation.',  targetUsers: 'Strategic Procurement',   maturity: 'concept',  roadmapStage: 'Discovery',     gtmStatus: 'not_started',aiReadiness: 30, deliveryReadiness: 25, architectureStatus: 'draft',    pricingModel: 'TBD',                     ownerId: 'r-viral',   capabilityIds: ['cap-optim','cap-forecast','cap-scrape'],      tags: ['procurement','investment'],       strategicBucket: 'Retail AI',            createdAt: daysAgo(45) },
];

// -----------------------------------------------------------------------------
// Opportunities
// -----------------------------------------------------------------------------
export const opportunities: Opportunity[] = [
  { id: 'o-roku-doc',     name: 'Roku — Documantra Contract Intelligence',        clientId: 'c-roku',      productId: 'p-doc',   capabilityIds: ['cap-extract','cap-doc'],            value: 850_000,  probability: 65, stage: 'propose',    ownerId: 'r-viral',  expectedCloseDate: daysOut(45),  lastInteractionAt: daysAgo(4),  nextStep: 'Send revised SOW with phased rollout',                           strategicImportance: 'high',     resourceIds: ['r-nischay','r-arjun'],            blockers: ['Legal review pending'],                            risks: ['Procurement freeze'], aiNextBestAction: 'Schedule call with VP Legal to address indemnification clause.', createdAt: daysAgo(60) },
  { id: 'o-albert-price', name: 'Albertsons — Price Sense AI Expansion',          clientId: 'c-albertsons',productId: 'p-price', capabilityIds: ['cap-scrape','cap-forecast'],        value: 1_400_000,probability: 75, stage: 'negotiate',  ownerId: 'r-viral',  expectedCloseDate: daysOut(28),  lastInteractionAt: daysAgo(2),  nextStep: 'Finalize MSA terms with procurement',                            strategicImportance: 'critical', resourceIds: ['r-subrato','r-kavya'],            blockers: [],                                                  risks: ['Competitor pricing pressure'], aiNextBestAction: 'Lock in pilot success metrics in writing before MSA signs.', createdAt: daysAgo(85) },
  { id: 'o-sonoco-ctrl',  name: 'Sonoco — Control Tower Phase 2',                 clientId: 'c-sonoco',    productId: 'p-ctrl',  capabilityIds: ['cap-dashboard','cap-agent'],        value: 620_000,  probability: 55, stage: 'propose',    ownerId: 'r-shubhy', expectedCloseDate: daysOut(60),  lastInteractionAt: daysAgo(7),  nextStep: 'Demo agent-driven exception handling',                           strategicImportance: 'high',     resourceIds: ['r-dushyant','r-meera'],           blockers: ['Champion on PTO until next week'],                 risks: ['Phase 1 issues unresolved'], aiNextBestAction: 'Resolve top 3 phase 1 issues before re-engaging on phase 2.', createdAt: daysAgo(75) },
  { id: 'o-kemet-optrix', name: 'KEMET — Optrix Network Optimization Pilot',      clientId: 'c-kemet',     productId: 'p-optr',  capabilityIds: ['cap-optim','cap-forecast'],         value: 480_000,  probability: 70, stage: 'negotiate',  ownerId: 'r-shubhy', expectedCloseDate: daysOut(21),  lastInteractionAt: daysAgo(3),  nextStep: 'Kickoff workshop with planning team',                            strategicImportance: 'high',     resourceIds: ['r-prantik','r-subrato'],          blockers: [],                                                  risks: ['Data quality concerns'], aiNextBestAction: 'Run data readiness assessment before kickoff to derisk.', createdAt: daysAgo(70) },
  { id: 'o-gev-wb',       name: 'GE Vernova — Agent Workbench Platform',          clientId: 'c-gev',       productId: 'p-wb',    capabilityIds: ['cap-agent','cap-workflow'],         value: 2_100_000,probability: 45, stage: 'discover',   ownerId: 'r-viral',  expectedCloseDate: daysOut(90),  lastInteractionAt: daysAgo(11), nextStep: 'Architecture workshop with their AI CoE',                        strategicImportance: 'critical', resourceIds: ['r-nischay','r-rahul'],            blockers: ['Awaiting NDA execution'],                          risks: ['Internal build vs buy debate'], aiNextBestAction: 'Engage their AI CoE lead directly — opportunity stale 11 days.', createdAt: daysAgo(95) },
  { id: 'o-cisco-mdm',    name: 'Cisco — AI in MDM Discovery',                    clientId: 'c-cisco',     productId: 'p-mdm',   capabilityIds: ['cap-extract','cap-kg'],             value: 240_000,  probability: 30, stage: 'qualify',    ownerId: 'r-rahul',  expectedCloseDate: daysOut(75),  lastInteractionAt: daysAgo(18), nextStep: 'Identify executive sponsor',                                     strategicImportance: 'medium',   resourceIds: [],                                  blockers: ['No exec sponsor yet'],                             risks: ['Opportunity going stale'], aiNextBestAction: 'STALE — escalate to Viral, no movement in 18 days.', createdAt: daysAgo(50) },
  { id: 'o-oracle-cosell',name: 'Oracle — AI in MDM Co-Sell Motion',             clientId: 'c-oracle',    productId: 'p-mdm',   capabilityIds: ['cap-oracle','cap-extract'],         value: 0,        probability: 60, stage: 'discover',   ownerId: 'r-viral',  expectedCloseDate: daysOut(120), lastInteractionAt: daysAgo(5),  nextStep: 'Joint solution architecture session',                           strategicImportance: 'critical', resourceIds: ['r-prantik','r-rahul'],            blockers: [],                                                  risks: [], aiNextBestAction: 'Get on the Oracle Q3 partner roadmap session.', createdAt: daysAgo(40) },
  { id: 'o-dexcom-ariv',  name: 'Dexcom — Ariv Conversational Analytics POC',     clientId: 'c-dexcom',    productId: 'p-ariv',  capabilityIds: ['cap-agent','cap-kg'],               value: 180_000,  probability: 80, stage: 'negotiate',  ownerId: 'r-shubhy', expectedCloseDate: daysOut(14),  lastInteractionAt: daysAgo(1),  nextStep: 'POC SOW signature this week',                                   strategicImportance: 'high',     resourceIds: ['r-dushyant','r-anika'],           blockers: [],                                                  risks: [], aiNextBestAction: 'Confirm POC success criteria with their data team before sign.', createdAt: daysAgo(30) },
  { id: 'o-milwaukee-doc',name: 'Milwaukee Tool — Documantra RFQ Automation',     clientId: 'c-milwaukee', productId: 'p-doc',   capabilityIds: ['cap-extract','cap-doc'],            value: 380_000,  probability: 55, stage: 'propose',    ownerId: 'r-viral',  expectedCloseDate: daysOut(50),  lastInteractionAt: daysAgo(6),  nextStep: 'Pricing workshop',                                              strategicImportance: 'medium',   resourceIds: ['r-arjun'],                        blockers: [],                                                  risks: [], aiNextBestAction: 'Bundle with phase 2 MEIO expansion to lift deal size.', createdAt: daysAgo(45) },
  { id: 'o-bloom-meio',   name: 'Bloom Energy — MEIO Implementation',             clientId: 'c-bloom',     productId: 'p-meio',  capabilityIds: ['cap-optim'],                        value: 540_000,  probability: 65, stage: 'negotiate',  ownerId: 'r-shubhy', expectedCloseDate: daysOut(35),  lastInteractionAt: daysAgo(4),  nextStep: 'Statement of work finalization',                                strategicImportance: 'high',     resourceIds: ['r-subrato','r-meera'],            blockers: [],                                                  risks: ['Resource conflict with Albertsons'], aiNextBestAction: 'Resolve Subrato allocation conflict before commitment.', createdAt: daysAgo(55) },
  { id: 'o-gev-snopt',    name: 'GE Vernova — SNO Phase 1',                       clientId: 'c-gev',       productId: 'p-sno',   capabilityIds: ['cap-optim','cap-forecast'],         value: 760_000,  probability: 40, stage: 'discover',   ownerId: 'r-viral',  expectedCloseDate: daysOut(110), lastInteractionAt: daysAgo(9),  nextStep: 'Data assessment workshop',                                      strategicImportance: 'high',     resourceIds: ['r-prantik'],                      blockers: [],                                                  risks: [], aiNextBestAction: 'Combine with GEV Workbench discussion to streamline procurement.', createdAt: daysAgo(40) },
  { id: 'o-roku-ariv',    name: 'Roku — Ariv for Programming Team',               clientId: 'c-roku',      productId: 'p-ariv',  capabilityIds: ['cap-agent','cap-kg'],               value: 320_000,  probability: 50, stage: 'qualify',    ownerId: 'r-viral',  expectedCloseDate: daysOut(80),  lastInteractionAt: daysAgo(14), nextStep: 'Confirm budget owner',                                          strategicImportance: 'medium',   resourceIds: ['r-dushyant'],                     blockers: ['Budget owner unclear'],                            risks: [], aiNextBestAction: 'STALE — 14 days no contact, follow up with VP Programming.', createdAt: daysAgo(35) },
  { id: 'o-sonoco-camp',  name: 'Sonoco — Campaign Planning Pilot',               clientId: 'c-sonoco',    productId: 'p-camp',  capabilityIds: ['cap-forecast'],                     value: 210_000,  probability: 35, stage: 'qualify',    ownerId: 'r-shubhy', expectedCloseDate: daysOut(95),  lastInteractionAt: daysAgo(8),  nextStep: 'Use-case validation with marketing',                            strategicImportance: 'low',      resourceIds: [],                                  blockers: [],                                                  risks: [], aiNextBestAction: 'Tie into Control Tower expansion narrative.', createdAt: daysAgo(25) },
  { id: 'o-albert-camp',  name: 'Albertsons — Campaign Planning Expansion',       clientId: 'c-albertsons',productId: 'p-camp',  capabilityIds: ['cap-forecast','cap-dashboard'],     value: 680_000,  probability: 50, stage: 'discover',   ownerId: 'r-viral',  expectedCloseDate: daysOut(75),  lastInteractionAt: daysAgo(6),  nextStep: 'Trade marketing executive briefing',                            strategicImportance: 'high',     resourceIds: ['r-subrato'],                      blockers: [],                                                  risks: [], aiNextBestAction: 'Align with Price Sense expansion to land one combined deal.', createdAt: daysAgo(28) },
  { id: 'o-kemet-doc',    name: 'KEMET — Documantra Supplier Onboarding',         clientId: 'c-kemet',     productId: 'p-doc',   capabilityIds: ['cap-extract'],                      value: 290_000,  probability: 60, stage: 'propose',    ownerId: 'r-shubhy', expectedCloseDate: daysOut(40),  lastInteractionAt: daysAgo(3),  nextStep: 'Demo for procurement team',                                     strategicImportance: 'medium',   resourceIds: ['r-arjun'],                        blockers: [],                                                  risks: [], aiNextBestAction: 'Position as Optrix pilot enabler — they need clean supplier data.', createdAt: daysAgo(20) },
];

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------
const M = (id: string, projectId: string, name: string, days: number, status: any, ownerId: string): Milestone =>
  ({ id, projectId, name, dueDate: daysOut(days), status, ownerId });

export const projects: Project[] = [
  { id: 'pr-sonoco-ctrl-p1', name: 'Sonoco — Control Tower Phase 1',         code: 'SONOCO-CT-P1',  clientId: 'c-sonoco',    productId: 'p-ctrl',  type: 'client_delivery', status: 'in_progress', rag: 'yellow', startDate: daysAgo(120), endDate: daysOut(30),  ownerId: 'r-shubhy',  scope: 'Implement Control Tower for finished-goods visibility across 4 plants.', charter: 'Deliver real-time visibility, exception detection, and root-cause AI for finished-goods distribution.', workstreamIds: ['ws-1','ws-2'], resourceIds: ['r-dushyant','r-meera','r-anika','r-subrato','r-arjun'], milestones: [ M('m1','pr-sonoco-ctrl-p1','Data integration complete', -30, 'done', 'r-subrato'), M('m2','pr-sonoco-ctrl-p1','Exception engine live', 7, 'at_risk', 'r-dushyant'), M('m3','pr-sonoco-ctrl-p1','UAT signoff', 25, 'not_started', 'r-meera') ], weeklyStatus: 'Yellow — exception engine slipping due to LLM latency tuning. Mitigation: add caching layer.', budget: 720_000, spent: 540_000, createdAt: daysAgo(125) },
  { id: 'pr-albert-price',   name: 'Albertsons — Price Sense AI Pilot',      code: 'ALB-PS-PIL',    clientId: 'c-albertsons',productId: 'p-price', type: 'client_delivery', status: 'in_progress', rag: 'green',  startDate: daysAgo(60),  endDate: daysOut(60),  ownerId: 'r-viral',   scope: 'Pilot Price Sense AI on 3 categories for competitive monitoring.', charter: 'Demonstrate measurable margin uplift on pilot categories within 90 days.', workstreamIds: ['ws-3'], resourceIds: ['r-subrato','r-kavya','r-anika'], milestones: [ M('m4','pr-albert-price','Scraping infra live', -15, 'done', 'r-subrato'), M('m5','pr-albert-price','Pricing model v1', 10, 'in_progress', 'r-subrato'), M('m6','pr-albert-price','Pilot review', 45, 'not_started', 'r-viral') ], weeklyStatus: 'Green — on track. Initial scraping coverage at 87% of comp set.', budget: 380_000, spent: 180_000, createdAt: daysAgo(62) },
  { id: 'pr-roku-doc',       name: 'Roku — Documantra Contract POC',         code: 'ROKU-DOC-POC',  clientId: 'c-roku',      productId: 'p-doc',   type: 'client_delivery', status: 'in_progress', rag: 'orange', startDate: daysAgo(45),  endDate: daysOut(15),  ownerId: 'r-shubhy',  scope: 'POC contract intelligence on 200 contracts.', charter: 'Show >85% field-level accuracy on key clauses to unlock production deal.', workstreamIds: ['ws-4'], resourceIds: ['r-nischay','r-arjun'], milestones: [ M('m7','pr-roku-doc','Extraction baseline', -10, 'done', 'r-nischay'), M('m8','pr-roku-doc','Accuracy >85%', 5, 'at_risk', 'r-nischay'), M('m9','pr-roku-doc','Executive readout', 12, 'not_started', 'r-shubhy') ], weeklyStatus: 'Orange — accuracy at 78% on indemnification clauses. Nischay overallocated.', budget: 95_000, spent: 78_000, createdAt: daysAgo(48) },
  { id: 'pr-kemet-optrix',   name: 'KEMET — Optrix Pilot',                   code: 'KEMET-OPT-PIL', clientId: 'c-kemet',     productId: 'p-optr',  type: 'client_delivery', status: 'in_progress', rag: 'green',  startDate: daysAgo(15),  endDate: daysOut(75),  ownerId: 'r-shubhy',  scope: 'Optimize 2-tier supply network for capacitor product family.', charter: 'Quantify $4M+ working capital opportunity across 2-tier network.', workstreamIds: ['ws-5'], resourceIds: ['r-prantik','r-subrato','r-kavya'], milestones: [ M('m10','pr-kemet-optrix','Data load', 5, 'in_progress', 'r-kavya'), M('m11','pr-kemet-optrix','Baseline model', 30, 'not_started', 'r-prantik'), M('m12','pr-kemet-optrix','Pilot results', 70, 'not_started', 'r-prantik') ], weeklyStatus: 'Green — kickoff completed, data loading on schedule.', budget: 320_000, spent: 45_000, createdAt: daysAgo(18) },
  { id: 'pr-bloom-meio',     name: 'Bloom Energy — MEIO Implementation',     code: 'BLOOM-MEIO',    clientId: 'c-bloom',     productId: 'p-meio',  type: 'client_delivery', status: 'in_progress', rag: 'yellow', startDate: daysAgo(80),  endDate: daysOut(40),  ownerId: 'r-shubhy',  scope: 'Implement MEIO for service-parts network.', charter: 'Reduce service-parts inventory 15% while maintaining 98% fill rate.', workstreamIds: ['ws-6'], resourceIds: ['r-subrato','r-meera'], milestones: [ M('m13','pr-bloom-meio','Data assessment', -50, 'done', 'r-subrato'), M('m14','pr-bloom-meio','Model calibration', -5, 'done', 'r-subrato'), M('m15','pr-bloom-meio','Production cutover', 28, 'at_risk', 'r-meera') ], weeklyStatus: 'Yellow — Subrato conflict with Albertsons may delay cutover.', budget: 540_000, spent: 380_000, createdAt: daysAgo(85) },
  { id: 'pr-doc-prod',       name: 'Documantra — GA Hardening',              code: 'DOC-GA',         clientId: 'c-roku',      productId: 'p-doc',   type: 'product_build',   status: 'in_progress', rag: 'green',  startDate: daysAgo(60),  endDate: daysOut(90),  ownerId: 'r-nischay', scope: 'Harden Documantra for GA: multi-tenant, SSO, audit trail.', charter: 'Achieve GA readiness with enterprise security and observability.', workstreamIds: ['ws-7'], resourceIds: ['r-nischay','r-arjun','r-anika','r-ranu'], milestones: [ M('m16','pr-doc-prod','Multi-tenant arch', -10, 'done', 'r-nischay'), M('m17','pr-doc-prod','SSO + audit', 25, 'in_progress', 'r-arjun'), M('m18','pr-doc-prod','GA launch', 85, 'not_started', 'r-nischay') ], weeklyStatus: 'Green — on track for GA.', createdAt: daysAgo(65) },
  { id: 'pr-wb-platform',    name: 'AI Agent Workbench — Platform Build',    code: 'WB-PLAT',        clientId: 'c-oracle',    productId: 'p-wb',    type: 'product_build',   status: 'in_progress', rag: 'yellow', startDate: daysAgo(40),  endDate: daysOut(140), ownerId: 'r-nischay', scope: 'Build core agent platform: orchestration, tools, memory, governance.', charter: 'Launch platform beta with 3 reference agents by end of Q3.', workstreamIds: ['ws-8','ws-9'], resourceIds: ['r-nischay','r-dushyant','r-rahul','r-ranu'], milestones: [ M('m19','pr-wb-platform','Orchestration v1', 14, 'at_risk', 'r-dushyant'), M('m20','pr-wb-platform','Tool framework', 45, 'not_started', 'r-rahul'), M('m21','pr-wb-platform','Beta release', 120, 'not_started', 'r-nischay') ], weeklyStatus: 'Yellow — orchestration v1 dependency on semantic layer.', createdAt: daysAgo(42) },
  { id: 'pr-gev-disc',       name: 'GE Vernova — Discovery Engagement',      code: 'GEV-DISC',       clientId: 'c-gev',       type: 'client_delivery', status: 'in_progress', rag: 'green',  startDate: daysAgo(20),  endDate: daysOut(40),  ownerId: 'r-viral',   scope: 'Discovery for AI platform + SNO opportunities.', charter: 'Land $2M+ multi-product engagement.', workstreamIds: [], resourceIds: ['r-rahul','r-prantik'], milestones: [ M('m22','pr-gev-disc','Stakeholder map', -10, 'done', 'r-viral'), M('m23','pr-gev-disc','Architecture proposal', 20, 'in_progress', 'r-rahul') ], weeklyStatus: 'Green — strong sponsorship from VP Digital.', createdAt: daysAgo(22) },
  { id: 'pr-internal-cap',   name: 'Internal — Capability Library Initiative',code: 'INT-CAPLIB',    clientId: 'c-oracle',    type: 'internal',        status: 'in_progress', rag: 'green',  startDate: daysAgo(30),  endDate: daysOut(60),  ownerId: 'r-shubhy',  scope: 'Document and productize 11 reusable capabilities.', charter: 'Reduce delivery time by 30% via reusable components.', workstreamIds: [], resourceIds: ['r-prantik','r-ranu'], milestones: [ M('m24','pr-internal-cap','Inventory complete', -5, 'done', 'r-shubhy'), M('m25','pr-internal-cap','Reuse playbook', 30, 'in_progress', 'r-prantik') ], weeklyStatus: 'Green.', createdAt: daysAgo(32) },
  { id: 'pr-camp-pilot',     name: 'Campaign Planning — Pilot Build',        code: 'CAMP-PIL',       clientId: 'c-sonoco',    productId: 'p-camp',  type: 'product_build',   status: 'blocked',     rag: 'red',    startDate: daysAgo(25),  endDate: daysOut(45),  ownerId: 'r-viral',   scope: 'Build campaign planning MVP for retail pilot.', charter: 'Demonstrate trade-spend ROI within pilot.', workstreamIds: [], resourceIds: ['r-subrato'], milestones: [ M('m26','pr-camp-pilot','Decision on forecasting approach', 0, 'blocked', 'r-viral') ], weeklyStatus: 'Red — blocked on architectural decision; pending Viral signoff.', createdAt: daysAgo(28) },
  { id: 'pr-cisco-mdm',      name: 'Cisco — AI in MDM Discovery',            code: 'CISCO-MDM-D',    clientId: 'c-cisco',     productId: 'p-mdm',   type: 'client_delivery', status: 'on_hold',     rag: 'yellow', startDate: daysAgo(35),  endDate: daysOut(25),  ownerId: 'r-rahul',   scope: 'Discovery for AI-enhanced MDM.', charter: 'Validate fit and quantify business case.', workstreamIds: [], resourceIds: [], milestones: [], weeklyStatus: 'On hold — awaiting exec sponsor.', createdAt: daysAgo(38) },
  { id: 'pr-dexcom-ariv',    name: 'Dexcom — Ariv POC',                      code: 'DEX-ARIV-POC',   clientId: 'c-dexcom',    productId: 'p-ariv',  type: 'client_delivery', status: 'not_started', rag: 'green',  startDate: daysOut(10),  endDate: daysOut(70),  ownerId: 'r-shubhy',  scope: 'POC of conversational analytics on commercial data.', charter: 'Validate accuracy >80% on sales analytics questions.', workstreamIds: [], resourceIds: ['r-dushyant','r-anika'], milestones: [], weeklyStatus: 'Pending SOW signature.', createdAt: daysAgo(15) },
];

// -----------------------------------------------------------------------------
// Workstreams
// -----------------------------------------------------------------------------
export const workstreams: Workstream[] = [
  { id: 'ws-1', name: 'Data Integration',    projectId: 'pr-sonoco-ctrl-p1', ownerId: 'r-subrato',  status: 'done',        description: 'ERP + WMS data integration' },
  { id: 'ws-2', name: 'Exception Engine',    projectId: 'pr-sonoco-ctrl-p1', ownerId: 'r-dushyant', status: 'at_risk',     description: 'LLM-driven exception detection' },
  { id: 'ws-3', name: 'Scraping & Pricing',  projectId: 'pr-albert-price',   ownerId: 'r-subrato',  status: 'in_progress', description: 'Competitor scraping + price model' },
  { id: 'ws-4', name: 'Extraction',          projectId: 'pr-roku-doc',       ownerId: 'r-nischay',  status: 'at_risk',     description: 'Contract clause extraction' },
  { id: 'ws-5', name: 'Network Modeling',    projectId: 'pr-kemet-optrix',   ownerId: 'r-prantik',  status: 'in_progress', description: 'Supply network optimization model' },
  { id: 'ws-6', name: 'MEIO Calibration',    projectId: 'pr-bloom-meio',     ownerId: 'r-subrato',  status: 'on_track',    description: 'Multi-echelon model calibration' },
  { id: 'ws-7', name: 'Platform Hardening',  projectId: 'pr-doc-prod',       ownerId: 'r-nischay',  status: 'on_track',    description: 'Multi-tenant + SSO + audit' },
  { id: 'ws-8', name: 'Orchestration',       projectId: 'pr-wb-platform',    ownerId: 'r-dushyant', status: 'at_risk',     description: 'Agent orchestration engine' },
  { id: 'ws-9', name: 'Tool Framework',      projectId: 'pr-wb-platform',    ownerId: 'r-rahul',    status: 'not_started', description: 'Universal tool registry' },
];

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------
export const tasks: Task[] = [
  { id: 't-1',  title: 'Tune LLM prompt for indemnification clauses',     status: 'in_progress', priority: 'p0', assigneeId: 'r-nischay',  ownerId: 'r-nischay',  productId: 'p-doc',   projectId: 'pr-roku-doc',       workstreamId: 'ws-4', dueDate: daysOut(3),   estimateHours: 16, dependsOn: [], tags: ['extraction','quality'], source: 'manual', createdAt: daysAgo(8),  updatedAt: daysAgo(1) },
  { id: 't-2',  title: 'Build caching layer for exception engine',         status: 'in_progress', priority: 'p0', assigneeId: 'r-dushyant', ownerId: 'r-dushyant', productId: 'p-ctrl',  projectId: 'pr-sonoco-ctrl-p1', workstreamId: 'ws-2', dueDate: daysOut(5),   estimateHours: 24, dependsOn: [], tags: ['perf','infra'], source: 'manual', createdAt: daysAgo(6), updatedAt: daysAgo(2) },
  { id: 't-3',  title: 'Expand scraping coverage to 95% of comp set',      status: 'in_progress', priority: 'p1', assigneeId: 'r-subrato',  ownerId: 'r-subrato',  productId: 'p-price', projectId: 'pr-albert-price',   workstreamId: 'ws-3', dueDate: daysOut(10),  estimateHours: 20, dependsOn: [], tags: ['scraping'], source: 'manual', createdAt: daysAgo(5), updatedAt: daysAgo(1) },
  { id: 't-4',  title: 'Multi-tenant data isolation review',               status: 'on_track',    priority: 'p1', assigneeId: 'r-nischay',  ownerId: 'r-nischay',  productId: 'p-doc',   projectId: 'pr-doc-prod',       workstreamId: 'ws-7', dueDate: daysOut(14),  estimateHours: 12, dependsOn: [], tags: ['security'], source: 'manual', createdAt: daysAgo(7), updatedAt: daysAgo(2) },
  { id: 't-5',  title: 'SSO integration with Okta',                        status: 'in_progress', priority: 'p1', assigneeId: 'r-arjun',    ownerId: 'r-arjun',    productId: 'p-doc',   projectId: 'pr-doc-prod',       workstreamId: 'ws-7', dueDate: daysOut(18),  estimateHours: 32, dependsOn: ['t-4'], tags: ['security','auth'], source: 'manual', createdAt: daysAgo(10), updatedAt: daysAgo(1) },
  { id: 't-6',  title: 'KEMET data load',                                  status: 'in_progress', priority: 'p1', assigneeId: 'r-kavya',    ownerId: 'r-kavya',    productId: 'p-optr',  projectId: 'pr-kemet-optrix',   workstreamId: 'ws-5', dueDate: daysOut(5),   estimateHours: 28, dependsOn: [], tags: ['data'], source: 'manual', createdAt: daysAgo(8), updatedAt: daysAgo(2) },
  { id: 't-7',  title: 'Design orchestration v1 API',                      status: 'in_progress', priority: 'p0', assigneeId: 'r-dushyant', ownerId: 'r-dushyant', productId: 'p-wb',    projectId: 'pr-wb-platform',    workstreamId: 'ws-8', dueDate: daysOut(7),   estimateHours: 36, dependsOn: [], tags: ['architecture'], source: 'manual', createdAt: daysAgo(15), updatedAt: daysAgo(2) },
  { id: 't-8',  title: 'UAT plan for Sonoco Phase 1',                      status: 'not_started', priority: 'p1', assigneeId: 'r-meera',    ownerId: 'r-meera',    productId: 'p-ctrl',  projectId: 'pr-sonoco-ctrl-p1', dueDate: daysOut(12),  estimateHours: 8,  dependsOn: ['t-2'], tags: ['uat'], source: 'manual', createdAt: daysAgo(4), updatedAt: daysAgo(1) },
  { id: 't-9',  title: 'Roku exec readout deck',                           status: 'not_started', priority: 'p0', assigneeId: 'r-viral',    ownerId: 'r-shubhy',   productId: 'p-doc',   projectId: 'pr-roku-doc',       dueDate: daysOut(10),  estimateHours: 6,  dependsOn: ['t-1'], tags: ['executive'], source: 'manual', createdAt: daysAgo(3), updatedAt: daysAgo(1) },
  { id: 't-10', title: 'Capability inventory writeup',                     status: 'in_progress', priority: 'p2', assigneeId: 'r-prantik',  ownerId: 'r-shubhy',                       projectId: 'pr-internal-cap',                   dueDate: daysOut(20),  estimateHours: 16, dependsOn: [], tags: ['internal'], source: 'manual', createdAt: daysAgo(10), updatedAt: daysAgo(3) },
  { id: 't-11', title: 'Bloom MEIO go-live runbook',                       status: 'in_progress', priority: 'p1', assigneeId: 'r-meera',    ownerId: 'r-meera',    productId: 'p-meio',  projectId: 'pr-bloom-meio',     dueDate: daysOut(22),  estimateHours: 12, dependsOn: [], tags: ['cutover'], source: 'manual', createdAt: daysAgo(7), updatedAt: daysAgo(2) },
  { id: 't-12', title: 'Oracle co-sell joint architecture deck',           status: 'in_progress', priority: 'p1', assigneeId: 'r-prantik',  ownerId: 'r-viral',    productId: 'p-mdm',                                                                                  dueDate: daysOut(8),   estimateHours: 10, dependsOn: [], tags: ['sales','oracle'], source: 'manual', createdAt: daysAgo(4), updatedAt: daysAgo(1) },
  { id: 't-13', title: 'Documantra extraction accuracy report',            status: 'not_started', priority: 'p0', assigneeId: 'r-nischay',  ownerId: 'r-nischay',  productId: 'p-doc',   projectId: 'pr-roku-doc',       dueDate: daysOut(6),   estimateHours: 6,  dependsOn: ['t-1'], tags: ['analysis'], source: 'manual', createdAt: daysAgo(3), updatedAt: daysAgo(1) },
  { id: 't-14', title: 'Price model v1 backtest',                          status: 'in_progress', priority: 'p1', assigneeId: 'r-subrato',  ownerId: 'r-subrato',  productId: 'p-price', projectId: 'pr-albert-price',   dueDate: daysOut(8),   estimateHours: 20, dependsOn: ['t-3'], tags: ['ml'], source: 'manual', createdAt: daysAgo(5), updatedAt: daysAgo(1) },
  { id: 't-15', title: 'UI design system audit',                           status: 'in_progress', priority: 'p2', assigneeId: 'r-ranu',     ownerId: 'r-ranu',                                                                                                          dueDate: daysOut(15),  estimateHours: 14, dependsOn: [], tags: ['design'], source: 'manual', createdAt: daysAgo(6), updatedAt: daysAgo(2) },
  { id: 't-16', title: 'Cisco discovery follow-up email',                  status: 'blocked',     priority: 'p2', assigneeId: 'r-rahul',    ownerId: 'r-rahul',    productId: 'p-mdm',                                                                                  dueDate: daysOut(2),   estimateHours: 1,  dependsOn: [], tags: ['sales','stale'], source: 'manual', createdAt: daysAgo(18), updatedAt: daysAgo(12) },
  { id: 't-17', title: 'Dexcom POC SOW',                                   status: 'in_progress', priority: 'p0', assigneeId: 'r-shubhy',   ownerId: 'r-shubhy',                       opportunityId: 'o-dexcom-ariv',                                                  dueDate: daysOut(3),   estimateHours: 4,  dependsOn: [], tags: ['contract'], source: 'manual', createdAt: daysAgo(4), updatedAt: daysAgo(1) },
  { id: 't-18', title: 'GE Vernova architecture proposal',                 status: 'in_progress', priority: 'p0', assigneeId: 'r-rahul',    ownerId: 'r-rahul',                        projectId: 'pr-gev-disc',                                                        dueDate: daysOut(14),  estimateHours: 24, dependsOn: [], tags: ['proposal'], source: 'manual', createdAt: daysAgo(8), updatedAt: daysAgo(2) },
  { id: 't-19', title: 'Albertsons pilot review prep',                     status: 'not_started', priority: 'p1', assigneeId: 'r-viral',    ownerId: 'r-viral',    productId: 'p-price', projectId: 'pr-albert-price',   dueDate: daysOut(35),  estimateHours: 8,  dependsOn: ['t-14'], tags: ['executive'], source: 'manual', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
  { id: 't-20', title: 'Workbench beta marketing site',                    status: 'not_started', priority: 'p2', assigneeId: 'r-anika',    ownerId: 'r-anika',    productId: 'p-wb',    projectId: 'pr-wb-platform',    dueDate: daysOut(60),  estimateHours: 30, dependsOn: ['t-7'], tags: ['marketing'], source: 'manual', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
  { id: 't-21', title: 'Onboard Anika to Documantra GA team',              status: 'done',        priority: 'p2', assigneeId: 'r-anika',    ownerId: 'r-nischay',  productId: 'p-doc',                                                                                  dueDate: daysAgo(3),   estimateHours: 4,  dependsOn: [], tags: ['onboarding'], source: 'manual', createdAt: daysAgo(10), updatedAt: daysAgo(3) },
  { id: 't-22', title: 'Forecasting approach decision (Campaign Planning)',status: 'blocked',     priority: 'p0', assigneeId: 'r-viral',    ownerId: 'r-viral',    productId: 'p-camp',  projectId: 'pr-camp-pilot',     dueDate: daysOut(0),   estimateHours: 2,  dependsOn: [], tags: ['decision','blocker'], source: 'manual', createdAt: daysAgo(12), updatedAt: daysAgo(5) },
  { id: 't-23', title: 'Documantra: clause taxonomy expansion',            status: 'not_started', priority: 'p2', assigneeId: 'r-arjun',    ownerId: 'r-nischay',  productId: 'p-doc',                                                                                  dueDate: daysOut(28),  estimateHours: 18, dependsOn: [], tags: ['extraction'], source: 'manual', createdAt: daysAgo(5), updatedAt: daysAgo(2) },
  { id: 't-24', title: 'Optrix model baseline run',                        status: 'not_started', priority: 'p1', assigneeId: 'r-prantik',  ownerId: 'r-prantik',  productId: 'p-optr',  projectId: 'pr-kemet-optrix',   dueDate: daysOut(25),  estimateHours: 32, dependsOn: ['t-6'], tags: ['model'], source: 'manual', createdAt: daysAgo(3), updatedAt: daysAgo(1) },
  { id: 't-25', title: 'Bloom MEIO production cutover dry-run',            status: 'not_started', priority: 'p0', assigneeId: 'r-subrato',  ownerId: 'r-meera',    productId: 'p-meio',  projectId: 'pr-bloom-meio',     dueDate: daysOut(25),  estimateHours: 16, dependsOn: ['t-11'], tags: ['cutover'], source: 'manual', createdAt: daysAgo(4), updatedAt: daysAgo(2) },
  { id: 't-26', title: 'Action: Follow up with Cisco exec sponsor',        status: 'not_started', priority: 'p2', assigneeId: 'r-rahul',    ownerId: 'r-viral',    productId: 'p-mdm',                                                                                  dueDate: daysOut(5),   estimateHours: 1,  dependsOn: [], tags: ['stale','sales'], source: 'ai_extracted', confidence: 'high', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { id: 't-27', title: 'Reusable accelerator: contract clause library',    status: 'not_started', priority: 'p2', assigneeId: 'r-arjun',    ownerId: 'r-nischay',  productId: 'p-doc',                                                                                  dueDate: daysOut(40),  estimateHours: 20, dependsOn: [], tags: ['accelerator'], source: 'ai_extracted', confidence: 'medium', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
];

// -----------------------------------------------------------------------------
// Action items
// -----------------------------------------------------------------------------
export const actionItems: ActionItem[] = [
  { id: 'a-1', title: 'Share revised SOW for Roku Documantra with Legal',     assigneeId: 'r-viral',   dueDate: daysOut(2),  status: 'open',        opportunityId: 'o-roku-doc',     source: 'ai_extracted', confidence: 'high',   reviewed: true,  createdAt: daysAgo(4) },
  { id: 'a-2', title: 'Schedule Albertsons MSA review with procurement',     assigneeId: 'r-viral',   dueDate: daysOut(3),  status: 'in_progress', opportunityId: 'o-albert-price', source: 'manual',                                            reviewed: true,  createdAt: daysAgo(3) },
  { id: 'a-3', title: 'Resolve Subrato allocation conflict (Bloom vs Albertsons)', assigneeId: 'r-shubhy', dueDate: daysOut(2), status: 'open',  projectId: 'pr-bloom-meio',      source: 'ai_extracted', confidence: 'high',   reviewed: true,  createdAt: daysAgo(2) },
  { id: 'a-4', title: 'Send executive readout deck for Roku',                assigneeId: 'r-shubhy',  dueDate: daysOut(10), status: 'open',        projectId: 'pr-roku-doc',         source: 'manual',                                            reviewed: true,  createdAt: daysAgo(3) },
  { id: 'a-5', title: 'Confirm Dexcom POC success criteria in writing',      assigneeId: 'r-shubhy',  dueDate: daysOut(1),  status: 'open',        opportunityId: 'o-dexcom-ariv',  source: 'ai_extracted', confidence: 'high',   reviewed: true,  createdAt: daysAgo(2) },
  { id: 'a-6', title: 'KEMET: confirm data quality readiness',               assigneeId: 'r-prantik', dueDate: daysOut(5),  status: 'in_progress', opportunityId: 'o-kemet-optrix', source: 'manual',                                            reviewed: true,  createdAt: daysAgo(4) },
  { id: 'a-7', title: 'Cisco exec sponsor identification',                   assigneeId: 'r-rahul',   dueDate: daysOut(7),  status: 'open',        opportunityId: 'o-cisco-mdm',    source: 'manual',                                            reviewed: true,  createdAt: daysAgo(15) },
  { id: 'a-8', title: 'Bloom cutover Go/No-Go review',                       assigneeId: 'r-meera',   dueDate: daysOut(23), status: 'open',        projectId: 'pr-bloom-meio',       source: 'manual',                                            reviewed: true,  createdAt: daysAgo(5) },
  { id: 'a-9', title: 'GE Vernova: schedule AI CoE workshop',                assigneeId: 'r-viral',   dueDate: daysOut(7),  status: 'in_progress', opportunityId: 'o-gev-wb',       source: 'ai_extracted', confidence: 'high',   reviewed: true,  createdAt: daysAgo(8) },
  { id: 'a-10',title: 'Roku: Legal indemnification review meeting',          assigneeId: 'r-viral',   dueDate: daysOut(4),  status: 'open',        opportunityId: 'o-roku-doc',     source: 'ai_extracted', confidence: 'medium', reviewed: false, createdAt: daysAgo(1) },
  { id: 'a-11',title: 'Workbench orchestration v1 design review',            assigneeId: 'r-nischay', dueDate: daysOut(5),  status: 'open',        projectId: 'pr-wb-platform',     source: 'manual',                                            reviewed: true,  createdAt: daysAgo(4) },
  { id: 'a-12',title: 'Documantra: regression test on indemnification',     assigneeId: 'r-arjun',   dueDate: daysOut(2),  status: 'in_progress', projectId: 'pr-roku-doc',         source: 'ai_extracted', confidence: 'high',   reviewed: true,  createdAt: daysAgo(2) },
  { id: 'a-13',title: 'Capability library: socialize with engineering',     assigneeId: 'r-shubhy',  dueDate: daysOut(14), status: 'open',        projectId: 'pr-internal-cap',     source: 'manual',                                            reviewed: true,  createdAt: daysAgo(5) },
  { id: 'a-14',title: 'Albertsons: align Campaign expansion to one motion', assigneeId: 'r-viral',   dueDate: daysOut(10), status: 'open',        opportunityId: 'o-albert-camp',  source: 'ai_extracted', confidence: 'medium', reviewed: false, createdAt: daysAgo(1) },
  { id: 'a-15',title: 'Hire AI Engineer for Workbench team',                 assigneeId: 'r-shubhy',  dueDate: daysOut(30), status: 'open',        productId: 'p-wb',                source: 'manual',                                            reviewed: true,  createdAt: daysAgo(10) },
];

// -----------------------------------------------------------------------------
// Risks
// -----------------------------------------------------------------------------
export const risks: Risk[] = [
  { id: 'rk-1', title: 'Nischay overallocated across Documantra, Workbench, Roku POC', description: 'Principal AI Engineer is on 3 high-priority efforts in same window. Risk of slipping all three.', severity: 'critical', likelihood: 'high',   status: 'mitigating', ownerId: 'r-shubhy',  mitigation: 'Offload extraction work to Arjun; bring contractor for Workbench.',     productId: 'p-doc',  dueDate: daysOut(7),  source: 'ai_extracted', createdAt: daysAgo(3) },
  { id: 'rk-2', title: 'Subrato dual-booked: Bloom MEIO and Albertsons Price Sense',  description: 'Conflict on cutover week.',                                                       severity: 'high',     likelihood: 'high',   status: 'mitigating', ownerId: 'r-shubhy',  mitigation: 'Shift Subrato to Albertsons; route Bloom to Kavya for cutover.',         projectId: 'pr-bloom-meio', dueDate: daysOut(14), source: 'ai_extracted', createdAt: daysAgo(2) },
  { id: 'rk-3', title: 'Roku procurement freeze',                                       description: 'Q3 budget freeze rumored at Roku.',                                                severity: 'high',     likelihood: 'medium', status: 'identified', ownerId: 'r-viral',   mitigation: 'Accelerate signature; explore departmental budget alternatives.',       opportunityId: 'o-roku-doc', source: 'manual',     createdAt: daysAgo(5) },
  { id: 'rk-4', title: 'Documantra accuracy below threshold for Roku POC',             description: 'Indemnification clauses at 78% accuracy; target 85%.',                              severity: 'critical', likelihood: 'high',   status: 'mitigating', ownerId: 'r-nischay', mitigation: 'Prompt tuning + few-shot examples; consider clause-specific fine-tune.', projectId: 'pr-roku-doc',    source: 'manual',     createdAt: daysAgo(4) },
  { id: 'rk-5', title: 'GE Vernova: build vs buy debate',                              description: 'Internal team pitching build-it-ourselves alternative.',                            severity: 'high',     likelihood: 'medium', status: 'mitigating', ownerId: 'r-viral',   mitigation: 'Bring case studies; offer build-with-us model.',                         opportunityId: 'o-gev-wb', source: 'manual',     createdAt: daysAgo(11) },
  { id: 'rk-6', title: 'KEMET data quality unknown',                                    description: 'No data assessment yet; could blow pilot timeline.',                                severity: 'medium',   likelihood: 'medium', status: 'mitigating', ownerId: 'r-prantik', mitigation: 'Run data assessment in week 1 before model build.',                      projectId: 'pr-kemet-optrix', source: 'manual',     createdAt: daysAgo(15) },
  { id: 'rk-7', title: 'Cisco opportunity going stale',                                description: '18 days no contact; risk of close-lost.',                                          severity: 'medium',   likelihood: 'high',   status: 'identified', ownerId: 'r-rahul',   mitigation: 'Escalate to Viral; one final push for exec sponsor.',                    opportunityId: 'o-cisco-mdm', source: 'ai_extracted', createdAt: daysAgo(2) },
  { id: 'rk-8', title: 'Workbench orchestration depends on Semantic Layer beta',       description: 'Critical path dependency, semantic layer not GA.',                                  severity: 'high',     likelihood: 'medium', status: 'identified', ownerId: 'r-dushyant',mitigation: 'Run orchestration v1 against stub semantic layer; parallelize.',         projectId: 'pr-wb-platform', source: 'manual',     createdAt: daysAgo(20) },
  { id: 'rk-9', title: 'Campaign Planning architectural decision blocked',             description: 'Forecasting approach undecided; project stalled.',                                  severity: 'high',     likelihood: 'high',   status: 'identified', ownerId: 'r-viral',   mitigation: 'Force decision this week; default to hierarchical TS if no signal.',     projectId: 'pr-camp-pilot', source: 'manual',     createdAt: daysAgo(8) },
  { id: 'rk-10',title: 'Documantra and Control Tower duplicate document processing',  description: 'Two products extracting same documents; consolidation needed.',                    severity: 'medium',   likelihood: 'high',   status: 'identified', ownerId: 'r-nischay', mitigation: 'Pull document processing into shared accelerator.',                       productId: 'p-doc',  source: 'ai_extracted', createdAt: daysAgo(3) },
  { id: 'rk-11',title: 'AI Engineer hiring lagging — Workbench team',                  description: 'Need 1 more senior AI engineer to hit Workbench beta.',                            severity: 'high',     likelihood: 'medium', status: 'mitigating', ownerId: 'r-shubhy',  mitigation: 'Active interviewing; contractor backstop identified.',                   productId: 'p-wb',   source: 'manual',     createdAt: daysAgo(25) },
  { id: 'rk-12',title: 'Universal Connector and Workbench overlap on tool registry',  description: 'Both teams designing tool framework; duplicate work.',                              severity: 'medium',   likelihood: 'high',   status: 'identified', ownerId: 'r-rahul',   mitigation: 'Architecture sync this week; align on shared registry.',                  productId: 'p-conn', source: 'ai_extracted', createdAt: daysAgo(4) },
];

// -----------------------------------------------------------------------------
// Issues
// -----------------------------------------------------------------------------
export const issues: Issue[] = [
  { id: 'is-1', title: 'Sonoco exception engine — latency 12s p95',           description: 'Causing UI timeouts for end users.', severity: 'high',     status: 'in_progress', ownerId: 'r-dushyant', projectId: 'pr-sonoco-ctrl-p1', reportedAt: daysAgo(5) },
  { id: 'is-2', title: 'Albertsons scraper getting rate-limited on 4 sites',  description: 'Need proxy rotation tuning.',         severity: 'medium',   status: 'open',        ownerId: 'r-subrato',  projectId: 'pr-albert-price',   reportedAt: daysAgo(3) },
  { id: 'is-3', title: 'Documantra OCR failing on scanned signatures',        description: 'Causes downstream extraction failures.', severity: 'medium', status: 'open',        ownerId: 'r-arjun',    productId: 'p-doc',             reportedAt: daysAgo(4) },
  { id: 'is-4', title: 'Bloom MEIO model overfitting on warranty parts',     description: 'Calibration issue on long-tail SKUs.', severity: 'high',     status: 'in_progress', ownerId: 'r-subrato',  projectId: 'pr-bloom-meio',     reportedAt: daysAgo(7) },
  { id: 'is-5', title: 'Workbench: agent memory not persisting across runs', description: 'State management bug.',                severity: 'medium',   status: 'open',        ownerId: 'r-dushyant', projectId: 'pr-wb-platform',    reportedAt: daysAgo(2) },
];

// -----------------------------------------------------------------------------
// Decisions
// -----------------------------------------------------------------------------
export const decisions: Decision[] = [
  { id: 'd-1', title: 'Adopt Anthropic Claude as default LLM for Documantra extraction', context: 'Evaluated GPT-4, Claude 3.5, Gemini on contract clause extraction.', decision: 'Claude 3.5 Sonnet as default; OpenAI fallback for redaction.', rationale: 'Best accuracy on indemnification and IP clauses + lower hallucination rate.', decidedBy: 'r-nischay', decidedAt: daysAgo(12), status: 'decided',  productId: 'p-doc',  source: 'manual' },
  { id: 'd-2', title: 'Control Tower exception engine: cache vs no-cache',                context: 'Latency target 3s p95 not met without caching.',                       decision: 'Add Redis cache layer with 5-min TTL.',                  rationale: '12x speedup on cache hits; data freshness acceptable for use case.',        decidedBy: 'r-dushyant', decidedAt: daysAgo(3), status: 'decided', projectId: 'pr-sonoco-ctrl-p1', source: 'manual' },
  { id: 'd-3', title: 'Workbench: build vs buy orchestration framework',                   context: 'LangGraph, CrewAI, build-our-own evaluated.',                          decision: 'Build our own; lightweight wrapper on Pydantic + asyncio.', rationale: 'Need custom telemetry, governance, and human-in-the-loop semantics.',     decidedBy: 'r-nischay', decidedAt: daysAgo(18), status: 'decided', productId: 'p-wb',   source: 'manual' },
  { id: 'd-4', title: 'Campaign Planning forecasting approach',                            context: 'Hierarchical TS vs deep learning vs hybrid.',                          decision: 'PENDING — Viral signoff required.',                       rationale: 'Need to balance accuracy vs time-to-pilot.',                                decidedBy: 'r-viral',    decidedAt: daysAgo(0), status: 'pending',  projectId: 'pr-camp-pilot',    source: 'manual' },
  { id: 'd-5', title: 'Consolidate document processing across Documantra & Control Tower',context: 'Two products building same capability.',                               decision: 'Lift to shared accelerator owned by Nischay.',           rationale: 'Reduces drift, halves maintenance, faster customer onboarding.',           decidedBy: 'r-nischay',  decidedAt: daysAgo(2),  status: 'decided', productId: 'p-doc',  source: 'ai_extracted' },
  { id: 'd-6', title: 'Universal Connector — adopt OCI Generative AI as a connector',     context: 'Oracle co-sell motion needs first-class OCI support.',                  decision: 'Add OCI GenAI provider with parity to OpenAI.',         rationale: 'Unlocks co-sell + customer preference at Oracle accounts.',                 decidedBy: 'r-rahul',    decidedAt: daysAgo(7),  status: 'decided', productId: 'p-conn', source: 'manual' },
  { id: 'd-7', title: 'KEMET Optrix: scope phase 1 to 2-tier only',                       context: 'Pilot scope conversation with KEMET.',                                  decision: 'Limit phase 1 to 2-tier capacitor network.',             rationale: 'Manage scope; phase 2 expands to full multi-tier.',                          decidedBy: 'r-shubhy',   decidedAt: daysAgo(15), status: 'decided', projectId: 'pr-kemet-optrix',  source: 'manual' },
  { id: 'd-8', title: 'Move Anika to Documantra GA team',                                  context: 'UI engineering need for SSO and admin console.',                       decision: 'Anika joins Documantra GA team part-time.',              rationale: 'Best skills match; existing rapport with Nischay.',                         decidedBy: 'r-shubhy',   decidedAt: daysAgo(10), status: 'decided', productId: 'p-doc',  source: 'manual' },
  { id: 'd-9', title: 'Reuse Forecasting capability across SNO, MEIO, Campaign',          context: 'Three teams building forecasting.',                                     decision: 'Standardize on one shared Forecasting Engine.',          rationale: 'Single ownership, shared roadmap, deeper investment in one place.',          decidedBy: 'r-subrato',  decidedAt: daysAgo(20), status: 'decided', source: 'manual' },
];

// -----------------------------------------------------------------------------
// Meetings & Transcripts
// -----------------------------------------------------------------------------
export const meetings: Meeting[] = [
  { id: 'mt-1', title: 'Roku Documantra — Legal Review',     scheduledAt: daysAgo(4),  durationMinutes: 45, attendeeIds: ['r-viral','r-nischay'],   opportunityId: 'o-roku-doc',     hasTranscript: true,  summary: 'Discussion on indemnification language and procurement timeline.' },
  { id: 'mt-2', title: 'Sonoco Phase 1 — Weekly Status',     scheduledAt: daysAgo(2),  durationMinutes: 30, attendeeIds: ['r-shubhy','r-dushyant','r-meera','r-anika'], projectId: 'pr-sonoco-ctrl-p1', hasTranscript: true, summary: 'Latency concerns on exception engine; mitigation plan agreed.' },
  { id: 'mt-3', title: 'Albertsons MSA Negotiation',         scheduledAt: daysAgo(2),  durationMinutes: 60, attendeeIds: ['r-viral'],                opportunityId: 'o-albert-price', hasTranscript: false, summary: 'Procurement pushback on liability cap; revised position to send.' },
  { id: 'mt-4', title: 'KEMET Kickoff',                      scheduledAt: daysAgo(15), durationMinutes: 90, attendeeIds: ['r-shubhy','r-prantik','r-subrato','r-kavya'], projectId: 'pr-kemet-optrix', hasTranscript: true, summary: 'Pilot scope confirmed: 2-tier capacitor network.' },
  { id: 'mt-5', title: 'GE Vernova Workbench Discovery',     scheduledAt: daysAgo(11), durationMinutes: 60, attendeeIds: ['r-viral','r-nischay','r-rahul'], opportunityId: 'o-gev-wb',    hasTranscript: true, summary: 'Build vs buy debate surfaced; need to bring case studies.' },
];

export const transcripts: Transcript[] = [
  {
    id: 'tr-1',
    meetingId: 'mt-1',
    title: 'Roku Documantra — Legal Review',
    uploadedBy: 'r-viral',
    uploadedAt: daysAgo(4),
    status: 'committed',
    extractedActionItemIds: ['a-1','a-10'],
    extractedRiskIds: ['rk-3'],
    extractedDecisionIds: [],
    extractedOpportunityIds: [],
    extractedDependencyIds: [],
    rawText: `Viral: Thanks for joining. Let's walk through the indemnification language Mark flagged last week.
Mark (Roku Legal): The current draft has uncapped IP indemnification. That won't fly with our procurement team. We need a cap, ideally 12 months of fees.
Viral: We can do 24 months of fees as a cap. We've done that with other media customers.
Mark: Acceptable in principle. I'll need to confirm with our SVP Legal.
Nischay: From a product side, our accuracy on indemnification clauses is currently 78%. We're targeting 85% in the next two weeks via prompt tuning.
Mark: That's a concern for the exec readout next month. We need to see 85% before we can sign.
Viral: Understood. Nischay will own getting accuracy above 85% by end of next sprint. I'll send the revised SOW with the 24-month cap by Friday.
Mark: Also — heads up, Q3 procurement freeze is being discussed internally. If we don't sign in the next 6 weeks, this likely pushes to Q4.
Viral: Critical. We'll prioritize closing this in the next 4 weeks.
Mark: One more thing — we'd like a legal indemnification review meeting next week with our SVP. Can you set it up?
Viral: Yes, I'll send invites for next Tuesday or Wednesday.`
  },
];

// -----------------------------------------------------------------------------
// Resource Allocations (drives the capacity engine)
// -----------------------------------------------------------------------------
export const allocations: ResourceAllocation[] = [
  // Nischay — OVERALLOCATED
  { id: 'al-1', resourceId: 'r-nischay', productId: 'p-doc',  projectId: 'pr-roku-doc',       startDate: daysAgo(45), endDate: daysOut(15), hoursPerWeek: 20, role: 'Tech Lead' },
  { id: 'al-2', resourceId: 'r-nischay', productId: 'p-doc',  projectId: 'pr-doc-prod',       startDate: daysAgo(60), endDate: daysOut(90), hoursPerWeek: 16, role: 'Architect' },
  { id: 'al-3', resourceId: 'r-nischay', productId: 'p-wb',   projectId: 'pr-wb-platform',    startDate: daysAgo(40), endDate: daysOut(140),hoursPerWeek: 14, role: 'Principal' },
  // Dushyant
  { id: 'al-4', resourceId: 'r-dushyant',productId: 'p-ctrl', projectId: 'pr-sonoco-ctrl-p1', startDate: daysAgo(120),endDate: daysOut(30), hoursPerWeek: 28, role: 'Engineer' },
  { id: 'al-5', resourceId: 'r-dushyant',productId: 'p-wb',   projectId: 'pr-wb-platform',    startDate: daysAgo(40), endDate: daysOut(140),hoursPerWeek: 14, role: 'Engineer' },
  // Subrato — CONFLICT
  { id: 'al-6', resourceId: 'r-subrato', productId: 'p-meio', projectId: 'pr-bloom-meio',     startDate: daysAgo(80), endDate: daysOut(40), hoursPerWeek: 22, role: 'Data Lead' },
  { id: 'al-7', resourceId: 'r-subrato', productId: 'p-price',projectId: 'pr-albert-price',   startDate: daysAgo(60), endDate: daysOut(60), hoursPerWeek: 22, role: 'Data Lead' },
  // Prantik
  { id: 'al-8', resourceId: 'r-prantik', productId: 'p-optr', projectId: 'pr-kemet-optrix',   startDate: daysAgo(15), endDate: daysOut(75), hoursPerWeek: 24, role: 'Architect' },
  { id: 'al-9', resourceId: 'r-prantik', productId: 'p-mdm',                                  startDate: daysAgo(30), endDate: daysOut(60), hoursPerWeek: 8,  role: 'Architect' },
  // Arjun
  { id: 'al-10',resourceId: 'r-arjun',   productId: 'p-doc',  projectId: 'pr-roku-doc',       startDate: daysAgo(45), endDate: daysOut(15), hoursPerWeek: 24, role: 'Engineer' },
  { id: 'al-11',resourceId: 'r-arjun',   productId: 'p-doc',  projectId: 'pr-doc-prod',       startDate: daysAgo(60), endDate: daysOut(90), hoursPerWeek: 14, role: 'Engineer' },
  // Anika
  { id: 'al-12',resourceId: 'r-anika',   productId: 'p-ctrl', projectId: 'pr-sonoco-ctrl-p1', startDate: daysAgo(90), endDate: daysOut(30), hoursPerWeek: 20, role: 'UI Engineer' },
  { id: 'al-13',resourceId: 'r-anika',   productId: 'p-doc',  projectId: 'pr-doc-prod',       startDate: daysAgo(10), endDate: daysOut(90), hoursPerWeek: 16, role: 'UI Engineer' },
  // Ranu
  { id: 'al-14',resourceId: 'r-ranu',    productId: 'p-wb',   projectId: 'pr-wb-platform',    startDate: daysAgo(40), endDate: daysOut(140),hoursPerWeek: 18, role: 'UI Engineer' },
  { id: 'al-15',resourceId: 'r-ranu',                                                          startDate: daysAgo(30), endDate: daysOut(60), hoursPerWeek: 12, role: 'Design System' },
  // Kavya
  { id: 'al-16',resourceId: 'r-kavya',   productId: 'p-optr', projectId: 'pr-kemet-optrix',   startDate: daysAgo(15), endDate: daysOut(75), hoursPerWeek: 24, role: 'Data Engineer' },
  { id: 'al-17',resourceId: 'r-kavya',   productId: 'p-price',projectId: 'pr-albert-price',   startDate: daysAgo(60), endDate: daysOut(60), hoursPerWeek: 10, role: 'Data Engineer' },
  // Meera
  { id: 'al-18',resourceId: 'r-meera',   productId: 'p-ctrl', projectId: 'pr-sonoco-ctrl-p1', startDate: daysAgo(120),endDate: daysOut(30), hoursPerWeek: 16, role: 'Delivery Lead' },
  { id: 'al-19',resourceId: 'r-meera',   productId: 'p-meio', projectId: 'pr-bloom-meio',     startDate: daysAgo(80), endDate: daysOut(40), hoursPerWeek: 16, role: 'Delivery Lead' },
  // Rahul
  { id: 'al-20',resourceId: 'r-rahul',   productId: 'p-conn',                                  startDate: daysAgo(60), endDate: daysOut(90), hoursPerWeek: 14, role: 'Architect' },
  { id: 'al-21',resourceId: 'r-rahul',   productId: 'p-wb',   projectId: 'pr-wb-platform',    startDate: daysAgo(40), endDate: daysOut(140),hoursPerWeek: 12, role: 'Architect' },
  { id: 'al-22',resourceId: 'r-rahul',                        projectId: 'pr-gev-disc',       startDate: daysAgo(20), endDate: daysOut(40), hoursPerWeek: 8,  role: 'Architect' },
  // Viral
  { id: 'al-23',resourceId: 'r-viral',                                                         startDate: daysAgo(60), endDate: daysOut(60), hoursPerWeek: 20, role: 'Sales / Portfolio' },
  { id: 'al-24',resourceId: 'r-viral',                                                         startDate: daysAgo(30), endDate: daysOut(90), hoursPerWeek: 18, role: 'Strategy' },
  // Shubhy
  { id: 'al-25',resourceId: 'r-shubhy',                                                        startDate: daysAgo(60), endDate: daysOut(60), hoursPerWeek: 30, role: 'Delivery' },
];

// -----------------------------------------------------------------------------
// Roadmap items
// -----------------------------------------------------------------------------
export const roadmapItems: RoadmapItem[] = [
  { id: 'rm-1', productId: 'p-doc',  name: 'Multi-tenant GA',           description: 'Full multi-tenant isolation', quarter: '2026 Q3', status: 'in_progress', ownerId: 'r-nischay', businessImpact: 'high' },
  { id: 'rm-2', productId: 'p-doc',  name: 'Clause taxonomy expansion', description: '50 new clause types',         quarter: '2026 Q3', status: 'planned',     ownerId: 'r-arjun',   businessImpact: 'medium' },
  { id: 'rm-3', productId: 'p-doc',  name: 'OCR pipeline upgrade',      description: 'Layout-aware OCR',            quarter: '2026 Q4', status: 'planned',     ownerId: 'r-nischay', businessImpact: 'medium' },
  { id: 'rm-4', productId: 'p-price',name: 'Real-time alerts',          description: 'Push alerts for price moves', quarter: '2026 Q3', status: 'planned',     ownerId: 'r-subrato', businessImpact: 'high' },
  { id: 'rm-5', productId: 'p-wb',   name: 'Tool registry',             description: 'Universal tool catalog',      quarter: '2026 Q3', status: 'planned',     ownerId: 'r-rahul',   businessImpact: 'high' },
  { id: 'rm-6', productId: 'p-wb',   name: 'Governance console',        description: 'Approvals + audit',           quarter: '2026 Q4', status: 'planned',     ownerId: 'r-nischay', businessImpact: 'high' },
  { id: 'rm-7', productId: 'p-ctrl', name: 'Exception SLA engine',      description: 'SLA-aware exception routing', quarter: '2026 Q3', status: 'in_progress', ownerId: 'r-dushyant',businessImpact: 'high' },
];

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
export const dependencies: Dependency[] = [
  { id: 'dp-1',  fromId: 't-5', fromType: 'task', toId: 't-4',  toType: 'task',    kind: 'depends_on', notes: 'SSO needs isolation review' },
  { id: 'dp-2',  fromId: 't-9', fromType: 'task', toId: 't-1',  toType: 'task',    kind: 'depends_on', notes: 'Need accuracy data before readout' },
  { id: 'dp-3',  fromId: 't-13',fromType: 'task', toId: 't-1',  toType: 'task',    kind: 'depends_on' },
  { id: 'dp-4',  fromId: 't-14',fromType: 'task', toId: 't-3',  toType: 'task',    kind: 'depends_on' },
  { id: 'dp-5',  fromId: 't-8', fromType: 'task', toId: 't-2',  toType: 'task',    kind: 'depends_on' },
  { id: 'dp-6',  fromId: 't-19',fromType: 'task', toId: 't-14', toType: 'task',    kind: 'depends_on' },
  { id: 'dp-7',  fromId: 't-25',fromType: 'task', toId: 't-11', toType: 'task',    kind: 'depends_on' },
  { id: 'dp-8',  fromId: 'p-doc',fromType: 'product', toId: 'p-ctrl', toType: 'product', kind: 'overlaps',  notes: 'Document processing duplication' },
  { id: 'dp-9',  fromId: 'p-wb', fromType: 'product', toId: 'p-conn', toType: 'product', kind: 'overlaps',  notes: 'Tool registry duplication' },
  { id: 'dp-10', fromId: 't-7', fromType: 'task', toId: 'cap-semantic', toType: 'capability', kind: 'depends_on', notes: 'Orchestration needs semantic layer' },
];

// -----------------------------------------------------------------------------
// Open questions
// -----------------------------------------------------------------------------
export const openQuestions: OpenQuestion[] = [
  { id: 'q-1', question: 'Should Documantra and Control Tower share a single document processing service?', context: 'Both products extract from same docs.', raisedBy: 'r-nischay', raisedAt: daysAgo(3), status: 'open',    productId: 'p-doc' },
  { id: 'q-2', question: 'Do we charge separately for OCI co-sell engagements or bundle with platform?',    context: 'Oracle motion strategy.',                raisedBy: 'r-viral',   raisedAt: daysAgo(5), status: 'open' },
  { id: 'q-3', question: 'What is the success metric for Dexcom Ariv POC?',                                  context: 'Need to define before SOW.',              raisedBy: 'r-shubhy',  raisedAt: daysAgo(1), status: 'open' },
];

// -----------------------------------------------------------------------------
// Leadership updates
// -----------------------------------------------------------------------------
export const leadershipUpdates: LeadershipUpdate[] = [
  {
    id: 'lu-1',
    weekOf: daysAgo(0),
    authorId: 'r-viral',
    highlights: [
      'Albertsons MSA in final negotiation — close target this week ($1.4M)',
      'Roku Documantra POC accuracy improving — 78% → targeting 85% by Friday',
      'GE Vernova architecture workshop confirmed — $2.1M opportunity',
      'KEMET Optrix pilot kicked off — on track',
    ],
    risks: [
      'Nischay overallocated across 3 priorities — mitigation in progress',
      'Subrato resource conflict between Bloom and Albertsons',
      'Campaign Planning blocked on forecasting decision',
    ],
    asks: [
      'Approve hiring of Sr. AI Engineer for Workbench team',
      'Executive intro to GE Vernova CDO',
    ],
    metrics: { active_opps: 15, pipeline_value: 9_220_000, active_projects: 12, overallocated_resources: 2 },
    productIds: ['p-doc','p-price','p-wb'],
    status: 'draft',
  },
];

// -----------------------------------------------------------------------------
// Helper accessors (mock query layer)
// -----------------------------------------------------------------------------
export const byId = <T extends { id: ID }>(arr: T[], id: ID | undefined) =>
  id ? arr.find(x => x.id === id) : undefined;

export const resourceById = (id: ID | undefined) => byId(resources, id);
export const clientById = (id: ID | undefined) => byId(clients, id);
export const productById = (id: ID | undefined) => byId(products, id);
export const projectById = (id: ID | undefined) => byId(projects, id);
export const opportunityById = (id: ID | undefined) => byId(opportunities, id);
export const locationById = (id: ID | undefined) => byId(locations, id);
export const capabilityById = (id: ID | undefined) => byId(capabilities, id);
