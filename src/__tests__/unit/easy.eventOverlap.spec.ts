import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const mockEvent: Event = {
  id: '6',
  title: 'Test Event',
  date: '2025-09-07',
  startTime: '09:00',
  endTime: '10:00',
  description: 'Test description',
  location: 'Test location',
  category: 'Test',
  repeat: { type: 'none', interval: 0, endDate: '' },
  notificationTime: 15,
};

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const wrongDate = parseDateTime('invalid-date', '14:30');

    expect(isNaN(wrongDate.getTime())).toBe(true);
    expect(isNaN(wrongDate.getMinutes())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const wrongTime = parseDateTime('2024-07-01', 'invalid-time');

    expect(isNaN(wrongTime.getFullYear())).toBe(true);
    expect(isNaN(wrongTime.getMonth())).toBe(true);
    expect(isNaN(wrongTime.getMinutes())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(isNaN(parseDateTime('', '14:30').getTime())).toBe(true);
    expect(isNaN(parseDateTime('', '14:30').getMinutes())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(mockEvent);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(8);
    expect(result.start.getDate()).toBe(7);
    expect(result.start.getHours()).toBe(9);
    expect(result.start.getMinutes()).toBe(0);

    expect(result.end.getFullYear()).toBe(2025);
    expect(result.end.getMonth()).toBe(8);
    expect(result.end.getDate()).toBe(7);
    expect(result.end.getHours()).toBe(10);
    expect(result.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongDateEvent: Event = {
      id: '6',
      title: 'Test Event',
      date: 'Invalid Date',
      startTime: '09:00',
      endTime: '10:00',
      description: 'Test description',
      location: 'Test location',
      category: 'Test',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 15,
    };

    const result = convertEventToDateRange(wrongDateEvent);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongTimeEvent: Event = {
      id: '6',
      title: 'Test Event',
      date: '2025-09-07',
      startTime: 'Invalid Time',
      endTime: 'Invalid Time',
      description: 'Test description',
      location: 'Test location',
      category: 'Test',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 15,
    };

    const wrongTimeResult = convertEventToDateRange(wrongTimeEvent);

    expect(isNaN(wrongTimeResult.start.getMonth())).toBe(true);
    expect(isNaN(wrongTimeResult.end.getMonth())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const validEvent: Event = {
      id: '6',
      title: 'Test Event',
      date: '2025-09-07',
      startTime: '09:30',
      endTime: '10:00',
      description: 'Test description',
      location: 'Test location',
      category: 'Test',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 15,
    };

    expect(isOverlapping(mockEvent, validEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const invalidEvent: Event = {
      id: '6',
      title: 'Test Event',
      date: '2025-09-07',
      startTime: '10:30',
      endTime: '11:00',
      description: 'Test description',
      location: 'Test location',
      category: 'Test',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 15,
    };

    expect(isOverlapping(mockEvent, invalidEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-09-07',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 0,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-09-07',
      startTime: '09:30',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 0,
    },
    {
      id: '3',
      title: 'Event 3',
      date: '2025-09-07',
      startTime: '12:19',
      endTime: '12:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 0,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    // 새 이벤트: 2024-07-01 09:45 ~ 10:15, id: '4'
    const validNewEvent: Event = {
      id: '4',
      title: 'New Event',
      date: '2025-09-07',
      startTime: '12:21',
      endTime: '12:25',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 0,
    };

    expect(findOverlappingEvents(validNewEvent, mockEvents)).toHaveLength(1);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    // 새 이벤트: 2024-07-01 09:45 ~ 10:15, id: '4'
    const invalidNewEvent: Event = {
      id: '3',
      title: 'New Event',
      date: '2025-09-07',
      startTime: '18:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 0,
    };

    expect(findOverlappingEvents(invalidNewEvent, mockEvents)).toHaveLength(0);
  });
});
