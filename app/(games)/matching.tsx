import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Button,
  Animated,
  Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface MatchingCard {
  id: number;
  value: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICONS = [
  'heart', 'star', 'diamond', 'flower', 'leaf', 'planet',
  'basketball', 'football', 'baseball', 'tennisball',
  'musical-note', 'headset', 'game-controller', 'camera',
  'airplane', 'boat', 'car', 'bicycle'
];

const randomArrFunction = (arr: any[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const gameCardsFunction = () => {
  const icons = [
    'paw', 'paw', 'heart', 'heart', 'tree', 'tree',
    'star', 'star', 'bell', 'bell', 'gift', 'gift',
  ];
  const randomIcons = randomArrFunction(icons);
  return randomIcons.map((icon, index) => ({
    id: index,
    value: icon,
    symbol: icon,
    isFlipped: false,
    isMatched: false,
  }));
};

export default function MatchingGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<MatchingCard[]>(gameCardsFunction());
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [matches, setMatches] = useState(0);
  const [winMessage, setWinMessage] = useState(new Animated.Value(0));
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Default to 60 seconds for level 1
  const [timerActive, setTimerActive] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    loadHighScore();
  }, []);

  useEffect(() => {
    initializeGame();
  }, [level]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
  }, [timerActive, timeLeft]);

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem('matchingHighScore');
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
        await AsyncStorage.setItem('matchingHighScore', newScore.toString());
        setHighScore(newScore);
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const handleGameOver = async () => {
    setTimerActive(false);
    setGameWon(false);
    await saveHighScore(score);

    try {
        const stats = await AsyncStorage.getItem('performanceStats');
        let parsedStats = stats ? JSON.parse(stats) : {};

        // Update the matching game score
        parsedStats.matchingGame = {
            currentScore: score,
            highScore: Math.max(score, parsedStats.matchingGame?.highScore || 0),
        };

        // Update the last played date
        parsedStats.lastPlayedDate = new Date().toISOString(); // Save today's date

        await AsyncStorage.setItem('performanceStats', JSON.stringify(parsedStats));
    } catch (error) {
        console.error('Error saving matching game score:', error);
    }

    Alert.alert(
      'Game Over!',
      `Your final score: ${score}\nHigh score: ${Math.max(score, highScore)}`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            setLevel(1);
            setScore(0);
            setGameWon(false);
            initializeGame();
          }
        },
        {
          text: 'Exit to Menu',
          onPress: () => router.back()
        }
      ]
    );
  };

  const initializeGame = () => {
    setCards(gameCardsFunction());
    setSelectedCards([]);
    setMatches(0);
    setTimerActive(true);
    setGameWon(false);
    setWinMessage(new Animated.Value(0));

    // Set time left based on the current level
    switch (level) {
      case 1:
        setTimeLeft(60);
        break;
      case 2:
        setTimeLeft(40);
        break;
      case 3:
        setTimeLeft(30);
        break;
      case 4:
        setTimeLeft(20);
        break;
      case 5:
        setTimeLeft(15);
        break;
      default:
        setTimeLeft(15); // Levels 6 and above
    }
  };

  const cardClickFunction = (card: MatchingCard) => {
    if (!gameWon && selectedCards.length < 2 && !card.isFlipped && timeLeft > 0) {
      const updatedSelectedCards = [...selectedCards, card];
      const updatedCards = cards.map((c) =>
        c.id === card.id ? { ...c, isFlipped: true } : c
      );
      setSelectedCards(updatedSelectedCards);
      setCards(updatedCards);
      if (updatedSelectedCards.length === 2) {
        if (updatedSelectedCards[0].symbol === updatedSelectedCards[1].symbol) {
          setMatches(matches + 1);
          setScore(prev => prev + 10); // Update score for a match
          setSelectedCards([]);
          if (matches + 1 === cards.length / 2) {
            geekWinGameFunction();
            setGameWon(true);
          }
        } else {
          setTimeout(() => {
            const flippedCards = updatedCards.map((c) =>
              updatedSelectedCards.some((s) => s.id === c.id) ?
                { ...c, isFlipped: false } : c
            );
            setSelectedCards([]);
            setCards(flippedCards);
          }, 1000);
        }
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

    // Update the current score and high score for Matching Game
    parsedStats.matchingGame.currentScore = newScore;
    if (newScore > parsedStats.matchingGame.highScore) {
        parsedStats.matchingGame.highScore = newScore;
    }

    // Save updated performance stats
    await AsyncStorage.setItem('performanceStats', JSON.stringify(parsedStats));
  };

  const geekWinGameFunction = () => {
    Animated.timing(winMessage, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    handleGameCompletion(score); // Save score when the game is won
  };

  useEffect(() => {
    if (matches === cards.length / 2) {
      geekWinGameFunction();
      setGameWon(true);
    }
  }, [matches]);

  const msg = `Matches: ${matches} / ${cards.length / 2}`;

  const proceedToNextLevel = () => {
    setLevel(prev => prev + 1); // Proceed to the next level
    initializeGame(); // Initialize the next level
  };

  const getGridDimensions = () => {
    const numCards = cards.length;
    const sqrt = Math.sqrt(numCards);
    return {
      rows: Math.ceil(sqrt),
      cols: Math.ceil(numCards / Math.ceil(sqrt))
    };
  };

  const { rows, cols } = getGridDimensions();
  const screenWidth = Dimensions.get('window').width;
  const gridPadding = SPACING.lg * 2;
  const gridWidth = screenWidth - gridPadding;
  const cardSize = Math.min(80, (gridWidth - (cols - 1) * SPACING.md) / cols);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.movesText}>Moves: {matches}</Text>
        <Text style={[
          styles.timerText,
          timeLeft <= 10 && styles.timerWarning
        ]}>
          Time: {timeLeft}s
        </Text>
      </View>

      <Card variant="elevated" style={styles.gridContainer}>
        <View style={[
          styles.grid,
          {
            width: cols * (cardSize + SPACING.md) - SPACING.md,
            gap: SPACING.md,
          }
        ]}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                { width: cardSize, height: cardSize },
                card.isFlipped && styles.cardFlipped
              ]}
              onPress={() => cardClickFunction(card)}
              disabled={gameWon || card.isFlipped || timeLeft <= 0}
            >
              {card.isFlipped && (
                <Icon name={card.symbol} size={cardSize * 0.6} style={styles.cardIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {gameWon ? (
        <View style={styles.winMessage}>
          <View style={styles.winMessageContent}>
            <Text style={styles.winText}>Congratulations on finishing Level {level}!</Text>
            <Button
              title={`Proceed to Level ${level + 1}`}
              onPress={proceedToNextLevel}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.previewText}>{msg}</Text>
      )}
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
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
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
  movesText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  timerText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: COLORS.error,
  },
  gridContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  cardFlipped: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardIcon: {
    color: 'blue',
  },
  previewText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontWeight: 'bold',
  },
  winMessage: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  winMessageContent: {
    backgroundColor: 'rgba(255, 215, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  winText: {
    fontSize: 36,
    color: 'white',
  },
}); 