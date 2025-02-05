import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

beforeAll(() => server.listen()); // Mock API 서버 실행
afterEach(() => server.resetHandlers()); // 각 테스트 이후 핸들러 초기화
afterAll(() => server.close()); // 모든 테스트 종료 후 서버 닫기

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  const { user } = setup(<App />);

  console.log(user);

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // 1️⃣ `saveSchedule` 유틸을 사용해 새 일정 추가
    // 2️⃣ 저장 후, 화면에 일정이 추가되었는지 확인 (`getByText`)
    // 3️⃣ 해당 일정의 모든 필드 값이 올바르게 반영되었는지 검증
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 1️⃣ 일정 추가 후, "수정" 버튼 클릭
    // 2️⃣ 입력 필드에서 일정 제목, 시간 등 변경
    // 3️⃣ 저장 버튼 클릭 후, 변경 사항이 반영되었는지 확인
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // 1️⃣ 일정 추가 후, "삭제" 버튼 클릭
    // 2️⃣ 삭제된 일정이 화면에서 사라졌는지 확인 (`queryByText`)
  });
});

describe('일정 뷰', () => {
  const { user } = setup(<App />);

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 1️⃣ "주별 뷰" 버튼 클릭
    // 2️⃣ 특정 주에 일정이 없는 상태에서 "일정 없음" 텍스트가 있는지 확인
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 1️⃣ 일정 추가 후 "주별 뷰" 전환
    // 2️⃣ 해당 주에 일정이 표시되는지 확인
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // 1️⃣ "월별 뷰" 버튼 클릭
    // 2️⃣ 특정 달에 일정이 없을 때 "일정 없음"이 표시되는지 확인
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // 1️⃣ 일정 추가 후 "월별 뷰" 전환
    // 2️⃣ 해당 날짜의 일정이 올바르게 표시되는지 확인
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // 1️⃣ 1월 1일이 있는 달로 이동
    // 2️⃣ 1월 1일이 공휴일 스타일(특정 CSS 클래스 등)로 표시되는지 확인
  });
});

describe('검색 기능', () => {
  const { user } = setup(<App />);

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // 1️⃣ 존재하지 않는 일정 이름 입력
    // 2️⃣ "검색 결과가 없습니다"가 화면에 표시되는지 확인
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // 1️⃣ "팀 회의" 일정 추가
    // 2️⃣ 검색창에 "팀 회의" 입력
    // 3️⃣ 리스트에 "팀 회의" 일정이 정상적으로 표시되는지 확인
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // 1️⃣ 검색어 입력 후 일정이 필터링되는지 확인
    // 2️⃣ 검색어 제거 후 전체 일정이 다시 표시되는지 검증
  });
});

describe('일정 충돌', () => {
  const { user } = setup(<App />);

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 1️⃣ 일정 추가
    // 2️⃣ 동일한 시간에 새 일정 추가 시도
    // 3️⃣ 충돌 경고 메시지가 표시되는지 확인
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 1️⃣ 일정 추가
    // 2️⃣ 해당 일정의 시간을 기존 일정과 겹치도록 수정
    // 3️⃣ 충돌 경고 메시지가 표시되는지 확인
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const { user } = setup(<App />);

  // 1️⃣ `notificationTime`을 10으로 설정하여 일정 추가
  // 2️⃣ 지정된 시간(10분 전)에 알람 메시지가 화면에 표시되는지 확인
});
