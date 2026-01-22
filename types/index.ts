export interface User {
  id: string;
  kakaoId: string;
  nickname: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: Date;
  emotion: string;
  intensity: number;
  memo: string | null;
  createdAt: Date;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: Date;
  category: string | null;
  beforeThoughts: string | null;
  afterThoughts: string | null;
  hotThought: string | null;
  balancedThought: string | null;
  createdAt: Date;
}

export interface Internalization {
  id: string;
  userId: string;
  date: Date;
  positiveStatement: string;
  createdAt: Date;
}

export interface UserResponse {
  id: string;
  userId: string;
  date: Date;
  question: string;
  answer: string;
  context: string | null;
  createdAt: Date;
}

export interface CounselorComment {
  id: string;
  userId: string;
  date: Date;
  comment: string;
  counselorId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  coreBeliefs: string | null;
  mainEmotions: string | null;
  emotionChanges: string | null;
  reportData: string | null;
  counselorComment: string | null;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'counselor';
  content: string;
  timestamp: Date;
}

export interface Emotion {
  label: string;
  value: string;
}

// AI 크루 팀 구축 플랫폼 타입
export interface Crew {
  id: string;
  name: string;
  role: string;
  instructions: string;
  avatarUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  type: 'direct' | 'group';
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  crewMembers?: Crew[];
}

export interface Message {
  id: string;
  sessionId: string;
  crewId: string | null;
  content: string;
  role: 'user' | 'assistant' | 'system';
  metadata: string | null;
  createdAt: Date;
  crew?: Crew | null;
}

export interface Thread {
  id: string;
  sessionId: string;
  parentMessageId: string | null;
  title: string | null;
  createdAt: Date;
}

export interface Optimization {
  id: string;
  crewId: string;
  previousInstructions: string;
  newInstructions: string;
  reason: string | null;
  createdAt: Date;
}
