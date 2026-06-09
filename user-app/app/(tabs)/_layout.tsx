import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Home, Flame, Calendar, Building2, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const getIcon = (name: string, color: string) => {
    const size = 20;
    switch (name) {
      case "index":
        return <Home size={size} color={color} />;
      case "poojas":
        return <Flame size={size} color={color} />;
      case "bookings":
        return <Calendar size={size} color={color} />;
      case "temples":
        return <Building2 size={size} color={color} />;
      case "profile":
        return <User size={size} color={color} />;
      default:
        return <Home size={size} color={color} />;
    }
  };

  const getLabel = (name: string) => {
    switch (name) {
      case "index":
        return "Home";
      case "poojas":
        return "Poojas";
      case "bookings":
        return "Bookings";
      case "temples":
        return "Temples";
      case "profile":
        return "Profile";
      default:
        return name;
    }
  };

  return (
    <View 
      style={[
        styles.tabBarContainer, 
        { 
          height: 68 + insets.bottom, 
          paddingBottom: insets.bottom 
        }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const activeColor = "#F97316"; // Primary brand orange
        const inactiveColor = "#78716C"; // Muted grey

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View 
              style={[
                styles.itemContainer,
                isFocused ? styles.activeItem : styles.inactiveItem
              ]}
            >
              {getIcon(route.name, isFocused ? activeColor : inactiveColor)}
              <Text 
                style={[
                  styles.tabLabel, 
                  { 
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight: isFocused ? "600" : "500"
                  }
                ]}
              >
                {getLabel(route.name)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="poojas" options={{ title: "Poojas" }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
      <Tabs.Screen name="temples" options={{ title: "Temples" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#2D0A2E", // Dark purple
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 0,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    minWidth: 64,
  },
  activeItem: {
    borderColor: "#F97316", // Orange border
    backgroundColor: "rgba(249, 115, 22, 0.12)", // Light tint of orange/purple
  },
  inactiveItem: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: "System",
  },
});
