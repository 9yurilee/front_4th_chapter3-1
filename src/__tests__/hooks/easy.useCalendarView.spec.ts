import { act, renderHook, waitFor } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

// 테스트 전 전체에서 사용할 시스템 시간을 고정합니다.
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-10-01T00:00:00'));
});

// 테스트가 끝난 후 시스템 시간 복구
afterAll(() => {
  vi.useRealTimers();
});

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2024-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.currentDate).toEqual(new Date('2024-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    // 사용하지 않으면, useEffect에 의해 예약된 비동기 작업이 실행되지 않아 holidays 상태가 초기 상태 그대로 남아 있을 수 있다.
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.holidays).toEqual({
      '2024-10-03': '개천절',
      '2024-10-09': '한글날',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

// ★★★
it("주간 뷰에서 다음으로 navigate시 7일 후 '2024-10-08' 날짜로 지정이 된다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  // 상태 업데이트가 완료될 때까지 대기
  await waitFor(() => {
    expect(result.current.view).toBe('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  // 현지 시간으로 해석하기 위해 '2024-10-08T00:00:00' 사용
  assertDate(result.current.currentDate, new Date('2024-10-08T00:00:00'));
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2024-09-24' 날짜로 지정이 된다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  // 상태 업데이트가 완료될 때까지 대기
  await waitFor(() => {
    expect(result.current.view).toBe('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2024-09-24T00:00:00'));
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2024-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2024-11-01T00:00:00'));
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2024-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2024-09-01T00:00:00'));
});

it("currentDate가 '2024-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2024-01-01T00:00:00'));
  });

  expect(result.current.holidays).toEqual({ '2024-01-01': '신정' });
});
