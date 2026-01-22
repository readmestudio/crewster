import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatContext {
  userId: string;
  date: string;
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentStep?: number;
  category?: string;
  emotion?: string;
  intensity?: number;
}

export async function getCounselorResponse(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  const systemPrompt = `당신은 따뜻하고 공감적인 상담사입니다. 사용자와 대화를 나누며 일기를 작성하도록 도와주세요.

주요 역할:
1. 사용자의 감정을 공감하고 이해합니다
2. Before/After 일기 작성 과정을 자연스럽게 이끕니다
3. 사용자가 자신의 생각을 깊이 탐구할 수 있도록 질문합니다
4. 회복지향적이고 균형잡힌 시각으로 전환하도록 돕습니다

대화 스타일:
- 따뜻하고 친근한 톤
- 공감과 이해를 먼저 표현
- 판단하지 않고 수용하는 자세
- 적절한 질문으로 깊이 있는 탐구 유도

현재 상황:
- 날짜: ${context.date}
- 감정: ${context.emotion || '미설정'}
- 강도: ${context.intensity || '미설정'}
${context.category ? `- 카테고리: ${context.category}` : ''}
${context.currentStep ? `- 현재 단계: ${context.currentStep}` : ''}

사용자의 답변을 듣고, 다음 단계로 자연스럽게 이끌어주세요.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // 이전 대화 기록 추가
  if (context.previousMessages) {
    context.previousMessages.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });
  }

  // 사용자 메시지 추가
  messages.push({ role: 'user', content: userMessage });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '죄송합니다. 다시 말씀해주실 수 있을까요?';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('상담사 응답 생성 중 오류가 발생했습니다.');
  }
}
