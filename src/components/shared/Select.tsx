import { FormControl, FormLabel, Select } from '@chakra-ui/react';

interface SelectProps<T> {
  title: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

function EventSelect<T extends string | number>({
  title,
  value,
  onChange,
  options,
}: SelectProps<T>) {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

export default EventSelect;
