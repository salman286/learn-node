exports.userRoles = ["user", "author", "admin"];

const commonPrivateFields = ["createdAt", "updatedAt"];
exports.blogPrivateFields = [...commonPrivateFields, "createdBy"];
exports.userPrivateFields = [
  ...commonPrivateFields,
  "password",
  "role",
  "active",
];
