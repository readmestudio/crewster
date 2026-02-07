// 슬랙 전송 API
import { NextRequest, NextResponse } from 'next/server';
import { sendSlackMessage, markdownToSlackBlocks } from '@/lib/slack';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const body = await request.json();
    const { channel, text, token, threadTs } = body;

    if (!channel || !text) {
      return NextResponse.json(
        { error: 'channel과 text는 필수입니다.' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: '슬랙 봇 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    const blocks = markdownToSlackBlocks(text);

    const result = await sendSlackMessage(
      {
        channel,
        text,
        blocks,
        threadTs,
      },
      token
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('슬랙 전송 오류:', error);
    return NextResponse.json(
      { error: error.message || '슬랙 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}