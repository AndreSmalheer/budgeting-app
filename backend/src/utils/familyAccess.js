export async function findUserById(db, userId) {
  if (typeof userId !== "string" || isNaN(userId)) {
    return null;
  }

  return db.collection("users").findOne({ _id: parseInt(userId) });
}

export async function getLinkedChildForParent(db, parentId) {
  const link = await db.collection("parentChildLinks").findOne({ parentId });

  if (!link) {
    return null;
  }

  const child = await findUserById(db, link.childId);

  if (!child) {
    return null;
  }

  return {
    link,
    child,
  };
}

export async function getLinkedParentForChild(db, childId) {
  const link = await db.collection("parentChildLinks").findOne({ childId });

  if (!link) {
    return null;
  }

  const parent = await findUserById(db, link.parentId);

  if (!parent) {
    return null;
  }

  return {
    link,
    parent,
  };
}

export function mapPublicUser(user) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}
