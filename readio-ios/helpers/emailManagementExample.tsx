import React, { useState } from 'react';
import { useLotusUser } from './providers/lotusUserContext';

/**
 * Example component showing how to use the email management functions
 * This demonstrates how to check if a user has an email and add one if they don't
 */
export const EmailManagementExample: React.FC = () => {
  const { checkEmailExists, addEmailToUser, user } = useLotusUser();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCheckEmail = async () => {
    if (!checkEmailExists) return;
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await checkEmailExists();
      
      if (result.success) {
        setMessage('User can add an email address');
      } else {
        switch (result.errorType) {
          case 'EMAIL_ALREADY_EXISTS':
            setMessage(`User already has an email: ${result.currentEmail}`);
            break;
          case 'USER_NOT_FOUND':
            setError('User not found. Please sign in again.');
            break;
          case 'NO_TOKEN':
            setError('No authentication token. Please sign in.');
            break;
          default:
            setError(result.error || 'Unknown error occurred');
        }
      }
    } catch (err) {
      setError('Failed to check email status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!addEmailToUser || !email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await addEmailToUser(email.trim());
      
      if (result.success) {
        setMessage(`Email "${result.email}" added successfully!`);
        setEmail(''); // Clear the input
      } else {
        switch (result.errorType) {
          case 'EMAIL_ALREADY_EXISTS':
            setError('This user already has an email address');
            break;
          case 'EMAIL_ALREADY_TAKEN':
            setError('This email is already registered with another account');
            break;
          case 'INVALID_EMAIL_FORMAT':
            setError('Please enter a valid email address');
            break;
          case 'USER_NOT_FOUND':
            setError('User not found. Please sign in again.');
            break;
          case 'NO_TOKEN':
            setError('No authentication token. Please sign in.');
            break;
          default:
            setError(result.error || 'Unknown error occurred');
        }
      }
    } catch (err) {
      setError('Failed to add email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h3>Email Management Example</h3>
      
      {user && (
        <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <strong>Current User:</strong> {user.user_db_id}
          {user.email && (
            <div><strong>Email:</strong> {user.email}</div>
          )}
        </div>
      )}

      <button 
        onClick={handleCheckEmail}
        disabled={loading}
        style={{ 
          marginBottom: 10, 
          padding: 10, 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Checking...' : 'Check Email Status'}
      </button>

      <div style={{ marginBottom: 10 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: 8, 
            border: '1px solid #ccc', 
            borderRadius: 4,
            marginBottom: 10
          }}
        />
        <button 
          onClick={handleAddEmail}
          disabled={loading || !email.trim()}
          style={{ 
            padding: 10, 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4,
            cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Email'}
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: 10, 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: 4,
          marginBottom: 10
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: 10, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: 4
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Hook for easy email management in any component
 */
export const useEmailManagement = () => {
  const { checkEmailExists, addEmailToUser, user } = useLotusUser();

  const checkAndAddEmail = async (email: string) => {
    // First check if user can add email
    const checkResult = await checkEmailExists?.();
    
    if (!checkResult?.success) {
      return {
        success: false,
        error: checkResult?.error || 'Cannot add email',
        errorType: checkResult?.errorType || 'UNKNOWN_ERROR'
      };
    }

    // If check passed, add the email
    return await addEmailToUser?.(email) || {
      success: false,
      error: 'Add email function not available',
      errorType: 'FUNCTION_NOT_AVAILABLE'
    };
  };

  return {
    checkEmailExists,
    addEmailToUser,
    checkAndAddEmail,
    userHasEmail: !!user?.email,
    userEmail: user?.email
  };
};
