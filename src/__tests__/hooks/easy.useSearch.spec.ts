import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-09-07',
    startTime: '10:00',
    endTime: '11:00',
    description: '프로젝트 회의',
    location: '회의실',
    category: '',
    repeat: { type: 'none', interval: 0, endDate: '' },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심',
    date: '2024-09-09',
    startTime: '12:00',
    endTime: '13:00',
    description: '점심 미팅',
    location: '식당',
    category: '',
    repeat: { type: 'none', interval: 0, endDate: '' },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '공연',
    date: '2024-09-15',
    startTime: '18:00',
    endTime: '19:00',
    description: '공연 관람',
    location: '공연장',
    category: '',
    repeat: { type: 'none', interval: 0, endDate: '' },
    notificationTime: 10,
  },
];

const currentDate = new Date('2024-09-07T00:00:00');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toHaveLength(2);
  // id로 한 번 더 검증
  expect(result.current.filteredEvents.map((event) => event.id)).toEqual(['1', '2']);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('공연');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('3');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('미팅');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('2');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {});
