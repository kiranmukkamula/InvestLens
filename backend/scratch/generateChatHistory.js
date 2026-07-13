import fs from 'fs';
import readline from 'readline';
import path from 'path';

function maskSecrets(text) {
  return text
    .replace(/gsk_[a-zA-Z0-9]+/g, 'gsk_*****_MASKED_SECRET_*****')
    .replace(/AQ\.[a-zA-Z0-9_-]+/g, 'AQ.*****_MASKED_SECRET_*****')
    .replace(/tvly-[a-zA-Z0-9_-]+/g, 'tvly-*****_MASKED_SECRET_*****')
    .replace(/d99rovpr[a-zA-Z0-9]+/g, 'd99r_*****_MASKED_SECRET_*****')
    .replace(/NbeH9bqPR[a-zA-Z0-9]+/g, 'NbeH_*****_MASKED_SECRET_*****');
}

async function parseTranscript() {
  const logFilePath = 'C:\\Users\\Mukka\\.gemini\\antigravity-ide\\brain\\7dba0575-ad3f-489d-ad47-70d3bad2ac67\\.system_generated\\logs\\transcript_full.jsonl';
  const outputFilePath = 'c:\\Users\\Mukka\\OneDrive\\Documents\\Desktop\\AI Investment\\ai_chat_transcript.md';

  console.log('Reading transcript from:', logFilePath);

  if (!fs.existsSync(logFilePath)) {
    console.error('Transcript file does not exist at:', logFilePath);
    return;
  }

  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let markdownContent = `# 💬 InvestLens: AI Developer Conversation Transcript\n\n`;
  markdownContent += `This file contains the complete, unedited conversation history between the Developer (**Mukkamula Kiran**) and the AI Coding Assistant (**Antigravity**) during the design, development, and debugging of the **InvestLens** system. It showcases the developer's prompt engineering skills, structural troubleshooting, and technical decisions.\n\n---\n\n`;

  let currentTurn = 1;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      
      if (step.type === 'USER_INPUT') {
        const rawContent = step.content || '';
        // Extract the user request from <USER_REQUEST> tag
        const match = rawContent.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        let requestText = match ? match[1].trim() : rawContent.trim();
        
        markdownContent += `### 👤 Turn ${currentTurn}: Developer Prompt\n`;
        markdownContent += `\`\`\`text\n${requestText}\n\`\`\`\n\n`;
      } 
      else if (step.source === 'MODEL' && step.type === 'PLANNER_RESPONSE') {
        const rawContent = step.content || '';
        if (rawContent.trim() && !rawContent.includes('tool_calls')) {
          markdownContent += `### 🤖 Turn ${currentTurn}: AI Assistant Response\n`;
          markdownContent += `${rawContent.trim()}\n\n`;
          markdownContent += `---\n\n`;
          currentTurn++;
        }
      }
    } catch (err) {
      console.error('Error parsing line:', err.message);
    }
  }

  const maskedMarkdownContent = maskSecrets(markdownContent);
  fs.writeFileSync(outputFilePath, maskedMarkdownContent, 'utf-8');
  console.log('Successfully wrote masked chat history to:', outputFilePath);
}

parseTranscript();
