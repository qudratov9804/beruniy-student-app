import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui/Input';

describe('Input component', () => {
  it('renders label', async () => {
    const { getByText } = await render(<Input label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders error message', async () => {
    const { getByText } = await render(<Input error="Xatolik yuz berdi" />);
    expect(getByText('Xatolik yuz berdi')).toBeTruthy();
  });

  it('renders hint when no error', async () => {
    const { getByText } = await render(<Input hint="Email manzilingiz" />);
    expect(getByText('Email manzilingiz')).toBeTruthy();
  });

  it('does not render hint when error is present', async () => {
    const { queryByText } = await render(<Input error="Error" hint="Hint" />);
    expect(queryByText('Hint')).toBeNull();
  });

  it('handles text change', async () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = await render(
      <Input placeholder="Type here" onChangeText={onChange} />
    );
    fireEvent.changeText(getByPlaceholderText('Type here'), 'test@email.com');
    expect(onChange).toHaveBeenCalledWith('test@email.com');
  });

  it('renders without label', async () => {
    const { toJSON } = await render(<Input placeholder="No label" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders password input without crashing', async () => {
    const { toJSON } = await render(<Input isPassword placeholder="Password" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with error border style', async () => {
    const { toJSON } = await render(<Input error="Error!" />);
    expect(toJSON()).toBeTruthy();
  });
});
