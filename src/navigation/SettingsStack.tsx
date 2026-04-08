import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/settings/AboutScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import ThemeScreen from '../screens/settings/ThemeScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMenu" component={ThemeScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}
