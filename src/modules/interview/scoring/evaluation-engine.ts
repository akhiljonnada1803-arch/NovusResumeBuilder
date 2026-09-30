import { Resume } from "@/types/resume";
import {
  InterviewQuestion,
  InterviewCategory,
  AnswerEvaluation,
  InterviewReadinessReport,
} from "../types";
import { IS_VALID_API_KEY, getGeminiModel } from "@/lib/gemini/client";

/**
 * Generates tailored interview questions based on candidate's real resume.
 */
export async function generateInterviewQuestions(
  resume: Resume,
  targetRole?: string
): Promise<InterviewQuestion[]> {
  const role = targetRole || resume.personalInfo?.jobTitle || "Software Engineer";
  const candidateExperience = (resume.experience || [])
    .map((e) => `${e.position} at ${e.company}: ${e.description} ${(e.highlights || []).join(" ")}`)
    .join("\n");
  const candidateProjects = (resume.projects || [])
    .map((p) => `${p.title}: ${p.description} (Tech: ${(p.technologies || []).join(", ")})`)
    .join("\n");
  const candidateSkills = (resume.skills || []).map((s) => s.name).join(", ");

  const prompt = `
You are a Principal Bar Raiser and Technical Interview Director at a top-tier tech firm (Google, Meta, Stripe, Netflix, Amazon).
Analyze this candidate's resume and generate 18-24 high-caliber, tailored interview questions for a ${role} position.

Resume Context:
- Skills: ${candidateSkills || "TypeScript, React, Node.js, Distributed Systems, Python, SQL"}
- Experience:
${candidateExperience || "Full stack engineering experience."}
- Projects:
${candidateProjects || "Built web applications."}

Categories to cover (generate 3-4 questions per category):
1. "technical": Architecture, database trade-offs, language internals, concurrency, memory/caching.
2. "system-design": High-scale distributed systems, reliability, p99 latency, partition tolerance, load balancing.
3. "project": Deep dive into candidate's specific resume projects and implementation details.
4. "behavioral": STAR method (Situation, Task, Action, Result) covering conflict, ownership, ambiguity, deadlines.
5. "leadership": Technical mentoring, architectural vision, engineering standards, cross-functional collaboration.
6. "hr": Cultural fit, motivation, career trajectory.

Return ONLY a valid JSON array of objects matching this exact schema:
[
  {
    "id": "q-1",
    "category": "technical",
    "question": "string",
    "intent": "Interviewer evaluation criteria",
    "suggestedPoints": ["point 1", "point 2", "point 3"],
    "difficulty": "Senior",
    "companyTags": ["Google", "Meta"],
    "commonPitfalls": ["Pitfall 1 to avoid", "Pitfall 2 to avoid"],
    "modelAnswer": "Comprehensive exemplar STAR or architectural answer outline explaining technical choices and trade-offs.",
    "estimatedTime": "3-5 mins"
  }
]
`;

  if (IS_VALID_API_KEY) {
    try {
      const model = getGeminiModel(0.2);

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          id: `q-${idx + 1}-${Date.now()}`,
          category: (q.category || "technical") as InterviewCategory,
          question: q.question,
          intent: q.intent || "Evaluating domain competence and technical rigor.",
          suggestedPoints: Array.isArray(q.suggestedPoints) ? q.suggestedPoints : [],
          difficulty: q.difficulty || "Senior",
          companyTags: Array.isArray(q.companyTags) && q.companyTags.length > 0 ? q.companyTags : ["FAANG", "Tier-1"],
          commonPitfalls: Array.isArray(q.commonPitfalls) ? q.commonPitfalls : ["Failing to articulate trade-offs."],
          modelAnswer: q.modelAnswer || "Structure response using Situation-Task-Action-Result with quantified performance outcomes.",
          estimatedTime: q.estimatedTime || "3-5 mins",
        }));
      }
    } catch {
      // Gracefully fall through to tailored domain questions
    }
  }

  const primaryProject = resume.projects?.[0]?.title || "recent core system";
  const secondaryProject = resume.projects?.[1]?.title || "data pipeline & API service";

  // Grounded comprehensive curated questions library (24 questions across 6 categories)
  return [
    // 1. Technical & Architecture
    {
      id: "q-1-tech",
      category: "technical",
      question: "How do you approach architecting distributed services to ensure sub-100ms p99 latency under heavy concurrent write loads?",
      intent: "Evaluate system design depth, caching strategies, and database indexing.",
      suggestedPoints: ["Read/Write replicas & CQRS", "Redis caching layers with TTL jitter", "Asynchronous message queues (Kafka/RabbitMQ)"],
      difficulty: "Senior",
      companyTags: ["Meta", "Stripe", "Uber"],
      commonPitfalls: ["Suggesting synchronous DB writes on high traffic paths", "Ignoring database connection pool limits"],
      modelAnswer: "In high-write environments, decouple writes using an append-only event stream (Kafka) with worker consumers, employ write-through Redis caching with jittered TTL to avoid stampedes, and partition PostgreSQL tables by tenant or date.",
      estimatedTime: "4-6 mins",
    },
    {
      id: "q-2-tech",
      category: "technical",
      question: "How do you diagnose and resolve a severe memory leak or event loop lag in a production Node.js/TypeScript backend?",
      intent: "Assess debugging methodology, profiling tooling, and V8 runtime understanding.",
      suggestedPoints: ["Heap snapshots using Chrome DevTools/Clinic.js", "Unbounded closures & global event listeners", "Analyzing active handles & CPU flamegraphs"],
      difficulty: "Senior",
      companyTags: ["Netflix", "Stripe", "Datadog"],
      commonPitfalls: ["Restarting pods repeatedly without taking heap diffs", "Confusing CPU saturation with memory leaks"],
      modelAnswer: "Capture baseline and leak heap snapshots using V8 heap profiler, calculate allocation diffs to identify retained objects (often uncleaned cache maps or detached event listeners), and inspect GC pause timings with Clinic.js.",
      estimatedTime: "3-5 mins",
    },
    {
      id: "q-3-tech",
      category: "technical",
      question: "Compare optimistic vs pessimistic concurrency control. When would you choose distributed locks (Redlock) over database-level row locks?",
      intent: "Probe transactional consistency, locking granularity, and distributed race conditions.",
      suggestedPoints: ["Optimistic version columns vs SELECT FOR UPDATE", "Clock drift risks with Redis Redlock", "Deadlock detection & transaction isolation levels"],
      difficulty: "Staff",
      companyTags: ["Amazon", "Uber", "Coinbase"],
      commonPitfalls: ["Claiming Redlock is 100% safe without accounting for GC pauses and clock skew", "Using pessimistic locking on high-concurrency read paths"],
      modelAnswer: "Use optimistic locking (version column) for low-conflict paths to maximize throughput. Use database row locking (SELECT FOR UPDATE) for strict financial consistency within a single database. Use distributed locks (e.g. Redis Redlock with fencing tokens) only when coordinating external third-party non-transactional resources.",
      estimatedTime: "4-5 mins",
    },
    {
      id: "q-4-tech",
      category: "technical",
      question: "How do database B-Tree indexes work under the hood, and how do you optimize a multi-column composite index for range and equality queries?",
      intent: "Validate deep database internals, query execution plans, and index selectivity.",
      suggestedPoints: ["Left-prefix rule on composite indexes", "EXPLAIN ANALYZE execution plans & Index Scans vs Seq Scans", "Placing equality columns before range columns"],
      difficulty: "Senior",
      companyTags: ["Google", "Meta", "Palantir"],
      commonPitfalls: ["Creating indexes on every column without considering write amplification", "Misunderstanding composite index ordering"],
      modelAnswer: "Order composite index columns starting with the highest cardinality equality filters, followed by range filters, following the left-prefix rule to allow the B-Tree search to prune irrelevant leaf pages without full index scans.",
      estimatedTime: "3-4 mins",
    },

    // 2. System Design
    {
      id: "q-5-sysdesign",
      category: "system-design",
      question: "Design a globally distributed rate limiter that can handle 500,000 requests/second with minimal cross-region latency.",
      intent: "Assess distributed state management, token bucket vs sliding window algorithms, and CAP theorem trade-offs.",
      suggestedPoints: ["Sliding window counter vs Token bucket algorithm", "Local edge rate limiting (Cloudflare/Fastly)", "Redis clusters with batch sync"],
      difficulty: "Staff",
      companyTags: ["Google", "Cloudflare", "Netflix"],
      commonPitfalls: ["Relying on a single global Redis cluster with high cross-region latency", "Failing to handle clock skew across nodes"],
      modelAnswer: "Employ a hybrid hierarchical rate limiter: enforce coarse limits at the edge via CDN/proxy using local memory sliding windows, synchronize aggregated metrics asynchronously to regional Redis clusters via Redis Cell or Lua scripts.",
      estimatedTime: "5-7 mins",
    },
    {
      id: "q-6-sysdesign",
      category: "system-design",
      question: "Design a real-time notification service delivering instant push, email, and in-app alerts to 10 million active users.",
      intent: "Evaluate WebSocket connection management, fan-out architectures, and idempotency.",
      suggestedPoints: ["WebSocket gateway with Redis Pub/Sub", "User notification preferences & rate capping", "Dead-letter queues and idempotent message keys"],
      difficulty: "Senior",
      companyTags: ["Slack", "Twitter", "Meta"],
      commonPitfalls: ["Broadcasting to all WebSocket nodes synchronously", "Not handling disconnected clients or duplicate delivery"],
      modelAnswer: "Use a gateway layer with persistent WebSocket connections backed by Redis Pub/Sub channels per user ID. Ingest notification events into Kafka, process user routing and rate limits via worker pools, and deduplicate with Redis TTL idempotency keys.",
      estimatedTime: "5-6 mins",
    },
    {
      id: "q-7-sysdesign",
      category: "system-design",
      question: "Design a URL shortening service (like Bitly) supporting 100,000 writes/sec and 1,000,000 reads/sec with custom vanity aliases.",
      intent: "Probe Base62 encoding, unique ID generation (Snowflake), and high-throughput read caching.",
      suggestedPoints: ["Base62 encoding of 64-bit distributed IDs", "Cache-aside with Redis (99% read cache hit ratio)", "Database sharding by short_hash key"],
      difficulty: "Mid",
      companyTags: ["Amazon", "Microsoft", "Salesforce"],
      commonPitfalls: ["Generating random strings and doing DB lookups on collision", "Ignoring 10:1 read-to-write ratio"],
      modelAnswer: "Generate 64-bit unique IDs using a distributed Snowflake generator, encode to Base62 (e.g. 7 characters). Cache mappings in Redis with LRU eviction for the top 20% URLs, and persist in a sharded NoSQL (DynamoDB) or partitioned PostgreSQL cluster.",
      estimatedTime: "4-5 mins",
    },
    {
      id: "q-8-sysdesign",
      category: "system-design",
      question: "How would you design a distributed cache invalidation system to prevent cache stampedes and stale reads across multi-region deployments?",
      intent: "Assess cache-aside vs write-through, TTL jitter, probabilistic early expiration, and CDC replication.",
      suggestedPoints: ["XFetch / probabilistic early expiration", "Mutex / single-flight lock on cache misses", "Change Data Capture (Debezium) for async invalidation"],
      difficulty: "Staff",
      companyTags: ["Meta", "Netflix", "Amazon"],
      commonPitfalls: ["Invalidating all keys simultaneously causing a thundering herd on the database", "Ignoring network partition boundaries"],
      modelAnswer: "Combine single-flight request coalescing (only one backend query per key on cache miss) with randomized TTL jitter (e.g. 300s +/- 30s) and Change Data Capture from database write-ahead logs to broadcast invalidations to all regional cache clusters.",
      estimatedTime: "5-6 mins",
    },

    // 3. Project Deep Dive
    {
      id: "q-9-project",
      category: "project",
      question: `Walk me through the architecture of your featured project (${primaryProject}). What was the most critical technical trade-off you made and how did it perform in production?`,
      intent: "Validate authentic hands-on project leadership, architectural discernment, and troubleshooting depth.",
      suggestedPoints: ["Clear architecture & component boundaries", "Specific technical trade-off evaluated", "Quantified latency, throughput, or cost outcome"],
      difficulty: "Senior",
      companyTags: ["Stripe", "Amazon", "YC Startup"],
      commonPitfalls: ["Focusing only on UI features without discussing backend constraints", "Not knowing the production bottlenecks"],
      modelAnswer: `When building ${primaryProject}, we evaluated synchronous REST vs asynchronous event streaming for state updates. We opted for an event-driven model using Kafka, which decoupled consumers and reduced peak p95 latency from 450ms to 42ms.`,
      estimatedTime: "4-5 mins",
    },
    {
      id: "q-10-project",
      category: "project",
      question: `In your work on (${secondaryProject}), walk me through the most severe production incident or outage you diagnosed. What was the root cause and how did you prevent recurrence?`,
      intent: "Assess incident management, post-mortem rigor, telemetry analysis, and systemic engineering safeguards.",
      suggestedPoints: ["MTTD and MTTR timeline", "Root cause analysis (5 Whys)", "Preventative safeguards: circuit breakers, alerts, and canary tests"],
      difficulty: "Senior",
      companyTags: ["Google", "Datadog", "PagerDuty"],
      commonPitfalls: ["Blaming a third-party vendor without discussing internal resilience", "Vague remediation steps"],
      modelAnswer: "Situation: A third-party webhook failure triggered retry storms that exhausted our DB connection pool. Task: Restore service and eliminate cascading failure. Action: Implemented exponential backoff with jitter and a Redis-backed circuit breaker. Result: Zero connection pool exhaustions in subsequent partner outages.",
      estimatedTime: "4-5 mins",
    },
    {
      id: "q-11-project",
      category: "project",
      question: `How did you architect the automated CI/CD and deployment pipeline for (${primaryProject}) to ensure zero-downtime releases and rapid rollbacks?`,
      intent: "Evaluate DevOps maturity, blue/green or canary deployment strategies, and automated regression testing.",
      suggestedPoints: ["Canary analysis with automated metric thresholds", "Database backward-compatible schema migrations (Expand-Contract)", "Fast automated rollback triggers"],
      difficulty: "Senior",
      companyTags: ["GitHub", "Vercel", "GitLab"],
      commonPitfalls: ["Running breaking database migrations simultaneously with application code", "No automated rollback criteria"],
      modelAnswer: "We enforced the Expand/Contract migration pattern where new database columns are added first, dual-written by old and new versions, followed by a 10% canary traffic rollout validated against error budget SLAs before full cutover.",
      estimatedTime: "3-4 mins",
    },
    {
      id: "q-12-project",
      category: "project",
      question: `What was the most challenging legacy refactoring or migration you executed on (${primaryProject})? How did you ensure feature parity without breaking existing users?`,
      intent: "Assess risk mitigation during codebase modernization, shadow traffic testing, and strangler fig pattern.",
      suggestedPoints: ["Strangler Fig migration pattern", "Dark launching and shadow traffic diffing", "Feature flag safety toggles"],
      difficulty: "Staff",
      companyTags: ["Stripe", "Shopify", "Airbnb"],
      commonPitfalls: ["Advocating for a full rewrite from scratch without incremental milestones", "No regression test coverage"],
      modelAnswer: "We migrated legacy monolithic endpoints using the Strangler Fig pattern with shadow traffic comparison: duplicated incoming production traffic to both new and old services, logged payload diffs until reaching 99.999% parity, and flipped traffic via feature flags.",
      estimatedTime: "4-5 mins",
    },

    // 4. Behavioral & STAR
    {
      id: "q-13-behavioral",
      category: "behavioral",
      question: "Tell me about a time when you strongly disagreed with a technical or product decision made by a team lead or architect. How did you handle the situation?",
      intent: "Assess constructive disagreement, empathy, and commitment to team execution (Disagree and Commit).",
      suggestedPoints: ["Data-driven constructive debate", "Active listening & empathy for product constraints", "Disagree and commit mindset once a decision was finalized"],
      difficulty: "Senior",
      companyTags: ["Amazon", "Google", "Apple"],
      commonPitfalls: ["Sounding defensive or resentful", "Giving an example where you did not support the team after the decision"],
      modelAnswer: "Situation: Our lead proposed migrating to a document database for relational user transactional data. Task: I needed to present relational integrity risks constructively. Action: I benchmarked foreign-key consistency and presented a 2-page RFC showing migration trade-offs. Result: The team adopted PostgreSQL with JSONB columns as the optimal middle ground.",
      estimatedTime: "3-4 mins",
    },
    {
      id: "q-14-behavioral",
      category: "behavioral",
      question: "Describe a project where you were faced with highly ambiguous requirements and a looming deadline. How did you define scope and deliver?",
      intent: "Evaluate autonomous initiative, stakeholder communication, and iterative de-risking.",
      suggestedPoints: ["Breaking ambiguity into falsifiable assumptions", "Building a lightweight MVP/tracer bullet", "Aligning product stakeholders on explicit phase milestones"],
      difficulty: "Senior",
      companyTags: ["Meta", "Uber", "YC Startups"],
      commonPitfalls: ["Waiting for perfect requirements before starting", "Over-engineering before confirming product direction"],
      modelAnswer: "Situation: Stakeholders requested an analytics engine without defined schema metrics 4 weeks before launch. Task: Establish technical scope autonomously. Action: Conducted 3 user interviews, drafted a 1-page metric spec, built a modular event ingestion prototype in week 1, and validated with key customers. Result: Shipped phase 1 on time with 94% adoption.",
      estimatedTime: "3-4 mins",
    },
    {
      id: "q-15-behavioral",
      category: "behavioral",
      question: "Tell me about a time you failed to deliver a key commitment or caused a major bug in production. How did you handle the aftermath?",
      intent: "Assess personal ownership, psychological safety, transparent communication, and blameless learning.",
      suggestedPoints: ["Immediate transparent escalation without finger-pointing", "Rapid mitigation and customer communication", "Publishing a blameless post-mortem with automated safeguards"],
      difficulty: "Senior",
      companyTags: ["Netflix", "Stripe", "Amazon"],
      commonPitfalls: ["Hiding the mistake or blaming junior engineers/external tools", "Not establishing systemic safeguards"],
      modelAnswer: "Situation: A migration script I wrote locked a high-traffic table for 8 minutes during peak hours. Task: Take ownership and restore operations immediately. Action: Escalated directly in the incident channel, rolled back the lock, conducted a blameless post-mortem, and implemented mandatory migration dry-run checks in CI. Result: Established team-wide zero-lock migration standard.",
      estimatedTime: "3-4 mins",
    },
    {
      id: "q-16-behavioral",
      category: "behavioral",
      question: "Give an example of a time you advocated for paying down technical debt when product managers wanted new features. How did you persuade leadership?",
      intent: "Assess business communication, engineering ROI calculation, and alignment with business goals.",
      suggestedPoints: ["Translating code quality into business velocity & downtime risk", "Proposing an incremental 20% debt budget", "Demonstrating post-refactor velocity gains"],
      difficulty: "Lead",
      companyTags: ["Atlassian", "Shopify", "Spotify"],
      commonPitfalls: ["Arguing solely for 'clean code' aesthetics without business metrics", "Adversarial attitude toward product managers"],
      modelAnswer: "Situation: Legacy authentication code caused 30% of sprint bugs and delayed new payments features. Task: Secure 2 sprints of refactoring capacity. Action: Analyzed incident history to show technical debt cost 18 engineering days per quarter, and proposed a staged refactor alongside payment feature flags. Result: Leadership approved; bug reports dropped by 65%.",
      estimatedTime: "3-5 mins",
    },

    // 5. Leadership & Impact
    {
      id: "q-17-leadership",
      category: "leadership",
      question: "How do you balance shipping fast for business deadlines against paying down technical debt and maintaining high code quality?",
      intent: "Evaluate engineering maturity, pragmatic trade-offs, and technical leadership.",
      suggestedPoints: ["Explicit technical debt tracking", "20% sprint allocation for refactoring", "Identifying business-critical vs non-critical failure zones"],
      difficulty: "Lead",
      companyTags: ["Netflix", "Meta", "Stripe"],
      commonPitfalls: ["Demanding 100% perfection without business context", "Ignoring tech debt until production breaks"],
      modelAnswer: "Technical debt is a financial leverage tool: borrow deliberately to test market fit, but track it transparently in the backlog with clear interest costs. We allocate 15-20% of sprint capacity to debt remediation and enforce strict zero-debt tolerance on auth and payments.",
      estimatedTime: "3-5 mins",
    },
    {
      id: "q-18-leadership",
      category: "leadership",
      question: "How do you conduct code reviews to foster both high engineering rigor and a supportive, psychologically safe team culture?",
      intent: "Probe code review standards, constructive feedback delivery, and knowledge sharing.",
      suggestedPoints: ["Differentiating 'nitpick' vs 'blocking architecture issue'", "Automating formatting/linting in CI to keep PRs focused on design", "Explaining the 'Why' with documentation links"],
      difficulty: "Senior",
      companyTags: ["Google", "GitHub", "Microsoft"],
      commonPitfalls: ["Using harsh, dismissive language", "Reviewing formatting manually instead of automating via linters"],
      modelAnswer: "Automate syntax and linting in CI so human reviews focus on architecture, race conditions, and API ergonomics. Prefix non-critical suggestions with '[nit]' or '[optional]', explain the underlying rationale with benchmark links, and praise elegant solutions publicly.",
      estimatedTime: "3-4 mins",
    },
    {
      id: "q-19-leadership",
      category: "leadership",
      question: "Tell me about a time you mentored a junior or mid-level engineer who was struggling with complex architectural concepts or delivery. What approach did you take?",
      intent: "Assess pedagogical empathy, delegation, active mentoring, and engineering talent development.",
      suggestedPoints: ["Pair programming on thorny problems", "Incremental ownership growth (scaffolding)", "Celebrating incremental milestones"],
      difficulty: "Lead",
      companyTags: ["LinkedIn", "Apple", "Meta"],
      commonPitfalls: ["Doing the work for them instead of coaching", "Expressing frustration with their learning curve"],
      modelAnswer: "Situation: A junior engineer struggled with concurrency bugs in distributed async workers. Task: Accelerate their distributed systems intuition. Action: Established weekly pair programming sessions, walked through race condition debug logs together, and assigned them lead ownership of a smaller async queue refactor. Result: They successfully delivered the module with zero production defects and were promoted.",
      estimatedTime: "3-5 mins",
    },
    {
      id: "q-20-leadership",
      category: "leadership",
      question: "How do you establish and track Service Level Objectives (SLOs) and error budgets across your engineering services?",
      intent: "Assess SRE fundamentals, quantifiable reliability metrics, and alerting strategies.",
      suggestedPoints: ["SLI vs SLO vs SLA definitions", "Error budget burn rate alerting", "Halting feature releases when error budgets are depleted"],
      difficulty: "Staff",
      companyTags: ["Google", "Datadog", "Cloudflare"],
      commonPitfalls: ["Setting arbitrary 100% uptime targets", "Alerting on every transient spike without burn-rate thresholds"],
      modelAnswer: "Define SLIs grounded in user experience (e.g. 99.9% of HTTP requests return <200ms and HTTP 200). Calculate monthly error budgets (0.1% = 43 minutes allowable downtime), and alert based on multi-window burn rates to prioritize reliability engineering when budgets deplete.",
      estimatedTime: "4-5 mins",
    },

    // 6. HR & Cultural Alignment
    {
      id: "q-21-hr",
      category: "hr",
      question: `Why are you looking to advance your career as a ${role}, and what type of engineering culture brings out your highest impact?`,
      intent: "Assess self-awareness, authentic motivation, growth trajectory, and cultural alignment.",
      suggestedPoints: ["Alignment with modern high-velocity engineering", "High psychological safety & autonomous ownership", "Continuous technical curiosity"],
      difficulty: "Mid",
      companyTags: ["All Tech Companies"],
      commonPitfalls: ["Generic answers like 'I love coding'", "Speaking negatively about past employers"],
      modelAnswer: `I thrive in engineering cultures that combine high autonomous ownership with transparent technical debate. As a ${role}, I am focused on architecting resilient distributed systems and mentoring teammates to elevate engineering standards.`,
      estimatedTime: "2-3 mins",
    },
    {
      id: "q-22-hr",
      category: "hr",
      question: "Where do you see yourself evolving technically over the next 3 to 5 years as an engineering leader or specialist?",
      intent: "Assess career ambition, continuous learning mindset, and organizational trajectory.",
      suggestedPoints: ["Deepening distributed systems / AI systems mastery", "Driving cross-organizational architectural vision", "Mentoring the next generation of engineers"],
      difficulty: "Senior",
      companyTags: ["Google", "Meta", "Microsoft"],
      commonPitfalls: ["Having no clear vision or expecting passive promotion", "Focusing exclusively on titles instead of technical mastery"],
      modelAnswer: "Over the next 3-5 years, I aim to lead the architecture of mission-critical high-throughput platform systems, establish engineering standards across cross-functional teams, and contribute to open-source developer tooling that elevates industry best practices.",
      estimatedTime: "2-3 mins",
    },
    {
      id: "q-23-hr",
      category: "hr",
      question: "How do you manage personal workload, prioritize multiple incoming requests, and sustain high velocity without burning out?",
      intent: "Assess sustainable engineering practices, prioritization frameworks, and boundary setting.",
      suggestedPoints: ["Impact vs Effort matrix prioritization", "Time-blocking for deep focus work", "Proactive communication with managers on capacity trade-offs"],
      difficulty: "Mid",
      companyTags: ["Stripe", "Spotify", "Amazon"],
      commonPitfalls: ["Saying 'I just work 80 hours a week'", "Letting non-urgent interruptions derail sprint commitments"],
      modelAnswer: "I categorize work using an Impact vs Urgency framework, batch code reviews and meetings into dedicated blocks to protect 3-4 hours of uninterrupted deep work daily, and proactively align with leads on backlog trade-offs when new critical tasks arise.",
      estimatedTime: "2-3 mins",
    },
    {
      id: "q-24-hr",
      category: "hr",
      question: "What questions do you typically ask an engineering hiring manager to evaluate if a team has high engineering rigor and a healthy culture?",
      intent: "Assess reverse-interview discernment, candidate standards, and cultural selectivity.",
      suggestedPoints: ["Deployment frequency & CI/CD automation", "How the team handles on-call and post-mortems", "Autonomy in choosing technical tools and architectural direction"],
      difficulty: "Senior",
      companyTags: ["Top-Tier Tech", "Startups"],
      commonPitfalls: ["Having no questions prepared for the interviewer", "Only asking about compensation and perks"],
      modelAnswer: "I ask about deployment frequency and MTTR during outages, how on-call rotations are compensated and sustained, and what the last major technical disagreement was and how the team resolved it to ensure high psychological safety and rigor.",
      estimatedTime: "2-3 mins",
    },
  ];
}

