import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import AreaScreen from '../screens/AreaScreen';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { dark } = useTheme();

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
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </>
  );
}
