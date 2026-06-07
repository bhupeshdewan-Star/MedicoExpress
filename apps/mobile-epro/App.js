import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';

// Simulated SQLCipher Local Database & Offline Queue Storage Wrapper
class SQLCipherDatabase {
  constructor() {
    this.storage = {};
    this.offlineQueue = [];
  }

  async saveSecure(key, value) {
    // Mimics SQLCipher encryption
    const encryptedKey = btoa(key);
    const encryptedVal = btoa(JSON.stringify(value));
    this.storage[encryptedKey] = encryptedVal;
    console.log(`[SQLCipher] Securely encrypted key and value saved.`);
    return true;
  }

  async retrieveSecure(key) {
    const encryptedKey = btoa(key);
    const encryptedVal = this.storage[encryptedKey];
    if (!encryptedVal) return null;
    return JSON.parse(atob(encryptedVal));
  }

  addToOfflineQueue(syncRecord) {
    // Generate UUID and append timestamp
    const recordWithMeta = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      ...syncRecord,
      submitted_at: new Date().toISOString()
    };
    this.offlineQueue.push(recordWithMeta);
    console.log(`[Offline Queue] Added ePRO response. Queue length: ${this.offlineQueue.length}`);
    return recordWithMeta.id;
  }

  getQueue() {
    return this.offlineQueue;
  }

  clearQueue() {
    this.offlineQueue = [];
  }
}

const db = new SQLCipherDatabase();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaPassed, setMfaPassed] = useState(false);
  const [diaryResponse, setDiaryResponse] = useState('');
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const verifyMFA = () => {
    if (mfaCode === '123456' || mfaCode.length === 6) {
      setMfaPassed(true);
    } else {
      Alert.alert('Validation Error', 'Invalid TOTP verification code.');
    }
  };

  const submitDiary = async () => {
    if (!diaryResponse) {
      Alert.alert('Empty Input', 'Please fill the diary input value.');
      return;
    }

    const payload = {
      subject_id: 1,
      visit_id: 2,
      questionnaire_id: 1,
      responses: { pain_level: diaryResponse, notes: 'Diary submitted offline' },
      submission_device_info: 'React Native Mobile Client v15.1',
      device_signature: 'mobile_device_sig_crypto_hash'
    };

    // Store in SQLCipher encrypted local DB
    await db.saveSecure('latest_diary', payload);

    // Queue in offline storage
    db.addToOfflineQueue(payload);

    Alert.alert('Local Save Complete', 'Diary response stored in secure offline queue.');
    setDiaryResponse('');
  };

  const triggerSync = async () => {
    const queue = db.getQueue();
    if (queue.length === 0) {
      Alert.alert('Sync Status', 'Offline sync queue is empty.');
      return;
    }

    console.log(`[Sync] Initiating LWW sync for ${queue.length} items...`);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/epro/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_bearer_token'
        },
        body: JSON.stringify({ syncQueue: queue })
      });
      
      const resData = await response.json();
      if (response.ok) {
        db.clearQueue();
        Alert.alert('Sync Successful', `Synchronized ${resData.syncedCount} records using Last-Write-Wins (LWW) resolution.`);
      } else {
        Alert.alert('Sync Failed', 'API Core gateway returned errors.');
      }
    } catch (err) {
      Alert.alert('Offline Mode', 'API Gateway unreachable. Responses remain queued securely in SQLCipher storage.');
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ClinCommand OS™ ePRO</Text>
        <TextInput style={styles.input} placeholder="Subject Username" />
        <TextInput style={styles.input} secureTextEntry placeholder="Password" />
        <Button title="Login" onPress={handleLogin} color="#10b981" />
      </View>
    );
  }

  if (!mfaPassed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>MFA Verification Required</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          maxLength={6} 
          placeholder="Enter 6-digit TOTP code" 
          value={mfaCode}
          onChangeText={setMfaCode}
        />
        <Button title="Verify" onPress={verifyMFA} color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject ePRO Portal</Text>
      <Text style={styles.label}>Submit Daily Symptom Diary</Text>
      <TextInput 
        style={styles.input} 
        placeholder="How do you feel today (0-10 pain scale)?" 
        value={diaryResponse}
        onChangeText={setDiaryResponse}
      />
      <View style={{ marginBottom: 12 }}>
        <Button title="Save Diary Entry" onPress={submitDiary} color="#10b981" />
      </View>
      <Button title="Sync Offline Data" onPress={triggerSync} color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    backgroundColor: '#1f2937',
    color: '#ffffff',
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 20,
  }
});
