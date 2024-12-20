import {
    TextInput,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    StyleSheet,
  } from "react-native";
  
  import { InputFieldProps } from "@/types/type";
  import { colors } from "@/constants/tokens";
  import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
  
  const InputField = ({
    label,
    icon,
    secureTextEntry = false,
    labelStyle,
    containerStyle,
    inputStyle,
    iconStyle,
    className,
    ...props
  }: InputFieldProps) => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container]}>
            <Text style={[styles.label]}>
              {label}
            </Text>
            <View style={styles.inputContainer}>
              {icon && (
                <Image source={icon} style={[styles.icon]} />
              )}
              <TextInput
                style={[styles.input, {color: colors.readioWhite}]}
                secureTextEntry={secureTextEntry}
                placeholderTextColor={colors.readioWhite}
                {...props}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
      width: '100%',
    },
    label: {
      fontSize: 18,
      marginBottom: 12,
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.readioWhite,
      color: colors.readioWhite,
    },
    icon: {
      width: 24,
      height: 24,
      marginLeft: 16,
    },
    input: {
      borderRadius: 50,
      padding: 16,
      fontFamily: readioRegularFont,
      fontSize: 15,
      flex: 1,
      textAlign: 'left',
      color: colors.readioWhite,
    },
  });
  
  export default InputField;