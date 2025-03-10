import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../../constants/theme';
import { Card } from '../../components/Card';
import { router } from 'expo-router';

export default function SequenceGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(true);
  const [currentShowIndex, setCurrentShowIndex] = useState(-1);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    loadHighScore();
    startNewSequence();
  }, [level]);

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem('sequenceHighScore');
      if (savedScore) {
        setHighScore(parseInt(savedScore));
      }
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  };

  const saveHighScore = async (newScore: number) => {
    try {
      if (newScore > highScore) {
        await AsyncStorage.setItem('sequenceHighScore', newScore.toString());
        setHighScore(newScore);
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const handleGameOver = async () => {
    await saveHighScore(score);
    Alert.alert(
      'Game Over!',
      `Your final score: ${score}\nHigh score: ${Math.max(score, highScore)}`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            setLevel(1);
            setScore(0);
            startNewSequence();
          }
        },
        {
          text: 'Exit to Menu',
          onPress: () => router.back()
        }
      ]
    );
  };

  const generateSequence = () => {
    const length = Math.min(3 + Math.floor(level / 2), 9);
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  };

  const startNewSequence = () => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setPlayerSequence([]);
    setShowingSequence(true);
    showSequenceToPlayer(newSequence);
  };

  const showSequenceToPlayer = (newSequence: number[]) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < newSequence.length) {
        setCurrentShowIndex(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
        setCurrentShowIndex(-1);
        setShowingSequence(false);
      }
    }, Math.max(1000 - (level * 50), 500));
  };

  const handleNumberPress = (number: number) => {
    if (showingSequence) return;

    const newPlayerSequence = [...playerSequence, number];
    setPlayerSequence(newPlayerSequence);

    // Check if the number is correct
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      handleGameOver();
      return;
    }

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + (level * 10);
      setScore(newScore);
      handleGameCompletion(newScore);
      setLevel(level + 1);
      setTimeout(startNewSequence, 500);
    }
  };

  const handleGameCompletion = async (newScore: number) => {
    // Load existing performance stats
    const stats = await AsyncStorage.getItem('performanceStats');
    const parsedStats = stats ? JSON.parse(stats) : {
        patternRecall: { currentScore: 0, highScore: 0 },
        matchingGame: { currentScore: 0, highScore: 0 },
        numberSequence: { currentScore: 0, highScore: 0 },
        iqChallenge: { currentScore: 0, highScore: 0 },
    };

    // Update the current score and high score for Number Sequence
    parsedStats.numberSequence.currentScore = newScore;
    if (newScore > parsedStats.numberSequence.highScore) {
        parsedStats.numberSequence.highScore = newScore;
    }

    // Update the last played date
    parsedStats.lastPlayedDate = new Date().toISOString(); // Save today's date

    // Save updated performance stats
    await AsyncStorage.setItem('performanceStats', JSON.stringify(parsedStats));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <Card variant="elevated" style={styles.sequenceDisplay}>
        {showingSequence ? (
          <Text style={styles.numberDisplay}>
            {currentShowIndex >= 0 ? sequence[currentShowIndex] : '?'}
          </Text>
        ) : (
          <Text style={styles.numberDisplay}>
            {playerSequence.length}/{sequence.length}
          </Text>
        )}
      </Card>

      <Text style={styles.instructionText}>
        {showingSequence 
          ? 'Remember the sequence...' 
          : 'Enter the sequence in order'}
      </Text>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <TouchableOpacity
            key={number}
            style={styles.numberButton}
            onPress={() => handleNumberPress(number)}
            disabled={showingSequence}
          >
            <Text style={styles.numberButtonText}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  levelText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  sequenceDisplay: {
    width: '100%',
    aspectRatio: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  numberDisplay: {
    fontSize: FONT_SIZES.xxl * 2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  instructionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
    maxWidth: 300,
  },
  numberButton: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  numberButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
}); 