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
const llm = new ChatGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY, model: "gemini-2.5-pro", temperature: 0.6 });
const qdrantClient = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });

const initializeQdrantCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some((c) => c.name === QDRANT_COLLECTION_NAME);
    if (!collectionExists) {
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' not found. Creating...`);
      await qdrantClient.recreateCollection(QDRANT_COLLECTION_NAME, { vectors: { size: 768, distance: "Cosine" } });
    } else {
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' already exists.`);
    }
  } catch (error) { console.error("Error initializing Qdrant collection:", error); }
};
initializeQdrantCollection();

const clearHistory = () => { conversationHistory = []; };

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

/**
 * Answers a question using one of two methods:
 * 1. General Chat: If isGeneral is true, it answers from the AI's base knowledge.
 * 2. RAG Chat: If isGeneral is false, it answers from the uploaded document.
 */
const askQuestion = async (question, isGeneral = false) => {
  // --- PATH 1: GENERAL CHAT (NO PDF) ---
  if (isGeneral) {
    console.log("Handling a general question (no RAG)...");

    const generalPrompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful and friendly AI assistant. Answer the user's question clearly and concisely."],
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

  // --- PATH 2: DOCUMENT CHAT (RAG) ---
  console.log("Handling a document-specific question (RAG)...");
  
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, { client: qdrantClient, collectionName: QDRANT_COLLECTION_NAME });
  const retriever = vectorStore.asRetriever({ k: 4 });

  const historyAwareRetrieverPrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    ["user", "Given the above conversation, generate a concise, standalone search query to look up in the document to get information relevant to the conversation."],
  ]);
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({ llm, retriever, rephrasePrompt: historyAwareRetrieverPrompt });

  const historyAwareResponsePrompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a highly skilled AI assistant. Your primary goal is to answer the user's question based on the provided document context. **Instructions:** 1. First, carefully analyze the document context provided. If it contains the information needed to answer the user's question, you MUST use it to formulate your response. 2. Structure your answer for maximum readability. Use markdown formatting like bolding for headings, and bullet points for lists. 3. If, and only if, the context does not contain the answer, then use your own general knowledge to provide a helpful response. 4. Do not mention "the context" or "the document" in your response. Answer as if you are the expert.`],
    new MessagesPlaceholder("chat_history"),
    ["user", `Here is the context from the document:\n---\n{context}\n---\nPlease answer my question based on our conversation and the context above.\n\nQuestion: {input}`],
  ]);

  const combineDocsChain = await createStuffDocumentsChain({ llm, prompt: historyAwareResponsePrompt });
  const conversationalRetrievalChain = await createRetrievalChain({ retriever: historyAwareRetrieverChain, combineDocsChain });

  const result = await conversationalRetrievalChain.invoke({ chat_history: conversationHistory, input: question });
  conversationHistory.push(new HumanMessage(question));
  conversationHistory.push(new AIMessage(result.answer));
  
  return result.answer;
};

module.exports = {
  processPdf,
  askQuestion,
};