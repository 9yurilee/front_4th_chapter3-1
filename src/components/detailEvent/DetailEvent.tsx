import { VStack } from '@chakra-ui/react';

import EventList from './EventList';
import SearchEvent from './SearchEvent';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventForm } from '../../hooks/useEventForm';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';

function DetailEvent() {
  const { editingEvent, setEditingEvent } = useEventForm();
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  const { view, currentDate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <SearchEvent value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <EventList list={filteredEvents} />
    </VStack>
  );
}

export default DetailEvent;
