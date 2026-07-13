import { StateGraph, START, END } from '@langchain/langgraph';
import GraphState from './state.js';
import { researchNode } from '../modules/research/index.js';
import { canonicalMapperNode } from '../modules/canonicalMapper/index.js';
import { analysisNode } from '../modules/analysis/index.js';
import { decisionNode } from '../modules/decision/index.js';
import logger from '../logger/logger.js';

/**
 * LangGraph Workflow Compiler
 * 
 * Purpose:
 * Assembles and compiles the StateGraph workflow for the Investment Advisor system.
 * Chains nodes sequentially: START -> research -> canonicalMapper -> analysis -> decision -> END.
 * Enforces standard GraphState transitions.
 */

logger.info('Building LangGraph workflow StateGraph builder...');

// Define the StateGraph with the GraphState configuration schema
const workflowBuilder = new StateGraph(GraphState)
  // 1. Add agent/mapper nodes
  .addNode('research_node', researchNode)
  .addNode('mapper_node', canonicalMapperNode)
  .addNode('analysis_node', analysisNode)
  .addNode('decision_node', decisionNode)

  // 2. Map entrypoint edge
  .addEdge(START, 'research_node')

  // 3. Define transitions
  .addEdge('research_node', 'mapper_node')
  .addEdge('mapper_node', 'analysis_node')
  .addEdge('analysis_node', 'decision_node')
  
  // 4. Map exit point edge
  .addEdge('decision_node', END);

// Compile the workflow graph
const compiledGraph = workflowBuilder.compile();

logger.info('LangGraph workflow compiled successfully.');

export default compiledGraph;
