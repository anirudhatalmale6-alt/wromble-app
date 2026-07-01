import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator, BackHandler, Platform,
  Animated, Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';

const WROMBLE_URL = 'https://wromble.dk';
const RIDER_URL = 'https://wromble.dk/rider/';
const PRIMARY_COLOR = '#E20E1D';

const TABS = [
  { key: 'home', label: 'Hjem', icon: '⌂', path: '/' },
  { key: 'food', label: 'Spisesteder', icon: '🍔', path: '/category/spisesteder/' },
  { key: 'shops', label: 'Butikker', icon: '🛒', path: '/category/specialbutikker/' },
  { key: 'search', label: 'Sog', icon: '🔍', path: '/search/' },
  { key: 'profile', label: 'Profil', icon: '👤', path: '/login/' },
];

const HIDE_WEB_ELEMENTS_CSS = `
  .wr-navbar,
  .wr-mobile-menu,
  .wr-footer,
  .wr-lang-wrap,
  .wr-cookie-banner,
  [class*="cookie"],
  [id*="cookie"] {
    display: none !important;
  }
  body {
    padding-top: 0 !important;
    margin-top: 0 !important;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    overscroll-behavior-y: contain;
  }
  html {
    overscroll-behavior-y: contain;
  }
`;

export default function App() {
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentUrl, setCurrentUrl] = useState('');
  const webViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const detectActiveTab = useCallback((url) => {
    if (!url) return;
    setCurrentUrl(url);
    const path = url.replace(WROMBLE_URL, '').replace(/\?.*$/, '');
    if (path.includes('/category/spisesteder')) setActiveTab('food');
    else if (path.includes('/category/specialbutikker')) setActiveTab('shops');
    else if (path.includes('/search')) setActiveTab('search');
    else if (path.includes('/private/') || path.includes('/login')) setActiveTab('profile');
    else if (path === '/' || path === '') setActiveTab('home');
  }, []);

  const navigateToTab = useCallback((tab) => {
    setActiveTab(tab.key);
    const url = WROMBLE_URL + tab.path;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${url}'; true;`);
    }
  }, []);

  if (!mode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <Animated.View style={[styles.modeScreen, { opacity: fadeAnim }]}>
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
              <Text style={styles.modeBtnIcon}>{'🍔'}</Text>
              <Text style={styles.modeBtnTitle}>Bestil mad</Text>
              <Text style={styles.modeBtnDesc}>Se menukort, bestil og betal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, { backgroundColor: '#333' }]}
              onPress={() => setMode('rider')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeBtnIcon}>{'🚗'}</Text>
              <Text style={styles.modeBtnTitle}>Chauffør</Text>
              <Text style={styles.modeBtnDesc}>Se ordrer og levér</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Wromble v1.1</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const url = mode === 'rider' ? RIDER_URL : WROMBLE_URL;
  const isRider = mode === 'rider';

  const injectedJS = `
    (function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      } else {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.head.appendChild(meta);
      }

      var style = document.createElement('style');
      style.id = 'wromble-app-inject';
      style.textContent = ${JSON.stringify(HIDE_WEB_ELEMENTS_CSS)};
      if (!document.getElementById('wromble-app-inject')) {
        document.head.appendChild(style);
      }

      window.addEventListener('scroll', function() {
        var existingStyle = document.getElementById('wromble-app-inject');
        if (!existingStyle) {
          var s = document.createElement('style');
          s.id = 'wromble-app-inject';
          s.textContent = ${JSON.stringify(HIDE_WEB_ELEMENTS_CSS)};
          document.head.appendChild(s);
        }
      });
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      <View style={styles.header}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => webViewRef.current?.goBack()}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>{'‹'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setMode(null)}
            style={styles.headerBtn}
          >
            <Text style={[styles.headerBtnText, { fontSize: 18 }]}>{'☰'}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {isRider ? 'Chauffør' : 'Wromble'}
        </Text>
        <TouchableOpacity
          onPress={() => webViewRef.current?.reload()}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>{'↻'}</Text>
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
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          detectActiveTab(navState.url);
        }}
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
        pullToRefreshEnabled={true}
        overScrollMode="never"
        bounces={false}
      />

      {!isRider && (
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => navigateToTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
    paddingHorizontal: 12,
    height: 48,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#888',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    color: '#999',
    marginBottom: 2,
  },
  tabIconActive: {
    color: PRIMARY_COLOR,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
  },
});
