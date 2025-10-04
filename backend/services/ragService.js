// services/ragService.js

const { QdrantClient } = require("@qdrant/js-client-rest");
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { QdrantVectorStore } = require("@langchain/qdrant");
const { Document } = require("@langchain/core/documents");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const { createHistoryAwareRetriever } = require("langchain/chains/history_aware_retriever");
const pdf = require("pdf-parse");

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const QDRANT_COLLECTION_NAME = "sprint_mate_rag";

let conversationHistory = [];

const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: GOOGLE_API_KEY, model: "models/embedding-001" });
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-pro",
  temperature: 0.4, // Lower temperature encourages more precise instruction-following for formatting.
});
const qdrantClient = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });

const initializeQdrantCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some((c) => c.name === QDRANT_COLLECTION_NAME);
    if (!collectionExists) {
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' not found. Creating...`);
      await qdrantClient.recreateCollection(QDRANT_COLLECTION_NAME, { vectors: { size: 768, distance: "Cosine" } });
      console.log("Collection created successfully.");
    } else {
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' already exists.`);
    }
  } catch (error) {
    console.error("Error initializing Qdrant collection:", error);
  }
};
initializeQdrantCollection();

const clearHistory = () => {
  console.log("Clearing conversation history.");
  conversationHistory = [];
};

const processPdf = async (fileBuffer) => {
  console.log("Starting PDF processing...");
  clearHistory();
  await qdrantClient.recreateCollection(QDRANT_COLLECTION_NAME, { vectors: { size: 768, distance: "Cosine" } });
  const data = await pdf(fileBuffer);
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500, chunkOverlap: 200 });
  const docs = await textSplitter.splitDocuments([new Document({ pageContent: data.text })]);
  await QdrantVectorStore.fromDocuments(docs, embeddings, { client: qdrantClient, collectionName: QDRANT_COLLECTION_NAME });
  console.log(`PDF processed and stored in Qdrant. ${docs.length} chunks were created.`);
};

const askQuestion = async (question, isGeneral = false) => {
  console.log(`🔍 askQuestion called with: question="${question}", isGeneral=${isGeneral}`);
  
  // --- PATH 1: GENERAL CHAT (NO PDF) ---
  if (isGeneral) {
    console.log("✅ Handling a general question (no RAG)...");
    try {
      const generalPrompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful and friendly AI assistant. Answer the user's question clearly and concisely, using Markdown for formatting if appropriate."],
        new MessagesPlaceholder("chat_history"),
        ["user", "{input}"],
      ]);
      const chain = generalPrompt.pipe(llm);
      const result = await chain.invoke({
        chat_history: conversationHistory,
        input: question,
      });
      conversationHistory.push(new HumanMessage(question));
      conversationHistory.push(new AIMessage(result.content));
      return result.content;
    } catch (error) {
      console.error("❌ Error in general chat:", error);
      throw error;
    }
  }

  // --- PATH 2: DOCUMENT CHAT (RAG) ---
  console.log("📄 Handling a document-specific question (RAG)...");
  
  try {
  
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, { client: qdrantClient, collectionName: QDRANT_COLLECTION_NAME });
  const retriever = vectorStore.asRetriever({ k: 4 });

  const historyAwareRetrieverPrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    ["user", "Given the above conversation, generate a concise, standalone search query to look up in the document to get information relevant to the conversation."],
  ]);
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({ llm, retriever, rephrasePrompt: historyAwareRetrieverPrompt });

  const historyAwareResponsePrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a professional AI assistant specializing in document analysis and summarization. You MUST strictly adhere to the following formatting rules to ensure maximum readability.

      **Formatting Rules:**
      - Use Markdown headings (like '### Heading') for main topics.
      - **For any series of related items, definitions, or points that follow a heading or an introductory sentence, you MUST format them as a bulleted list. Use a hyphen and a space ('- ') for each item. Do not just use line breaks.**
      - Use bold text ('**text**') for key terms within a sentence.
      - If you encounter data best represented in a table, you MUST format it as a proper Markdown table.

      **Answering Rules:**
      1.  Prioritize the document context. If it contains the answer, you MUST use it.
      2.  If the context is insufficient, use your general knowledge.
      3.  Do not mention "the context" or "the document." Present the information directly.`
    ],
    new MessagesPlaceholder("chat_history"),
    ["user", `Here is the context from the document:\n---\n{context}\n---\nPlease answer my question based on our conversation and the context above.\n\nQuestion: {input}`],
  ]);

  const combineDocsChain = await createStuffDocumentsChain({ llm, prompt: historyAwareResponsePrompt });
  const conversationalRetrievalChain = await createRetrievalChain({ retriever: historyAwareRetrieverChain, combineDocsChain });

  const result = await conversationalRetrievalChain.invoke({ chat_history: conversationHistory, input: question });
  conversationHistory.push(new HumanMessage(question));
  conversationHistory.push(new AIMessage(result.answer));
  
  console.log("✅ RAG processing completed successfully");
  return result.answer;
  
  } catch (error) {
    console.error("❌ Error in RAG processing:", error);
    console.log("🔄 Falling back to general chat mode...");
    
    // Fallback to general chat if RAG fails
    const generalPrompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful and friendly AI assistant. Answer the user's question clearly and concisely, using Markdown for formatting if appropriate."],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);
    const chain = generalPrompt.pipe(llm);
    const result = await chain.invoke({
      chat_history: conversationHistory,
      input: question,
    });
    conversationHistory.push(new HumanMessage(question));
    conversationHistory.push(new AIMessage(result.content));
    return result.content;
  }
};

module.exports = {
  processPdf,
  askQuestion,
};