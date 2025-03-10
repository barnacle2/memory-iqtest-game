import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../../constants/theme';
import { Card } from '../../components/Card';
import { router } from 'expo-router';

interface Cell {
  id: number;
  isActive: boolean;
  isSelected: boolean;
  indicator?: number;
}

export default function PatternGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [showPattern, setShowPattern] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [gameState, setGameState] = useState<'initializing' | 'showing' | 'input'>('initializing');
  const [isReady, setIsReady] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem('patternHighScore');
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
        await AsyncStorage.setItem('patternHighScore', newScore.toString());
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
          text: 'Play Again',
          onPress: () => {
            setLevel(1);
            setScore(0);
            setGridSize(3);
            setGameState('showing');
            initializeGrid();
          }
        },
        {
          text: 'Exit to Menu',
          onPress: () => router.back()
        }
      ]
    );
  };

  const initializeGrid = useCallback(() => {
    const newCells: Cell[] = Array.from({ length: gridSize * gridSize }, (_, index) => ({
      id: index,
      isActive: false,
      isSelected: false,
    }));
    setCells(newCells);
    setIsReady(true);
    setGameState('showing');
  }, [gridSize]);

  useEffect(() => {
    setIsReady(false);
    initializeGrid();
  }, [gridSize, initializeGrid]);

  useEffect(() => {
    if (isReady && gameState === 'showing') {
      generatePattern();
    }
  }, [isReady, gameState]);

  const generatePattern = () => {
    let patternLength = level <= 3 ? 4 : Math.min(level + 1, gridSize * gridSize);
    const totalCells = gridSize * gridSize;

    const newPattern = new Set<number>();

    while (newPattern.size < patternLength) {
        let randIndex = Math.floor(Math.random() * totalCells);

        // Ensure we don't generate an invalid index
        if (randIndex < 0 || randIndex >= totalCells) {
            console.error(`Invalid index generated: ${randIndex}`);
            continue;
        }

        newPattern.add(randIndex);
    }

    const uniquePattern = Array.from(newPattern);

    console.log(`Level: ${level}, Generated Pattern:`, uniquePattern); // Debugging log

    setPattern(uniquePattern);
    showPatternToPlayer(uniquePattern);
};

const showPatternToPlayer = (newPattern: number[]) => {
    setShowPattern(true);

    setCells(prevCells => {
        const updatedCells = prevCells.map(cell => ({
            ...cell,
            isActive: newPattern.includes(cell.id),
            isSelected: false, 
            indicator: newPattern.includes(cell.id) ? newPattern.indexOf(cell.id) + 1 : undefined
        }));
        return updatedCells;
    });

    // Hide pattern after delay
    const showDuration = Math.max(3000 - (level * 200), 1000);
    setTimeout(() => {
        setCells(prevCells => prevCells.map(cell => ({
            ...cell,
            isActive: false,
            isSelected: false,
            indicator: undefined
        })));
        setShowPattern(false);
        setGameState('input');
        setPlayerPattern([]);
    }, showDuration);
};

  const handleCellPress = (cellId: number) => {
    if (gameState !== 'input') return;

    // Add new cell to player pattern
    const newPlayerPattern = [...playerPattern, cellId];
    setPlayerPattern(newPlayerPattern);

    // Update cell visual state
    const newCells = cells.map(cell => ({
        ...cell,
        isSelected: cell.id === cellId || (cell.isSelected && cell.id !== cellId)
    }));
    setCells(newCells);

    // Check if wrong cell was pressed
    if (pattern[playerPattern.length] !== cellId) {
        handleGameOver(); // Call game over if the wrong cell is pressed
        return;
    }

    // Check if pattern is complete
    if (newPlayerPattern.length === pattern.length) {
        // Check if the player's pattern matches the generated pattern
        const isPatternCorrect = newPlayerPattern.every((id, index) => id === pattern[index]);
        
        console.log("Player Pattern:", newPlayerPattern);
        console.log("Expected Pattern:", pattern);

        if (isPatternCorrect) {
            const newScore = score + (level * 10);
            setScore(newScore);
            handleGameCompletion(newScore); // Call to save the score

            setLevel(prev => prev + 1);
            
            // Check if grid size should increase
            if ((level + 1) % 3 === 0 && gridSize < 5) {
                setGridSize(prev => prev + 1);
            }

            // Reset for next level
            setGameState('showing'); // Change game state to 'showing' to display the new pattern
            const resetCells = cells.map(cell => ({
                ...cell,
                isActive: false,
                isSelected: false
            }));
            setCells(resetCells);
            setPlayerPattern([]);
            generatePattern(); // Generate a new pattern for the next level
        } else {
            handleGameOver(); // Call game over if the pattern is incorrect
        }
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

    // Update the current score and high score for Pattern Recall
    parsedStats.patternRecall.currentScore = newScore;
    if (newScore > parsedStats.patternRecall.highScore) {
        parsedStats.patternRecall.highScore = newScore;
    }

    // Save updated performance stats
    await AsyncStorage.setItem('performanceStats', JSON.stringify(parsedStats));
  };

  if (!isReady || gameState === 'initializing') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing level {level}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <Card variant="elevated" style={styles.gridContainer}>
        <View style={[
          styles.grid,
          { width: gridSize * 80 + (gridSize - 1) * 10 }
        ]}>
          {cells.map((cell) => (
            <TouchableOpacity
              key={cell.id}
              style={[
                styles.cell,
                cell.isActive && styles.cellActive,
                cell.isSelected && styles.cellSelected,
              ]}
              onPress={() => handleCellPress(cell.id)}
              disabled={gameState !== 'input'}
            >
              {cell.indicator && (
                <Text style={styles.indicatorText}>{cell.indicator}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Text style={styles.instructionText}>
        {gameState === 'showing' ? 'Remember the pattern...' :
         gameState === 'input' ? 'Recreate the pattern' :
         'Preparing...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
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
  gridContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 400,
  },
  cell: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    margin: 0,
  },
  cellActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cellSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  instructionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    marginTop: SPACING.xl,
    textAlign: 'center',
  },
  indicatorText: {
    position: 'absolute',
    top: 5,
    left: 5,
    color: COLORS.text,
    fontWeight: 'bold',
  },
}); 