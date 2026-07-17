// Écran de chargement
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const CommandeFormSkeleton: React.FC = () => {
  const { theme } = useTheme();

  const SkeletonBlock = ({ height = 50, width = '100%' }: { height?: number; width?: string | number }) => (
    <View
      style={[
        skeletonStyles.block,
        {
          backgroundColor: theme.surfaceVariant,
          height,
          width: width as any,
        },
      ]}
    />
  );

  return (
    <View style={skeletonStyles.container}>
      <SkeletonBlock height={200} />
      <View style={skeletonStyles.spacer} />
      <SkeletonBlock height={300} />
      <View style={skeletonStyles.spacer} />
      <SkeletonBlock height={180} />
      <View style={skeletonStyles.spacer} />
      <SkeletonBlock height={150} />
      <View style={skeletonStyles.spacer} />
      <SkeletonBlock height={55} />
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  block: {
    borderRadius: 16,
    opacity: 0.5,
  },
  spacer: {
    height: 16,
  },
});