/**
 * Evaluates candidate's response across dimensions with mandatory evidence anchoring.
 * If answer length < threshold or AI is offline, returns zero scores / "Insufficient interview data"
 * without fabricating fake praise or hallucinations.
 */
export async function evaluateCandidateAnswer(
  question: InterviewQuestion,
  candidateAnswer: string,
  resume: Resume
): Promise<AnswerEvaluation> {
  const cleanAnswer = (candidateAnswer || "").trim();
  const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;

  // 1. THRESHOLD RULE: If answer is too short (< 8 words), return "Insufficient interview data"
  if (wordCount < 8) {
    return {
      evaluationStatus: "insufficient-data",
      overallScore: 0,
      technicalAccuracy: 0,
      communication: 0,
      confidence: 0,
      completeness: 0,
      reason: "Answer was too brief (< 8 words) to extract technical claims or evaluate competence.",
      supportingTranscript: cleanAnswer ? `"${cleanAnswer}"` : "(No answer provided)",
      feedback: "Insufficient interview data: Please provide a substantive response explaining your reasoning and technical decisions.",
      strengths: [],
      improvements: [
        "Provide a complete spoken or written explanation addressing the question intent.",
        "Structure your response using the STAR format (Situation, Task, Action, Result).",
      ],
      modelAnswer: `When addressing ${question.question.toLowerCase().replace("?", "")}, I start by defining the technical requirements, trade-offs, and key metrics.`,
      evidenceList: [],
    };
  }

  // 2. AI Evidence-Based Evaluation
  if (IS_VALID_API_KEY) {
    try {
      const model = getGeminiModel(0.1);

      const prompt = `
You are a Principal Engineering Bar Raiser.
Evaluate this candidate's interview response with strict evidence-based rigor.

CRITICAL EVIDENCE RULES:
1. Every score MUST be derived from factual statements in the candidate's transcript.
2. If the candidate makes vague, hand-wavy, or inaccurate statements, score them accordingly (40-65).
3. EVERY score must include:
   - score (0-100)
   - reason (explanation of what was correct or missing)
   - supportingTranscript (verbatim quote from candidate)
4. DO NOT invent praise or strengths if not supported by the candidate's actual words.

Question:
"${question.question}"

Question Intent:
${question.intent}

Candidate's Answer:
"""
${cleanAnswer}
"""

Return valid JSON adhering strictly to this schema:
{
  "overallScore": number (0-100),
  "technicalAccuracy": number (0-100),
  "communication": number (0-100),
  "confidence": number (0-100),
  "completeness": number (0-100),
  "reason": "Detailed evidence-backed reason for this score",
  "supportingTranscript": "Exact verbatim quote from candidate answer",
  "feedback": "Concise 2-3 sentence recruiter critique",
  "strengths": ["Strength 1 citing exact candidate statement"],
  "improvements": ["Improvement 1 citing candidate omission or weak point"],
  "modelAnswer": "Exemplar model answer (150-200 words)",
  "evidenceList": [
    {
      "category": "Technical Accuracy",
      "score": number,
      "reason": "Reason for technical score",
      "supportingTranscript": "Exact candidate quote"
    },
    {
      "category": "Communication",
      "score": number,
      "reason": "Reason for communication score",
      "supportingTranscript": "Exact candidate quote"
    },
    {
      "category": "Completeness",
      "score": number,
      "reason": "Reason for completeness score",
      "supportingTranscript": "Exact candidate quote"
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());

      return {
        evaluationStatus: "completed",
        overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
        technicalAccuracy: Math.min(100, Math.max(0, parsed.technicalAccuracy || 0)),
        communication: Math.min(100, Math.max(0, parsed.communication || 0)),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        completeness: Math.min(100, Math.max(0, parsed.completeness || 0)),
        reason: parsed.reason || "Evaluated against question intent and technical correctness.",
        supportingTranscript: parsed.supportingTranscript || cleanAnswer.slice(0, 100),
        feedback: parsed.feedback || "Response evaluated against standard competency rubric.",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        modelAnswer: parsed.modelAnswer || "",
        evidenceList: Array.isArray(parsed.evidenceList) ? parsed.evidenceList : [],
      };
    } catch (err) {
      console.warn("AI answer evaluation failed:", err);
    }
  }

  // 3. AI Service Unavailable
  return {
    evaluationStatus: "ai-unavailable",
    overallScore: 0,
    technicalAccuracy: 0,
    communication: 0,
    confidence: 0,
    completeness: 0,
    reason: "AI evaluation service could not be reached to perform evidence-backed scoring.",
    supportingTranscript: cleanAnswer.slice(0, 80) + "...",
    feedback: "Evaluation unavailable: To maintain reporting integrity, no simulated or fabricated scores are assigned without live AI verification.",
    strengths: [],
    improvements: ["Configure a valid Google Gemini API key to enable live evidence-backed interview scoring."],
    modelAnswer: "",
    evidenceList: [],
  };
}

/**
 * Computes an overall Interview Readiness benchmark report from evaluated answers.
 */
export function calculateInterviewReadiness(
  evaluations: AnswerEvaluation[]
): InterviewReadinessReport {
  const completedEvaluations = evaluations.filter((e) => e.evaluationStatus === "completed" && e.overallScore > 0);

  if (completedEvaluations.length === 0) {
    return {
      overallReadiness: 0,
      readinessLevel: "Insufficient Data",
      totalQuestionsAnswered: 0,
      averageScores: {
        technicalAccuracy: 0,
        communication: 0,
        confidence: 0,
        completeness: 0,
      },
      evidenceList: [],
      topStrengths: [],
      priorityImprovements: [
        "Complete at least one full interview question with substantive technical details to calculate readiness.",
      ],
    };
  }

  const count = completedEvaluations.length;
  const avgTech = Math.round(completedEvaluations.reduce((acc, e) => acc + e.technicalAccuracy, 0) / count);
  const avgComm = Math.round(completedEvaluations.reduce((acc, e) => acc + e.communication, 0) / count);
  const avgConf = Math.round(completedEvaluations.reduce((acc, e) => acc + e.confidence, 0) / count);
  const avgComp = Math.round(completedEvaluations.reduce((acc, e) => acc + e.completeness, 0) / count);

  const overall = Math.round(
    avgTech * 0.35 + avgComm * 0.25 + avgConf * 0.2 + avgComp * 0.2
  );

  let readinessLevel: InterviewReadinessReport["readinessLevel"] = "Solid Candidate";
  if (overall >= 88) readinessLevel = "FAANG / Tier-1 Ready";
  else if (overall >= 75) readinessLevel = "Solid Candidate";
  else if (overall >= 60) readinessLevel = "Needs Moderate Preparation";
  else readinessLevel = "High Risk";

  const allStrengths = Array.from(new Set(completedEvaluations.flatMap((e) => e.strengths))).slice(0, 3);
  const allImprovements = Array.from(new Set(completedEvaluations.flatMap((e) => e.improvements))).slice(0, 3);
  const allEvidence = completedEvaluations.flatMap((e) => e.evidenceList || []);

  return {
    overallReadiness: overall,
    readinessLevel,
    totalQuestionsAnswered: count,
    averageScores: {
      technicalAccuracy: avgTech,
      communication: avgComm,
      confidence: avgConf,
      completeness: avgComp,
    },
    evidenceList: allEvidence,
    topStrengths: allStrengths,
    priorityImprovements: allImprovements,
  };
}
