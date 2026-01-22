// GPT-4o를 사용한 크루 에이전트 통신
import OpenAI from 'openai';

// API 키 검증
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CrewChatContext {
  crewId: string;
  crewName: string;
  role: string;
  instructions: string;
  sessionId: string;
  previousMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  dmHistory?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export async function getCrewResponse(
  userMessage: string,
  context: CrewChatContext
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = `당신은 ${context.crewName}입니다. 역할: ${context.role}

${context.instructions}

대화 스타일:
- 전문적이면서도 친근한 톤
- 명확하고 실용적인 답변
- 사용자의 요구사항을 정확히 이해하고 실행

항상 한국어로 응답하세요.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // 이전 대화 기록 추가 (최근 20개만)
  if (context.previousMessages) {
    const recentMessages = context.previousMessages.slice(-20);
    recentMessages.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

  // 사용자 메시지 추가
  messages.push({ role: 'user', content: userMessage });

  // API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 추가하세요.');
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // 스트림을 ReadableStream으로 변환
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('스트리밍 중 오류:', error);
          controller.error(error);
        }
      },
    });

    return readableStream;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // 더 자세한 오류 메시지 제공
    if (error?.status === 401) {
      throw new Error('OpenAI API 키가 유효하지 않습니다. .env 파일의 OPENAI_API_KEY를 확인하세요.');
    } else if (error?.status === 429) {
      throw new Error('OpenAI API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.');
    } else if (error?.message) {
      throw new Error(`OpenAI API 오류: ${error.message}`);
    } else {
      throw new Error(`크루 응답 생성 중 오류가 발생했습니다: ${error?.toString() || '알 수 없는 오류'}`);
    }
  }
}

export async function getCrewResponseNonStreaming(
  userMessage: string,
  context: CrewChatContext
): Promise<string> {
  const systemPrompt = `당신은 ${context.crewName}입니다. 역할: ${context.role}

${context.instructions}

대화 스타일:
- 전문적이면서도 친근한 톤
- 명확하고 실용적인 답변
- 사용자의 요구사항을 정확히 이해하고 실행

항상 한국어로 응답하세요.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (context.previousMessages) {
    const recentMessages = context.previousMessages.slice(-20);
    recentMessages.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

  messages.push({ role: 'user', content: userMessage });

  // API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 추가하세요.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || '죄송합니다. 다시 말씀해주실 수 있을까요?';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // 더 자세한 오류 메시지 제공
    if (error?.status === 401) {
      throw new Error('OpenAI API 키가 유효하지 않습니다. .env 파일의 OPENAI_API_KEY를 확인하세요.');
    } else if (error?.status === 429) {
      throw new Error('OpenAI API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.');
    } else if (error?.message) {
      throw new Error(`OpenAI API 오류: ${error.message}`);
    } else {
      throw new Error(`크루 응답 생성 중 오류가 발생했습니다: ${error?.toString() || '알 수 없는 오류'}`);
    }
  }
}

// 멀티 에이전트 그룹 채팅용
export async function getGroupChatResponse(
  userMessage: string,
  contexts: CrewChatContext[],
  previousMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string; crewId?: string }>
): Promise<Array<{ crewId: string; crewName: string; response: string }>> {
  const responses: Array<{ crewId: string; crewName: string; response: string }> = [];

  // 각 크루가 순차적으로 응답
  for (const context of contexts) {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `당신은 ${context.crewName}입니다. 역할: ${context.role}

${context.instructions}

현재 그룹 채팅에서 다른 크루들과 협업하고 있습니다. 사용자의 요청에 대해 전문적인 답변을 제공하세요. 
마스터(사용자)에게 다음 액션을 요구할 수 있는 질문이나 제안을 포함해주세요.

${context.dmHistory && context.dmHistory.length > 0 
  ? `\n중요: 아래는 마스터와의 이전 1:1 대화(DM) 히스토리입니다. 이 대화 내용을 참고하여 그룹 챗에서 일관성 있게 답변하세요.\n` 
  : ''}

대화 스타일:
- 전문적이면서도 친근한 톤
- 명확하고 실용적인 답변
- 다른 크루들의 의견을 고려하여 답변
- 마스터에게 구체적인 액션 힌트 제공
- 이전 DM 대화에서 나눈 내용을 참고하여 일관성 유지

항상 한국어로 응답하세요.`,
      },
    ];

    // DM 히스토리 추가 (이전 1:1 대화)
    if (context.dmHistory && context.dmHistory.length > 0) {
      messages.push({
        role: 'system',
        content: `[이전 DM 대화 히스토리]\n${context.dmHistory.map((msg, idx) => 
          `${msg.role === 'user' ? '[마스터]' : '[나]'}: ${msg.content}`
        ).join('\n')}\n[DM 히스토리 끝]`,
      });
    }

    // 이전 대화 기록 추가 (간소화)
    if (previousMessages && previousMessages.length > 0) {
      const recentMessages = previousMessages.slice(-10);
      recentMessages.forEach((msg) => {
        if (msg.role === 'user') {
          messages.push({
            role: 'user',
            content: `[마스터]: ${msg.content}`,
          });
        } else if (msg.role === 'assistant') {
          messages.push({
            role: 'assistant',
            content: msg.crewId === context.crewId 
              ? `[나]: ${msg.content}`
              : `[다른 크루]: ${msg.content}`,
          });
        }
      });
    }

    messages.push({ role: 'user', content: `[마스터]: ${userMessage}` });

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다.');
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      responses.push({
        crewId: context.crewId,
        crewName: context.crewName,
        response,
      });
    } catch (error: any) {
      console.error(`Error getting response from ${context.crewName}:`, error);
      const errorMessage = error?.message || '알 수 없는 오류';
      responses.push({
        crewId: context.crewId,
        crewName: context.crewName,
        response: `응답 생성 중 오류가 발생했습니다: ${errorMessage}`,
      });
    }
  }

  return responses;
}