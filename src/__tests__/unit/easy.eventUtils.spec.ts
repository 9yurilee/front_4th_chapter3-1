import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'event 1',
      date: '2024-07-01',
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
      title: 'event 2',
      date: '2024-07-21',
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
      title: 'event 3',
      date: '2024-09-07',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 0,
    },
  ];

  // NOTE 대소문자 테스트 케이스를 위해 검색어도 영어로 변환하였습니다.
  it("검색어 'event 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, 'event 2', new Date('2024-07-09'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockEvents.find((event) => event.title === 'event 2'));
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockEvents.find((event) => event.date === '2024-07-01'));
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');

    expect(result).toHaveLength(2);
  });

  // NOTE 대소문자 테스트 케이스를 위해 검색어도 영어로 변환하였습니다.
  it("검색어 'event'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, 'event', new Date('2024-07-24'), 'week');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const resultByMonth = getFilteredEvents(mockEvents, '', new Date('2024-07-15'), 'month');
    expect(resultByMonth).toHaveLength(2);

    const resultByWeek = getFilteredEvents(mockEvents, '', new Date('2024-07-24'), 'week');
    expect(resultByWeek).toHaveLength(1);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const resultLower = getFilteredEvents(mockEvents, 'event 1', new Date('2024-07-15'), 'month');
    const resultUpper = getFilteredEvents(
      mockEvents,
      'event 1'.toUpperCase(),
      new Date('2024-07-15'),
      'month'
    );

    expect(resultLower).toEqual(resultUpper);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const eventsWithBoundary: Event[] = [
      ...mockEvents,
      {
        id: '4',
        title: 'Boundary Event',
        date: '2024-07-31',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0, endDate: '' },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(eventsWithBoundary, '', new Date('2024-07-15'), 'month');
    expect(result).toHaveLength(3);

    const resultIds = result.map((e) => e.id);
    expect(resultIds).toEqual(expect.arrayContaining(['1', '2', '4']));
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const resultByMonth = getFilteredEvents([], '', new Date('2024-07-15'), 'month');
    const resultByWeek = getFilteredEvents([], '', new Date('2024-07-15'), 'week');

    expect(resultByMonth).toHaveLength(0);
    expect(resultByWeek).toHaveLength(0);
  });
});
