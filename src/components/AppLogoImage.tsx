import { Image, StyleSheet } from "react-native";

const AppLogoImage = () => {
  return (
    <Image
      source={require('../../assets/icon.png')}
      style={styles.logoImage}
    />
  );
}

export default AppLogoImage;

const styles = StyleSheet.create({
    logoImage: { width: 140, height: 140 }
})
