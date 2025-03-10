import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const GameSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('Medium');

  const handleBackPress = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Game Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Sound Effects</Text>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Difficulty Level</Text>
        <View style={styles.difficultyButtons}>
          {['Easy', 'Medium', 'Hard'].map(level => (
            <Button
              key={level}
              title={level}
              onPress={() => setDifficulty(level)}
              color={difficulty === level ? COLORS.primary : COLORS.text}
            />
          ))}
        </View>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Reset Progress</Text>
        <Button title="Reset" onPress={() => { /* Reset logic here */ }} color={COLORS.error} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>About</Text>
        <Text style={styles.aboutText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg * 2,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  header: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  aboutText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
});

export default GameSettings; 