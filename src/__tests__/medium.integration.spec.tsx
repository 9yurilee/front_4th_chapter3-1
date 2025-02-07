import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

const saveSchedule = async (
  user: ReturnType<typeof userEvent.setup>,
  form: Omit<EventForm, 'id'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const { user } = setup(<App />);
    const event: Omit<Event, 'id'> = {
      title: '콘서트',
      date: '2025-02-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '콘서트 관람',
      location: '고척돔',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
      category: '개인',
    };
    await saveSchedule(user, event);
    await waitFor(() => {
      expect(screen.getByLabelText('제목', { exact: false })).toHaveValue(event.title);
      expect(screen.getByLabelText('날짜', { exact: false })).toHaveValue(event.date);
      expect(screen.getByLabelText('시작 시간', { exact: false })).toHaveValue(event.startTime);
      expect(screen.getByLabelText('종료 시간', { exact: false })).toHaveValue(event.endTime);
      expect(screen.getByLabelText('설명', { exact: false })).toHaveValue(event.description);
      expect(screen.getByLabelText('위치', { exact: false })).toHaveValue(event.location);
    });
  });

  it('일정을 수정하고 변경 사항이 반영되는지 확인', async () => {
    const { user } = setup(<App />);

    const event: Omit<Event, 'id'> = {
      title: '기존 일정',
      date: '2025-02-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 설명',
      location: '회의실 B',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await saveSchedule(user, event);

    console.log(screen);
    // 일정 목록에서 해당 일정 찾기
    const eventItem = await screen.findByText(event.title);
    expect(eventItem).toBeInTheDocument();

    // 가장 가까운 div 컨테이너 찾기
    const container = eventItem.closest('div');
    expect(container).not.toBeNull(); // null 방지

    // 수정 버튼 클릭
    const editButton = within(container as HTMLElement).getByLabelText('Edit event');
    await user.click(editButton);

    // 수정 내용 입력
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 일정');

    await user.click(screen.getByTestId('event-submit-button'));

    // 일정 수정이 반영되었는지 확인
    await waitFor(() => {
      expect(screen.getByLabelText('제목')).toHaveValue('수정된 일정');
    });
    // await user.click(screen.getByLabelText('Edit event'));
    // await user.clear(screen.getByLabelText('제목'));
    // await user.type(screen.getByLabelText('제목'), '수정된 일정');
    // await user.click(screen.getByTestId('event-submit-button'));

    // await waitFor(() => {
    //   expect(screen.getByLabelText('제목')).toHaveValue('수정된 일정');
    // });
  });

  it('일정을 삭제하고 목록에서 사라지는지 확인', async () => {
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '삭제할 일정',
      date: '2025-02-20',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제 테스트',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    });

    await user.click(screen.getByLabelText('Delete event'));

    await waitFor(() => expect(screen.queryByText('삭제할 일정')).not.toBeInTheDocument());
  });
});
