import { VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';

import EventList from './EventList';
import SearchEvent from './SearchEvent';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

interface DetailEventProps {
  list: Event[];
  editingEvent: Event | null;
  setEditingEvent: Dispatch<SetStateAction<Event | null>>;
  editEvent: (event: Event) => void;
}

function DetailEvent({ list, editingEvent, setEditingEvent, editEvent }: DetailEventProps) {
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  const { view, currentDate } = useCalendarView();
  const { searchTerm, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <SearchEvent value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <EventList
        list={list}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        editEvent={editEvent}
      />
    </VStack>
  );
}

export default DetailEvent;
