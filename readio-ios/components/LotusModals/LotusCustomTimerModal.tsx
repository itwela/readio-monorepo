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
  presetName?: string; // If provided, editing existing custom preset
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
            <Text style={deleteModalStyles.title}>Delete Timer</Text>
          </View>
          
          <Text style={deleteModalStyles.message}>
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
              <Text style={deleteModalStyles.cancelButtonText}>Cancel</Text>
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
              <Text style={[deleteModalStyles.deleteButtonText, isDeleting && deleteModalStyles.disabledButtonText]}>
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

const LotusCustomTimerModal = ({ visible, onClose, presetName }: CustomTimerModalProps) => {
  const timerContext = useLotusTimer();
  const { userId } = useLotusAuth();
  
  // Safety check
  if (!timerContext) {
    console.log('❌ Timer context not available');
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
    incrementInterval,
    decrementInterval,
    incrementPreparation,
    decrementPreparation,
    formatTime,
    formatDuration,
    getTotalChainTime
  } = timerContext;
  
  const { successFeedback, lightFeedback } = useLotusHaptic();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(100)).current;
  
  // State for editing and custom timer naming
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);
  const [customTimerName, setCustomTimerName] = useState<string>('');
  const [isSavingPreset, setIsSavingPreset] = useState<boolean>(false);
  
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
    if (visible) {
      setTimerType('custom');
      setPresetName(presetName);
    }
  }, [visible, presetName]);

  // Load custom presets when modal opens with preset name
  useEffect(() => {
    if (visible && presetName && userCustomPresets?.success && userCustomPresets.presets) {
      console.log('🔍 Loading custom preset from database:', presetName);
      
      const customPreset = userCustomPresets.presets.find(p => p.name === presetName);
      if (customPreset && customPreset.chain.length > 0) {
        console.log('✅ Found preset in database:', customPreset);
        
        // Store original preset data for comparison
        setOriginalPresetData(customPreset);
        
        // Clear existing chain first
        clearChain();
        
        // Load the first timer settings into the current timer state
        const firstTimer = customPreset.chain[0];
        setTimerState({
          ...timerState,
          rounds: firstTimer.rounds,
          duration: firstTimer.duration,
          interval: firstTimer.interval,
          preparation: firstTimer.preparation,
          timeRemaining: firstTimer.duration * 60,
          timerType: 'custom',
          presetName: customPreset.name,
        });
        
        // Add each timer to the chain
        setTimeout(() => {
          customPreset.chain.forEach((timer) => {
            // Temporarily set the timer state to match this chain item
            setTimerState({
              ...timerState,
              rounds: timer.rounds,
              duration: timer.duration,
              interval: timer.interval,
              preparation: timer.preparation,
              timeRemaining: timer.duration * 60,
            });
            // Add to chain with the original name
            addToChain(timer.name);
          });
          
          // Reset back to the first timer's settings
          setTimerState({
            ...timerState,
            rounds: firstTimer.rounds,
            duration: firstTimer.duration,
            interval: firstTimer.interval,
            preparation: firstTimer.preparation,
            timeRemaining: firstTimer.duration * 60,
            timerType: 'custom',
            presetName: customPreset.name,
          });
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

  if (!visible) {
    return null;
  }

  const getModalTitle = () => {
    if (presetName) {
      return presetName; // Editing existing custom preset
    }
    return 'Custom Timer'; // Creating new custom timer
  };

  const isCreatingNewCustomTimer = () => {
    return !presetName;
  };

  const isSavedCustomPreset = () => {
    return !!presetName;
  };

  const hasUnsavedChanges = () => {
    if (!originalPresetData || !isSavedCustomPreset()) {
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
          interval: timerState.interval,
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
        current.interval !== original.interval ||
        current.preparation !== original.preparation
      ) {
        return true;
      }
    }

    return false;
  };

  const handleAddToChain = () => {
    // Auto-generate name based on chain length
    const autoName = `Timer ${timerChain.length + 1}`;
    addToChain(autoName);
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
        // Create updated chain with the new values
        const updatedChain = [...timerChain];
        updatedChain[timerIndex] = {
          ...updatedChain[timerIndex],
          rounds: timerState.rounds,
          duration: timerState.duration,
          interval: timerState.interval,
          preparation: timerState.preparation,
        };
        
        // Force update the chain by clearing and re-adding all timers
        clearChain();
        setTimeout(() => {
          updatedChain.forEach((timer) => {
            // Temporarily set the timer state to match this chain item
            setTimerState({
              ...timerState,
              rounds: timer.rounds,
              duration: timer.duration,
              interval: timer.interval,
              preparation: timer.preparation,
              timeRemaining: timer.duration * 60,
            });
            // Add to chain with the original name
            addToChain(timer.name);
          });
        }, 50);
      }
      
      setEditingTimerId(null);
      lightFeedback();
    }
  };

  const handleClose = () => {
    lightFeedback();
    setEditingTimerId(null);
    setCustomTimerName('');
    setIsSavingPreset(false);
    setIsUpdatingPreset(false);
    setShowDeleteModal(false);
    setIsDeleting(false);
    setOriginalPresetData(null);
    resetToDefaults();
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
        setCustomTimerName('');
        setIsSavingPreset(false);
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

  const handleUpdatePreset = async () => {
    if (!presetName || !userCustomPresets?.success || timerChain.length === 0) {
      Alert.alert('Error', 'Cannot update preset - no changes detected or chain is empty.');
      return;
    }
    
    const presetToUpdate = userCustomPresets.presets?.find(p => p.name === presetName);
    if (!presetToUpdate) {
      Alert.alert('Error', 'Original preset not found');
      return;
    }

    if (isUpdatingPreset) return;
    
    setIsUpdatingPreset(true);
    
    try {
      // Create a copy of the timer chain to work with
      let updatedChain = [...timerChain];
      
      // If there's a timer currently being edited, apply those changes to the chain
      if (editingTimerId) {
        const timerIndex = updatedChain.findIndex(t => t.id === editingTimerId);
        if (timerIndex !== -1) {
          updatedChain[timerIndex] = {
            ...updatedChain[timerIndex],
            rounds: timerState.rounds,
            duration: timerState.duration,
            interval: timerState.interval,
            preparation: timerState.preparation,
          };
        }
      } 
      
      // Prepare updated data with the current edits included
      const updatedData = {
        chain: updatedChain.map((timer, index) => ({
          order: index,
          name: timer.name,
          rounds: timer.rounds,
          duration: timer.duration,
          interval: timer.interval,
          preparation: timer.preparation,
        })),
        totalTimers: updatedChain.length,
        totalDuration: getTotalChainTime(),
        totalRounds: updatedChain.reduce((sum, timer) => sum + timer.rounds, 0),
      };
      
      const result = await updateTimerPreset({ 
        presetId: presetToUpdate._id, 
        updates: updatedData 
      });
      
      if (result.success) {
        Alert.alert('Success', result.message || 'Timer preset updated successfully!');
        successFeedback();
        // Clear the editing state since changes are saved
        setEditingTimerId(null);
        // Update original preset data to match current state
        if (originalPresetData) {
          setOriginalPresetData({
            ...originalPresetData,
            chain: updatedData.chain
          });
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update timer preset');
      }
      
    } catch (error) {
      console.error('Error updating preset:', error);
      Alert.alert('Error', 'Failed to update timer preset. Please try again.');
    } finally {
      setIsUpdatingPreset(false);
    }
  };

  const handleSaveAsPreset = async () => {
    if (!customTimerName.trim() || timerChain.length === 0) {
      Alert.alert('Error', 'Please enter a timer name and add at least one timer to the chain.');
      return;
    }
    
    if (isSavingPreset) return;
    
    setIsSavingPreset(true);
    
    try {
      const presetData = {
        name: customTimerName.trim(),
        description: `Custom ${timerChain.length}-timer ${customTimerName.trim()} chain`,
        type: 'custom' as const,
        userId: userId as string,
        isPublic: false,
        
        // Timer chain data
        chain: timerChain.map((timer, index) => ({
          order: index,
          name: timer.name,
          rounds: timer.rounds,
          duration: timer.duration,
          interval: timer.interval,
          preparation: timer.preparation,
        })),
        
        // Computed metadata
        totalTimers: timerChain.length,
        totalDuration: getTotalChainTime(),
        totalRounds: timerChain.reduce((sum, timer) => sum + timer.rounds, 0),
        
        // Tags for categorization
        tags: ['custom', 'workout'],
      };
      
      const result = await createTimerPreset(presetData);
      
      if (result.success) {
        Alert.alert('Success', result.message || 'Timer preset saved successfully!');
        successFeedback();
        handleClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to save timer preset');
      }
      
    } catch (error) {
      console.error('Error saving preset:', error);
      Alert.alert('Error', 'Failed to save timer preset. Please try again.');
    } finally {
      setIsSavingPreset(false);
    }
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
              {isCreatingNewCustomTimer() ? (
                <View style={styles.nameInputContainer}>
                  <FontAwesome name="pencil" size={16} color={colors.readioOrange} style={styles.pencilIcon} />
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Name your timer (10 chars max)..."
                    placeholderTextColor={colors.readioWhite + '60'}
                    value={customTimerName}
                    onChangeText={setCustomTimerName}
                    autoCapitalize="words"
                    returnKeyType="done"
                    maxLength={10}
                  />
                </View>
              ) : (
                <Text style={styles.modalTitle}>
                  {getModalTitle()}
                </Text>
              )}
              
              <View style={styles.headerButtons}>
                {/* Delete button for saved custom presets */}
                {isSavedCustomPreset() && (
                  <Pressable 
                    onPress={handleDeletePress} 
                    style={styles.deleteButton}
                  >
                    <FontAwesome name="trash" size={18} color={colors.readioOrange} />
                  </Pressable>
                )}
                
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
                    : isCreatingNewCustomTimer() ? `${customTimerName || 'New Timer'} Settings` :
                    'Current Timer (Editable)'
                  }
                </Text>
                <Text style={styles.modalText}>
                  {editingTimerId
                    ? 'Modify the selected timer settings'
                    : isCreatingNewCustomTimer()
                      ? 'Set up your timer preferences'
                      : 'Adjust the current timer or add custom timers to your preset chain'
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
                {editingTimerId && !isSavedCustomPreset() && (
                  <TouchableOpacity 
                    style={[styles.addToChainButton, styles.updateButton]}
                    onPress={handleUpdateTimer}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="check" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                    <Text style={styles.addToChainText}>Apply Changes</Text>
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

            {/* Save as Preset Button (only for new custom timers with content) */}
            {isCreatingNewCustomTimer() && customTimerName.trim() && timerChain.length > 0 && (
              <TouchableOpacity 
                style={[styles.savePresetButton, isSavingPreset && styles.disabledButton]}
                onPress={handleSaveAsPreset}
                activeOpacity={0.7}
                disabled={isSavingPreset}
              >
                <FontAwesome name="bookmark" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                <Text style={[styles.savePresetText, isSavingPreset && styles.disabledButtonText]}>
                  {isSavingPreset ? 'Saving...' : 'Save as Preset'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Update Preset Button (only for saved custom presets with content) */}
            {isSavedCustomPreset() && timerChain.length > 0 && (
              <View style={{ paddingVertical: 15 }}>
                <TouchableOpacity 
                  style={[
                    styles.savePresetButton, 
                    hasUnsavedChanges() 
                      ? { backgroundColor: colors.readioOrange } 
                      : { backgroundColor: colors.readioBlack },
                    isUpdatingPreset && styles.disabledButton
                  ]}
                  onPress={handleUpdatePreset}
                  activeOpacity={0.7}
                  disabled={isUpdatingPreset}
                >
                  <FontAwesome name="refresh" size={18} color={colors.readioWhite} style={{ marginRight: 10 }} />
                  <Text style={[styles.savePresetText, isUpdatingPreset && styles.disabledButtonText]}>
                    {isUpdatingPreset ? 'Updating...' : 'Update Preset'}
                  </Text>
                </TouchableOpacity>
              </View>
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
    width: '80%',
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