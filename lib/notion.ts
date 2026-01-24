// 노션 API 클라이언트
import { Client } from '@notionhq/client';

let notionClient: Client | null = null;

export function getNotionClient(apiKey?: string): Client | null {
  const key = apiKey || process.env.NOTION_API_KEY;
  if (!key) return null;

  if (!notionClient) {
    notionClient = new Client({ auth: key });
  }
  return notionClient;
}

export interface NotionPage {
  title: string;
  content: string; // 마크다운 형식
  parentPageId?: string;
}

export async function createNotionPage(
  page: NotionPage,
  apiKey?: string
): Promise<{ pageId: string; url: string } | null> {
  const client = getNotionClient(apiKey);
  if (!client) {
    throw new Error('노션 API 키가 설정되지 않았습니다.');
  }

  if (!page.parentPageId) {
    throw new Error('노션 페이지를 생성하려면 parentPageId가 필요합니다.');
  }

  try {
    // 마크다운을 노션 블록으로 변환
    const blocks = markdownToNotionBlocks(page.content);

    const response = await client.pages.create({
      parent: { page_id: page.parentPageId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: page.title,
              },
            },
          ],
        },
      },
      children: blocks,
    });

    return {
      pageId: response.id,
      url: (response as any).url || `https://notion.so/${response.id.replace(/-/g, '')}`,
    };
  } catch (error) {
    console.error('노션 페이지 생성 오류:', error);
    throw error;
  }
}

// 간단한 마크다운을 노션 블록으로 변환
function markdownToNotionBlocks(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    // 헤딩 처리
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
        },
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: line.substring(3) } }],
        },
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.substring(4) } }],
        },
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // 리스트 아이템
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
        },
      });
    } else {
      // 일반 텍스트
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: line } }],
        },
      });
    }
  }

  return blocks;
}

// 마크다운을 클립보드에 복사하는 유틸리티
export async function copyMarkdownToClipboard(markdown: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (error) {
    console.error('클립보드 복사 오류:', error);
    return false;
  }
}