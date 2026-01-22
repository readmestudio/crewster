import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportId = searchParams.get('id');

    if (reportId) {
      // 특정 리포트 조회
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!report || report.userId !== auth.userId) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json({
        report,
        reportData: report.reportData ? JSON.parse(report.reportData) : null,
      });
    }

    // 사용자의 모든 리포트 조회
    const reports = await prisma.report.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Report GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
