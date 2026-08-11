import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Badge,
  Button,
  Container,
  Header,
  Input,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { EditProfileScreenProps } from "../navigation/NavigationTypes";
import ProfileService from "../services/ProfileService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateUserData } from "../store/slices/userSlice";
import { getUserRoleMeta } from "../utils/Formatters";
import { mapApiUser } from "../utils/Mappers";

const EditProfile: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData);
  const organization = useAppSelector(
    (state) => state.organization.organizationData,
  );

  const [name, setName] = useState(user?.name ?? "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Your name can't be empty.");
      return;
    }

    setLoading(true);

    try {
      // `role` and `status` are deliberately not editable here.
      const response = await ProfileService.updateProfile({
        name: name.trim(),
        designation: jobTitle.trim(),
        department: department.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      dispatch(
        response?.data?.user
          ? updateUserData(mapApiUser(response.data.user))
          : updateUserData({
              name: name.trim(),
              jobTitle: jobTitle.trim(),
              department: department.trim(),
              phoneNumber: phoneNumber.trim(),
            }),
      );

      Alert.alert("Profile updated", "Your changes have been saved.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Couldn't save",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ProfileService.uploadAvatar posts the multipart body; picking the file
  // needs an image picker dependency that isn't installed yet.
  const handleChangePhoto = () =>
    Alert.alert(
      "Change photo",
      "Add an image picker (react-native-image-picker) to enable uploads.",
    );

  return (
    <Container>
      <Header title="Edit Profile" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <WhiteContainer style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarSection}>
              <Avatar name={name || "User"} image={user?.image} size={88} />
              <TouchableOpacity
                style={styles.changePhoto}
                onPress={handleChangePhoto}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="camera-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.changePhotoText}>Change photo</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Full Name"
              icon="person-outline"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Job Title"
              icon="briefcase-outline"
              placeholder="What you do"
              value={jobTitle}
              onChangeText={setJobTitle}
            />

            <Input
              label="Department"
              icon="business-outline"
              placeholder="Which team you're on"
              value={department}
              onChangeText={setDepartment}
            />

            <Input
              label="Phone Number"
              icon="call-outline"
              placeholder="+91 00000 00000"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            {/* Read-only, admin-controlled fields */}
            <Text style={styles.readOnlyLabel}>Managed by your admin</Text>
            <View style={styles.readOnlyCard}>
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyKey}>Email</Text>
                <Text style={styles.readOnlyValue}>{user?.email}</Text>
              </View>
              <View style={styles.readOnlyDivider} />
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyKey}>Role</Text>
                {user ? (
                  <Badge meta={getUserRoleMeta(user.role)} size="small" />
                ) : null}
              </View>
              <View style={styles.readOnlyDivider} />
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyKey}>Organization</Text>
                <Text style={styles.readOnlyValue}>
                  {organization?.name ?? "—"}
                </Text>
              </View>
            </View>

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={[styles.save]}
            />
          </ScrollView>
        </WhiteContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 48,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  changePhoto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  readOnlyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  readOnlyCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    gap: 12,
  },
  readOnlyKey: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.secondaryFont,
    fontWeight: "500",
    textAlign: "right",
  },
  readOnlyDivider: {
    height: 1,
    backgroundColor: Colors.lightBorder,
  },
  save: {
    marginTop: 32,
  },
});
