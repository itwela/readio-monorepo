import { TextInputProps, TouchableOpacityProps } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";

// --------------------------------------------------------------------------------------------------------------

declare interface UserStuff {
  name?: string;
  topics?: string[];
}

declare interface Station {
  id?: number;             // Primary key (SERIAL in DB)
  name?: string;         // URL or path to the image, optional
  imageurl?: string;         // 
  created_at?: string;     // Timestamp of creation
  clerk_id?: string;        // Foreign key referencing users table
}

declare interface Readio {
  id?: number;               // Unique identifier for TrackPlayer and primary key (SERIAL in DB)
  url: string;              // Path to the audio file, required for TrackPlayer
  title?: string;            // Title of the track, required for TrackPlayer
  artist?: string;          // Artist name, optional but recommended for TrackPlayer
  artwork?: string;         // URL or path to the image, optional for TrackPlayer
  image?: string;           // URL or path to a different image, optional
  clerk_id?: string;        // Foreign key referencing users table
  text?: string;            // Text content, optional
  created_at?: string;      // Timestamp of creation
  favorited?: boolean;      // Boolean indicating if the readio is favorited
  topic?: string;           // Topic related to the readio, optional
  basepath?: string;        // Base64-encoded audio data, optional
  station_id?: number;      // Foreign key for station association
  tag?: string;             // Tag associated with the readio, optional
}

// --------------------------------------------------------------------------------------------------------------


declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}


export type RootNavigationProp = StackNavigationProp<RootStackParamList>;