import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLotusTimer } from '@/helpers/providers/lotusTimerProvider';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';

interface CustomTimerModalProps {
  visible: boolean;
  onClose: () => void;
  presetName?: string; // Optional - if provided, editing existing preset; if not, creating new
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  presetName: string;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  visible, 
  onClose, 
  onConfirm, 
  presetName, 
  isDeleting 
}) => {
  const { lightFeedback } = useLotusHaptic();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={deleteModalStyles.overlay}>
        <View style={deleteModalStyles.container}>
          <View style={deleteModalStyles.header}>
            <FontAwesome name="warning" size={24} color={colors.readioOrange} />
            <Text allowFontScaling={false} style={deleteModalStyles.title}>Delete Timer</Text>
          </View>
          
          <Text allowFontScaling={false} style={deleteModalStyles.message}>
            Are you sure you want to delete "{presetName}"? This action is not reversible.
          </Text>
          
          <View style={deleteModalStyles.buttonContainer}>
            <TouchableOpacity 
              style={[deleteModalStyles.button, deleteModalStyles.cancelButton]}
              onPress={() => {
                lightFeedback();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text allowFontScaling={false} style={deleteModalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[deleteModalStyles.button, deleteModalStyles.deleteButton, isDeleting && deleteModalStyles.disabledButton]}
              onPress={() => {
                lightFeedback();
                onConfirm();
              }}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Text allowFontScaling={false} style={[deleteModalStyles.deleteButtonText, isDeleting && deleteModalStyles.disabledButtonText]}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const deleteModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.readioBrown,
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: colors.readioOrange + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  title: {
    fontSize: 20,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    color: colors.readioWhite + 'CC',
    fontFamily: readioRegularFont,
    lineHeight: 22,
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.readioBlack + '60',
    borderWidth: 1,
    borderColor: colors.readioWhite + '30',
  },
  deleteButton: {
    backgroundColor: colors.readioBrown,
    borderWidth: 1,
    borderColor: colors.readioOrange,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: colors.readioOrange,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: colors.readioWhite + '60',
  },
});

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
      <Text allowFontScaling={false} style={itemStyles.label}>{label}</Text>
      
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
          <Text allowFontScaling={false} style={itemStyles.valueText}>{value}</Text>
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
  formatDuration,
  formatRestTime
}: { 
  item: any; 
  index: number; 
  onRemove: () => void;
  onEdit: () => void;
  isSelected?: boolean;
  formatDuration: (minutes: number) => string;
  formatRestTime: (restMinutes: number) => string;
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
        <Text allowFontScaling={false} style={chainStyles.indexText}>{index + 1}</Text>
      </View>
      
      <View style={chainStyles.infoContainer}>
        <Text allowFontScaling={false} style={[
          chainStyles.detailsText,
          isSelected && chainStyles.selectedText
        ]}>
          {item.name}
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
    paddingVertical: 10,
    paddingHorizontal: 5,
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

const LotusCustomTimerModal = ({ visible, onClose, presetName }: CustomTimerModalProps) => {
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
    startChain,
    setTimerType, 
    setPresetName,
    addToChain,
    removeFromChain,
    clearChain,
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
    updateTimerInChain,
    loadSavedPreset,
    logTimerState
  } = timerContext;
  
  const { successFeedback, lightFeedback } = useLotusHaptic();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(100)).current;
  
  // State for editing and custom timer naming
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);
  const [currentTimerName, setCurrentTimerName] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Update preset state
  const [isUpdatingPreset, setIsUpdatingPreset] = useState<boolean>(false);
  
  // Store original preset data for comparison
  const [originalPresetData, setOriginalPresetData] = useState<any>(null);
  
  // Convex mutations and queries
  const createTimerPreset = useMutation(api.timerPresets.createTimerPreset);
  const deleteTimerPreset = useMutation(api.timerPresets.deleteTimerPreset);
  const updateTimerPreset = useMutation(api.timerPresets.updateTimerPreset);
  const userCustomPresets = useQuery(api.timerPresets.getUserTimerPresets, 
    userId ? { userId } : 'skip'
  );

  // Set timer configuration when modal opens
  useEffect(() => {
    if (visible && presetName) {
      // Check if this is a built-in preset (creating new workout) vs saved preset (editing)
      const isBuiltInPreset = ['WORK OUT', 'WORK IN', 'WORK FLOW'].includes(presetName);
      if (isBuiltInPreset) {
        setSessionType(presetName);
        // Don't set timer type or preset name - keep it blank for new workout creation
      } else {
        setTimerType('saved');
        setPresetName(presetName);
      }
    }
  }, [visible, presetName]);

  // Load saved presets when modal opens with preset name
  useEffect(() => {
    if (visible && presetName && userCustomPresets?.success && userCustomPresets.presets) {
      
      const savedPreset = userCustomPresets.presets.find(p => p.name === presetName);
      if (savedPreset && savedPreset.chain.length > 0) {
        
        // Store original preset data for comparison
        setOriginalPresetData(savedPreset);
        
        // Clear existing chain first
        clearChain();
        
        // Use the new loadSavedPreset function instead of manual manipulation
        setTimeout(() => {
          loadSavedPreset(savedPreset);
        }, 100);
      }
    }
  }, [visible, presetName, userCustomPresets]);

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

  useEffect(() => {
    if (visible) {
      // If creating a new custom session (no saved preset), reset everything.
      const isBuiltInPreset = presetName ? ['WORK OUT', 'WORK IN', 'WORK FLOW'].includes(presetName) : false;
      if (!presetName || isBuiltInPreset) {
        resetToDefaults();
        setCurrentTimerName('');
        setEditingTimerId(null);
        setOriginalPresetData(null);
      }
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const getModalTitle = () => {
    return presetName || 'Create Custom Timer'; // Default title when creating new
  };

  const isSavedPreset = () => {
    return !!presetName;
  };

  const hasUnsavedChanges = () => {
    if (!originalPresetData || !isSavedPreset()) {
      return false;
    }

    // Create current state including any edits in progress
    let currentChain = [...timerChain];
    
    // Apply any current edits to the chain
    if (editingTimerId) {
      const timerIndex = currentChain.findIndex(t => t.id === editingTimerId);
      if (timerIndex !== -1) {
        currentChain[timerIndex] = {
          ...currentChain[timerIndex],
          rounds: timerState.rounds,
          duration: timerState.duration,
          rest: timerState.rest,
          preparation: timerState.preparation,
        };
      }
    }

    // Compare chain length
    if (currentChain.length !== originalPresetData.chain.length) {
      return true;
    }

    // Compare each timer in the chain
    for (let i = 0; i < currentChain.length; i++) {
      const current = currentChain[i];
      const original = originalPresetData.chain[i];
      
      if (
        current.name !== original.name ||
        current.rounds !== original.rounds ||
        current.duration !== original.duration ||
        current.rest !== original.rest ||
        current.preparation !== original.preparation
      ) {
        return true;
      }
    }

    return false;
  };

  const handleAddToChain = () => {
    if (!currentTimerName.trim()) return;
    
    addToChain(currentTimerName.trim());
    setCurrentTimerName(''); // Clear the name field after adding
    lightFeedback();
  };

  const handleEditTimer = (timerId: string) => {
    // If already editing this timer, deselect it
    if (editingTimerId === timerId) {
      setEditingTimerId(null);
      lightFeedback();
      return;
    }
    
    // Find the timer and load its settings for editing
    const timerToEdit = timerChain.find(t => t.id === timerId);
    if (timerToEdit) {
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
      const updates = {
        rounds: timerState.rounds,
        duration: timerState.duration,
        rest: timerState.rest,
        preparation: timerState.preparation,
      };
      
      updateTimerInChain(editingTimerId, updates);
            
      setEditingTimerId(null);
      setCurrentTimerName(''); // Clear the name field
      lightFeedback();
    }
  };

  const handleClose = () => {
    lightFeedback();
    setEditingTimerId(null);
    setCurrentTimerName('');
    setSessionType('');
    setIsUpdatingPreset(false);
    setShowDeleteModal(false);
    setIsDeleting(false);
    setOriginalPresetData(null);
    // Removed automatic reset to preserve timer state when starting a workout session.
    onClose();
  };

  const handleDeletePress = () => {
    lightFeedback();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!presetName || !userCustomPresets?.success) return;
    
    const presetToDelete = userCustomPresets.presets?.find(p => p.name === presetName);
    if (!presetToDelete) {
      Alert.alert('Error', 'Preset not found');
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await deleteTimerPreset({ presetId: presetToDelete._id });
      
      if (result.success) {
        Alert.alert('Success', result.message || 'Timer preset deleted successfully!');
        successFeedback();
        
        // Clear all state and close
        setShowDeleteModal(false);
        setEditingTimerId(null);
        setIsUpdatingPreset(false);
        setOriginalPresetData(null);
        resetToDefaults();
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to delete timer preset');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      Alert.alert('Error', 'Failed to delete timer preset. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    lightFeedback();
    setShowDeleteModal(false);
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
              <Text allowFontScaling={false} style={styles.modalTitle}>
                {getModalTitle()}
              </Text>
              
              <View style={styles.headerButtons}>
                {/* Debug button */}
                {/* <Pressable 
                  onPress={() => {
                                    logTimerState('SAVED_MODAL_DEBUG', {
                  editingTimerId,
                  currentTimerState: timerState,
                  modalType: 'saved'
                });
                  }} 
                  style={styles.debugButton}
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
              {/* Exercise Name Section */}
              <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.sectionTitle}>
                  {sessionType === 'WORK IN' ? 'Name Your Practice' : 
                   sessionType === 'WORK FLOW' ? 'Name Your Task' : 
                   'Name Your Exercise'}
                </Text>
                <View style={styles.nameInputContainer}>
                  <FontAwesome name="tag" size={16} color={colors.readioOrange} style={styles.pencilIcon} />
                  <TextInput
                    allowFontScaling={false}
                    style={styles.nameInput}
                    placeholder={
                      sessionType === 'WORK IN' ? 'e.g., Meditation, Yoga, Stretching...' :
                      sessionType === 'WORK FLOW' ? 'e.g., Deep Work, Email, Planning...' :
                      'e.g., Push Ups, Squats, Burpees...'
                    }
                    placeholderTextColor={colors.readioWhite + '60'}
                    value={currentTimerName}
                    onChangeText={setCurrentTimerName}
                    autoCapitalize="words"
                    returnKeyType="done"
                    maxLength={20}
                  />
                </View>
              </View>

              {/* Timer Settings Section */}
              <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.sectionTitle}>
                  Settings
                </Text>
                
                <View style={styles.settingsList}>
                  <TimerSettingItem
                    label="Rounds"
                    value={timerState.rounds.toString()}
                    onIncrement={incrementRounds}
                    onDecrement={decrementRounds}
                  />
                  
                    <TimerSettingItem
                      label="Time To Prepare"
                      value={formatTime(timerState.preparation)}
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
                    label="Rest Duration"
                    value={formatRestTime(timerState.rest)}
                    onIncrement={incrementRest}
                    onDecrement={decrementRest}
                  />
                </View>
              </View>

              {/* Add to Chain / Update Timer Section */}
              <View style={styles.section}>
                {editingTimerId && isSavedPreset() && (
                  <TouchableOpacity 
                    style={[styles.addToChainButton, styles.updateButton]}
                    onPress={handleUpdateTimer}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="check" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                    <Text allowFontScaling={false} style={styles.addToChainText}>Apply Changes</Text>
                  </TouchableOpacity>
                )}
                
                {currentTimerName.trim() && (
                  <TouchableOpacity 
                    style={styles.addToChainButton}
                    onPress={handleAddToChain}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="plus" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                    <Text allowFontScaling={false} style={styles.addToChainText}>Add "{currentTimerName}"</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Timer Chain Display */}
              {timerChain.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.chainHeader}>
                    <Text allowFontScaling={false} style={styles.sectionTitle}>
                      Total Time - {getTotalChainTime()}
                    </Text>
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => {
                        lightFeedback();
                        clearChain();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text allowFontScaling={false} style={styles.clearButtonText}>Clear</Text>
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
                        formatRestTime={formatRestTime}
                      />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>



            {/* Start Chain Button (for new custom timers with content) */}
            {(!isSavedPreset() || sessionType) && timerChain.length > 0 && (
              <TouchableOpacity 
                style={[styles.savePresetButton, { backgroundColor: colors.readioOrange }]}
                onPress={() => {
                  lightFeedback();
                  console.log('Starting chain with length:', timerChain.length);
                  startChain();
                  // Small delay to ensure timer starts before closing modal
                  setTimeout(() => {
                    handleClose();
                  }, 100);
                }}
                activeOpacity={0.7}
              >
                <FontAwesome name="play" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                <Text allowFontScaling={false} style={styles.savePresetText}>
                  {sessionType ? `Start ${sessionType}` : 'Start Workout'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        presetName={presetName || 'Unknown'}
        isDeleting={isDeleting}
      />
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  debugButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.readioBlack + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.readioOrange + '20',
  },
  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.readioBlack + '40',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.readioOrange + '40',
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
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.readioBlack + '20',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    width: '100%',
    borderColor: colors.readioOrange + '30',
  },
  pencilIcon: {
    marginRight: 10,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    width: '100%',
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
  savePresetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.readioBlack,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.readioOrange + '40',
  },
  savePresetText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.readioWhite + '30',
  },
  disabledButtonText: {
    color: colors.readioWhite + '60',
  },
});

export default LotusCustomTimerModal; 