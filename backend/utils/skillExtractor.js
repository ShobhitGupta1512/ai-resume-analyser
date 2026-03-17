/**
 * skillExtractor.js
 * Extracts skills from resume text across all major job fields.
 * Returns structured skills grouped by category.
 */

// ─── SKILL DATABASE ────────────────────────────────────────────────────────────

const SKILL_DATABASE = {

  // ── PROGRAMMING LANGUAGES ────────────────────────────────────────────────────
  programmingLanguages: {
    label: "Programming Languages",
    skills: [
      "javascript", "typescript", "python", "java", "c", "c++", "c#", "go", "golang",
      "rust", "swift", "kotlin", "ruby", "php", "scala", "r", "matlab", "perl",
      "haskell", "elixir", "erlang", "clojure", "f#", "dart", "lua", "groovy",
      "assembly", "cobol", "fortran", "julia", "solidity", "vba", "bash", "shell",
      "powershell", "objective-c", "abap",
    ],
  },

  // ── FRONTEND ─────────────────────────────────────────────────────────────────
  frontend: {
    label: "Frontend Development",
    skills: [
      "html", "css", "html5", "css3", "react", "react.js", "reactjs", "next.js",
      "nextjs", "vue", "vue.js", "vuejs", "angular", "svelte", "nuxt.js", "nuxtjs",
      "gatsby", "remix", "astro", "jquery", "bootstrap", "tailwind", "tailwindcss",
      "material ui", "material-ui", "mui", "chakra ui", "ant design", "antd",
      "shadcn", "styled components", "emotion", "sass", "scss", "less", "webpack",
      "vite", "parcel", "rollup", "babel", "eslint", "prettier", "storybook",
      "redux", "redux toolkit", "zustand", "recoil", "mobx", "jotai", "pinia",
      "react query", "tanstack query", "swr", "axios", "fetch api", "graphql client",
      "apollo client", "framer motion", "gsap", "three.js", "threejs", "d3.js", "d3",
      "chart.js", "recharts", "highcharts", "leaflet", "mapbox", "webgl",
      "progressive web apps", "pwa", "web components", "responsive design",
      "cross-browser compatibility", "accessibility", "wcag",
    ],
  },

  // ── BACKEND ──────────────────────────────────────────────────────────────────
  backend: {
    label: "Backend Development",
    skills: [
      "node.js", "nodejs", "express", "express.js", "expressjs", "fastify", "nest.js",
      "nestjs", "hapi", "koa", "django", "flask", "fastapi", "tornado", "bottle",
      "spring", "spring boot", "spring mvc", "hibernate", "struts", "micronaut",
      "quarkus", "laravel", "symfony", "codeigniter", "yii", "lumen", "slim",
      "ruby on rails", "rails", "sinatra", "gin", "fiber", "echo", "beego",
      "asp.net", "asp.net core", ".net", ".net core", "dotnet", "blazor",
      "phoenix", "ktor", "micronaut", "dropwizard", "play framework",
      "rest api", "restful api", "restful", "graphql", "grpc", "soap",
      "websockets", "webhooks", "oauth", "oauth2", "jwt", "api gateway",
      "microservices", "monolith", "serverless", "event-driven architecture",
    ],
  },

  // ── DATABASES ────────────────────────────────────────────────────────────────
  databases: {
    label: "Databases",
    skills: [
      "mysql", "postgresql", "postgres", "sqlite", "mariadb", "oracle", "oracle db",
      "sql server", "mssql", "mongodb", "mongoose", "dynamodb", "cassandra",
      "couchdb", "couchbase", "firestore", "firebase", "supabase", "planetscale",
      "redis", "memcached", "elasticsearch", "opensearch", "solr", "neo4j",
      "arangodb", "fauna", "cockroachdb", "tidb", "clickhouse", "snowflake",
      "bigquery", "redshift", "databricks", "hive", "hbase", "influxdb",
      "timescaledb", "prisma", "typeorm", "sequelize", "sqlalchemy", "knex",
      "drizzle", "sql", "nosql", "plsql", "t-sql",
    ],
  },

  // ── CLOUD & DEVOPS ───────────────────────────────────────────────────────────
  cloudDevOps: {
    label: "Cloud & DevOps",
    skills: [
      "aws", "amazon web services", "ec2", "s3", "lambda", "rds", "cloudfront",
      "ecs", "eks", "sqs", "sns", "api gateway", "cloudwatch", "iam", "route 53",
      "azure", "microsoft azure", "azure functions", "azure devops", "blob storage",
      "gcp", "google cloud", "google cloud platform", "cloud run", "cloud functions",
      "bigquery", "firebase", "vercel", "netlify", "heroku", "railway", "render",
      "digital ocean", "linode", "vultr", "docker", "kubernetes", "k8s",
      "docker compose", "helm", "terraform", "ansible", "puppet", "chef",
      "jenkins", "github actions", "gitlab ci", "circle ci", "travis ci",
      "ci/cd", "nginx", "apache", "caddy", "traefik", "istio", "prometheus",
      "grafana", "datadog", "new relic", "splunk", "elk stack", "elasticsearch",
      "logstash", "kibana", "linux", "unix", "bash scripting", "infrastructure as code",
      "iac", "pulumi", "vagrant", "packer",
    ],
  },

  // ── MOBILE DEVELOPMENT ───────────────────────────────────────────────────────
  mobileDevelopment: {
    label: "Mobile Development",
    skills: [
      "react native", "flutter", "dart", "swift", "swiftui", "objective-c",
      "kotlin", "android", "ios", "xcode", "android studio", "expo",
      "ionic", "cordova", "capacitor", "xamarin", "maui", ".net maui",
      "jetpack compose", "kotlin multiplatform", "kmp",
      "firebase", "push notifications", "apns", "fcm", "app store", "play store",
      "mobile ui/ux", "responsive design",
    ],
  },

  // ── AI / ML / DATA SCIENCE ───────────────────────────────────────────────────
  aiMlDataScience: {
    label: "AI / ML / Data Science",
    skills: [
      "machine learning", "deep learning", "neural networks", "artificial intelligence",
      "ai", "ml", "nlp", "natural language processing", "computer vision",
      "reinforcement learning", "supervised learning", "unsupervised learning",
      "generative ai", "llm", "large language models", "transformers",
      "tensorflow", "keras", "pytorch", "scikit-learn", "sklearn",
      "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
      "hugging face", "langchain", "llama", "openai api", "gpt", "bert",
      "stable diffusion", "opencv", "pillow", "pil", "streamlit", "gradio",
      "jupyter", "jupyter notebook", "google colab", "apache spark", "pyspark",
      "hadoop", "airflow", "mlflow", "kubeflow", "dvc", "weights & biases",
      "wandb", "feature engineering", "model deployment", "model serving",
      "data preprocessing", "data augmentation", "transfer learning",
      "object detection", "image segmentation", "sentiment analysis",
      "recommendation systems", "time series", "regression", "classification",
      "clustering", "dimensionality reduction", "pca", "cnn", "rnn", "lstm",
      "gans", "vae", "xgboost", "lightgbm", "catboost", "random forest",
    ],
  },

  // ── DATA ENGINEERING & ANALYTICS ─────────────────────────────────────────────
  dataEngineering: {
    label: "Data Engineering & Analytics",
    skills: [
      "sql", "etl", "data pipeline", "data warehouse", "data lake", "data lakehouse",
      "apache kafka", "kafka", "apache spark", "spark", "flink", "airflow",
      "dbt", "fivetran", "stitch", "talend", "informatica", "nifi",
      "snowflake", "bigquery", "redshift", "databricks", "azure synapse",
      "tableau", "power bi", "looker", "metabase", "superset", "qlik",
      "excel", "google sheets", "data visualization", "data modeling",
      "dimensional modeling", "star schema", "olap", "oltp",
    ],
  },

  // ── CYBERSECURITY ─────────────────────────────────────────────────────────────
  cybersecurity: {
    label: "Cybersecurity",
    skills: [
      "penetration testing", "ethical hacking", "vulnerability assessment",
      "network security", "application security", "appsec", "devsecops",
      "siem", "soc", "incident response", "threat modeling", "risk assessment",
      "owasp", "burp suite", "metasploit", "nmap", "wireshark", "kali linux",
      "nessus", "qualys", "snort", "suricata", "ids", "ips", "waf",
      "pki", "ssl/tls", "encryption", "cryptography", "iam", "zero trust",
      "sso", "mfa", "oauth", "saml", "openid connect", "gdpr", "hipaa",
      "pci dss", "iso 27001", "nist", "soc 2", "forensics", "malware analysis",
    ],
  },

  // ── TESTING & QA ─────────────────────────────────────────────────────────────
  testingQA: {
    label: "Testing & QA",
    skills: [
      "unit testing", "integration testing", "e2e testing", "end-to-end testing",
      "test automation", "manual testing", "regression testing", "performance testing",
      "load testing", "stress testing", "jest", "vitest", "mocha", "chai",
      "jasmine", "karma", "cypress", "playwright", "selenium", "puppeteer",
      "testcafe", "webdriverio", "appium", "detox", "junit", "testng",
      "pytest", "unittest", "rspec", "capybara", "k6", "jmeter", "gatling",
      "postman", "insomnia", "swagger", "tdd", "bdd", "cucumber", "gherkin",
      "sonarqube", "codecov", "code coverage",
    ],
  },

  // ── BLOCKCHAIN & WEB3 ─────────────────────────────────────────────────────────
  blockchain: {
    label: "Blockchain & Web3",
    skills: [
      "blockchain", "web3", "ethereum", "solidity", "smart contracts",
      "hardhat", "truffle", "foundry", "ethers.js", "web3.js",
      "defi", "nft", "erc20", "erc721", "ipfs", "polygon", "binance smart chain",
      "solana", "rust (solana)", "anchor", "near", "avalanche", "chainlink",
      "metamask", "walletconnect", "openzeppelin", "dao",
    ],
  },

  // ── GAME DEVELOPMENT ──────────────────────────────────────────────────────────
  gameDevelopment: {
    label: "Game Development",
    skills: [
      "unity", "unreal engine", "godot", "pygame", "phaser", "three.js",
      "babylonjs", "opengl", "vulkan", "directx", "shader programming",
      "hlsl", "glsl", "game design", "level design", "2d", "3d", "physics engines",
      "box2d", "bullet physics", "multiplayer networking", "game ai",
      "c++ (games)", "lua (games)", "blueprints", "ecs", "procedural generation",
    ],
  },

  // ── DESIGN & UX/UI ────────────────────────────────────────────────────────────
  designUX: {
    label: "Design & UX/UI",
    skills: [
      "figma", "adobe xd", "sketch", "invision", "zeplin", "marvel",
      "adobe photoshop", "photoshop", "adobe illustrator", "illustrator",
      "adobe after effects", "after effects", "adobe premiere", "premiere pro",
      "adobe indesign", "indesign", "canva", "procreate", "blender",
      "autodesk maya", "maya", "3ds max", "cinema 4d", "c4d",
      "ux research", "user research", "usability testing", "wireframing",
      "prototyping", "information architecture", "design systems",
      "ui design", "ux design", "product design", "visual design",
      "typography", "color theory", "brand identity", "motion design",
    ],
  },

  // ── PROJECT MANAGEMENT & AGILE ────────────────────────────────────────────────
  projectManagement: {
    label: "Project Management & Agile",
    skills: [
      "agile", "scrum", "kanban", "lean", "safe", "waterfall", "prince2",
      "pmp", "project management", "product management", "product roadmap",
      "sprint planning", "backlog grooming", "retrospectives", "jira",
      "confluence", "trello", "asana", "notion", "linear", "monday.com",
      "basecamp", "clickup", "ms project", "risk management",
      "stakeholder management", "change management", "okrs", "kpis",
    ],
  },

  // ── BUSINESS & FINANCE ────────────────────────────────────────────────────────
  businessFinance: {
    label: "Business & Finance",
    skills: [
      "financial analysis", "financial modeling", "valuation", "dcf",
      "accounting", "bookkeeping", "gaap", "ifrs", "auditing", "tax",
      "excel", "vba", "bloomberg terminal", "refinitiv", "capital iq",
      "investment banking", "equity research", "portfolio management",
      "risk management", "derivatives", "fixed income", "asset management",
      "private equity", "venture capital", "mergers & acquisitions", "m&a",
      "business analysis", "business intelligence", "market research",
      "competitive analysis", "strategy", "operations management",
      "supply chain", "procurement", "erp", "sap", "oracle financials",
      "quickbooks", "xero", "salesforce", "crm",
    ],
  },

  // ── MARKETING & GROWTH ────────────────────────────────────────────────────────
  marketing: {
    label: "Marketing & Growth",
    skills: [
      "seo", "sem", "ppc", "google ads", "facebook ads", "meta ads",
      "social media marketing", "content marketing", "email marketing",
      "marketing automation", "hubspot", "mailchimp", "klaviyo",
      "google analytics", "ga4", "mixpanel", "amplitude", "segment",
      "a/b testing", "conversion rate optimization", "cro", "growth hacking",
      "affiliate marketing", "influencer marketing", "brand strategy",
      "copywriting", "content strategy", "wordpress", "shopify",
      "e-commerce", "woocommerce", "funnel optimization", "ad creative",
      "market segmentation", "customer acquisition",
    ],
  },

  // ── HEALTHCARE & MEDICAL ──────────────────────────────────────────────────────
  healthcare: {
    label: "Healthcare & Medical",
    skills: [
      "ehr", "emr", "epic", "cerner", "meditech", "allscripts",
      "hl7", "fhir", "hipaa", "icd-10", "cpt coding", "medical billing",
      "clinical documentation", "nursing", "patient care", "diagnosis",
      "pharmacology", "medical imaging", "radiology", "pathology",
      "telemedicine", "health informatics", "public health", "epidemiology",
      "clinical trials", "gcp", "fda regulations", "medical devices",
      "bioinformatics", "genomics",
    ],
  },

  // ── LEGAL ─────────────────────────────────────────────────────────────────────
  legal: {
    label: "Legal",
    skills: [
      "contract law", "corporate law", "intellectual property", "patent law",
      "trademark", "copyright", "litigation", "legal research", "legal writing",
      "compliance", "regulatory affairs", "gdpr", "data privacy",
      "employment law", "labor law", "mergers & acquisitions", "due diligence",
      "westlaw", "lexisnexis", "legal drafting", "negotiation",
    ],
  },

  // ── EDUCATION & TRAINING ──────────────────────────────────────────────────────
  education: {
    label: "Education & Training",
    skills: [
      "curriculum development", "instructional design", "e-learning",
      "lms", "moodle", "canvas", "blackboard", "articulate storyline",
      "adobe captivate", "teaching", "mentoring", "coaching",
      "training & development", "assessment design", "classroom management",
      "stem education", "special education", "adult learning",
    ],
  },

  // ── SOFT SKILLS ───────────────────────────────────────────────────────────────
  softSkills: {
    label: "Soft Skills",
    skills: [
      "leadership", "communication", "teamwork", "problem solving",
      "critical thinking", "analytical thinking", "creativity", "adaptability",
      "time management", "attention to detail", "multitasking", "collaboration",
      "presentation skills", "public speaking", "negotiation", "conflict resolution",
      "decision making", "strategic thinking", "emotional intelligence",
      "client management", "cross-functional collaboration",
    ],
  },

  // ── LANGUAGES (SPOKEN) ────────────────────────────────────────────────────────
  spokenLanguages: {
    label: "Languages (Spoken)",
    skills: [
      "english", "hindi", "spanish", "french", "german", "chinese", "mandarin",
      "japanese", "arabic", "portuguese", "russian", "italian", "korean",
      "dutch", "swedish", "norwegian", "danish", "polish", "turkish",
      "hebrew", "urdu", "bengali", "tamil", "telugu", "marathi",
    ],
  },

  // ── TOOLS & PRODUCTIVITY ──────────────────────────────────────────────────────
  toolsProductivity: {
    label: "Tools & Productivity",
    skills: [
      "git", "github", "gitlab", "bitbucket", "vs code", "visual studio",
      "intellij", "pycharm", "eclipse", "vim", "neovim", "emacs",
      "postman", "insomnia", "slack", "microsoft teams", "zoom",
      "google workspace", "microsoft office", "word", "excel", "powerpoint",
      "outlook", "notion", "obsidian", "confluence", "sharepoint",
      "linux", "macos", "windows", "wsl",
    ],
  },
};

