import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceStats {
  patternRecall: { currentScore: number; highScore: number };
  matchingGame: { currentScore: number; highScore: number };
  numberSequence: { currentScore: number; highScore: number };
  iqChallenge: { currentScore: number; highScore: number };
  // Add more games as needed
}

interface User {
  name: string;
  avatar: string;
  performanceStats: PerformanceStats;
}

const UserProfile = () => {
  const [user, setUser] = useState<User>({
    name: '',
    avatar: '',
    performanceStats: {
      patternRecall: { currentScore: 0, highScore: 0 },
      matchingGame: { currentScore: 0, highScore: 0 },
      numberSequence: { currentScore: 0, highScore: 0 },
      iqChallenge: { currentScore: 0, highScore: 0 },
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('playerName');
        const stats = await AsyncStorage.getItem('performanceStats');
        if (name) {
          setUser({
            name,
            avatar: 'https://www.shareicon.net/data/512x512/2016/08/18/809170_user_512x512.png', // Placeholder avatar URL
            performanceStats: stats ? JSON.parse(stats) : {
              patternRecall: { currentScore: 0, highScore: 0 },
              matchingGame: { currentScore: 0, highScore: 0 },
              numberSequence: { currentScore: 0, highScore: 0 },
              iqChallenge: { currentScore: 0, highScore: 0 },
            },
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleBackPress = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.header}>{user.name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.subHeader}>Performance Stats</Text>
        {Object.entries(user.performanceStats).map(([game, scores]) => (
          <View key={game} style={styles.statRow}>
            <Text style={styles.gameName}>{game.replace(/([A-Z])/g, ' $1')}</Text>
            <Text>Current Score: {scores.currentScore}</Text>
            <Text>High Score: {scores.highScore}</Text>
          </View>
        ))}
      </View>

      <Button title="Game Settings" onPress={() => { /* Navigate to settings screen */ }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg * 2,
    backgroundColor: COLORS.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular avatar
    marginBottom: SPACING.md,
  },
  header: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  subHeader: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  statRow: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  gameName: {
    fontWeight: 'bold',
  },
});

export default UserProfile; 