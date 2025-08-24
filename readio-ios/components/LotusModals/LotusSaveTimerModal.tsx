import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

interface LotusSaveTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (presetName: string) => void;
  isLoading?: boolean;
}

export default function LotusSaveTimerModal({ 
  visible, 
  onClose, 
  onSave, 
  isLoading = false 
}: LotusSaveTimerModalProps) {
  const { lightFeedback } = useLotusHaptic();
  const [presetName, setPresetName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (!presetName.trim()) return;
    
    lightFeedback();
    onSave(presetName.trim());
    setPresetName(''); // Reset input
    
    // Show success message
    setShowSuccess(true);
    
    // Hide success message and close modal after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    lightFeedback();
    setPresetName(''); // Reset input
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
       
        <KeyboardAvoidingView 
          behavior={'padding'}
          keyboardVerticalOffset={30}
        >
         <View style={styles.container}>
         
          <View style={styles.header}>
            <FontAwesome name="save" size={24} color={colors.readioOrange} />
            <Text style={styles.title}>Save Timer Preset</Text>
          </View>
          
          {showSuccess ? (
            <>

              <View style={styles.successContainer}>
                <FontAwesome name="check-circle" size={48} color={colors.readioOrange} />
                <Text style={styles.successText}>Timer preset saved successfully!</Text>
              </View>
            
            </>
          ) : (
            <>

            <Text style={styles.message}>
              Name your timer preset to save it for later use.
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preset Name</Text>
              <TextInput
                style={styles.input}
                value={presetName}
                onChangeText={setPresetName}
                placeholder="Enter timer preset name..."
                placeholderTextColor={colors.readioWhite + '60'}
                autoFocus
                maxLength={50}
              />
            </View>
  
            <View style={styles.buttonContainer}>

              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={!presetName.trim() || isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Preset'}
                </Text>
              </TouchableOpacity>
              
            </View>

            </>
          )}

        </View>
        </KeyboardAvoidingView>
        
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    height: '100%',
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
    shadowColor: colors.readioBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
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
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.readioBlack + '20',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.readioOrange + '30',
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.readioBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: colors.readioBlack + '80',
    borderWidth: 1,
    borderColor: colors.readioOrange + '40',
  },
  saveButton: {
    backgroundColor: colors.readioOrange,
  },
  cancelButtonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successText: {
    color: colors.readioWhite,
    fontSize: 18,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
}); 