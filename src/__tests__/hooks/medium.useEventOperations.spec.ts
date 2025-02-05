import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// mocking 함수(() => {}) 생성
const toastFn = vi.fn();

// @chakra-ui/react 모듈을 재정의 하는 역할
vi.mock('@chakra-ui/react', async () => {
  // 원래의 모듈(export) 내용을 가져온 후
  const actual = await vi.importActual('@chakra-ui/react');

  return {
    ...actual, // 원래 모듈의 모든 export를 유지
    useToast: () => toastFn, // 새롭게 정의
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));
  ``;
  await waitFor(() => {
    expect(result.current.events).toBeDefined();
    expect(result.current.events.length).toBeGreaterThan(0);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const mockEvent: Event = {
    id: '999',
    title: '새로운 이벤트',
    date: new Date().toISOString(),
    startTime: '12:00',
    endTime: '13:00',
    description: '설명',
    location: '장소',
    category: '카테고리',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };

  setupMockHandlerCreation([mockEvent]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(mockEvent);

    // 타이머 진행
    vi.advanceTimersByTime(500);
  });

  await waitFor(() => {
    expect(result.current.events.find((e) => e.id === mockEvent.id)).toBeDefined();
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating(); // Mock 핸들러 적용

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  const updatedEvent: Partial<Event> = {
    id: '2',
    title: '변경할 이벤트명',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent as Event);

    vi.advanceTimersByTime(500);
  });

  await waitFor(() => {
    const event = result.current.events.find((e) => e.id === updatedEvent.id);

    expect(event?.title).toBe(updatedEvent.title);
    expect(event?.endTime).toBe(updatedEvent.endTime);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => result.current.events.length > 0);

  expect(result.current.events).toHaveLength(1);

  await act(async () => {
    await result.current.deleteEvent('1');
  });
  await waitFor(() => result.current.events.length === 0);

  expect(result.current.events).toHaveLength(0);

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
    })
  );
});

// ★ HAVE TO CHECK ★
it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // GET 요청 실패를 강제
  server.use(
    http.get('/api/events', (_, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: '서버 에러' }));
    })
  );

  renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });
});

// ★ HAVE TO CHECK ★
it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const mockEvent: Event = {
    id: 'not-existing',
    title: '존재하지 않는 이벤트',
    date: new Date().toISOString(),
    startTime: '08:00',
    endTime: '09:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };

  // msw 핸들러에서 404 응답을 주도록 설정
  server.use(
    http.put(`/api/events/${mockEvent.id}`, (_, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: '이벤트를 찾을 수 없습니다.' }));
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(mockEvent);

    vi.advanceTimersByTime(500);
  });

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      })
    );
  });
});

// ★ HAVE TO CHECK ★
it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const mockEvent: Event = {
    id: '9999',
    title: '네트워크 에러 이벤트',
    date: new Date().toISOString(),
    startTime: '16:00',
    endTime: '17:00',
    description: '',
    location: '장소',
    category: '카테고리',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };

  // GET 요청: 초기 이벤트 데이터에 mockEvent가 포함되도록 설정
  server.use(
    http.get('/api/events', (_, res, ctx) => {
      return HttpResponse.json({ events: [mockEvent] });
    })
  );

  // DELETE 요청: 네트워크 오류를 강제 (PUT, POST 등과 다르게 DELETE 요청 시 엔드포인트는 /api/events/{id} 형식)
  server.use(
    http.delete(`/api/events/${mockEvent.id}`, (_, res, ctx) => {
      return res.networkError('네트워크 오류');
    })
  );

  // useEventOperations 훅은 마운트 시 내부에서 fetchEvents()를 호출하여 이벤트를 로드합니다.
  const { result } = renderHook(() => useEventOperations(false));

  // 초기 데이터 로딩 완료를 기다립니다.
  await waitFor(() => {
    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.events.find((e) => e.id === mockEvent.id)).toBeDefined();
  });

  // 삭제 요청 실행: 네트워크 오류로 인해 삭제가 실패해야 합니다.
  await act(async () => {
    await result.current.deleteEvent(mockEvent.id);
  });

  // 삭제 요청 후, 에러 토스트가 호출되고 상태에는 여전히 이벤트가 남아있는지 확인합니다.
  await waitFor(() => {
    // 토스트가 '일정 삭제 실패' 에러 메시지로 호출되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
      })
    );
    // 삭제 실패 시, 이벤트는 상태에 그대로 남아 있어야 합니다.
    expect(result.current.events.find((e) => e.id === mockEvent.id)).toBeDefined();
  });
});
