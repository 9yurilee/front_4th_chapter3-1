import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('유효하지 않은 월(0 이하)에 대해 예외를 던진다', () => {
    expect(() => getDaysInMonth(2024, 0)).toThrow('월은 1부터 12 사이여야 합니다.');
    expect(() => getDaysInMonth(2024, -1)).toThrow('월은 1부터 12 사이여야 합니다.');
  });

  it('유효하지 않은 월(13 이상)에 대해 예외를 던진다', () => {
    expect(() => getDaysInMonth(2024, 13)).toThrow('월은 1부터 12 사이여야 합니다.');
    expect(() => getDaysInMonth(2024, 20)).toThrow('월은 1부터 12 사이여야 합니다.');
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date('2025-02-05');

    expect(getWeekDates(wednesday)[0]).toEqual(new Date('2025-02-02'));
    expect(getWeekDates(wednesday)[6]).toEqual(new Date('2025-02-08'));
  });

  // NOTE: 함수에 맞게 주의 시작을 일요일로 변경했습니다.
  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2025-02-02');

    expect(getWeekDates(sunday)[0]).toEqual(new Date('2025-02-02'));
    expect(getWeekDates(sunday)[6]).toEqual(new Date('2025-02-08'));
  });

  // NOTE: 함수에 맞게 주의 끝을 토요일로 변경했습니다.
  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const saturday = new Date('2025-02-08');

    expect(getWeekDates(saturday)[6]).toEqual(new Date('2025-02-08'));
    expect(getWeekDates(saturday)[0]).toEqual(new Date('2025-02-02'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const endOfYear = new Date('2024-12-31');

    expect(getWeekDates(endOfYear)[0]).toEqual(new Date('2024-12-29'));
    expect(getWeekDates(endOfYear)[6]).toEqual(new Date('2025-01-04'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const endOfYear = new Date('2025-01-01');

    expect(getWeekDates(endOfYear)[0]).toEqual(new Date('2024-12-29'));
    expect(getWeekDates(endOfYear)[6]).toEqual(new Date('2025-01-04'));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // 2024
    const leapDay = new Date('2024-02-29');

    expect(getWeekDates(leapDay)[0]).toEqual(new Date('2024-02-25'));
    expect(getWeekDates(leapDay)[6]).toEqual(new Date('2024-03-02'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const endOfMonth = new Date('2025-01-31');

    expect(getWeekDates(endOfMonth)[0]).toEqual(new Date('2025-01-26'));
    expect(getWeekDates(endOfMonth)[6]).toEqual(new Date('2025-02-01'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const targetDate = new Date('2024-07-01');

    expect(getWeeksAtMonth(targetDate)).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const dummyEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-02-01T00:00:00.000Z', // 1일
      startTime: '09:00',
      endTime: '10:00',
      description: 'Description 1',
      location: 'Location 1',
      category: '업무',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-02-02T00:00:00.000Z', // 2일
      startTime: '11:00',
      endTime: '12:00',
      description: 'Description 2',
      location: 'Location 2',
      category: '개인',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 15,
    },
    {
      id: '3',
      title: 'Event 3',
      date: '2025-02-01T00:00:00.000Z',
      startTime: '13:00',
      endTime: '14:00',
      description: 'Description 3',
      location: 'Location 3',
      category: '가족',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 5,
    },
    {
      id: '4',
      title: 'Event 4',
      date: '2025-02-03T00:00:00.000Z',
      startTime: '15:00',
      endTime: '16:00',
      description: 'Description 4',
      location: 'Location 4',
      category: '기타',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 20,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    expect(getEventsForDay(dummyEvents, 1)).toHaveLength(2);
    expect(getEventsForDay(dummyEvents, 1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({ id: '3' }),
      ])
    );
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(dummyEvents, 5)).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(dummyEvents, 0)).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(dummyEvents, 32)).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-01-15');

    expect(formatWeek(targetDate)).toBe('2025년 1월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-01-03');

    expect(formatWeek(targetDate)).toBe('2025년 1월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-01-27');

    expect(formatWeek(targetDate)).toBe('2025년 1월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2024-12-31');

    expect(formatWeek(targetDate)).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const leapDay = new Date('2024-02-29');

    expect(formatWeek(leapDay)).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const endOfFeb = new Date('2025-02-28');

    expect(formatWeek(endOfFeb)).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    expect(formatMonth(new Date('2024-07-10'))).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2024-07-10'), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2024-07-01'), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2024-07-31'), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2024-06-30'), rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2024-08-01'), rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const wrongRangeStart = new Date('2024-08-01');
    const wrongRangeEnd = new Date('2024-07-01');

    expect(isDateInRange(new Date('2024-07-15'), wrongRangeStart, wrongRangeEnd)).toBe(false);
    expect(isDateInRange(new Date('2024-08-05'), wrongRangeStart, wrongRangeEnd)).toBe(false);
    expect(isDateInRange(new Date('2024-07-01'), wrongRangeStart, wrongRangeEnd)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(1)).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1000, 3)).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const targetDate = new Date('2025-09-07');

    expect(formatDate(targetDate)).toBe('2025-09-07');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const targetDate = new Date('2025-09-10');

    expect(formatDate(targetDate, 7)).toBe('2025-09-07');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const targetDate = new Date('2025-9-07');

    expect(formatDate(targetDate)).toBe('2025-09-07');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const targetDate = new Date('2025-09-7');

    expect(formatDate(targetDate)).toBe('2025-09-07');
  });
});