// ─── EXTRACTOR FUNCTION ────────────────────────────────────────────────────────

/**
 * Extracts skills from resume text and returns them grouped by category.
 *
 * @param {string} resumeText - cleaned resume text
 * @returns {{
 *   grouped: Record<string, { label: string, skills: string[] }>,
 *   all: string[],
 *   totalCount: number
 * }}
 */
export const extractSkills = (resumeText) => {
  if (!resumeText || typeof resumeText !== "string") {
    return { grouped: {}, all: [], totalCount: 0 };
  }

  const lowerText = resumeText.toLowerCase();
  const grouped = {};
  const allFound = new Set();

  for (const [categoryKey, category] of Object.entries(SKILL_DATABASE)) {
    const found = [];

    for (const skill of category.skills) {
      // Use word boundary matching for short skills to avoid false positives
      // e.g. "r" should not match inside "react"
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern =
        skill.length <= 3
          ? new RegExp(`(?<![a-z0-9])${escapedSkill}(?![a-z0-9])`, "i")
          : new RegExp(`(?<![a-z])${escapedSkill}(?![a-z])`, "i");

      if (pattern.test(lowerText)) {
        // Store in original casing (capitalize known acronyms)
        const displaySkill = formatSkillName(skill);
        if (!allFound.has(displaySkill)) {
          found.push(displaySkill);
          allFound.add(displaySkill);
        }
      }
    }

    if (found.length > 0) {
      grouped[categoryKey] = {
        label: category.label,
        skills: found,
      };
    }
  }

  return {
    grouped,
    all: [...allFound],
    totalCount: allFound.size,
  };
};

// ─── HELPER: Format skill display name ────────────────────────────────────────

const ACRONYMS = new Set([
  "html", "css", "sql", "api", "rest", "aws", "gcp", "ci/cd", "ux", "ui",
  "ai", "ml", "nlp", "cnn", "rnn", "lstm", "pca", "seo", "sem", "ppc",
  "crm", "erp", "sap", "jwt", "oauth", "pwa", "hl7", "ehr", "emr", "fhir",
  "ids", "ips", "waf", "iam", "sso", "mfa", "saml", "pki", "tdd", "bdd",
  "vba", "pmp", "okrs", "kpis", "dcf", "m&a", "lms", "wsl", "ssl/tls",
  "ios", "php", "c", "r", "go",
]);

const formatSkillName = (skill) => {
  const lower = skill.toLowerCase();
  if (ACRONYMS.has(lower)) return skill.toUpperCase();

  // Title case for multi-word skills
  return skill
    .split(" ")
    .map((word) => {
      if (ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// ─── EXPORT SKILL DATABASE (for external use / extending) ─────────────────────
export { SKILL_DATABASE };