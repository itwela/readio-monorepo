import { TextInputProps, TouchableOpacityProps } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Track } from 'react-native-track-player';

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
  user_db_id?: string;        // Foreign key referencing users table
}

type ContentType = 'article' | 'music' | 'audiobook' | 'liner_notes' | 'docu_series' | 'meditation_intro';

declare interface LotusTrack extends Track {
  contentType: ContentType;
  id?: number;
  image?: string;
  user_db_id?: string;
  text?: string;
  created_at?: string;
  favorited?: boolean;
  topic?: string;
  basepath?: string;
  station_id?: number;
  tag?: string;
  upvotes?: number;
  featured?: boolean;
  // Type-specific properties
  seasonImage?: string; // For articles
  album_image?: string; // For fithop
  audiobook_image?: string; // For audiobooks
}

declare interface LotusArticle extends LotusTrack {
  // Kept for backward compatibility
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
  isOnModal?: boolean;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
