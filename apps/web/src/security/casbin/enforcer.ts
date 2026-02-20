import { newEnforcer, newModelFromString } from "casbin";
import { Role, User } from "@/src/db/models";

const modelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`;

export async function enforceUserPermission(userId: string, resource: string, action: string) {
  const user = await User.findById(userId).lean();
  if (!user) {
    return false;
  }

  const roleDocs = await Role.find({ _id: { $in: user.roleIds } }).lean();
  const enforcer = await newEnforcer(newModelFromString(modelText));
  for (const role of roleDocs) {
    await enforcer.addGroupingPolicy(userId, role.name);
    for (const perm of role.permissions) {
      const [obj, act] = perm.split(":");
      if (obj && act) {
        await enforcer.addPolicy(role.name, obj, act);
      }
    }
  }

  return enforcer.enforce(userId, resource, action);
}
