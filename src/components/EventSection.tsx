import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import { useEventForm } from '../hooks/useEventForm.ts';
import { RepeatType } from '../types.ts';
import { getTimeErrorMessage } from '../utils/timeValidation.ts';
import { EventInput } from './shared/EventInput.tsx';
import EventSelect from './shared/Select.tsx';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

const repeatOptions = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
];

interface EventSectionProps {
  onAddOrUpdateEvent: () => void;
}

function EventSection({ onAddOrUpdateEvent }: EventSectionProps) {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventForm();

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>
      <EventInput title="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <EventInput title="날짜" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>
      <EventInput
        title="설명"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <EventInput title="위치" value={location} onChange={(e) => setLocation(e.target.value)} />
      <EventSelect
        title="카테고리"
        value={category}
        onChange={setCategory}
        options={categories.map((cat) => ({ value: cat, label: cat }))}
      />
      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>
      <EventSelect
        title="알림 설정"
        value={notificationTime}
        onChange={(value) => setNotificationTime(Number(value))}
        options={notificationOptions}
      />
      {isRepeating && (
        <VStack width="100%">
          <EventSelect
            title="반복 유형"
            value={repeatType}
            onChange={(value) => setRepeatType(value as unknown as RepeatType)}
            options={repeatOptions}
          />
          <HStack width="100%">
            <EventInput
              title="반복 간격"
              type="number"
              value={repeatInterval}
              onChange={(e) => setRepeatInterval(Number(e.target.value))}
              min={1}
            />
            <EventInput
              title="반복 종료일"
              type="date"
              value={repeatEndDate}
              onChange={(e) => setRepeatEndDate(e.target.value)}
            />
          </HStack>
        </VStack>
      )}
      <Button data-testid="event-submit-button" onClick={onAddOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
}

export default EventSection;
