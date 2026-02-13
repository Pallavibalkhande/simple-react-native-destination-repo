import React, { FC } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
} from 'react-native';

type PrimaryButtonProps = {
  /** Text displayed inside the button */
  title: string;
  /** Callback invoked when the button is pressed */
  onPress: (event: GestureResponderEvent) => void;
  /** If true, the button is disabled and not pressable */
  disabled?: boolean;
  /** If true, shows a loading spinner instead of the title */
  loading?: boolean;
  /** Custom style for the button container */
  style?: ViewStyle;
  /** Custom style for the title text */
  textStyle?: TextStyle;
  /** Optional testID for testing purposes */
  testID?: string;
};

export const PrimaryButton: FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={styles.title.color}
        />
      ) : (
        <Text style={[styles.title, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const BUTTON_HEIGHT = 48;
const BUTTON_RADIUS = 8;
const PRIMARY_COLOR = '#0066FF';
const DISABLED_COLOR = '#A0A0A0';
const TITLE_COLOR = '#FFFFFF';

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    minWidth: 120,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: DISABLED_COLOR,
  },
  title: {
    color: TITLE_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrimaryButton;