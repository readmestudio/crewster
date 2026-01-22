import cron from 'node-cron';
import { prisma } from './db';
import { sendKakaoNotification } from './kakao';

// 매일 오전 9시에 알림톡 발송
export function startNotificationScheduler() {
  // 실제 운영 환경에서는 매일 오전 9시: '0 9 * * *'
  // 테스트용: 매 분마다 (개발용)
  const schedule = process.env.NODE_ENV === 'production' 
    ? '0 9 * * *' 
    : '*/1 * * * *'; // 개발용: 1분마다

  cron.schedule(schedule, async () => {
    try {
      console.log('Starting daily notification...');
      
      // 오늘 날짜
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 오늘 아직 알림을 받지 않은 활성 사용자 찾기
      const users = await prisma.user.findMany({
        where: {
          // 최근 7일 이내 활동한 사용자
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      for (const user of users) {
        // 오늘 이미 체크인한 사용자는 제외
        const todayCheckIn = await prisma.dailyCheckIn.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: today,
            },
          },
        });

        if (todayCheckIn) {
          continue; // 이미 오늘 체크인한 사용자는 스킵
        }

        // 알림톡 발송 (실제 구현 시 사용자의 전화번호가 필요)
        // 여기서는 예시로만 작성
        try {
          // await sendKakaoNotification(
          //   user.phoneNumber, // 사용자 전화번호 (추가 필요)
          //   'template_id',
          //   {
          //     '#{nickname}': user.nickname || '사용자',
          //   }
          // );
          console.log(`Notification sent to user ${user.id}`);
        } catch (error) {
          console.error(`Failed to send notification to user ${user.id}:`, error);
        }
      }

      console.log('Daily notification completed');
    } catch (error) {
      console.error('Notification scheduler error:', error);
    }
  });

  console.log('Notification scheduler started');
}
