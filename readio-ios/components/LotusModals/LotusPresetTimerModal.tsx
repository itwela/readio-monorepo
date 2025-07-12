import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLotusTimer } from '@/helpers/providers/lotusTimerProvider';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

interface PresetTimerModalProps {
  visible: boolean;
  onClose: () => void;
  presetName: string;
}

// Simple timer setting item component
const TimerSettingItem = ({ 
  label, 
  value, 
  onIncrement, 
  onDecrement 
}: { 
  label: string; 
  value: string; 
  onIncrement: () => void; 
  onDecrement: () => void; 
}) => {
  const { lightFeedback } = useLotusHaptic();

  return (
    <View style={itemStyles.container}>
      <Text style={itemStyles.label}>{label}</Text>
      
      <View style={itemStyles.valueContainer}>
        <TouchableOpacity 
          style={itemStyles.button}
          onPress={() => {
            lightFeedback();
            onDecrement();
          }}
          activeOpacity={0.7}
        >
          <FontAwesome name="minus" size={16} color={colors.readioWhite} />
        </TouchableOpacity>
        
        <View style={itemStyles.valueDisplay}>
          <Text style={itemStyles.valueText}>{value}</Text>
        </View>
        
        <TouchableOpacity 
          style={itemStyles.button}
          onPress={() => {
            lightFeedback();
            onIncrement();
          }}
          activeOpacity={0.7}
        >
          <FontAwesome name="plus" size={16} color={colors.readioWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Timer chain item display component
const ChainItem = ({ 
  item, 
  index, 
  onRemove,
  onEdit,
  isSelected = false,
  formatDuration
}: { 
  item: any; 
  index: number; 
  onRemove: () => void;
  onEdit: () => void;
  isSelected?: boolean;
  formatDuration: (minutes: number) => string;
}) => {
  const { lightFeedback } = useLotusHaptic();

  return (
    <TouchableOpacity 
      style={[
        chainStyles.container,
        isSelected && chainStyles.selectedContainer
      ]}
      onPress={() => {
        lightFeedback();
        onEdit();
      }}
      activeOpacity={0.7}
    >
      <View style={[
        chainStyles.indexContainer,
        isSelected && chainStyles.selectedIndexContainer
      ]}>
        <Text style={chainStyles.indexText}>{index + 1}</Text>
      </View>
      
      <View style={chainStyles.infoContainer}>
        <Text style={[
          chainStyles.detailsText,
          isSelected && chainStyles.selectedText
        ]}>
          {item.rounds} rounds × {formatDuration(item.duration)}, {item.interval}s rest
        </Text>
      </View>
      
      <TouchableOpacity 
        style={chainStyles.removeButton}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the edit
          lightFeedback();
          onRemove();
        }}
        activeOpacity={0.7}
      >
        <FontAwesome name="trash" size={14} color={colors.readioWhite} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.readioBlack + '10',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.readioBrown + '30',
  },
  label: {
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.readioOrange,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.readioOrange + 'CC',
  },
  valueDisplay: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.readioBlack,
  },
  valueText: {
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
});

const chainStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.readioBlack + '20',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.readioBlack + '40',
  },
  selectedContainer: {
    backgroundColor: colors.readioOrange + '40',
    borderColor: colors.readioOrange + '80',
    borderWidth: 2,
  },
  indexContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.readioBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIndexContainer: {
    backgroundColor: colors.readioOrange,
  },
  indexText: {
    fontSize: 14,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailsText: {
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  selectedText: {
    color: colors.readioWhite,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.readioBrown + '60',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const LotusPresetTimerModal = ({ visible, onClose, presetName }: PresetTimerModalProps) => {
  const timerContext = useLotusTimer();
  
  // Safety check
  if (!timerContext) {
    return null;
  }
  
  const { 
    timerState, 
    timerChain,
    setTimerState,
    startTimer,
    startChain,
    setTimerType, 
    setPresetName,
    addToChain,
    removeFromChain,
    clearChain,
    updateTimerInChain,
    loadPreset,
    resetToDefaults,
    incrementRounds,
    decrementRounds,
    incrementDuration,
    decrementDuration,
    incrementInterval,
    decrementInterval,
    incrementPreparation,
    decrementPreparation,
    formatTime,
    formatDuration,
    getTotalChainTime,
    presets,
    logTimerState
  } = timerContext;
  
  const { successFeedback, lightFeedback } = useLotusHaptic();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(100)).current;
  
  // State for editing timers in chain
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);

  // Debug logging function for modal
  const logModalState = (action: string, additionalData?: any) => {
    if (additionalData) {
    }
  };

  // Set timer configuration when modal opens
  useEffect(() => {
    if (visible && presetName) {
      logModalState('MODAL_OPENING', { 
        visible, 
        presetName,
        currentChainLength: timerChain.length 
      });
      setTimerType('preset');
      setPresetName(presetName);
      loadPreset(presetName);
    }
  }, [visible, presetName]);

  // Handle animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateYValue, {
          toValue: 0,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYValue, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const handleAddToChain = () => {
    // Auto-generate name based on chain length
    const autoName = `Timer ${timerChain.length + 1}`;
    logModalState('HANDLE_ADD_TO_CHAIN', { 
      autoName, 
      currentChainLength: timerChain.length,
      timerStateBeforeAdd: {
        rounds: timerState.rounds,
        duration: timerState.duration,
        interval: timerState.interval,
        preparation: timerState.preparation,
      }
    });
    addToChain(autoName);
    lightFeedback();
  };

  const handleEditTimer = (timerId: string) => {
    // If already editing this timer, deselect it
    if (editingTimerId === timerId) {
      logModalState('HANDLE_EDIT_TIMER_DESELECT', { timerId });
      setEditingTimerId(null);
      lightFeedback();
      return;
    }
    
    // Find the timer and load its settings for editing
    const timerToEdit = timerChain.find(t => t.id === timerId);
    if (timerToEdit) {
      logModalState('HANDLE_EDIT_TIMER_SELECT', { 
        timerId, 
        timerToEdit,
        currentTimerState: {
          rounds: timerState.rounds,
          duration: timerState.duration,
          interval: timerState.interval,
          preparation: timerState.preparation,
        }
      });
      setTimerState({
        ...timerState,
        rounds: timerToEdit.rounds,
        duration: timerToEdit.duration,
        interval: timerToEdit.interval,
        preparation: timerToEdit.preparation,
        timeRemaining: timerToEdit.duration * 60,
      });
      setEditingTimerId(timerId);
      lightFeedback();
    }
  };

  const handleUpdateTimer = () => {
    if (editingTimerId) {
      // Find the timer in the chain and update it with current timerState values
      const timerIndex = timerChain.findIndex(t => t.id === editingTimerId);
      if (timerIndex !== -1) {
        const originalTimer = timerChain[timerIndex];
        
        // Prepare the updates
        const updates = {
          rounds: timerState.rounds,
          duration: timerState.duration,
          interval: timerState.interval,
          preparation: timerState.preparation,
        };
        
        logModalState('HANDLE_UPDATE_TIMER', {
          editingTimerId,
          timerIndex,
          originalTimer,
          updates,
          currentTimerState: {
            rounds: timerState.rounds,
            duration: timerState.duration,
            interval: timerState.interval,
            preparation: timerState.preparation,
          },
          chainLengthBefore: timerChain.length
        });
        
        // Use the new updateTimerInChain function to update only this specific timer
        // This preserves the order and doesn't affect other timers in the chain
        updateTimerInChain(editingTimerId, updates);
      }
      
      setEditingTimerId(null);
      lightFeedback();
    }
  };

  const handleClose = () => {
    lightFeedback();
    setEditingTimerId(null);
    resetToDefaults();
    onClose();
  };

  const handleStart = () => {
    logModalState('HANDLE_START_BEFORE_UPDATE', {
      editingTimerId,
      chainLength: timerChain.length,
      willStartChain: timerChain.length > 0
    });
    
    handleUpdateTimer();
    successFeedback();
    
    // Automatically choose single timer or chain based on what's available
    if (timerChain.length > 0) {
      logModalState('HANDLE_START_CHAIN', { chainLength: timerChain.length });
      startChain(); // Start the full chain
    } else {
      logModalState('HANDLE_START_TIMER', { singleTimer: true });
      startTimer(); // Start just the current timer
    }
    
    onClose();
  };



  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackground}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ scale: scaleValue }, { translateY: translateYValue }] },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.modalTitle}>
                {presetName}
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Debug Button */}
                {/* <Pressable 
                  onPress={() => {
                    logTimerState('MANUAL_DEBUG_FROM_MODAL');
                    logModalState('MANUAL_DEBUG_MODAL_STATE');
                  }} 
                  style={[styles.closeButton, { backgroundColor: colors.readioBlack + '60' }]}
                >
                  <FontAwesome name="bug" size={16} color={colors.readioOrange} />
                </Pressable> */}
                
                <Pressable 
                  onPress={handleClose} 
                  style={styles.closeButton}
                >
                  <FontAwesome name="close" size={20} color={colors.readioWhite} />
                </Pressable>
              </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }} 
              style={styles.scrollContainer} 
              showsVerticalScrollIndicator={false}
            >

              {/* Timer Settings Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {editingTimerId 
                    ? `Editing Timer ${timerChain.findIndex(t => t.id === editingTimerId) + 1}` 
                    : 'Customize This Preset'
                  }
                </Text>
                <Text style={styles.modalText}>
                  {editingTimerId
                    ? 'Modify the selected timer settings'
                    : 'Adjust these settings and add timers to create a custom chain'
                  }
                </Text>
                
                <View style={styles.settingsList}>
                  <TimerSettingItem
                    label="Rounds"
                    value={timerState.rounds.toString()}
                    onIncrement={incrementRounds}
                    onDecrement={decrementRounds}
                  />
                  
                  <TimerSettingItem
                    label="Preparation Time"
                    value={formatTime(timerState.preparation || 10)}
                    onIncrement={incrementPreparation}
                    onDecrement={decrementPreparation}
                  />
                  
                  <TimerSettingItem
                    label="Round Duration"
                    value={formatDuration(timerState.duration)}
                    onIncrement={incrementDuration}
                    onDecrement={decrementDuration}
                  />
                  
                  <TimerSettingItem
                    label="Rest Between Rounds"
                    value={formatTime(timerState.interval)}
                    onIncrement={incrementInterval}
                    onDecrement={decrementInterval}
                  />
                </View>
              </View>

              {/* Add to Chain / Update Timer Section */}
              <View style={styles.section}>
                {editingTimerId && (
                  <TouchableOpacity 
                    style={[styles.addToChainButton, styles.updateButton]}
                    onPress={handleUpdateTimer}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="check" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                    <Text style={styles.addToChainText}>
                      Update Timer {timerChain.findIndex(t => t.id === editingTimerId) + 1}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.addToChainButton}
                  onPress={handleAddToChain}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="plus" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                  <Text style={styles.addToChainText}>Add Timer {timerChain.length + 1} to Chain</Text>
                </TouchableOpacity>
              </View>

              {/* Timer Chain Display */}
              {timerChain.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.chainHeader}>
                    <Text style={styles.sectionTitle}>
                      Timer Chain ({timerChain.length}) - {getTotalChainTime()}
                    </Text>
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => {
                        lightFeedback();
                        clearChain();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.chainList}>
                    {timerChain.map((item, index) => (
                      <ChainItem
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={() => removeFromChain(item.id)}
                        onEdit={() => handleEditTimer(item.id)}
                        isSelected={editingTimerId === item.id}
                        formatDuration={formatDuration}
                      />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Start Button */}
            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleStart}
            >
              <Text style={styles.startButtonText}>
                Start {presetName}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: colors.readioBrown,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.readioBrown,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.readioOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  presetDescription: {
    fontSize: 15,
    color: colors.readioOrange,
    fontFamily: readioRegularFont,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: colors.readioOrange + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.readioOrange + '40',
  },
  modalText: {
    fontSize: 14,
    color: colors.readioWhite + 'CC',
    fontFamily: readioRegularFont,
    marginBottom: 15,
    lineHeight: 20,
  },
  settingsList: {
    gap: 0,
  },
  addToChainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.readioBlack,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: colors.readioOrange,
  },
  addToChainText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  chainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.readioBrown + '60',
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    fontSize: 14,
  },
  chainList: {
    gap: 0,
  },
  startButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  startButtonText: {
    color: colors.readioWhite,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    fontSize: 18,
  },
});

export default LotusPresetTimerModal; 