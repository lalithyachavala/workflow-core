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

  const email = "admin@euroasianngroup.com";
  const adminExists = await User.findOne({ email });
  if (!adminExists) {
    await User.create({
      email,
      passwordHash: await hashPassword("Admin123!"),
      roleIds: [adminRole._id],
      isActive: true,
      profile: { displayName: "Admin", employeeCode: "ADMIN001" },
    });
  }

  seeded = true;
}
