import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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

export default function GameMenu() {
  const [playerName, setPlayerName] = useState<string>('');

  useEffect(() => {
    loadPlayerName();
  }, []);

  const loadPlayerName = async () => {
    try {
      const name = await AsyncStorage.getItem('playerName');
      if (name) {
        setPlayerName(name);
      } else {
        // If no name is found, go back to landing page
        router.replace('/');
      }
    } catch (err) {
      console.error('Error loading player name:', err);
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {playerName}!</Text>
        <Text style={styles.subtitle}>Train your brain daily</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsCard}>
          <Card variant="elevated">
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85</Text>
                <Text style={styles.statLabel}>Current IQ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Challenge</Text>

        <View style={styles.gameGrid}>
          {gameCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.gameCard}
              onPress={() => {
                // Navigate to specific game screen
                router.push(`/(games)/${category.id}` as any);
              }}
            >
              <Card variant="elevated" style={{ flex: 1 }}>
                <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.gameTitle}>{category.title}</Text>
                <Text style={styles.gameDescription}>{category.description}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  welcomeText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statsCard: {
    marginBottom: SPACING.xl,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
  },
  gameCard: {
    width: '50%',
    padding: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  gameTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  gameDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
}); 