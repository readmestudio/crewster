// 슬랙 API 클라이언트
import { WebClient } from '@slack/web-api';

let slackClient: WebClient | null = null;

export function getSlackClient(token?: string): WebClient | null {
  const slackToken = token || process.env.SLACK_BOT_TOKEN;
  if (!slackToken) return null;

  if (!slackClient) {
    slackClient = new WebClient(slackToken);
  }
  return slackClient;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  threadTs?: string; // 쓰레드에 답변할 때 사용
}

export async function sendSlackMessage(
  message: SlackMessage,
  token?: string
): Promise<{ ts: string; channel: string } | null> {
  const client = getSlackClient(token);
  if (!client) {
    throw new Error('슬랙 봇 토큰이 설정되지 않았습니다.');
  }

  try {
    const response = await client.chat.postMessage({
      channel: message.channel,
      text: message.text,
      blocks: message.blocks,
      thread_ts: message.threadTs,
    });

    if (response.ok) {
      return {
        ts: response.ts || '',
        channel: message.channel,
      };
    } else {
      throw new Error(response.error || '슬랙 메시지 전송 실패');
    }
  } catch (error) {
    console.error('슬랙 메시지 전송 오류:', error);
    throw error;
  }
}

// 마크다운을 슬랙 블록으로 변환
export function markdownToSlackBlocks(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split('\n');

  let currentSection: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (currentSection.length > 0) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: currentSection.join('\n'),
          },
        });
        currentSection = [];
      }
      continue;
    }

    // 헤딩 처리
    if (line.startsWith('# ')) {
      if (currentSection.length > 0) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: currentSection.join('\n'),
          },
        });
        currentSection = [];
      }
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: line.substring(2),
        },
      });
    } else if (line.startsWith('## ')) {
      if (currentSection.length > 0) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: currentSection.join('\n'),
          },
        });
        currentSection = [];
      }
      currentSection.push(`*${line.substring(3)}*`);
    } else {
      currentSection.push(line);
    }
  }

  if (currentSection.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: currentSection.join('\n'),
      },
    });
  }

  return blocks.length > 0 ? blocks : [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: markdown,
      },
    },
  ];
}