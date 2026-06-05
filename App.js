import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator, BackHandler, Platform, Image
} from 'react-native';
import { WebView } from 'react-native-webview';

const WROMBLE_URL = 'https://wromble.dk';
const RIDER_URL = 'https://wromble.dk/rider/';
const PRIMARY_COLOR = '#E20E1D';

export default function App() {
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        if (mode) {
          setMode(null);
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [canGoBack, mode]);

  if (!mode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <View style={styles.modeScreen}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoSubtext}>Online Bestilling</Text>
            <Text style={styles.logoText}>Wromble</Text>
            <Text style={styles.logoTagline}>Nemt & Enkelt</Text>
          </View>

          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[styles.modeBtn, { backgroundColor: PRIMARY_COLOR }]}
              onPress={() => setMode('customer')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeBtnIcon}>🍔</Text>
              <Text style={styles.modeBtnTitle}>Bestil mad</Text>
              <Text style={styles.modeBtnDesc}>Se menukort, bestil og betal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, { backgroundColor: '#333' }]}
              onPress={() => setMode('rider')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeBtnIcon}>🚗</Text>
              <Text style={styles.modeBtnTitle}>Chauffør</Text>
              <Text style={styles.modeBtnDesc}>Se ordrer og levér</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Wromble v1.0</Text>
        </View>
      </SafeAreaView>
    );
  }

  const url = mode === 'rider' ? RIDER_URL : WROMBLE_URL;

  const injectedJS = `
    (function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.head.appendChild(meta);
      }

      var style = document.createElement('style');
      style.textContent = 'body { -webkit-touch-callout: none; -webkit-user-select: none; }';
      document.head.appendChild(style);
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode(null)} style={styles.headerBack}>
          <Text style={styles.headerBackText}>← Tilbage</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'rider' ? 'Chauffør' : 'Wromble'}
        </Text>
        <TouchableOpacity
          onPress={() => webViewRef.current?.reload()}
          style={styles.headerRefresh}
        >
          <Text style={styles.headerRefreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Indlæser...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        injectedJavaScript={injectedJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        geolocationEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  modeScreen: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: PRIMARY_COLOR,
    letterSpacing: -1,
  },
  logoTagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  modeButtons: {
    width: '100%',
    gap: 16,
  },
  modeBtn: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modeBtnIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  modeBtnTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  modeBtnDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  version: {
    position: 'absolute',
    bottom: 30,
    color: '#ccc',
    fontSize: 12,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBack: {
    padding: 4,
  },
  headerBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerRefresh: {
    padding: 4,
  },
  headerRefreshText: {
    color: '#fff',
    fontSize: 22,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#888',
    fontSize: 14,
  },
});
