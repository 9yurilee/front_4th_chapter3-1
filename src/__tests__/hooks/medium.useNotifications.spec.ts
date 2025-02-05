import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  date: new Date().toISOString(),
  startTime: '10:00',
  endTime: '11:00',
  description: 'Test description',
  location: 'Test location',
  category: 'Test category',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 0,
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications([]));

  // 알림 추가
  act(() => {
    result.current.setNotifications([{ id: '1', message: 'Test Notification' }]);
  });

  expect(result.current.notifications).toHaveLength(1);

  // 알림 제거 함수 호출
  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {});
