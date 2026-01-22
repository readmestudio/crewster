import axios from 'axios';

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const KAKAO_ADMIN_KEY = process.env.KAKAO_ADMIN_KEY;

export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  refresh_token_expires_in: number;
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
    };
    has_email?: boolean;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
  };
}

// 카카오톡 로그인 URL 생성
export function getKakaoLoginUrl(): string {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID || '',
    redirect_uri: KAKAO_REDIRECT_URI || '',
    response_type: 'code',
  });
  return `${baseUrl}?${params.toString()}`;
}

// 카카오톡 액세스 토큰 발급
export async function getKakaoToken(code: string): Promise<KakaoTokenResponse> {
  const response = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID || '',
      client_secret: KAKAO_CLIENT_SECRET || '',
      redirect_uri: KAKAO_REDIRECT_URI || '',
      code,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
}

// 카카오톡 사용자 정보 조회
export async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
  const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

// 카카오톡 알림톡 발송
export async function sendKakaoNotification(
  phoneNumber: string,
  templateId: string,
  templateArgs: Record<string, string>
): Promise<void> {
  if (!KAKAO_ADMIN_KEY) {
    throw new Error('KAKAO_ADMIN_KEY is not set');
  }

  await axios.post(
    'https://kapi.kakao.com/v1/notifications/send',
    {
      receiver_uuids: [phoneNumber],
      template_id: templateId,
      template_args: templateArgs,
    },
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
}
