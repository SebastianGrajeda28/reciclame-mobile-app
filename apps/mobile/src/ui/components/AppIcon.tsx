import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleProp, TextStyle } from 'react-native';

export type AppIconName =
  | 'recycle'
  | 'user'
  | 'users'
  | 'bell'
  | 'settings'
  | 'camera'
  | 'scan'
  | 'list'
  | 'filter'
  | 'image'
  | 'qr'
  | 'map'
  | 'pin'
  | 'directions'
  | 'search'
  | 'checkCircle'
  | 'check'
  | 'close'
  | 'alertCircle'
  | 'alertTriangle'
  | 'info'
  | 'loader'
  | 'wifiOff'
  | 'award'
  | 'star'
  | 'flame'
  | 'edit'
  | 'plus'
  | 'logout'
  | 'leaf'
  | 'trash'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowBack'
  | 'arrowUndo'
  | 'chevronRight'
  | 'chevronDown'
  | 'mail'
  | 'calendar'
  | 'clock'
  | 'trophy'
  | 'lock'
  | 'google'
  | 'book'
  | 'weight'
  | 'bottle'
  | 'briefcase'
  | 'flask'
  | 'delete'
  | 'battery'
  | 'laptop'
  | 'fileDocument'
  | 'locate'
  | 'package'
  | 'eyeOff'
  | 'shield'
  | 'shieldOutline';

type AppIconProps = {
  name: AppIconName;
  size: number;
  color: string;
  style?: StyleProp<TextStyle>;
};

export function AppIcon({ name, size, color, style }: AppIconProps) {
  switch (name) {
    case 'recycle':
      return <Ionicons name="sync-outline" size={size} color={color} style={style} />;
    case 'user':
      return <FontAwesome6 name="user" size={size} color={color} style={style} />;
    case 'users':
      return <MaterialIcons name="groups" size={size} color={color} style={style} />;
    case 'bell':
      return <Feather name="bell" size={size} color={color} style={style} />;
    case 'settings':
      return <Feather name="settings" size={size} color={color} style={style} />;
    case 'camera':
      return <Ionicons name="camera" size={size} color={color} style={style} />;
    case 'scan':
      return <MaterialCommunityIcons name="line-scan" size={size} color={color} style={style} />;
    case 'list':
      return <Feather name="list" size={size} color={color} style={style} />;
    case 'filter':
      return <Feather name="filter" size={size} color={color} style={style} />;
    case 'image':
      return <Feather name="image" size={size} color={color} style={style} />;
    case 'qr':
      return <MaterialCommunityIcons name="qrcode" size={size} color={color} style={style} />;
    case 'map':
      return <Feather name="map" size={size} color={color} style={style} />;
    case 'pin':
      return <Feather name="map-pin" size={size} color={color} style={style} />;
    case 'directions':
      return <Ionicons name="paper-plane-outline" size={size} color={color} style={style} />;
    case 'search':
      return <Feather name="search" size={size} color={color} style={style} />;
    case 'checkCircle':
      return <Feather name="check-circle" size={size} color={color} style={style} />;
    case 'check':
      return <AntDesign name="check" size={size} color={color} style={style} />;
    case 'close':
      return <Feather name="x" size={size} color={color} style={style} />;
    case 'alertCircle':
      return <Feather name="alert-circle" size={size} color={color} style={style} />;
    case 'alertTriangle':
      return <Feather name="alert-triangle" size={size} color={color} style={style} />;
    case 'info':
      return <Feather name="info" size={size} color={color} style={style} />;
    case 'loader':
      return <AntDesign name="loading" size={size} color={color} style={style} />;
    case 'wifiOff':
      return <Feather name="wifi-off" size={size} color={color} style={style} />;
    case 'award':
      return <Feather name="award" size={size} color={color} style={style} />;
    case 'star':
      return <Feather name="star" size={size} color={color} style={style} />;
    case 'flame':
      return <MaterialCommunityIcons name="fire" size={size} color={color} style={style} />;
    case 'edit':
      return <Feather name="edit-2" size={size} color={color} style={style} />;
    case 'plus':
      return <AntDesign name="plus" size={size} color={color} style={style} />;
    case 'logout':
      return <MaterialCommunityIcons name="logout" size={size} color={color} style={style} />;
    case 'leaf':
      return <Feather name="feather" size={size} color={color} style={style} />;
    case 'trash':
      return <Ionicons name="trash-outline" size={size} color={color} style={style} />;
    case 'arrowLeft':
      return <AntDesign name="arrow-left" size={size} color={color} style={style} />;
    case 'arrowRight':
      return <AntDesign name="arrow-right" size={size} color={color} style={style} />;
    case 'arrowBack':
      return <Ionicons name="arrow-back-outline" size={size} color={color} style={style} />;
    case 'arrowUndo':
      return <Ionicons name="arrow-undo-outline" size={size} color={color} style={style} />;
    case 'chevronRight':
      return <AntDesign name="right" size={size} color={color} style={style} />;
    case 'chevronDown':
      return <AntDesign name="down" size={size} color={color} style={style} />;
    case 'mail':
      return <AntDesign name="mail" size={size} color={color} style={style} />;
    case 'calendar':
      return <AntDesign name="calendar" size={size} color={color} style={style} />;
    case 'clock':
      return <Feather name="clock" size={size} color={color} style={style} />;
    case 'trophy':
      return <FontAwesome6 name="trophy" size={size} color={color} style={style} />;
    case 'lock':
      return <AntDesign name="lock" size={size} color={color} style={style} />;
    case 'google':
      return <AntDesign name="google" size={size} color={color} style={style} />;
    case 'book':
      return <FontAwesome6 name="book-open-reader" size={size} color={color} style={style} />;
    case 'weight':
      return (
        <MaterialCommunityIcons name="weight-kilogram" size={size} color={color} style={style} />
      );
    case 'bottle':
      return (
        <MaterialCommunityIcons
          name="bottle-soda-outline"
          size={size}
          color={color}
          style={style}
        />
      );
    case 'briefcase':
      return <Ionicons name="briefcase-outline" size={size} color={color} style={style} />;
    case 'flask':
      return (
        <MaterialCommunityIcons name="flask-outline" size={size} color={color} style={style} />
      );
    case 'delete':
      return (
        <MaterialCommunityIcons
          name="delete-empty-outline"
          size={size}
          color={color}
          style={style}
        />
      );
    case 'battery':
      return <Ionicons name="battery-half-outline" size={size} color={color} style={style} />;
    case 'laptop':
      return <MaterialCommunityIcons name="laptop" size={size} color={color} style={style} />;
    case 'fileDocument':
      return (
        <MaterialCommunityIcons
          name="file-document-outline"
          size={size}
          color={color}
          style={style}
        />
      );
    case 'locate':
      return <Feather name="crosshair" size={size} color={color} style={style} />;
    case 'eyeOff':
      return <Feather name="eye-off" size={size} color={color} style={style} />;
    case 'shield':
      return <MaterialCommunityIcons name="shield-check" size={size} color={color} style={style} />;
    case 'shieldOutline':
      return (
        <MaterialCommunityIcons name="shield-outline" size={size} color={color} style={style} />
      );
    case 'package':
      return (
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={size}
          color={color}
          style={style}
        />
      );
    default:
      return null;
  }
}
