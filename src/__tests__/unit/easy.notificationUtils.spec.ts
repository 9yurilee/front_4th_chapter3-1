import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvent: Event[] = [
    {
      id: '1',
      title: 'event 1',
      date: '2024-09-07',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 30,
    },
  ];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-09-07T10:00:00');
    const result = getUpcomingEvents(mockEvent, now, []);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockEvent.find((event) => event.date === '2024-09-07'));
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-09-07T10:40:00');
    const result = getUpcomingEvents(mockEvent, now, []);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-09-07T09:50:00');
    const result = getUpcomingEvents(mockEvent, now, []);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-09-07T10:40:00');
    const result = getUpcomingEvents(mockEvent, now, []);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: 'test',
      date: '2024-09-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 10,
    };

    const result = createNotificationMessage(mockEvent);

    expect(result).toBe('10분 후 test 일정이 시작됩니다.');
  });
});
