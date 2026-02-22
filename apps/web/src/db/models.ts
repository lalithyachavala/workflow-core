import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roleIds: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    isActive: { type: Boolean, default: true },
    profile: {
      displayName: { type: String, default: "" },
      profilePictureBase64: { type: String, default: "" },
      employeeCode: { type: String, default: "" },
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      nationality: { type: String, default: "" },
      dateOfBirth: { type: Date, default: null },
      gender: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      jobTitle: { type: String, default: "" },
      department: { type: String, default: "" },
      manager: { type: String, default: "" },
      phone: { type: String, default: "" },
      timezone: { type: String, default: "" },
      skills: [{ type: String }],
      education: { type: String, default: "" },
      languages: [{ type: String }],
      dependents: [{ type: String }],
      contacts: [{ type: String }],
    },
  },
  { timestamps: true },
);

const roleSchema = new Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    description: { type: String, default: "" },
    permissions: [{ type: String, required: true }],
  },
  { timestamps: true },
);

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const deviceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hostname: { type: String, required: true },
    osVersion: { type: String, default: "" },
    deviceFingerprint: { type: String, required: true, index: true },
    appVersion: { type: String, default: "" },
  },
  { timestamps: true },
);

const faceTemplateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    /** Encrypted embeddings per pose (AES-GCM). front, left, right. */
    embeddingFront: { type: String, default: null },
    embeddingLeft: { type: String, default: null },
    embeddingRight: { type: String, default: null },
    /** Model version for embedding compatibility. */
    modelVersion: { type: Number, default: 1 },
    status: { type: String, default: "active" },
    /** @deprecated legacy single embedding - migrate to embeddingFront/Left/Right */
    embeddingVector: [{ type: Number }],
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

const attendanceEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["clockIn", "clockOut"], required: true },
    timestamp: { type: Date, required: true, index: true },
    ip: { type: String, default: "" },
    geo: {
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      ll: [{ type: Number }],
    },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    faceScore: { type: Number, default: 0 },
    verificationStatus: { type: String, default: "pending" },
  },
  { timestamps: true },
);

const workSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clockInAt: { type: Date, required: true, index: true },
    clockOutAt: { type: Date, default: null, index: true },
    totalSeconds: { type: Number, default: 0 },
    ipAtIn: { type: String, default: "" },
    ipAtOut: { type: String, default: "" },
    deviceIdAtIn: { type: Schema.Types.ObjectId, ref: "Device" },
    deviceIdAtOut: { type: Schema.Types.ObjectId, ref: "Device" },
  },
  { timestamps: true },
);

const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const awayAlertSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    employeeEmail: { type: String, required: true },
    awayAt: { type: Date, required: true, default: () => new Date() },
    minutesAway: { type: Number, required: true, default: 15 },
  },
  { timestamps: true },
);

const companyStructureSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    type: { type: String, default: "Department" },
    country: { type: String, default: "" },
    timeZone: { type: String, default: "" },
    parentStructure: { type: String, default: "" },
  },
  { timestamps: true },
);

const loginHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loginTime: { type: Date, required: true },
    loginTimeFormatted: { type: String, required: true },
    ipAddress: { type: String, default: "" },
    systemName: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export type RoleDoc = InferSchemaType<typeof roleSchema>;

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
export const RefreshToken =
  mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);
export const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);
export const FaceTemplate =
  mongoose.models.FaceTemplate || mongoose.model("FaceTemplate", faceTemplateSchema);
export const AttendanceEvent =
  mongoose.models.AttendanceEvent || mongoose.model("AttendanceEvent", attendanceEventSchema);
export const WorkSession =
  mongoose.models.WorkSession || mongoose.model("WorkSession", workSessionSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export const CompanyStructure =
  mongoose.models.CompanyStructure || mongoose.model("CompanyStructure", companyStructureSchema);
export const AwayAlert =
  mongoose.models.AwayAlert || mongoose.model("AwayAlert", awayAlertSchema);
export const LoginHistory =
  mongoose.models.LoginHistory || mongoose.model("LoginHistory", loginHistorySchema);
