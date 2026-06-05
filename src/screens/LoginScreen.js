import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';

const PRIMARY = '#E20E1D';

export default function LoginScreen({ onLogin, onSkip }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Fejl', 'Udfyld venligst alle felter');
      return;
    }
    onLogin(email, password, isSignUp ? name : null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logoSub}>Online Bestilling</Text>
        <Text style={styles.logo}>Wromble</Text>
        <Text style={styles.logoTag}>Nemt & Enkelt</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isSignUp ? 'Opret konto' : 'Log ind'}</Text>

          {isSignUp && (
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Fulde navn</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Dit navn"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="din@email.dk"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Adgangskode</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitText}>{isSignUp ? 'Opret konto' : 'Log ind'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.appleBtn} activeOpacity={0.8}>
            <Text style={styles.appleBtnText}> Log ind med Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Har du allerede en konto? Log ind' : 'Ingen konto? Opret gratis'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Fortsæt uden login →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  logoSub: { textAlign: 'center', fontSize: 13, color: '#888' },
  logo: { textAlign: 'center', fontSize: 38, fontWeight: '900', color: PRIMARY, marginVertical: 2 },
  logoTag: { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 40 },
  card: { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 16,
  },
  submitBtn: {
    backgroundColor: PRIMARY, borderRadius: 12, padding: 16, marginTop: 8,
  },
  submitText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '700' },
  appleBtn: {
    backgroundColor: '#000', borderRadius: 12, padding: 16, marginTop: 10,
  },
  appleBtnText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '700' },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { color: PRIMARY, fontSize: 14, fontWeight: '600' },
  skipBtn: { marginTop: 24, alignItems: 'center' },
  skipText: { color: '#888', fontSize: 14 },
});
