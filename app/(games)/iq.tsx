import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../../constants/theme';
import { Card } from '../../components/Card';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const generateQuestions = (level: number): Question[] => {
  const questions: Question[] = [];
  
  // Combined questions without types
  const allQuestions = [
    // Number questions
    {
      question: '7 9 5 11 4 15 12 7 13 8 11 ?',
      options: ['8', '10', '11', '13'],
      correctAnswer: 1,
      explanation: 'The pattern alternates between adding and subtracting.',
    },
    {
      question: '2 5 7 4 7 5 3 6 ?',
      options: ['4', '6', '8', '10'],
      correctAnswer: 1,
      explanation: 'The pattern alternates between increasing and decreasing.',
    },
    {
      question: '2, 5, 8, 11, ?',
      options: ['8', '12', '14', '16'],
      correctAnswer: 2,
      explanation: 'The pattern increases by 3 each time.',
    },
    {
      question: '121, 144, 169, 196, ?',
      options: ['225', '230', '275', '221'],
      correctAnswer: 0,
      explanation: 'These are perfect squares: 11², 12², 13², 14².',
    },
    {
      question: '4, 6, 9, 6, 14, 6, ?',
      options: ['14', '9', '16', '19'],
      correctAnswer: 3,
      explanation: 'The pattern alternates between a number and 6.',
    },
    {
      question: '2, 3, 5, 9, 17, 33, 65, ?',
      options: ['104', '129', '97', '135'],
      correctAnswer: 1,
      explanation: 'Each number is double the previous plus 1.',
    },
    {
      question: '1, 3, 12, 52, 265, ?',
      options: ['1188', '1390', '1489', '1596'],
      correctAnswer: 3,
      explanation: 'Each number is multiplied by the next integer.',
    },
    {
      question: '2, 8, 26, 62, 122, 212, ?',
      options: ['338', '339', '340', '341'],
      correctAnswer: 0,
      explanation: 'The pattern follows a specific growth rate.',
    },
    {
      question: '13, 17, 19, 23, 29, ?',
      options: ['30', '31', '33', '34'],
      correctAnswer: 1,
      explanation: 'These are prime numbers.',
    },
    {
      question: '2, 3, 6, 11, 18, 27, ?',
      options: ['21', '28', '38', '41'],
      correctAnswer: 2,
      explanation: 'The pattern increases by consecutive odd numbers.',
    },
    // Logic questions
    {
      question: 'Mary is 16 years old. She is 4 times older than her brother. How old will Mary be when she is twice his age?',
      options: ["That's impossible", '20', '24', '28'],
      correctAnswer: 2,
      explanation: 'When Mary is 24, her brother will be 12.',
    },
    {
      question: 'Which fraction is the biggest?',
      options: ['3/5', '5/8', '1/2', '4/7'],
      correctAnswer: 1,
      explanation: '5/8 is greater than the others.',
    },
    {
      question: 'The store reduces the price of one product by 20 percent. How many percent do you need to raise to the percentage to get the original price?',
      options: ['25', '27', '30', '35'],
      correctAnswer: 0,
      explanation: 'You need to raise it by 25%.',
    },
    {
      question: 'There are 5 machines that make 5 parts in 5 minutes. How long does it take to make 100 parts on 100 machines?',
      options: ['5', '10', '15', '30'],
      correctAnswer: 0,
      explanation: 'It takes 5 minutes for 100 machines to make 100 parts.',
    },
    {
      question: 'There is a lake on the surface of which water lilies float. The number of lilies doubles daily. If it takes 48 days to completely occupy the entire area of the lake, how many days will it take to occupy the floor of the lake?',
      options: ['47', '46', '96', '108'],
      correctAnswer: 0,
      explanation: 'It will take 47 days to occupy the floor.',
    },
    {
      question: 'A car travels at a speed of 40 mph over a certain distance and then returns over the same distance at a speed of 60 mph. What is the average speed for the total journey?',
      options: ['30 mph', '40 mph', '60 mph', '48 mph'],
      correctAnswer: 3,
      explanation: 'The average speed is 48 mph.',
    },
    {
      question: 'Which day is three days before the day immediately following the day two days before the day three days after the day immediately before Friday?',
      options: ['Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
      correctAnswer: 1,
      explanation: 'The answer is Wednesday.',
    },
    {
      question: 'What is always associated with DOLMEN?',
      options: ['cloths', 'statue', 'tribe', 'stone'],
      correctAnswer: 3,
      explanation: 'Dolmens are associated with stone structures.',
    },
    {
      question: 'What is the name given to a group of HORSES?',
      options: ['husk', 'harras', 'mute', 'rush'],
      correctAnswer: 1,
      explanation: 'A group of horses is called a harras.',
    },
    {
      question: 'You have accidentally left the plug out of the bath and are attempting to fill the bath with both taps full on. The hot tap takes three minutes to fill the bath and the cold tap two minutes, and the water empties through the plughole in six minutes. In how many minutes will the bath be filled?',
      options: ['1', '3', '1.5', '5'],
      correctAnswer: 1,
      explanation: 'The bath will be filled in 3 minutes.',
    },
    // Add more questions as needed...
  ];

  // Shuffle the questions array
  const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

  // Select a subset of questions (30 random questions)
  return shuffledQuestions.slice(0, 30);
};

export default function IQGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  useEffect(() => {
    loadHighScore();
    startNewLevel();
  }, [level]);

  useEffect(() => {
    if (timeLeft > 0 && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showExplanation) {
      handleTimeout();
    }
  }, [timeLeft, showExplanation]);

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem('iqHighScore');
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
        await AsyncStorage.setItem('iqHighScore', newScore.toString());
        setHighScore(newScore);
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const calculateIQ = () => {
    const baseIQ = 85;
    const questionsPerLevel = 3;
    const totalQuestions = (level - 1) * questionsPerLevel + currentQuestionIndex;
    const accuracy = totalCorrect / totalQuestions;
    const difficultyBonus = level * 5;
    return Math.round(baseIQ + (accuracy * 30) + difficultyBonus);
  };

  const handleGameOver = async () => {
    const finalIQ = calculateIQ();
    await saveHighScore(score);
    Alert.alert(
      'Game Over!',
      `Your final score: ${score}\nEstimated IQ: ${finalIQ}\nHigh score: ${Math.max(score, highScore)}`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            setLevel(1);
            setScore(0);
            setLives(3);
            setTotalCorrect(0);
            startNewLevel();
          }
        },
        {
          text: 'Exit to Menu',
          onPress: () => router.back()
        }
      ]
    );
  };

  const startNewLevel = () => {
    const newQuestions = generateQuestions(level);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setTimeLeft(timePerQuestion);
  };

  const handleTimeout = () => {
    setLives(lives - 1);
    if (lives <= 1) {
      handleGameOver();
    } else {
      showAnswerExplanation(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.ceil((timeLeft / timePerQuestion) * 10);
      const questionScore = 10 + timeBonus;
      setScore(score + questionScore);
      setTotalCorrect(totalCorrect + 1);
    } else {
      setLives(lives - 1);
      if (lives <= 1) {
        handleGameOver();
        return;
      }
    }

    showAnswerExplanation(isCorrect);
  };

  const showAnswerExplanation = (wasCorrect: boolean) => {
    setShowExplanation(true);
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowExplanation(false);
        setTimeLeft(timePerQuestion);
      } else {
        // Level complete
        setLevel(level + 1);
        startNewLevel();
      }
    }, 3000);
  };

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.livesContainer}>
          {[...Array(3)].map((_, i) => (
            <Ionicons
              key={i}
              name="heart"
              size={24}
              color={i < lives ? COLORS.error : COLORS.border}
              style={styles.heartIcon}
            />
          ))}
        </View>
        <Text style={[
          styles.timerText,
          timeLeft < 10 && styles.timerWarning
        ]}>
          Time: {timeLeft}s
        </Text>
      </View>

      <Card variant="elevated" style={styles.questionCard}>
        <Text style={styles.questionText}>
          {currentQuestion.question}
        </Text>

        {showExplanation ? (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(index)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      <Text style={styles.progressText}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  livesContainer: {
    flexDirection: 'row',
  },
  heartIcon: {
    marginRight: SPACING.sm,
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
  timerText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: COLORS.error,
  },
  questionCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZES.lg * 1.5,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  explanationContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  explanationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  progressText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
}); 