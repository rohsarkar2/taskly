import React, { useEffect, useState } from "react";
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
  Container,
  Header,
  Loader,
  SectionHeader,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { OrganizationInfoScreenProps } from "../navigation/NavigationTypes";
import ProfileService from "../services/ProfileService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOrganizationData } from "../store/slices/organizationSlice";
import { mapApiOrganization } from "../utils/Mappers";

const OrganizationInfo: React.FC<OrganizationInfoScreenProps> = () => {
  const dispatch = useAppDispatch();
  const organization = useAppSelector(
    (state) => state.organization.organizationData,
  );

  // The persisted copy from sign in only carries the identity fields, so the
  // detail block stays blank until this call lands.
  const [loading, setLoading] = useState(!organization?.employeeCount);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await ProfileService.getOrganization();
        if (active && response?.data?.organization) {
          dispatch(
            setOrganizationData(
              mapApiOrganization(response.data.organization),
            ),
          );
        }
      } catch (caught: any) {
        if (active) {
          setError(caught?.message ?? "Couldn't load your organization.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [dispatch]);

  // Copy to clipboard needs @react-native-clipboard/clipboard; for now just
  // surface the ID so it can be read out.
  const handleCopyId = () =>
    Alert.alert("Organization ID", organization?.uniqueOrganizationId ?? "—");

  const details = [
    { label: "Industry", value: organization?.industry },
    { label: "Website", value: organization?.website },
    { label: "Timezone", value: organization?.timezone },
  ].filter((detail) => Boolean(detail.value));

  if (loading && !organization) {
    return (
      <Container>
        <Header title="Organization" showBack />
        <WhiteContainer style={styles.container}>
          <Loader style={styles.screenLoader} size="large" />
        </WhiteContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="Organization" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Identity */}
          <View style={styles.identity}>
            <View style={styles.logo}>
              <Ionicons name="business" size={30} color={Colors.primary} />
            </View>
            <Text style={styles.name}>{organization?.name ?? "—"}</Text>
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
                {organization?.uniqueOrganizationId ?? "—"}
              </Text>
            </View>
            <Ionicons name="copy-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Members", value: organization?.employeeCount ?? 0 },
              {
                label: "Working Days",
                value: organization?.workingDays?.length ?? 0,
              },
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

          {/* Details */}
          {details.length > 0 ? (
            <>
              <SectionHeader title="Details" style={styles.sectionHeader} />
              <View style={styles.card}>
                {details.map((detail, index) => (
                  <React.Fragment key={detail.label}>
                    {index > 0 ? <View style={styles.detailDivider} /> : null}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{detail.label}</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {detail.value}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </>
          ) : null}

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
  screenLoader: {
    flex: 1,
  },
  error: {
    fontSize: 13,
    color: Colors.danger,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondaryFont,
    textAlign: "right",
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.lightBorder,
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
