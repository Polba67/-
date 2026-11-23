import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Modal, FlatList, SafeAreaView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [repsPerSet, setRepsPerSet] = useState('10');
  const [history, setHistory] = useState({});
  const [statsVisible, setStatsVisible] = useState(false);

  // Получаем сегодняшнюю дату в формате ДД.ММ.ГГГГ
  const getTodayKey = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const today = getTodayKey();

  // Загружаем данные из памяти при открытии
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('workout_history');
        const savedReps = await AsyncStorage.getItem('daily_reps');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedReps) setRepsPerSet(savedReps);
      } catch (e) {
        console.log(e);
      }
    };
    loadData();
  }, []);

  // Сохранение нормы повторений
  const handleRepsChange = async (val) => {
    const clean = val.replace(/[^0-9]/g, '');
    setRepsPerSet(clean);
    await AsyncStorage.setItem('daily_reps', clean);
  };

  // Нажатие на карточку Бицепс или Плечи
  const addSet = async (muscle) => {
    const repsToAdd = parseInt(repsPerSet, 10) || 0;
    if (repsToAdd <= 0) return;

    const currentDay = history[today] || { bSets: 0, bReps: 0, sSets: 0, sReps: 0 };
    const updatedDay = { ...currentDay };

    if (muscle === 'biceps') {
      updatedDay.bSets += 1;
      updatedDay.bReps += repsToAdd;
    } else {
      updatedDay.sSets += 1;
      updatedDay.sReps += repsToAdd;
    }

    const updatedHistory = { ...history, [today]: updatedDay };
    setHistory(updatedHistory);
    await AsyncStorage.setItem('workout_history', JSON.stringify(updatedHistory));
  };

  const todayStats = history[today] || { bSets: 0, bReps: 0, sSets: 0, sReps: 0 };
  const historyList = Object.keys(history).reverse().map((date) => ({
    date,
    ...history[date],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Тренировки • {today}</Text>

      {/* Верхний счетчик повторений */}
      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>Повторений за 1 подход:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={repsPerSet}
          onChangeText={handleRepsChange}
          placeholder="10"
        />
      </View>

      {/* Сектор 1: Бицепс */}
      <TouchableOpacity
        style={[styles.card, styles.bicepsCard]}
        activeOpacity={0.7}
        onPress={() => addSet('biceps')}
      >
        <Text style={styles.cardTitle}>БИЦЕПС</Text>
        <Text style={styles.cardStats}>
          Подходов: {todayStats.bSets}   |   Повторений: {todayStats.bReps}
        </Text>
        <Text style={styles.cardHint}>Нажми в любое место (+1 подход)</Text>
      </TouchableOpacity>

      {/* Сектор 2: Плечи */}
      <TouchableOpacity
        style={[styles.card, styles.shouldersCard]}
        activeOpacity={0.7}
        onPress={() => addSet('shoulders')}
      >
        <Text style={styles.cardTitle}>ПЛЕЧИ</Text>
        <Text style={styles.cardStats}>
          Подходов: {todayStats.sSets}   |   Повторений: {todayStats.sReps}
        </Text>
        <Text style={styles.cardHint}>Нажми в любое место (+1 подход)</Text>
      </TouchableOpacity>

      {/* Кнопка Stats внизу */}
      <TouchableOpacity
        style={styles.statsBtn}
        onPress={() => setStatsVisible(true)}
      >
        <Text style={styles.statsBtnText}>📊 Stats (История по дням)</Text>
      </TouchableOpacity>

      {/* Окно статистики */}
      <Modal visible={statsVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Статистика по дням</Text>
            <TouchableOpacity onPress={() => setStatsVisible(false)}>
              <Text style={styles.closeBtn}>Закрыть ✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={historyList}
            keyExtractor={(item) => item.date}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Пока нет записей. Сделай первый подход!</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyDate}>📅 {item.date}</Text>
                <Text style={styles.historyText}>
                  💪 Бицепс: {item.bSets} подх. ({item.bReps} повт.)
                </Text>
                <Text style={styles.historyText}>
                  🏋️ Плечи: {item.sSets} подх. ({item.sReps} повт.)
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F8',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    marginTop: 10,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F1F5F9',
    width: 80,
    height: 45,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  card: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  bicepsCard: {
    backgroundColor: '#2563EB',
  },
  shouldersCard: {
    backgroundColor: '#0D9488',
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardStats: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0F2FE',
    marginTop: 12,
  },
  cardHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 16,
  },
  statsBtn: {
    backgroundColor: '#1E293B',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  statsBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    padding: 5,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  historyDate: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  historyText: {
    fontSize: 15,
    color: '#475569',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 40,
  },
});
