import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { Card } from '../components/Card';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const gameCategories = [
  {
    id: 'pattern',
    title: 'Pattern Recall',
    description: 'Memorize and recreate visual patterns',
    icon: 'grid-outline',
    color: COLORS.primary,
  },
  {
    id: 'sequence',
    title: 'Number Sequence',
    description: 'Remember and repeat number sequences',
    icon: 'numbers-outline',
    color: COLORS.secondary,
  },
  {
    id: 'matching',
    title: 'Object Matching',
    description: 'Find matching pairs in a grid',
    icon: 'copy-outline',
    color: COLORS.accent,
  },
  {
    id: 'iq',
    title: 'IQ Challenge',
    description: 'Test your cognitive abilities',
    icon: 'brain-outline',
    color: COLORS.success,
  },
];

export default function Landing() {
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [error, setError] = useState('');

  const handlePlay = async () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      // Save player name to AsyncStorage
      await AsyncStorage.setItem('playerName', playerName.trim());
      // Navigate to game menu
      router.push('/menu');
    } catch (err) {
      console.error('Error saving player name:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Memory Game IQ</Text>
          <Text style={styles.subtitle}>Train Your Brain Daily</Text>
        </View>

        <View style={styles.cardContainer}>
          <Card variant="elevated" style={styles.card}>
            {!showNameInput ? (
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlay}
              >
                <Text style={styles.playButtonText}>PLAY</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={playerName}
                  onChangeText={(text) => {
                    setPlayerName(text);
                    setError('');
                  }}
                  autoFocus
                  maxLength={20}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity 
                  style={[
                    styles.playButton,
                    !playerName.trim() && styles.playButtonDisabled
                  ]}
                  onPress={handlePlay}
                >
                  <Text style={styles.playButtonText}>START</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl * 1.5,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: SPACING.xl,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.medium,
  },
  playButtonDisabled: {
    opacity: 0.7,
  },
  playButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
}); 