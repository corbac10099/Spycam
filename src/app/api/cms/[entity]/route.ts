import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API pour le CMS - Autorise GET (public) et POST/PUT/DELETE (privé, via AppControl)

const setCORSHeaders = (res: NextResponse) => {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
};

export async function OPTIONS() {
  return setCORSHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const url = new URL(request.url);
  const includeDrafts = url.searchParams.get('drafts') === 'true' || process.env.NODE_ENV === 'development';

  try {
    let data;

    switch (entity) {
      case 'news':
        data = await prisma.news.findMany({ 
          where: includeDrafts ? undefined : { isDraft: false },
          orderBy: { createdAt: 'desc' } 
        });
        // Parse nodes JSON
        data = data.map(d => ({ ...d, nodes: d.nodes ? JSON.parse(d.nodes) : [] }));
        break;
      case 'agents':
        data = await prisma.agent.findMany({ where: includeDrafts ? undefined : { isDraft: false } });
        data = data.map(d => ({ ...d, abilities: d.abilities ? JSON.parse(d.abilities) : {} }));
        break;
      case 'maps':
        data = await prisma.map.findMany({ where: includeDrafts ? undefined : { isDraft: false } });
        break;
      case 'banners':
        data = await prisma.banner.findMany({ where: includeDrafts ? undefined : { isDraft: false } });
        break;
      default:
        return setCORSHeaders(NextResponse.json({ error: 'Entity not found' }, { status: 404 }));
    }
    return setCORSHeaders(NextResponse.json(data));
  } catch (error: any) {
    return setCORSHeaders(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  
  try {
    const body = await request.json();
    let data;

    switch (entity) {
      case 'news':
        data = await prisma.news.create({
          data: {
            title: body.title,
            nodes: JSON.stringify(body.nodes || []),
            currentNodeId: body.currentNodeId || null,
            isDraft: body.isDraft ?? true,
          }
        });
        break;
      case 'agents':
        data = await prisma.agent.create({
          data: {
            uuid: body.uuid,
            name: body.name,
            role: body.role,
            iconUrl: body.iconUrl,
            abilities: JSON.stringify(body.abilities || {}),
            isDraft: body.isDraft ?? true,
          }
        });
        break;
      case 'maps':
        data = await prisma.map.create({
          data: {
            uuid: body.uuid,
            name: body.name,
            splashUrl: body.splashUrl,
            isDraft: body.isDraft ?? true,
          }
        });
        break;
      case 'banners':
        data = await prisma.banner.create({
          data: {
            name: body.name,
            wideArtUrl: body.wideArtUrl,
            isDraft: body.isDraft ?? true,
          }
        });
        break;
      default:
        return setCORSHeaders(NextResponse.json({ error: 'Entity not found' }, { status: 404 }));
    }
    
    // Parse back for response
    if (data && (data as any).nodes) (data as any).nodes = JSON.parse((data as any).nodes);
    if (data && (data as any).abilities) (data as any).abilities = JSON.parse((data as any).abilities);
    
    return setCORSHeaders(NextResponse.json(data));
  } catch (error: any) {
    return setCORSHeaders(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}
