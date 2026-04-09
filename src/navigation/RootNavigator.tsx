import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import SettingsStack from './SettingsStack';
import AreaScreen from '../screens/AreaScreen';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { dark, theme } = useTheme();

  useEffect(() => {
    // Aseguramos que el color de fondo de la raíz
    SystemUI.setBackgroundColorAsync(theme.bg);
    
    // Configuramos la barra de navegación de Android explícitamente
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(theme.bg);
      NavigationBar.setButtonStyleAsync(dark ? 'light' : 'dark');
    }
  }, [theme.bg, dark]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen name="Area" component={AreaScreen} />
            <RootStack.Screen name="Settings" component={SettingsStack} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </>
  );
}
