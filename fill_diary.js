const { chromium } = require("playwright");
const readline = require("readline");

/*Commands to run this project, first initialize node in a new folder with
npm init -y
next install playwright library for automation
npm install playwright
Now install browser for the automation
npx playwright install
Now you can simply add in the array of data in the DATA below and then start this by
node fill_diary.js
*/
(async () => {
  // --- CONFIGURATION ---
  const DATA = [
    {
      date: "20 Feb 2025",
      work_summary:
        "REVIEW-0: Presented project proposal and backend architecture (FastAPI + LangChain + Chroma + Gemini). Discussed supported laws and RAG approach. Collected feedback: must add clear legal disclaimer, handle hallucinations, and log queries safely.",
      hours_worked: 4.0,
      learnings_outcomes:
        "Clarified that the system is an assistant and not a replacement for a lawyer; roadmap finalized.",
      blockers_risks:
        "Need strict prompt design to avoid giving wrong or over-confident legal conclusions.",
      skills_used: ["Presentation", "Project planning"],
      reference_links: "Review notes, updated README.md",
    },
    {
      date: "25 Feb 2025",
      work_summary:
        "Started ingestion notebook Constitution_Pdf_Injest_NyayMitra.ipynb — tested loading Constitution PDF with pymupdf, splitting text into chunks, and generating embeddings with Google Generative AI embeddings.",
      hours_worked: 3.0,
      learnings_outcomes:
        "Learned practical chunking strategies and embedding generation for long legal documents.",
      blockers_risks:
        "Memory usage can spike for very large PDFs; need batch-wise processing.",
      skills_used: ["Python", "PDF parsing"],
      reference_links:
        "src/Constitution_Pdf_Injest_NyayMitra.ipynb, LangChain embedding examples",
    },
    {
      date: "27 Feb 2025",
      work_summary:
        "Integrated ChromaDB as vector store; created local persistent collection for Constitution chunks and ran similarity search on few sample legal queries. Verified that retrieved context is relevant.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Confirmed ChromaDB works well for semantic search over legal text; tuned k to get enough context.",
      blockers_risks:
        "Need proper schema & naming for multiple acts to keep collections organised.",
      skills_used: ["Vector databases"],
      reference_links: "chains.py, ChromaDB docs",
    },
    {
      date: "04 Mar 2025",
      work_summary:
        "Implemented core RAG chain in chains.py using create_stuff_documents_chain, create_history_aware_retriever, and contextual prompts. Created function get_rag_chain() that wires LLM, retriever, and prompts together.",
      hours_worked: 3.5,
      learnings_outcomes:
        "Learned how to create history-aware retrievers so follow-up legal questions use chat context.",
      blockers_risks: "Wrong score_threshold may return irrelevant context.",
      skills_used: ["Python"],
      reference_links: "chains.py, LangChain RAG examples",
    },
    {
      date: "06 Mar 2025",
      work_summary:
        "Designed initial system and user prompts in prompts.py to ensure safe and accurate legal responses. Added behavior: quote sections where possible, state limitations, and avoid making final legal judgments.",
      hours_worked: 2.0,
      learnings_outcomes:
        'Understood importance of prompt engineering for legal domain and safely handling "no answer" cases.',
      blockers_risks:
        "Prompts must be updated whenever new laws or features are added.",
      skills_used: ["Prompt design"],
      reference_links:
        "prompts.py, Google Gemini legal best-practices references",
    },
    {
      date: "11 Mar 2025",
      work_summary:
        "Implemented NyayMitra class in main.py with attributes for LLM, embeddings, vector store, and Redis cache. Added constructor and basic method stubs for handling user queries and maintaining session history.",
      hours_worked: 3.0,
      learnings_outcomes:
        "Structured backend around a single orchestrator class to keep code modular and easier to test.",
      blockers_risks:
        "Need careful handling of concurrent user sessions and chat histories.",
      skills_used: ["Python", "Object-oriented design"],
      reference_links: "main.py",
    },
    {
      date: "18 Mar 2025",
      work_summary:
        "Implemented Redis-based caching via redis_cache.py to store previous responses and reduce repeated computation for identical legal queries. Added TTL and simple key structure.",
      hours_worked: 2.5,
      learnings_outcomes:
        "Caching significantly reduces response time for frequent questions.",
      blockers_risks:
        "Outdated cached responses if laws or embeddings change; need invalidation strategy.",
      skills_used: ["Redis", "Performance optimization"],
      reference_links: "redis_cache.py, Redis docs",
    },
    {
      date: "20 Mar 2025",
      work_summary:
        "Wired FastAPI endpoints in api.py: defined Pydantic request models, /legal-query endpoint, and basic error handling (HTTPException). Set up CORS middleware for frontend integration.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Learned best practices for building clean, typed APIs with FastAPI and Pydantic.",
      blockers_risks:
        "Must sanitize user input to avoid prompt injection or abuse.",
      skills_used: ["FastAPI", "API design"],
      reference_links: "api.py, FastAPI docs",
    },
    {
      date: "25 Mar 2025",
      work_summary:
        "Tested end-to-end backend flow with dummy input via cURL/Postman — user query → embeddings → Chroma search → RAG chain → LLM answer. Logged intermediate steps for debugging.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Validated that combined RAG chain gives context-backed legal answers instead of pure generative hallucinations.",
      blockers_risks:
        "Need to handle long questions and multi-part queries in future.",
      skills_used: ["Debugging", "API testing"],
      reference_links: "api.py test logs",
    },
    {
      date: "01 Apr 2025",
      work_summary:
        'Enhanced RAG prompts to separate "contextualization" prompt (rephrasing user query) and "answering" prompt. Used MessagesPlaceholder("chat_history") so chain remembers earlier questions.',
      hours_worked: 4.0,
      learnings_outcomes:
        'History-aware RAG makes follow-up legal questions more natural ("what about appeal?" etc.).',
      blockers_risks:
        "Very long chat history may slow down responses and increase token usage.",
      skills_used: ["Python", "Prompt design"],
      reference_links: "chains.py, prompts.py",
    },
    {
      date: "08 Apr 2025",
      work_summary:
        "REVIEW-1: Demoed working backend — user legal queries answered using Constitution + Acts context, with clear disclaimers. Feedback: add domain list of laws, log sources used, and rate-limit requests.",
      hours_worked: 4.0,
      learnings_outcomes:
        "Importance of transparency (showing which law sections used) and safeguards against API misuse.",
      blockers_risks: "Need request throttling and proper logging strategy.",
      skills_used: ["Presentation", "Documentation"],
      reference_links: "review minutes, config/prompts.yaml",
    },
    {
      date: "15 Apr 2025",
      work_summary:
        "Implemented structured logging of queries and retrieved document metadata; added log messages in main.py and api.py for request ID, law source, and latency.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Logs help in debugging and also for future analytics on which laws are most frequently used.",
      blockers_risks:
        "Must avoid logging sensitive user details; privacy concerns.",
      skills_used: ["Logging"],
      reference_links: "logging configuration in main.py",
    },
    {
      date: "22 Apr 2025",
      work_summary:
        "Started frontend work: created React+Vite project (client), cleaned template, and set up basic routing. Added .env.example for frontend API base URL.",
      hours_worked: 2.5,
      learnings_outcomes:
        "Understood Vite-based React setup and how to configure dev/production API endpoints.",
      blockers_risks:
        "Need consistent CORS and base URL configuration between client and server.",
      skills_used: ["React", "Vite"],
      reference_links: "client/package.json, client/vite.config.js",
    },
    {
      date: "24 Apr 2025",
      work_summary:
        "Implemented reusable UI components (Button, Card, Avatar) using shadcn UI in src/components/ui. Set up Tailwind and base styling in index.css.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Component-driven design makes it easier to maintain uniform UI across pages.",
      blockers_risks:
        "Need to keep design consistent when new pages are added.",
      skills_used: ["React", "Tailwind"],
      reference_links: "src/components/ui/*.jsx",
    },
    {
      date: "29 Apr 2025",
      work_summary:
        'Built initial landing page with hero section (Nyay Mitra branding, taglines) and sections explaining "Case Identification", "Guided Legal Steps", and other features using images from public/.',
      hours_worked: 2.0,
      learnings_outcomes:
        "Learned to convey technical features in simple legal-friendly language on the UI.",
      blockers_risks: "Need mobile responsiveness testing.",
      skills_used: ["React", "Frontend"],
      reference_links:
        "src/components/Navbar.jsx, src/components/Model.jsx, public/*.png",
    },
    {
      date: "06 May 2025",
      work_summary:
        "Created chat-style interface for legal queries — input box, send button, and message list layout. Added state management for user messages and assistant replies.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Simple chat UI pattern works well for legal Q&A flows.",
      blockers_risks: "Need to support long answers and scroll handling.",
      skills_used: ["React"],
      reference_links: "src/pages or main chat component",
    },
    {
      date: "08 May 2025",
      work_summary:
        "Implemented API helper in src/lib/api.js to call FastAPI endpoint; added loading state and basic error handling for network issues.",
      hours_worked: 3.0,
      learnings_outcomes:
        "Centralizing API calls simplifies future changes (e.g., changing base URL or adding headers).",
      blockers_risks:
        "Handling slow responses gracefully to avoid user frustration.",
      skills_used: ["JavaScript", "API integration"],
      reference_links: "src/lib/api.js",
    },
    {
      date: "13 May 2025",
      work_summary:
        "Added section to describe supported laws (Constitution, BNS, BNSS, BSA, Consumer Protection, IT Act, POCSO, SHW Act) on the frontend, synced with backend README.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Clear scope explanation builds trust and sets user expectations correctly.",
      blockers_risks:
        "Must update both UI and backend docs when adding new laws.",
      skills_used: ["Documentation"],
      reference_links: "Backend README.md, frontend info section",
    },
    {
      date: "15 May 2025",
      work_summary:
        "Connected chat UI to backend — sending user queries to FastAPI and displaying RAG-based answers. Tested with sample legal questions from Constitution and BNS.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Successfully validated full-stack flow: React → FastAPI → RAG → LLM → UI.",
      blockers_risks:
        "Long answers may require pagination or expandable views.",
      skills_used: ["React", "API integration"],
      reference_links: "api.py, src/lib/api.js",
    },
    {
      date: "20 May 2025",
      work_summary:
        "REVIEW-2: Demonstrated working prototype: user asks legal questions and Nyay Mitra responds citing relevant laws. Reviewers suggested adding explicit disclaimer text and sources section in responses.",
      hours_worked: 4.0,
      learnings_outcomes:
        "Legal-tech systems must be very transparent about limitations and sources.",
      blockers_risks:
        'Need consistent display of "this is not legal advice" across UI and responses.',
      skills_used: ["Presentation", "UX"],
      reference_links: "Review minutes, updated prompts and UI text",
    },
    {
      date: "27 May 2025",
      work_summary:
        "Implemented frontend disclaimer banner and footer note; updated backend prompt to always remind user that this is informational assistance only. Did quick usability testing.",
      hours_worked: 2.5,
      learnings_outcomes:
        "Repetition of disclaimer improves safety and reduces misuse.",
      blockers_risks:
        "Must ensure not to hide key information behind too much text.",
      skills_used: ["UX", "React"],
      reference_links: "chains.py, prompts.py",
    },
    {
      date: "11 Aug 2025",
      work_summary:
        "Enhanced ingestion notebook to support multiple acts (BNS, BNSS, BSA, Consumer Protection, IT Act etc.) and stored embeddings into separate or tagged Chroma collections.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Multi-document RAG needs careful tagging to know which law each chunk belongs to.",
      blockers_risks: "Performance impact when corpus grows large.",
      skills_used: ["Python", "Data engineering"],
      reference_links:
        "src/Constitution_Pdf_Injest_NyayMitra.ipynb, src/acts.txt",
    },
    {
      date: "14 Aug 2025",
      work_summary:
        'Added structured response format: answer + "Relevant Laws / Sections" + "Summary" fields. Updated UI to display these blocks clearly.',
      hours_worked: 1.5,
      learnings_outcomes:
        "Structured responses make legal answers more understandable and scannable.",
      blockers_risks:
        "When context is weak, sections might not be exact citations.",
      skills_used: ["React", "Frontend"],
      reference_links: "prompts.py, chat response component",
    },
    {
      date: "18 Aug 2025",
      work_summary:
        'Implemented loading spinners and "thinking…" state on frontend while backend processes queries; improved error toast messages for timeouts or missing API key.',
      hours_worked: 1.0,
      learnings_outcomes:
        "Good feedback during waiting improves user experience.",
      blockers_risks: "Need to handle very slow responses gracefully.",
      skills_used: ["React", "UX"],
      reference_links: "src/components/StatefulButton.jsx",
    },
    {
      date: "21 Aug 2025",
      work_summary:
        "Added configuration checks in backend to ensure environment variables (GOOGLE_API_KEY, Chroma path, Redis URL) are properly loaded. Added meaningful error messages if misconfigured.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Early configuration validation reduces runtime crashes and confusion.",
      blockers_risks:
        "Environment differences between dev and deployment machines.",
      skills_used: ["Python", "Configuration management"],
      reference_links: ".env.example, main.py",
    },
    {
      date: "25 Aug 2025",
      work_summary:
        "Prepared architecture diagram: user → React client → FastAPI → NyayMitra class → embeddings + Chroma → Gemini → response. Added to project documentation.",
      hours_worked: 3.0,
      learnings_outcomes:
        "Visual architecture helps explain project quickly to faculty and external evaluators.",
      blockers_risks:
        "Need to keep the diagram updated when architecture changes.",
      skills_used: ["Documentation", "System design"],
      reference_links: "Architecture slide/doc",
    },
    {
      date: "28 Aug 2025",
      work_summary:
        "Implemented basic FAQ/static info page explaining when to use Nyay Mitra, supported queries, and how to phrase legal questions. Linked from navbar.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Guidance on asking questions improves quality of queries and answers.",
      blockers_risks: "Must not sound like legal advice itself.",
      skills_used: ["React", "Content writing"],
      reference_links: "Navbar.jsx, FAQ component",
    },
    {
      date: "29 Aug 2025",
      work_summary:
        'Explored adding "case-type" classification (e.g., traffic, consumer, workplace harassment) based on user query, to route retrieval to more relevant subsets. Drafted design but kept as future scope.',
      hours_worked: 3.5,
      learnings_outcomes:
        "Specialized retrieval per domain can improve accuracy for large corpora.",
      blockers_risks:
        "Needs labeled data and additional modelling; marked as future enhancement.",
      skills_used: ["Machine learning", "Design thinking"],
      reference_links: "Design notes",
    },
    {
      date: "01 Sep 2025",
      work_summary:
        'Improved conversation memory handling: limited chat history length, summarized older turns if needed, and ensured MessagesPlaceholder("chat_history") doesn\'t grow unbounded.',
      hours_worked: 2.0,
      learnings_outcomes:
        "Controlled history keeps costs and latency reasonable while preserving context.",
      blockers_risks:
        "Over-aggressive summarisation may lose important details.",
      skills_used: ["Python", "Optimization"],
      reference_links: "chains.py",
    },
    {
      date: "04 Sep 2025",
      work_summary:
        "Performed load tests with multiple concurrent queries (simulated users). Observed response times and monitored Redis cache effectiveness.",
      hours_worked: 2.5,
      learnings_outcomes:
        "Caching plus efficient retrieval settings keep latency acceptable under moderate load.",
      blockers_risks: "Need more optimization for very high concurrency.",
      skills_used: ["Performance testing", "Monitoring"],
      reference_links: "Test logs, Redis dashboard",
    },
    {
      date: "08 Sep 2025",
      work_summary:
        "Added simple health-check and status endpoints in FastAPI (e.g., /health, /config-status) to verify that vector store and embeddings are initialized.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Health endpoints are useful for deployment and debugging on servers.",
      blockers_risks: "Must not expose sensitive configuration details.",
      skills_used: ["FastAPI", "API design"],
      reference_links: "api.py",
    },
    {
      date: "12 Sep 2025",
      work_summary:
        "REVIEW-3: Demonstrated full-stack system: frontend chat, RAG backend, multiple laws, disclaimers, and caching. Feedback: add more examples in README and clearly explain how to run ingestion notebook.",
      hours_worked: 4.0,
      learnings_outcomes:
        "Importance of good documentation for external users and examiners.",
      blockers_risks:
        "Missing documentation may confuse evaluators during setup.",
      skills_used: ["Presentation", "Documentation"],
      reference_links: "Updated SETUP.md, README.md",
    },
    {
      date: "18 Sep 2025",
      work_summary:
        "Wrote SETUP.md with step-by-step instructions: install UV, create virtualenv, set environment variables, run ingestion, start FastAPI, and run React client.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Clear setup guide reduces onboarding time for any new user.",
      blockers_risks: "OS differences (Windows/Linux) may need extra notes.",
      skills_used: ["Technical writing"],
      reference_links: "SETUP.md",
    },
    {
      date: "22 Sep 2025",
      work_summary:
        'Audited prompts and responses to reduce hallucinations: emphasized "use only given context", "admit when uncertain", and "suggest consulting a lawyer".',
      hours_worked: 3.0,
      learnings_outcomes:
        "Prompt-based safety greatly influences reliability in legal domain.",
      blockers_risks:
        "Still dependent on underlying LLM behavior; cannot guarantee 0 hallucinations.",
      skills_used: ["Prompt engineering", "Safety"],
      reference_links: "prompts.py",
    },
    {
      date: "26 Sep 2025",
      work_summary:
        "Tuned retrieval search_kwargs for Chroma (k, score_threshold) to reduce noisy context and improve precision of referenced sections.",
      hours_worked: 1.0,
      learnings_outcomes:
        "Proper retrieval settings are crucial for high-quality legal answers.",
      blockers_risks: "One setting may not be optimal for all legal topics.",
      skills_used: ["Optimization", "Tuning"],
      reference_links: "chains.py",
    },
    {
      date: "09 Oct 2025",
      work_summary:
        "Prepared release-ready backend: cleaned unused code, ensured pyproject.toml and uv.lock are updated, and verified that readme field is correct.",
      hours_worked: 2.5,
      learnings_outcomes:
        "A clean and minimal backend repo looks professional and is easier to grade.",
      blockers_risks:
        "Any last-minute dependency changes must be tested thoroughly.",
      skills_used: ["Release management", "Python"],
      reference_links: "pyproject.toml, uv.lock",
    },
    {
      date: "10 Oct 2025",
      work_summary:
        "Performed full end-to-end tests: entered diverse legal queries (traffic, consumer, workplace, IT/online issues) and observed context retrieval & responses. Logged corner cases.",
      hours_worked: 3.0,
      learnings_outcomes:
        "System handles a wide variety of everyday legal questions reasonably well.",
      blockers_risks:
        "Deep, case-specific advice still requires human experts.",
      skills_used: ["Testing", "QA"],
      reference_links: "Test cases, logs",
    },
    {
      date: "13 Oct 2025",
      work_summary:
        "Captured screen recordings demonstrating: setup steps, example queries, and explanation of architecture. Prepared short demo clip for final evaluation.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Recorded demo guarantees that examiners can see functionality even if live demo faces network issues.",
      blockers_risks: "Keep video length concise and clear.",
      skills_used: ["Documentation", "Demo"],
      reference_links: "Demo video folder",
    },
    {
      date: "16 Oct 2025",
      work_summary:
        "Applied final UI polish: improved typography, spacing, and responsiveness. Verified hero section, feature cards, testimonials, and chat layout across screen sizes.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Small design tweaks significantly improve first impression of the project.",
      blockers_risks: "Cross-browser differences need quick cross-check.",
      skills_used: ["UI design", "CSS"],
      reference_links: "index.css, component styles",
    },
    {
      date: "17 Oct 2025",
      work_summary:
        "Improved error handling in backend (FastAPI) to return user-friendly messages instead of raw stack traces; added proper HTTP status codes.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Robust error handling improves reliability and user trust.",
      blockers_risks:
        "Must log internal errors while hiding sensitive info from users.",
      skills_used: ["FastAPI", "Error handling"],
      reference_links: "api.py",
    },
    {
      date: "23 Oct 2025",
      work_summary:
        "Performed robustness tests with long user questions and multi-turn conversations; checked that caching and chat history behave correctly without crashing.",
      hours_worked: 2.5,
      learnings_outcomes:
        "System stable for extended usage with multiple queries.",
      blockers_risks:
        "Very long prompts may hit token limits; need good instructions to users.",
      skills_used: ["Testing", "Debugging"],
      reference_links: "Long conversation logs",
    },
    {
      date: "30 Oct 2025",
      work_summary:
        "Finalized viva/demo script: divided explanation among team members (problem statement, backend RAG pipeline, frontend UI, future work).",
      hours_worked: 3.0,
      learnings_outcomes:
        "Clear role division improves confidence during final demo.",
      blockers_risks: "Need to rehearse timing and transitions.",
      skills_used: ["Teamwork", "Communication"],
      reference_links: "Demo script document",
    },
    {
      date: "03 Nov 2025",
      work_summary:
        "Verified project on final presentation hardware: installed dependencies, configured .env, tested ingestion outputs, & checked that client connects to server correctly.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Early dry-run on target machine avoids last-minute surprises.",
      blockers_risks:
        "Internet dependency for Gemini API must be checked before demo.",
      skills_used: ["Troubleshooting", "Deployment"],
      reference_links: "Local setup notes",
    },
    {
      date: "06 Nov 2025",
      work_summary:
        "Prepared final deliverables: zipped backend and frontend code, README, SETUP guide, demo video, and architecture diagram. Ensured file names are clear and organized.",
      hours_worked: 2.5,
      learnings_outcomes:
        "Well-structured deliverables help evaluators quickly understand the project.",
      blockers_risks:
        "Need to verify all paths and instructions one last time.",
      skills_used: ["Documentation", "Project management"],
      reference_links: "Final submission folder",
    },
    {
      date: "07 Nov 2025",
      work_summary:
        "Conducted final UX review: ensured disclaimers are visible, responses are readable, and wording is simple for non-law users. Made minor text edits.",
      hours_worked: 1.5,
      learnings_outcomes:
        "Language simplicity is critical for laypeople seeking legal guidance.",
      blockers_risks: "Multi-language support remains future work.",
      skills_used: ["UX writing", "Accessibility"],
      reference_links: "UI text in React components",
    },
    {
      date: "10 Nov 2025",
      work_summary:
        "Re-tested ingestion for at least one act end-to-end to ensure vector store is consistent; checked random queries to validate RAG quality after any recent code changes.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Regression testing ensures changes haven't silently broken retrieval.",
      blockers_risks: "Large corpus changes may require full re-ingestion.",
      skills_used: ["Regression testing", "QA"],
      reference_links: "Ingestion notebook, Chroma collections",
    },
    {
      date: "13 Nov 2025",
      work_summary:
        "Full team rehearsal of final demo: walked through project motivation, tech stack, architecture, live demo, and Q&A preparation.",
      hours_worked: 3.0,
      learnings_outcomes:
        "Team more confident and prepared for unexpected questions.",
      blockers_risks: "Need to stay within allotted presentation time.",
      skills_used: ["Presentation", "Teamwork"],
      reference_links: "Rehearsal notes",
    },
    {
      date: "20 Nov 2025",
      work_summary:
        "Created final submission checklist: verified code, docs, demo video, architecture diagram, and ingestion notebook are all included and updated. Ensured each team member has diary entries.",
      hours_worked: 2.0,
      learnings_outcomes:
        "Administrative readiness avoids marks loss due to missing items.",
      blockers_risks: "Any last-minute change must go through quick re-check.",
      skills_used: ["Project management", "Organization"],
      reference_links: "Submission checklist",
    },
    {
      date: "24 Nov 2025",
      work_summary:
        "Performed last validation pass on both frontend and backend; cross-checked environment variables, vector database presence, and README instructions. Noted final review date and hardware/network checks.",
      hours_worked: 3.5,
      learnings_outcomes: "Confirmed system is stable and demo-ready.",
      blockers_risks:
        "Final review on 26 Nov depends on lab network and API availability.",
      skills_used: ["QA", "Testing"],
      reference_links: "Final README and setup guide",
    },
  ];

  // Launch Browser
  const browser = await chromium.launch({ headless: false }); // Headless: false to see it happening
  const context = await browser.newContext();
  const page = await context.newPage();

  // Helper function to handle intelligent date selection
  // Assumes the calendar ALWAYS opens on November 2025 as the default state
  async function selectDate(page, dateStr) {
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      console.error(`Invalid date format: ${dateStr}`);
      throw new Error(`Invalid date: ${dateStr}`);
    }

    // --- CALCULATE SELECTORS ---
    // The UI uses different formats for attributes. We prepare both.

    const m = targetDate.getMonth() + 1; // 1-12
    const d = targetDate.getDate(); // 1-31
    const y = targetDate.getFullYear(); // YYYY

    // Format 1: Button attribute (often M/D/YYYY with NO zero padding)
    // Example: "2/20/2025" or "11/1/2025"
    const selectorV1 = `button[data-day="${m}/${d}/${y}"]`;

    // Format 2: ISO format on parent TD (YYYY-MM-DD with zero padding)
    // Example: "2025-02-20"
    const mISO = String(m).padStart(2, "0");
    const dISO = String(d).padStart(2, "0");
    const selectorV2 = `td[data-day="${y}-${mISO}-${dISO}"] button`;

    console.log(
      `Targeting date: ${y}-${mISO}-${dISO} (Selectors: '${selectorV1}' OR '${selectorV2}')`
    );

    // Open the calendar popover
    await page.click('button[data-slot="popover-trigger"]');
    await page.waitForTimeout(500); // Wait for popover animation

    // --- DETERMINISTIC NAVIGATION ---
    // We assume the calendar starts at November 2025
    const startYear = 2025;
    const startMonth = 10; // 10 = November in JS Date (0-11)

    const targetYearJS = targetDate.getFullYear();
    const targetMonthJS = targetDate.getMonth();

    // Calculate the difference in months
    // Negative means target is in the past (Click Previous)
    // Positive means target is in the future (Click Next)
    const monthDiff =
      (targetYearJS - startYear) * 12 + (targetMonthJS - startMonth);

    if (monthDiff < 0) {
      const clicks = Math.abs(monthDiff);
      console.log(`Navigating back ${clicks} months...`);
      for (let i = 0; i < clicks; i++) {
        await page.click(".rdp-button_previous");
        await page.waitForTimeout(150); // Small wait between clicks to ensure UI handles it
      }
    } else if (monthDiff > 0) {
      const clicks = monthDiff;
      console.log(`Navigating forward ${clicks} months...`);
      for (let i = 0; i < clicks; i++) {
        await page.click(".rdp-button_next");
        await page.waitForTimeout(150);
      }
    }

    // Verify we are roughly in the right place (Optional console log)
    try {
      const caption = await page.textContent(".rdp-caption_label");
      console.log(`Calendar currently showing: ${caption}`);
    } catch (e) {}

    // --- CLICK THE DATE ---
    const btn1 = page.locator(selectorV1);
    const btn2 = page.locator(selectorV2);

    if (await btn1.isVisible()) {
      console.log("Found date button (Method 1). Clicking...");
      await btn1.click();
    } else if (await btn2.isVisible()) {
      console.log("Found date button via parent cell (Method 2). Clicking...");
      await btn2.click();
    } else {
      console.error(`CRITICAL: Date button not found for ${dateStr}.`);
      console.error(`Ensure the calendar navigated to the correct month.`);
      // Close popover to see if that helps manual intervention, or fail hard
      await page.keyboard.press("Escape");
      throw new Error(`Failed to select date: ${dateStr}`);
    }
  }

  // Helper to wait for user input in terminal
  async function waitForUserConfirmation() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(
        "\nPress ENTER in this terminal when you are ready to start automation...",
        (ans) => {
          rl.close();
          resolve(ans);
        }
      );
    });
  }

  // --- INITIAL SETUP ---

  console.log("Navigating to https://vtu.internyet.in ...");
  try {
    await page.goto("https://vtu.internyet.in", { timeout: 0 }); // 0 timeout for infinite wait
  } catch (e) {
    console.log("Navigation took a while, continuing...");
  }

  console.log(
    "--------------------------------------------------------------------------------"
  );
  console.log("STEP 1: Log in manually in the opened browser window.");
  console.log("STEP 2: Navigate to the 'Select Project & Date' page.");
  console.log(
    "--------------------------------------------------------------------------------"
  );

  // Wait for user input
  await waitForUserConfirmation();

  console.log("Checking for form...");

  // Wait a moment for the user to be truly ready, just in case
  try {
    // We check for the form. If not found quickly, we warn but user said they are ready.
    await page.waitForSelector("form#check-diary-form", { timeout: 5000 });
    console.log("Target form detected! Starting automation...");
  } catch (e) {
    console.warn(
      "Warning: The 'Select Project' form was not found immediately."
    );
    console.warn(
      "Attempting to proceed anyway, but script might fail if the page is wrong."
    );
  }

  for (const [index, entry] of DATA.entries()) {
    console.log(`Processing entry ${index + 1}/${DATA.length}: ${entry.date}`);

    // --- STEP 1: SELECT PROJECT & DATE ---

    // Ensure we are on the first form.
    try {
      await page.waitForSelector("form#check-diary-form", { timeout: 10000 });
    } catch (e) {
      console.error(
        "Could not find the start form. Please ensure you are on the correct page."
      );
      break;
    }

    // 1. Select Project (Always first option as requested)
    await page.click("button#project_id");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // 2. Select Date using deterministic helper
    try {
      await selectDate(page, entry.date);
    } catch (err) {
      console.error(err.message);
      process.exit(1); // Stop execution if date fails
    }

    // 3. Continue
    console.log("Waiting for Continue button to be enabled...");
    // We use a CSS selector to wait for the button to NOT have the 'disabled' attribute.
    // The previous error was because 'expect' is part of @playwright/test, not the core library.
    try {
      // Wait up to 5s for the button to become enabled
      await page.waitForSelector(
        'button:has-text("Continue"):not([disabled])',
        { timeout: 5000 }
      );
    } catch (e) {
      console.log(
        "Continue button might still be disabled or selector mismatch. Attempting click anyway..."
      );
    }

    await page.click('button:has-text("Continue")');

    // --- STEP 2: FILL DETAILS ---

    // Wait for the second form to load
    await page.waitForSelector("form#student-diary-form");

    // 1. Work Summary
    await page.fill('textarea[name="description"]', entry.work_summary);

    // 2. Hours Worked
    await page.fill(
      'input[placeholder="e.g. 6.5"]',
      entry.hours_worked.toString()
    );

    // 3. Reference Links
    if (entry.reference_links) {
      await page.fill('textarea[name="links"]', entry.reference_links);
    }

    // 4. Learnings
    await page.fill('textarea[name="learnings"]', entry.learnings_outcomes);

    // 5. Blockers
    if (entry.blockers_risks) {
      await page.fill('textarea[name="blockers"]', entry.blockers_risks);
    }

    // 6. Skills (Smart Selection)
    const skillsInputSelector = 'input[id*="react-select"]';
    let skillsAddedCount = 0;

    console.log("Adding skills...");

    for (const skill of entry.skills_used) {
      try {
        // Type the skill
        await page.fill(skillsInputSelector, skill);
        await page.waitForTimeout(800); // Wait for results to filter

        // Check if "No options" message is visible
        const noOptions = await page
          .getByText("No options", { exact: false })
          .isVisible();

        if (!noOptions) {
          // If options exist, select the first one
          await page.keyboard.press("Enter");
          skillsAddedCount++;
          await page.waitForTimeout(300); // Wait for tag to be added
        } else {
          console.log(`Skill '${skill}' not found, skipping.`);
          // Clear the input to reset state for next skill
          await page.fill(skillsInputSelector, "");
        }
      } catch (err) {
        console.log(`Error processing skill ${skill}: ${err.message}`);
      }
    }

    // Fallback if no skills were added
    if (skillsAddedCount === 0) {
      console.log(
        "No valid skills selected from list. Defaulting to 'Machine Learning'."
      );
      await page.fill(skillsInputSelector, "Machine Learning");
      await page.waitForTimeout(1000);
      await page.keyboard.press("Enter");
    }

    // 7. Save
    await page.click('button:has-text("Save")');

    // --- STEP 3: LOOP BACK ---

    // Wait for the "Create" button on the dashboard/success page
    await page.waitForSelector('a:has-text("Create")');

    // Click to start next entry
    if (index < DATA.length - 1) {
      await page.click('a:has-text("Create")');
      // Loop will handle waiting for form#check-diary-form at start of next iteration
    }
  }

  console.log("All entries processed!");
  // await browser.close();
})();
