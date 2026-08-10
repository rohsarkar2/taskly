import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Container,
  Header,
  SectionHeader,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { organization, projects, users } from "../data";
import { OrganizationInfoScreenProps } from "../navigation/NavigationTypes";
import { formatDate } from "../utils/Formatters";

const OrganizationInfo: React.FC<OrganizationInfoScreenProps> = () => {
  const activeProjects = projects.filter(
    (project) => project.status === "active"
  );

  // Copy to clipboard needs @react-native-clipboard/clipboard — added with the
  // API work; for now just surface the ID so it can be read out.
  const handleCopyId = () =>
    Alert.alert("Organization ID", organization.uniqueOrganizationId);

  return (
    <Container>
      <Header title="Organization" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <View style={styles.identity}>
            <View style={styles.logo}>
              <Ionicons name="business" size={30} color={Colors.primary} />
            </View>
            <Text style={styles.name}>{organization.name}</Text>
            <Text style={styles.since}>
              On Taskly since {formatDate(organization.createdAt)}
            </Text>
          </View>

          {/* Organization ID */}
          <TouchableOpacity
            style={styles.idCard}
            onPress={handleCopyId}
            activeOpacity={0.7}
          >
            <View style={styles.idText}>
              <Text style={styles.idLabel}>Organization ID</Text>
              <Text style={styles.idValue}>
                {organization.uniqueOrganizationId}
              </Text>
            </View>
            <Ionicons name="copy-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Members", value: organization.memberCount },
              { label: "Active Projects", value: activeProjects.length },
              { label: "Team Size", value: organization.size.split(" ")[0] },
            ].map((stat, index) => (
              <React.Fragment key={stat.label}>
                {index > 0 ? <View style={styles.statDivider} /> : null}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Admin */}
          <SectionHeader title="Administrator" style={styles.sectionHeader} />
          <View style={styles.card}>
            <View style={styles.adminRow}>
              <Avatar name={organization.adminName} size={44} />
              <View style={styles.adminText}>
                <Text style={styles.adminName}>{organization.adminName}</Text>
                <Text style={styles.adminEmail}>{organization.adminEmail}</Text>
              </View>
            </View>
          </View>

          {/* Leadership */}
          <SectionHeader title="Leadership" style={styles.sectionHeader} />
          <View style={styles.card}>
            {users
              .filter((member) => member.role !== "team-member")
              .map((member, index) => (
                <View
                  key={member.id}
                  style={[styles.leaderRow, index > 0 && styles.leaderRowGap]}
                >
                  <Avatar name={member.name} size={36} />
                  <View style={styles.leaderText}>
                    <Text style={styles.leaderName}>{member.name}</Text>
                    <Text style={styles.leaderRole}>{member.jobTitle}</Text>
                  </View>
                </View>
              ))}
          </View>

          <View style={styles.notice}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={Colors.mutedFont}
            />
            <Text style={styles.noticeText}>
              Organization settings are managed by your admin in Taskly Admin.
            </Text>
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default OrganizationInfo;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  identity: {
    alignItems: "center",
    paddingVertical: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 14,
  },
  since: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 4,
  },
  idCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  idText: {
    flex: 1,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  idValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingVertical: 16,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
  statValue: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.black,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.mutedFont,
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionHeader: {
    marginTop: 28,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
  },
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminText: {
    flex: 1,
  },
  adminName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  adminEmail: {
    fontSize: 13,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  leaderRowGap: {
    marginTop: 16,
  },
  leaderText: {
    flex: 1,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  leaderRole: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.mutedFont,
    lineHeight: 17,
  },
});
