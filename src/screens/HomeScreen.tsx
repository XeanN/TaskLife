import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { subscribeToTasks, Task } from "../services/taskService";

export type AreaId = "work" | "education" | "finance" | "health";
export type Area = {
  id: AreaId;
  label: string;
  color: string;
  icon: string;
  lib: "ionicons" | "fa5" | "material";
};

export const AREAS: Area[] = [
  {
    id: "work",
    label: "Trabajo",
    color: "#4A7FA5",
    icon: "briefcase",
    lib: "ionicons",
  },
  {
    id: "education",
    label: "Educación",
    color: "#5BA4C8",
    icon: "school",
    lib: "ionicons",
  },
  {
    id: "finance",
    label: "Finanzas",
    color: "#3AA88A",
    icon: "bar-chart",
    lib: "ionicons",
  },
  {
    id: "health",
    label: "Bienestar",
    color: "#4DBF8A",
    icon: "heart-outline",
    lib: "ionicons",
  },
];

function getAreaStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pending = total - completed;
  return { pending, completed, total };
}

function AreaIcon({
  lib,
  icon,
  size,
  color,
}: {
  lib: string;
  icon: string;
  size: number;
  color: string;
}) {
  if (lib === "fa5")
    return <FontAwesome5 name={icon as any} size={size} color={color} />;
  if (lib === "material")
    return <MaterialIcons name={icon as any} size={size} color={color} />;
  return <Ionicons name={icon as any} size={size} color={color} />;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme, dark } = useTheme();
  const navigation = useNavigation<any>();
  const s = makeStyles(theme);

  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    if (!user) return;
    const unsubs = AREAS.map((area) =>
      subscribeToTasks(user.id, area.id, (tasks) => {
        setAllTasks((prev) => ({ ...prev, [area.id]: tasks }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const totalPending = useMemo(
    () =>
      Object.values(allTasks)
        .flat()
        .filter((t) => !t.done).length,
    [allTasks]
  );

  const goToArea = (area: Area) => {
    navigation.navigate("Area", {
      id: area.id,
      label: area.label,
      color: area.color,
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Pressable
            style={s.avatarCircle}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={s.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </Pressable>
        </View>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Ionicons name="infinite-outline" size={56} color={theme.primary} />
          </View>
          <Text style={s.heroTitle}>Tu vida</Text>
          <Text style={s.heroSubtitle}>Organiza tus tareas por área</Text>
        </View>

        {/* ── Mi día ── */}
        <Pressable
          style={s.miDiaBtn}
          onPress={() => navigation.navigate("Tasks")}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.gold} />
          <Text style={s.miDiaText}>
            Mi día
            {totalPending > 0 && (
              <Text style={s.miDiaCount}>
                {"  "}({totalPending})
              </Text>
            )}
          </Text>
        </Pressable>

        {/* ── Grid áreas ── */}
        <View style={s.grid}>
          {AREAS.map((area) => {
            const tasks = allTasks[area.id] ?? [];
            const { pending } = getAreaStats(tasks);
            
            const areaColors: Record<string, string> = {
              work: dark ? '#2E516B' : '#4A7FA5',
              education: dark ? '#3A708C' : '#5BA4C8',
              finance: dark ? '#226D57' : '#3AA88A',
              health: dark ? '#2D825A' : '#4DBF8A',
            };
            const activeColor = areaColors[area.id] || area.color;
            const currentArea = { ...area, color: activeColor };

            return (
              <Pressable
                key={area.id}
                style={({ pressed }) => [
                  s.areaCard,
                  { backgroundColor: activeColor },
                  pressed && s.pressed,
                ]}
                onPress={() => goToArea(currentArea)}
              >
                <AreaIcon
                  lib={area.lib}
                  icon={area.icon}
                  size={28}
                  color="#fff"
                />
                <Text style={s.areaLabel}>{area.label}</Text>
                <Text style={s.areaCount}>({pending})</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Nueva tarea ── */}
        <Pressable
          style={({ pressed }) => [s.newTaskBtn, pressed && s.pressed]}
          onPress={() => navigation.navigate("Tasks")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.newTaskText}>Nueva tarea</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 24,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "800", color: "#fff" },

    hero: { alignItems: "center", marginBottom: 28 },
    heroIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.iconBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: t.text,
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: 15,
      color: t.textSecond,
    },

    miDiaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.goldBg,
      borderRadius: 14,
      height: 52,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: t.gold + "40",
    },
    miDiaText: {
      fontSize: 16,
      fontWeight: "700",
      color: t.gold,
    },
    miDiaCount: {
      fontSize: 14,
      fontWeight: "600",
      color: t.gold,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
    },
    areaCard: {
      width: "47.5%",
      paddingVertical: 22,
      paddingHorizontal: 16,
      borderRadius: 18,
      alignItems: "center",
      gap: 8,
    },
    areaLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    areaCount: {
      fontSize: 13,
      color: "rgba(255,255,255,0.85)",
      fontWeight: "600",
    },

    newTaskBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.primary,
      borderRadius: 14,
      height: 54,
    },
    newTaskText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  });