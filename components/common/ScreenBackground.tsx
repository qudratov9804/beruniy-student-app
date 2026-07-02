import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
}

export const ScreenBackground: React.FC<Props> = ({ children }) => (
  <ImageBackground
    source={require('../../assets/bg.png')}
    style={styles.bg}
    resizeMode="cover"
  >
    <LinearGradient
      colors={['rgba(15,23,42,0.85)', 'rgba(37,99,235,0.60)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </ImageBackground>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
});
