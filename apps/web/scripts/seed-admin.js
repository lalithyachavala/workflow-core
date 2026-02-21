/* eslint-disable no-console */
const mongoose = require("mongoose");
const argon2 = require("argon2");

const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/workforce";

const roleSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String, default: "" },
  permissions: [{ type: String, required: true }],
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  roleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  isActive: { type: Boolean, default: true },
  profile: {
    displayName: { type: String, default: "" },
    employeeCode: { type: String, default: "" },
  },
});

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(mongodbUri, { dbName: "workforce" });

  let adminRole = await Role.findOne({ name: "admin" });
  if (!adminRole) {
    adminRole = await Role.create({
      name: "admin",
      description: "System administrator",
      permissions: [
        "roles:create",
        "roles:read",
        "roles:update",
        "roles:delete",
        "users:create",
        "users:read",
        "users:update",
        "attendance:read",
        "attendance:correct",
        "face:enroll",
        "company_structure:create",
        "company_structure:read",
        "company_structure:update",
        "company_structure:delete",
        "dashboard:read",
      ],
    });
  }

  const adminEmail = "admin@euroasianngroup.com";
  let existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const passwordHash = await argon2.hash("Admin123!");
    await User.create({
      email: adminEmail,
      passwordHash,
      roleIds: [adminRole._id],
      isActive: true,
      profile: { displayName: "Admin", employeeCode: "ADMIN001" },
    });
    console.log("Admin seeded.");
  } else {
    console.log("Admin already exists.");
  }

  let employeeRole = await Role.findOne({ name: "employee" });
  if (!employeeRole) {
    employeeRole = await Role.create({
      name: "employee",
      description: "Regular employee",
      permissions: ["attendance:read", "dashboard:read"],
    });
  }

  const employeeEmail = "lalithyachavala@euroasianngroup.com";
  existing = await User.findOne({ email: employeeEmail });
  if (!existing) {
    const passwordHash = await argon2.hash("lalithya");
    await User.create({
      email: employeeEmail,
      passwordHash,
      roleIds: [employeeRole._id],
      isActive: true,
      profile: { displayName: "Lalithya Chavala", employeeCode: "EMP001" },
    });
    console.log("Employee seeded.");
  } else {
    console.log("Employee already exists.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
