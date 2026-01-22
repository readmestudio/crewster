// 아바타 생성 유틸리티
// DiceBear API를 사용하여 노션 스타일의 얼굴 아이콘 생성

export function generateAvatarUrl(name: string, style: 'notion' | 'avataaars' = 'notion'): string {
  // DiceBear API 사용
  // notionists 스타일 사용 (하얀 선만의 캐리커쳐)
  const seed = name.toLowerCase().replace(/\s+/g, '-');
  const baseUrl = 'https://api.dicebear.com/8.x';
  
  if (style === 'notion') {
    // notionists 스타일 사용 (하얀 선만의 캐리커쳐)
    return `${baseUrl}/notionists/svg?seed=${seed}`;
  }
  
  return `${baseUrl}/notionists/svg?seed=${seed}`;
}

export function getAvatarUrl(crewId: string, name: string): string {
  // 로컬 스토리지에서 아바타 URL 확인
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`crew_avatar_${crewId}`);
    if (stored) return stored;
  }
  
  // 없으면 생성
  return generateAvatarUrl(name);
}