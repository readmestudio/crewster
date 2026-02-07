import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthWithSubscription, createUnauthorizedResponse } from '@/lib/middleware';
import { rateLimit } from '@/lib/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Get a single template
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const { id } = await params;

    const template = await prisma.crewTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PATCH: Update a template (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const template = await prisma.crewTemplate.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.role && { role: body.role }),
        ...(body.instructions && { instructions: body.instructions }),
        ...(body.description && { description: body.description }),
        ...(body.iconEmoji && { iconEmoji: body.iconEmoji }),
        ...(body.category && { category: body.category }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a template (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const { id } = await params;

    await prisma.crewTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Template delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
