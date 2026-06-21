import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WelcomeScreen } from '@/screens/WelcomeScreen';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <WelcomeScreen />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
