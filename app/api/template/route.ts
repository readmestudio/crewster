import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthWithSubscription, createUnauthorizedResponse } from '@/lib/middleware';
import { rateLimit } from '@/lib/rate-limit';

// GET: Get all public templates
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const templates = await prisma.crewTemplate.findMany({
      where: {
        isPublic: true,
        ...(category && { category }),
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST: Create a new template (admin only - for now just allow authenticated users)
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const body = await request.json();
    const { name, role, instructions, description, iconEmoji, category, isPublic } = body;

    if (!name || !role || !instructions || !description) {
      return NextResponse.json(
        { error: 'Name, role, instructions, and description are required' },
        { status: 400 }
      );
    }

    const template = await prisma.crewTemplate.create({
      data: {
        name,
        role,
        instructions,
        description,
        iconEmoji: iconEmoji || '🤖',
        category: category || 'general',
        isPublic: isPublic ?? true,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
