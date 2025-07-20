import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLotusTimer } from '@/helpers/providers/lotusTimerProvider';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';

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

// Timer chain item display component with title
const ChainItem = ({ 
  item, 
  index, 
  onRemove,
  onSelect,
  isSelected = false,
  formatDuration
}: { 
  item: any; 
  index: number; 
  onRemove: () => void;
  onSelect: () => void;
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
        onSelect();
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
          chainStyles.titleText,
          isSelected && chainStyles.selectedTitleText
        ]}>
          {item.name}
        </Text>
        {/* <Text style={[
          chainStyles.detailsText,
          isSelected && chainStyles.selectedDetailsText
        ]}>
          {item.rounds} rounds × {formatDuration(item.duration)}, {item.rest}s rest
        </Text> */}
      </View>
      
      <TouchableOpacity 
        style={chainStyles.removeButton}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the select
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
  selectedTitleText: {
    color: colors.readioOrange,
  },
  selectedDetailsText: {
    color: colors.readioOrange,
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
  titleText: {
    fontSize: 18,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
    marginBottom: 4,
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
  const { userId } = useLotusAuth();
  
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
    incrementRest,
    decrementRest,
    incrementPreparation,
    decrementPreparation,
    formatTime,
    formatDuration,
    formatRestTime,
    getTotalChainTime,
    presets,
    logTimerState
  } = timerContext;
  
  const { successFeedback, lightFeedback } = useLotusHaptic();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(100)).current;
  
  // State for editing
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);

  // State for saving modified presets as new saved presets
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [savePresetName, setSavePresetName] = useState<string>('');
  const [isSavingPreset, setIsSavingPreset] = useState<boolean>(false);
  
  // Convex mutation for creating timer presets
  const createTimerPreset = useMutation(api.timerPresets.createTimerPreset);

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
      setEditingTimerId(null);
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
        rest: timerState.rest,
        preparation: timerState.preparation,
      }
    });
    addToChain(autoName);
    lightFeedback();
  };

  const handleEditTimer = (timerId: string) => {
    // Find the timer and load its settings for editing
    const timerToEdit = timerChain.find(t => t.id === timerId);
    if (timerToEdit) {
      logModalState('HANDLE_EDIT_TIMER_SELECT', { 
        timerId, 
        timerToEdit,
        currentTimerState: {
          rounds: timerState.rounds,
          duration: timerState.duration,
          rest: timerState.rest,
          preparation: timerState.preparation,
        }
      });
      setTimerState({
        ...timerState,
        rounds: timerToEdit.rounds,
        duration: timerToEdit.duration,
        rest: timerToEdit.rest,
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
          rest: timerState.rest,
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
            rest: timerState.rest,
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

  const handleBackToChainList = () => {
    lightFeedback();
    setEditingTimerId(null);
    resetToDefaults();
  };

  const handleClose = () => {
    lightFeedback();
    setEditingTimerId(null);
    setShowSaveModal(false);
    setSavePresetName('');
    setIsSavingPreset(false);
    resetToDefaults();
    onClose();
  };

  const handleSaveAsPreset = async () => {
    if (!savePresetName.trim() || timerChain.length === 0) {
      Alert.alert('Error', 'Please enter a preset name and ensure you have timers in the chain.');
      return;
    }
    
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to save presets.');
      return;
    }
    
    if (isSavingPreset) return;
    
    setIsSavingPreset(true);
    
    try {
      // Apply any current edits to the chain before saving
      let finalChain = [...timerChain];
      if (editingTimerId) {
        const timerIndex = finalChain.findIndex(t => t.id === editingTimerId);
        if (timerIndex !== -1) {
          finalChain[timerIndex] = {
            ...finalChain[timerIndex],
            rounds: timerState.rounds,
            duration: timerState.duration,
            rest: timerState.rest,
            preparation: timerState.preparation,
          };
        }
      }
      
      const presetData = {
        name: savePresetName.trim(),
        description: `Modified ${presetName} preset with ${finalChain.length} timers`,
        type: 'saved' as const,
        userId: userId,
        isPublic: false,
        
        // Timer chain data
        chain: finalChain.map((timer, index) => ({
          order: index,
          name: timer.name,
          rounds: timer.rounds,
          duration: timer.duration,
          rest: timer.rest,
          preparation: timer.preparation,
        })),
        
        // Computed metadata
        totalTimers: finalChain.length,
        totalDuration: getTotalChainTime(),
        totalRounds: finalChain.reduce((sum, timer) => sum + timer.rounds, 0),
        
        // Tags for categorization
        tags: ['saved', 'modified', presetName.toLowerCase()],
      };
      
      const result = await createTimerPreset(presetData);
      
      if (result.success) {
        Alert.alert('Success', `${savePresetName} saved successfully!`);
        successFeedback();
        setShowSaveModal(false);
        setSavePresetName('');
      } else {
        Alert.alert('Error', result.error || 'Failed to save preset');
      }
      
    } catch (error) {
      console.error('Error saving preset:', error);
      Alert.alert('Error', 'Failed to save preset. Please try again.');
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleShowSaveModal = () => {
    if (timerChain.length === 0) {
      Alert.alert('Nothing to Save', 'Please add some timers to the chain before saving.');
      return;
    }
    setSavePresetName(`My ${presetName}`);
    setShowSaveModal(true);
    lightFeedback();
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
              {/* <Text style={styles.modalTitle}>
                {presetName}
              </Text> */}
              <View/>
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable 
                  onPress={handleClose} 
                  style={styles.closeButton}
                >
                  <FontAwesome name="close" size={20} color={colors.readioWhite} />
                </Pressable>
              </View>

            </View>

            {/* Content */}
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }} 
              style={styles.scrollContainer} 
              showsVerticalScrollIndicator={false}
            >
              {/* Add Timer Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add Timer to Chain</Text>
                <Text style={styles.modalText}>
                  Create a new timer and add it to your chain
                </Text>
                
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
                        onSelect={() => handleEditTimer(item.id)}
                        isSelected={editingTimerId === item.id}
                        formatDuration={formatDuration}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Customization Panel - Only show when editing */}
              {editingTimerId && (
                <View style={styles.section}>
                  <View style={styles.customizationHeader}>
                    <Text style={styles.sectionTitle}>
                      Customize Timer Settings
                    </Text>
                    <TouchableOpacity 
                      style={styles.backButton}
                      onPress={handleBackToChainList}
                      activeOpacity={0.7}
                    >
                      <FontAwesome name="times" size={16} color={colors.readioWhite} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalText}>
                    Modify the selected timer settings
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
                      value={formatRestTime(timerState.rest)}
                      onIncrement={incrementRest}
                      onDecrement={decrementRest}
                    />
                  </View>

                  {/* Update Timer Button */}
                  <TouchableOpacity 
                    style={[styles.addToChainButton, styles.updateButton]}
                    onPress={handleUpdateTimer}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="check" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                    <Text style={styles.addToChainText}>
                      Update Timer
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Save as Preset Button */}
              {timerChain.length > 0 && (
                <TouchableOpacity 
                  style={[styles.saveButton, { marginBottom: 10 }]}
                  onPress={handleShowSaveModal}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="bookmark" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                  <Text style={styles.saveButtonText}>
                    Save as Preset
                  </Text>
                </TouchableOpacity>
              )}

              {/* Start Button */}
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStart}
              >
                <Text style={styles.startButtonText}>
                  Start {presetName}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
      
      {/* Save Preset Modal */}
      <Modal
        transparent
        visible={showSaveModal}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.saveModalOverlay}>
          <View style={styles.saveModalContainer}>
            <View style={styles.saveModalHeader}>
              <FontAwesome name="bookmark" size={24} color={colors.readioOrange} />
              <Text style={styles.saveModalTitle}>Save as Preset</Text>
            </View>
            
            <Text style={styles.saveModalText}>
              Enter a name for your customized {presetName} preset:
            </Text>
            
            <TextInput
              style={styles.saveModalInput}
              placeholder="Preset name..."
              placeholderTextColor={colors.readioWhite + '60'}
              value={savePresetName}
              onChangeText={setSavePresetName}
              autoCapitalize="words"
              returnKeyType="done"
              maxLength={20}
              autoFocus
            />
            
            <View style={styles.saveModalButtons}>
              <TouchableOpacity 
                style={[styles.saveModalButton, styles.cancelButton]}
                onPress={() => {
                  lightFeedback();
                  setShowSaveModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveModalButton, styles.confirmButton, isSavingPreset && styles.disabledButton]}
                onPress={handleSaveAsPreset}
                disabled={isSavingPreset || !savePresetName.trim()}
                activeOpacity={0.7}
              >
                <Text style={[styles.confirmButtonText, isSavingPreset && styles.disabledButtonText]}>
                  {isSavingPreset ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  customizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.readioBlack + '60',
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.readioBlack,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  saveButtonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  saveModalOverlay: {
    flex: 1,
    backgroundColor: colors.readioBrown + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveModalContainer: {
    width: '80%',
    backgroundColor: colors.readioBlack,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  saveModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveModalTitle: {
    fontSize: 20,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  saveModalText: {
    fontSize: 16,
    color: colors.readioWhite + 'CC',
    fontFamily: readioRegularFont,
    textAlign: 'center',
    marginBottom: 20,
  },
  saveModalInput: {
    width: '100%',
    height: 50,
    backgroundColor: colors.readioBlack + '20',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioRegularFont,
    borderWidth: 1,
    borderColor: colors.readioOrange + '40',
  },
  saveModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.readioBrown + '60',
  },
  cancelButtonText: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: colors.readioOrange,
  },
  confirmButtonText: {
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  disabledButtonText: {
    color: colors.readioWhite + '60',
  },
});

export default LotusPresetTimerModal; 