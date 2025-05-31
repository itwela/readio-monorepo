import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface AdminSyncDashboardProps {
  style?: any;
}

export const AdminSyncDashboard: React.FC<AdminSyncDashboardProps> = ({ style }) => {
  const { userIsAdmin } = useLotusUser();
  const [isLoading, setIsLoading] = useState({
    fithop: false,
    audiobooks: false,
    linerNotes: false
  });
  
  const syncFithopMutation = () => {
    console.log('syncFithopMutation');
  }
  const syncAudiobooksMutation = () => {
    console.log('syncAudiobooksMutation');
  }
  const syncLinerNotesMutation = () => {
    console.log('syncLinerNotesMutation');
  }

  // Only show to admins
  if (!userIsAdmin) {
    return null;
  }

  const handleSync = async (type: 'fithop' | 'audiobooks' | 'linerNotes') => {
    Alert.alert(
      'Confirm Sync',
      `Are you sure you want to sync ${type} to articles? This should only be done when new content is added.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sync', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(prev => ({ ...prev, [type]: true }));
            
            try {
              let result;
              switch (type) {
                case 'fithop':
                  result = await syncFithopMutation();
                  break;
                case 'audiobooks':
                  result = await syncAudiobooksMutation();
                  break;
                case 'linerNotes':
                  result = await syncLinerNotesMutation();
                  break;
              }
              
              Alert.alert('Success', `${type} sync completed successfully!`);
              console.log(`✅ ${type} sync result:`, result);
            } catch (error) {
              Alert.alert('Error', `Failed to sync ${type}: ${error}`);
              console.error(`❌ ${type} sync error:`, error);
            } finally {
              setIsLoading(prev => ({ ...prev, [type]: false }));
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>🔧 Admin Sync Dashboard</Text>
      <Text style={styles.subtitle}>
        Sync operations to update the articles table with new content.
        Only run when new content is added!
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.syncButton, isLoading.fithop && styles.disabled]}
          onPress={() => handleSync('fithop')}
          disabled={isLoading.fithop}
        >
          <Text style={styles.buttonText}>
            {isLoading.fithop ? 'Syncing...' : 'Sync Fithop Music'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.syncButton, isLoading.audiobooks && styles.disabled]}
          onPress={() => handleSync('audiobooks')}
          disabled={isLoading.audiobooks}
        >
          <Text style={styles.buttonText}>
            {isLoading.audiobooks ? 'Syncing...' : 'Sync Audiobooks'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.syncButton, isLoading.linerNotes && styles.disabled]}
          onPress={() => handleSync('linerNotes')}
          disabled={isLoading.linerNotes}
        >
          <Text style={styles.buttonText}>
            {isLoading.linerNotes ? 'Syncing...' : 'Sync Liner Notes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.readioBlack,
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  title: {
    color: colors.readioOrange,
    fontSize: 18,
    fontFamily: readioBoldFont,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.readioWhite,
    fontSize: 14,
    fontFamily: readioRegularFont,
    marginBottom: 20,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 10,
  },
  syncButton: {
    backgroundColor: colors.readioOrange,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.readioWhite,
    opacity: 0.5,
  },
  buttonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioBoldFont,
  },
}); 