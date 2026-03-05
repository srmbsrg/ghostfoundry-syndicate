/**
 * Dark Factory - Artifact API
 * GET /api/dark-factory/artifacts/[artifactId]
 * 
 * Returns the full content of a generated artifact
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ artifactId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { artifactId } = await context.params;

    if (!artifactId) {
      return NextResponse.json(
        { error: 'Artifact ID is required' },
        { status: 400 }
      );
    }

    const artifact = await prisma.generatedArtifact.findUnique({
      where: { id: artifactId },
      include: {
        task: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: artifact.id,
      taskId: artifact.taskId,
      taskStatus: artifact.task.status,
      type: artifact.type,
      path: artifact.path,
      content: artifact.content,
      checksum: artifact.checksum,
      version: artifact.version,
      deployed: artifact.deployed,
      createdAt: artifact.createdAt,
    });

  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
}
