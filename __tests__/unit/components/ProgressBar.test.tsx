import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('renders without crashing', async () => {
    const { toJSON } = await render(<ProgressBar progress={50} />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows label when showLabel=true', async () => {
    const { getByText } = await render(<ProgressBar progress={75} showLabel />);
    expect(getByText('75%')).toBeTruthy();
  });

  it('does not show label by default', async () => {
    const { queryByText } = await render(<ProgressBar progress={50} />);
    expect(queryByText('50%')).toBeNull();
  });

  it('clamps progress above 100', async () => {
    const { getByText } = await render(<ProgressBar progress={150} showLabel />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('clamps progress below 0', async () => {
    const { getByText } = await render(<ProgressBar progress={-10} showLabel />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('renders with custom height', async () => {
    const { toJSON } = await render(<ProgressBar progress={50} height={16} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders non-animated without crashing', async () => {
    const { toJSON } = await render(<ProgressBar progress={60} animated={false} />);
    expect(toJSON()).toBeTruthy();
  });
});
