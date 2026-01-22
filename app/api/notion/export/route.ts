// 노션 내보내기 API
import { NextRequest, NextResponse } from 'next/server';
import { createNotionPage } from '@/lib/notion';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, apiKey, parentPageId } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title과 content는 필수입니다.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: '노션 API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await createNotionPage(
      {
        title,
        content,
        parentPageId,
      },
      apiKey
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('노션 내보내기 오류:', error);
    return NextResponse.json(
      { error: error.message || '노션 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}