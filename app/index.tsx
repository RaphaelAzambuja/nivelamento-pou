import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { Audio } from "expo-av";

export default function App() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const LEVEL_MARGIN = 0.05;
  const SMOOTH = 0.2;

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMusic() {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/pou.mp3"),
        {
          isLooping: true,
          volume: 0.8,
        }
      );

      if (!isMounted) return;

      setSound(sound);
      await sound.playAsync();
    }

    loadMusic();

    return () => {
      isMounted = false;
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ x, y }) => {
      setPos((prev) => ({
        x: prev.x + (-x - prev.x) * SMOOTH,
        y: prev.y + (y - prev.y) * SMOOTH,
      }));
    });

    return () => sub.remove();
  }, []);

  const isLevel =
    Math.abs(pos.x) < LEVEL_MARGIN && Math.abs(pos.y) < LEVEL_MARGIN;

  const DEAD_ZONE = LEVEL_MARGIN;
  const STRONG_ZONE = 0.3;

  let message = "Nivelado";

  if (!(Math.abs(pos.x) <= DEAD_ZONE && Math.abs(pos.y) <= DEAD_ZONE)) {
    if (pos.x > DEAD_ZONE && pos.y < -DEAD_ZONE) {
      message =
        pos.x > STRONG_ZONE || pos.y < -STRONG_ZONE
          ? "Tortão pra direita e pra cima"
          : "Inclinado pra direita/cima";
    } else if (pos.x < -DEAD_ZONE && pos.y < -DEAD_ZONE) {
      message =
        pos.x < -STRONG_ZONE || pos.y < -STRONG_ZONE
          ? "Tortão pra esquerda e pra cima"
          : "Inclinado pra esquerda/cima";
    } else if (pos.x < -DEAD_ZONE && pos.y > DEAD_ZONE) {
      message =
        pos.x < -STRONG_ZONE || pos.y > STRONG_ZONE
          ? "Tortão pra esquerda e pra baixo"
          : "Inclinado pra esquerda/baixo";
    } else if (pos.x > DEAD_ZONE && pos.y > DEAD_ZONE) {
      message =
        pos.x > STRONG_ZONE || pos.y > STRONG_ZONE
          ? "Tortão pra direita e pra baixo"
          : "Inclinado pra direita/baixo";
    } else {
      if (pos.x > DEAD_ZONE) message = "Tortão pra direita";
      if (pos.x < -DEAD_ZONE) message = "Tortão pra esquerda";
      if (pos.y > DEAD_ZONE) message = "Tortão pra baixo";
      if (pos.y < -DEAD_ZONE) message = "Tortão pra cima";
    }
  }

  const currentImage = isLevel
    ? require("../assets/pou.png")
    : require("../assets/pou_dodoi.png");

  const bubbleSize = isLevel ? BUBBLE_SIZE : BUBBLE_SIZE * 1.2;

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: isLevel ? "green" : "red" }]}>
        <Image
          source={currentImage}
          style={[
            styles.bubble,
            {
              width: bubbleSize,
              height: bubbleSize,
              transform: [
                { translateX: pos.x * 100 },
                { translateY: pos.y * 100 },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const CIRCLE_SIZE = 250;
const BUBBLE_SIZE = 50;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    borderRadius: BUBBLE_SIZE / 2,
  },
  message: {
    color: "#fff",
    fontSize: 24,
    marginTop: 20,
    fontWeight: "bold",
  },
});
