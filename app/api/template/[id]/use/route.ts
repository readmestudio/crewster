import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAvatarUrl } from '@/lib/avatar';
import {
  withUsageLimit,
  createUnauthorizedResponse,
} from '@/lib/middleware';

interface Params {
  params: Promise<{ id: string }>;
}

// POST: Create a crew from a template
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Check auth and crew creation limit
    const result = await withUsageLimit(request, 'crew_create');
    if (!result) return createUnauthorizedResponse();
    if (result.error) return result.error;

    const { auth } = result;
    const { id } = await params;

    // Get the template
    const template = await prisma.crewTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get optional overrides from request body
    const body = await request.json().catch(() => ({}));

    // Create crew from template
    const avatarUrl = generateAvatarUrl(body.name || template.name);
    const crew = await prisma.crew.create({
      data: {
        name: body.name || template.name,
        role: body.role || template.role,
        instructions: body.instructions || template.instructions,
        avatarUrl,
        userId: auth.userId,
      },
    });

    // Increment template usage count
    await prisma.crewTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({ crew }, { status: 201 });
  } catch (error) {
    console.error('Crew creation from template error:', error);
    return NextResponse.json(
      { error: 'Failed to create crew from template' },
      { status: 500 }
    );
  }
}
