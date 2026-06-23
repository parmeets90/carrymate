import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { RootNavigator } from '@/navigation/RootNavigator';
import { SplashScreen } from '@/screens/SplashScreen';
import { AlertHost } from '@/components/AlertHost';
import { useAuth } from '@/store/auth';
import { registerForPush, navigationRef } from '@/lib/push';
import { colors } from '@/theme';

const queryClient = new QueryClient();

function Gate(): React.JSX.Element {
  const { hydrated, bootstrap, user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Register for push once signed in; foreground messages refresh the badge/list.
  useEffect(() => {
    if (!user) return;
    let cleanup: (() => void) | undefined;
    void registerForPush(() => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifUnread'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    }).then((c) => {
      cleanup = c;
    });
    return () => cleanup?.();
  }, [user, qc]);

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.skyBlue} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {splashDone ? <Gate /> : <SplashScreen onDone={() => setSplashDone(true)} />}
        <AlertHost />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgApp },
});

export default App;
