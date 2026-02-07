import { GoogleGenerativeAI, Content } from '@google/generative-ai';

export interface CrewChatContext {
  crewId: string;
  crewName: string;
  role: string;
  instructions: string;
  sessionId: string;
  previousMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  dmHistory?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

function buildSystemPrompt(context: CrewChatContext): string {
  return `당신은 ${context.crewName}입니다. 역할: ${context.role}

${context.instructions}

대화 스타일:
- 전문적이면서도 친근한 톤
- 명확하고 실용적인 답변
- 사용자의 요구사항을 정확히 이해하고 실행

항상 한국어로 응답하세요.`;
}

const MAX_CONTEXT_TOKENS = 2000;

function estimateTokens(text: string): number {
  // Korean text: ~1 token per 3 characters; English: ~1 token per 4 characters
  // Use conservative estimate of 1 token per 3 chars
  return Math.ceil(text.length / 3);
}

function buildContents(
  previousMessages: Array<{ role: string; content: string }> | undefined,
  userMessage: string
): Content[] {
  const contents: Content[] = [];

  if (previousMessages) {
    // Token-based context window: include messages from most recent, up to token limit
    const userTokens = estimateTokens(userMessage);
    let remainingTokens = MAX_CONTEXT_TOKENS - userTokens;

    const filtered = previousMessages.filter((msg) => msg.role !== 'system');
    // Iterate from most recent to oldest
    const selected: Array<{ role: string; content: string }> = [];
    for (let i = filtered.length - 1; i >= 0 && remainingTokens > 0; i--) {
      const tokens = estimateTokens(filtered[i].content);
      if (tokens <= remainingTokens) {
        selected.unshift(filtered[i]);
        remainingTokens -= tokens;
      } else {
        break;
      }
    }

    for (const msg of selected) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Gemini requires alternating user/model turns - merge consecutive same-role messages
  const merged: Content[] = [];
  for (const content of contents) {
    if (merged.length > 0 && merged[merged.length - 1].role === content.role) {
      merged[merged.length - 1].parts.push(...content.parts);
    } else {
      merged.push({ ...content });
    }
  }

  // Gemini requires the first message to be from the user
  if (merged.length > 0 && merged[0].role === 'model') {
    merged.shift();
  }

  return merged;
}

function handleGeminiError(error: any): never {
  console.error('Gemini API error:', error);

  const message = error?.message || '';
  const status = error?.status;

  if (status === 401 || status === 403 || message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
    throw new Error('Gemini API 키가 유효하지 않습니다. 설정에서 API 키를 확인하세요.');
  } else if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
    throw new Error('Gemini API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.');
  } else if (message.includes('SAFETY')) {
    throw new Error('안전 필터에 의해 응답이 차단되었습니다. 다른 방식으로 질문해보세요.');
  } else {
    throw new Error(`AI 응답 생성 중 오류가 발생했습니다: ${message || '알 수 없는 오류'}`);
  }
}

export async function getCrewResponse(
  apiKey: string,
  userMessage: string,
  context: CrewChatContext
): Promise<ReadableStream<Uint8Array>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(context),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  });

  const contents = buildContents(context.previousMessages, userMessage);

  try {
    const result = await model.generateContentStream({ contents });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error('스트리밍 중 오류:', error);
          controller.error(error);
        }
      },
    });
  } catch (error: any) {
    handleGeminiError(error);
  }
}

export async function getCrewResponseNonStreaming(
  apiKey: string,
  userMessage: string,
  context: CrewChatContext
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(context),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  });

  const contents = buildContents(context.previousMessages, userMessage);

  try {
    const result = await model.generateContent({ contents });
    return result.response.text() || '죄송합니다. 다시 말씀해주실 수 있을까요?';
  } catch (error: any) {
    handleGeminiError(error);
  }
}

export async function getGroupChatResponse(
  apiKey: string,
  userMessage: string,
  contexts: CrewChatContext[],
  previousMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string; crewId?: string }>
): Promise<Array<{ crewId: string; crewName: string; response: string }>> {
  // 병렬 처리: 모든 크루에 대해 동시에 Gemini API 호출
  const responses = await Promise.all(
    contexts.map(async (context) => {
      const genAI = new GoogleGenerativeAI(apiKey);

      let systemPrompt = `당신은 ${context.crewName}입니다. 역할: ${context.role}

${context.instructions}

현재 그룹 채팅에서 다른 크루들과 협업하고 있습니다. 사용자의 요청에 대해 전문적인 답변을 제공하세요.
마스터(사용자)에게 다음 액션을 요구할 수 있는 질문이나 제안을 포함해주세요.`;

      if (context.dmHistory && context.dmHistory.length > 0) {
        const dmHistoryText = context.dmHistory
          .slice(-5)
          .map((msg) => {
            const truncated = msg.content.length > 200 ? msg.content.slice(0, 200) + '...' : msg.content;
            return `${msg.role === 'user' ? '[마스터]' : '[나]'}: ${truncated}`;
          })
          .join('\n');
        systemPrompt += `\n\n중요: 아래는 마스터와의 이전 1:1 대화(DM) 히스토리입니다. 이 대화 내용을 참고하여 그룹 챗에서 일관성 있게 답변하세요.\n`;
        systemPrompt += `[이전 DM 대화 히스토리]\n${dmHistoryText}\n[DM 히스토리 끝]`;
      }

      systemPrompt += `\n\n대화 스타일:
- 전문적이면서도 친근한 톤
- 명확하고 실용적인 답변
- 다른 크루들의 의견을 고려하여 답변
- 마스터에게 구체적인 액션 힌트 제공
- 이전 DM 대화에서 나눈 내용을 참고하여 일관성 유지

항상 한국어로 응답하세요.`;

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      // Build group chat contents
      const contents: Content[] = [];
      if (previousMessages && previousMessages.length > 0) {
        const recentMessages = previousMessages.slice(-10);
        for (const msg of recentMessages) {
          if (msg.role === 'user') {
            contents.push({
              role: 'user',
              parts: [{ text: `[마스터]: ${msg.content}` }],
            });
          } else if (msg.role === 'assistant') {
            contents.push({
              role: 'model',
              parts: [{
                text: msg.crewId === context.crewId
                  ? `[나]: ${msg.content}`
                  : `[다른 크루]: ${msg.content}`,
              }],
            });
          }
        }
      }
      contents.push({ role: 'user', parts: [{ text: `[마스터]: ${userMessage}` }] });

      // Merge consecutive same-role messages
      const merged: Content[] = [];
      for (const c of contents) {
        if (merged.length > 0 && merged[merged.length - 1].role === c.role) {
          merged[merged.length - 1].parts.push(...c.parts);
        } else {
          merged.push({ ...c });
        }
      }
      if (merged.length > 0 && merged[0].role === 'model') {
        merged.shift();
      }

      try {
        const result = await model.generateContent({ contents: merged });
        return {
          crewId: context.crewId,
          crewName: context.crewName,
          response: result.response.text() || '',
        };
      } catch (error: any) {
        console.error(`Error getting response from ${context.crewName}:`, error);
        return {
          crewId: context.crewId,
          crewName: context.crewName,
          response: `응답 생성 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
        };
      }
    })
  );

  return responses;
}
