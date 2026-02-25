import { Role, User } from "@/src/db/models";
import { hashPassword } from "@/src/lib/password";

let seeded = false;

export async function ensureBootstrap() {
  if (seeded) {
    return;
  }

  const requiredPermissions = [
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
  ];

  let adminRole = await Role.findOne({ name: "admin" });
  if (!adminRole) {
    adminRole = await Role.create({
      name: "admin",
      description: "System administrator",
      permissions: requiredPermissions,
    });
  } else {
    const merged = Array.from(new Set([...(adminRole.permissions || []), ...requiredPermissions]));
    if (merged.length !== adminRole.permissions.length) {
      adminRole.permissions = merged;
      await adminRole.save();
    }
  }

  const adminEmail = "admin@euroasianngroup.com";
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      email: adminEmail,
      passwordHash: await hashPassword("Admin123!"),
      roleIds: [adminRole._id],
      isActive: true,
      profile: { displayName: "Admin", employeeCode: "ADMIN001" },
    });
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
  const employeeExists = await User.findOne({ email: employeeEmail });
  if (!employeeExists) {
    await User.create({
      email: employeeEmail,
      passwordHash: await hashPassword("lalithya"),
      roleIds: [employeeRole._id],
      isActive: true,
      profile: { displayName: "Lalithya Chavala", employeeCode: "EMP001" },
    });
  }

  const harshithEmail = "harshithadmin@euroasianngroup.com";
  const harshithExists = await User.findOne({ email: harshithEmail });
  if (!harshithExists) {
    await User.create({
      email: harshithEmail,
      passwordHash: await hashPassword("harshith"),
      roleIds: [employeeRole._id, adminRole._id],
      isActive: true,
      profile: { displayName: "Harshith", employeeCode: "EMP002" },
    });
  }

  seeded = true;
}
