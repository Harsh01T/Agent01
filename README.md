🤖 Agent01: AI Customer Support Agent
A production-ready, full-stack AI customer support chat widget built with Next.js, MySQL, and Google Gemini. This agent functions as an automated customer representative for a fictional e-commerce store, answering incoming user queries based strictly on seeded domain knowledge while leveraging an enterprise-grade distributed rate limiter at the edge network.

🚀 How to Run Locally
Prerequisites
  Node.js (v18+ recommended)
  MySQL Server (running locally on port 3306)
  Upstash Account (free tier serverless Redis)
  
Step-by-Step Setup :-->
  Clone and install dependencies:
    git clone <your-repo-url>
    cd <your-repo-folder>
    npm install
  
  Configure Environment Variables:
    Create a .env.local file in the root directory

  Initialize the Database:
    Execute the migration queries in your local MySQL instance
  
  Start the Development Server:
    npm run dev

🔑 2. Environment Variables Configuration
  # AI Provider Configuration
  # Obtain an API key from Google AI Studio: https://aistudio.google.com/app/apikey
  GEMINI_API_KEY=AIzaSyYourActualKeyHere...
  
  # MySQL Database Configuration
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=customer_support_agent
  
  # Upstash Redis Configuration
  # Obtain credentials from your Upstash console: https://console.upstash.com/
  UPSTASH_REDIS_REST_URL="https://your-database-id.upstash.io"
  UPSTASH_REDIS_REST_TOKEN="your_upstash_secret_token_here"

🗄️ 3. Database Setup (Migrations & Seed) (Note: Domain knowledge data is seeded directly into the LLM system prompt rather than the database for zero-latency context loading).
  CREATE DATABASE IF NOT EXISTS customer_support_agent;
  USE customer_support_agent;
  
  CREATE TABLE IF NOT EXISTS conversations (
      id CHAR(36) PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON NULL
  );
  
  CREATE TABLE IF NOT EXISTS messages (
      id CHAR(36) PRIMARY KEY,
      conversation_id CHAR(36) NOT NULL,
      sender ENUM('user', 'ai') NOT NULL,
      text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      INDEX idx_conversation_id (conversation_id)
  );

🏗️ 4. Architecture Overview
  [Client UI] ──> [Edge Middleware (Redis Limiter)] ──> [API Route Controller]
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                        ▼                                       ▼
                             [DB Service (MySQL)]                      [LLM Service (Gemini)]

🧠 5. LLM Notes
  Provider & Model: Google Gemini (gemini-2.5-flash)
  Context Selection: Gemini was selected for its exceptional sub-second response times, precise instruction following, and highly economical free tier operations during development.
  Prompting & Guardrails Strategy: * Explicit corporate policies covering shipping limits, refund metrics, and business operating windows are seeded as fixed systemInstruction parameters.
  The prompt requires the model to "Answer clearly and concisely based ONLY on the following policies" and demands that it redirect out-of-bounds user topics politely to human customer teams.
  Deterministic Configuration: The engine temperature parameter is hardwired to 0.2 to actively curb hallucination. Max response generation tokens are capped at 250 elements, and history arrays retrieved from MySQL are sliced at a max limit of the last 10 messages to optimize prompt context window dimensions.

⚖️ 6. Trade-offs
  Certain technical trade-offs were made to balance delivery speed against architectural modularity:
  System Prompt Domain Seeding: Hardcoding store policy criteria right inside the system instruction file yields incredibly fast execution and zero layout latency for localized store operations. However, this is tightly constrained by context window limitations. If company documentation expanded to a massive, multi-page layout, it would require swapping to a vector embedding platform.
  Raw Database Strings: Interfacing directly over native MySQL drivers provides lightning-quick operations and removes third-party dependencies. However, it requires manually synchronizing structural table entities between SQL databases and TypeScript typing interfaces.
  
  Planned Roadmap Improvements:
  Transition to an ORM: Implement Prisma or Drizzle ORM to enforce unified type safety across migration profiles and schema states.
  Retrieval-Augmented Generation (RAG): Migrate the store knowledge index over to an external Vector Database (such as Pinecone or pgvector), using semantic search vectors to source dynamic content matches for massive corporate document networks.
  User Accounts & Session Guarding: Layer NextAuth.js directly into the API endpoint to securely bind generated UUID chat contexts directly to authenticated client profiles.
    
