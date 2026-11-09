import React from 'react'
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native'

interface Props {
  size?: number
  borderRadius?: number
  style?: ViewStyle
  imageStyle?: ImageStyle
}

export const AppLogo: React.FC<Props> = ({
  size = 48,
  borderRadius,
  style,
  imageStyle,
}) => {
  const radius = borderRadius !== undefined ? borderRadius : Math.round(size * 0.24)

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Image
        source={require('../../assets/icon.png')}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
