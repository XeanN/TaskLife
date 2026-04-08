import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getAreaStats } from "@/controllers/TaskController";
import { useAllTasks } from "@/hooks/useTasks";
import { AREAS } from "@/models/Area";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { theme } = useTheme();
  const { allTasks, todayTasks, totalPending } = useAllTasks();
  const s = makeStyles(theme);

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const goToArea = (area: (typeof AREAS)[number]) =>
    router.push(
      `/area/${area.id}?label=${area.label}&color=${encodeURIComponent(area.color)}`,
    );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Pressable
            style={s.avatarCircle}
            onPress={() => router.push("/(tabs)/profile")}
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
          onPress={() => router.push("/(tabs)/tasks")}
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
            return (
              <Pressable
                key={area.id}
                style={({ pressed }) => [
                  s.areaCard,
                  { backgroundColor: area.color },
                  pressed && s.pressed,
                ]}
                onPress={() => goToArea(area)}
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
          onPress={() => router.push("/(tabs)/tasks")}
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
      backgroundColor: t.primaryLight,
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
