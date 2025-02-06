import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { ChangeEventHandler } from 'react';

interface InputProps {
  title: string;
  type?: string;
  value: string | number;
  min?: number;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export const EventInput = ({ title, type = 'text', min, value, onChange }: InputProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Input type={type} min={min} value={value} onChange={onChange} />
    </FormControl>
  );
};
