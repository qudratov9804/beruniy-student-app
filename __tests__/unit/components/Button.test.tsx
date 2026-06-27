import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button component', () => {
  it('renders children text', async () => {
    const { getByText } = await render(<Button>Press me</Button>);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button onPress={onPress}>Click</Button>);
    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button onPress={onPress} disabled>Disabled</Button>
    );
    const text = getByText('Disabled');
    expect(text).toBeTruthy();
    fireEvent.press(text);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('hides children text when loading', async () => {
    const { queryByText } = await render(<Button loading>Loading</Button>);
    expect(queryByText('Loading')).toBeNull();
  });

  it('renders primary variant by default', async () => {
    const { toJSON } = await render(<Button>Primary</Button>);
    expect(toJSON()).toBeTruthy();
  });

  it('renders outline variant', async () => {
    const { toJSON } = await render(<Button variant="outline">Outline</Button>);
    expect(toJSON()).toBeTruthy();
  });

  it('renders danger variant', async () => {
    const { toJSON } = await render(<Button variant="danger">Danger</Button>);
    expect(toJSON()).toBeTruthy();
  });

  it('renders large size', async () => {
    const { getByText } = await render(<Button size="lg">Large</Button>);
    expect(getByText('Large')).toBeTruthy();
  });

  it('renders success variant', async () => {
    const { getByText } = await render(<Button variant="success">Success</Button>);
    expect(getByText('Success')).toBeTruthy();
  });
});
