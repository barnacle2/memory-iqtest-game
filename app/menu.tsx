import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Card } from '../components/Card';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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

// Define the props for the SideNavbar component
interface SideNavbarProps {
  visible: boolean;
  onClose: () => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ visible, onClose }) => {
  const translateX = visible ? 0 : -250; // Adjust the width of the navbar

  // Animated values for hover effects
  const [scaleUserProfile] = useState(new Animated.Value(1));
  const [scaleGameSettings] = useState(new Animated.Value(1));

  const handleHoverIn = (scaleValue: Animated.Value) => {
    Animated.spring(scaleValue, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = (scaleValue: Animated.Value) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.sideNavbar, { transform: [{ translateX }], backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPressIn={() => handleHoverIn(scaleUserProfile)}
        onPressOut={() => handleHoverOut(scaleUserProfile)}
        onPress={() => {
          router.push('/screens/UserProfile');
        }}
        style={styles.navItem}
      >
        <Animated.Text style={[styles.navText, { transform: [{ scale: scaleUserProfile }] }]}>
          User Profile
        </Animated.Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        onPressIn={() => handleHoverIn(scaleGameSettings)}
        onPressOut={() => handleHoverOut(scaleGameSettings)}
        onPress={() => {
          router.push('/screens/GameSettings');
        }}
        style={styles.navItem}
      >
        <Animated.Text style={[styles.navText, { transform: [{ scale: scaleGameSettings }] }]}>
          Game Settings
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GameMenu = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const [navbarVisible, setNavbarVisible] = useState<boolean>(false);
  const [currentIQ, setCurrentIQ] = useState<number>(0);
  const [dayStreak, setDayStreak] = useState<number>(0);

  useEffect(() => {
    loadUserProfile();
    loadPerformanceStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const name = await AsyncStorage.getItem('playerName');
      if (name) {
        setPlayerName(name);
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      router.replace('/');
    }
  };

  const saveUserProfile = async (name: string) => {
    try {
      await AsyncStorage.setItem('playerName', name);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const loadPerformanceStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('performanceStats');
      if (stats) {
        const parsedStats = JSON.parse(stats);
        setCurrentIQ(parsedStats.currentIQ);
        setDayStreak(parsedStats.dayStreak);
      }
    } catch (error) {
      console.error('Error loading performance stats:', error);
    }
  };

  const savePerformanceStats = async (stats: { currentIQ: number; dayStreak: number }) => {
    try {
      await AsyncStorage.setItem('performanceStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving performance stats:', error);
    }
  };

  const updateStats = (newIQ: number) => {
    setCurrentIQ(newIQ);
    setDayStreak(prev => prev + 1);
    savePerformanceStats({ currentIQ: newIQ, dayStreak: dayStreak + 1 });
  };

  const openMenu = () => {
    console.log('Opening menu'); // Debug log
    setNavbarVisible(true);
  };

  const closeMenu = () => {
    console.log('Closing menu'); // Debug log
    setNavbarVisible(false);
  };

  return (
    <View style={styles.container}>
      <SideNavbar visible={navbarVisible} onClose={closeMenu} />
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.menuIcon}>
          <MaterialIcons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Welcome, {playerName}!</Text>
        <Text style={styles.subtitle}>Train your brain daily</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <Card variant="elevated">
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentIQ}</Text>
                <Text style={styles.statLabel}>Current IQ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dayStreak}</Text>
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
};

export default GameMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.sm * 7,
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
  menuIcon: {
    position: 'absolute',
    left: SPACING.lg,
    top: SPACING.sm * 4,
  },
  sideNavbar: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 250, // Width of the side navbar
    height: '100%',
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  closeButton: {
    alignItems: 'flex-end',
  },
  closeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  divider: {
    height: 5,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  navItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  navText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
}); 