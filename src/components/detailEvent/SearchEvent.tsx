import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { ChangeEvent } from 'react';

interface SearchEventProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function SearchEvent({ value, onChange }: SearchEventProps) {
  console.log(onChange);
  return (
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input placeholder="검색어를 입력하세요" value={value} onChange={onChange} />
    </FormControl>
  );
}

export default SearchEvent;
