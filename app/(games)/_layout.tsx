import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    />
  );
} 