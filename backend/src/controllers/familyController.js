import { getDatabase } from "../config/database.js";
import {
  findUserById,
  getLinkedChildForParent,
  mapPublicUser,
} from "../utils/familyAccess.js";

export async function getFamilyStatus(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const usersCollection = db.collection("users");
    const linksCollection = db.collection("parentChildLinks");

    const user = await findUserById(db, userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: "Gebruiker niet gevonden.",
      });
      return;
    }

    const familyStatus = await buildFamilyStatus({
      user,
      usersCollection,
      linksCollection,
    });

    response.json({
      success: true,
      ...familyStatus,
    });
  } catch (error) {
    next(error);
  }
}

export async function linkChildToParent(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const childEmail = request.body.childEmail?.trim().toLowerCase() || "";

    validateUserId(userId);

    if (!isValidEmail(childEmail)) {
      response.status(422).json({
        success: false,
        message: "Vul een geldig e-mailadres van het kind in.",
      });
      return;
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");
    const linksCollection = db.collection("parentChildLinks");

    const parent = await findUserById(db, userId);

    if (!parent) {
      response.status(404).json({
        success: false,
        message: "Ouderaccount niet gevonden.",
      });
      return;
    }

    if (parent.role !== "parent") {
      response.status(403).json({
        success: false,
        message: "Alleen een ouderaccount kan een kind koppelen.",
      });
      return;
    }

    const child = await usersCollection.findOne({
      email: childEmail,
      role: "child",
    });

    if (!child) {
      response.status(404).json({
        success: false,
        message: "Er is geen kindaccount gevonden met dit e-mailadres.",
      });
      return;
    }

    if (String(child._id) === userId) {
      response.status(422).json({
        success: false,
        message: "Je kunt je eigen account niet koppelen als kindaccount.",
      });
      return;
    }

    const existingParentLink = await linksCollection.findOne({
      parentId: userId,
    });

    if (existingParentLink) {
      response.status(409).json({
        success: false,
        message: "Dit ouderaccount is al gekoppeld aan een kind.",
      });
      return;
    }

    const existingChildLink = await linksCollection.findOne({
      childId: String(child._id),
    });

    if (existingChildLink) {
      response.status(409).json({
        success: false,
        message: "Dit kindaccount is al gekoppeld aan een ouder.",
      });
      return;
    }

    await linksCollection.insertOne({
      parentId: userId,
      childId: String(child._id),
      createdAt: new Date(),
    });

    const familyStatus = await buildFamilyStatus({
      user: parent,
      usersCollection,
      linksCollection,
    });

    response.status(201).json({
      success: true,
      message: `${child.fullName} is gekoppeld aan dit ouderaccount.`,
      ...familyStatus,
    });
  } catch (error) {
    next(error);
  }
}

export async function unlinkFamilyAccount(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const usersCollection = db.collection("users");
    const linksCollection = db.collection("parentChildLinks");

    const user = await findUserById(db, userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: "Gebruiker niet gevonden.",
      });
      return;
    }

    const linkFilter =
      user.role === "parent" ? { parentId: userId } : { childId: userId };

    const existingLink = await linksCollection.findOne(linkFilter);

    if (!existingLink) {
      response.status(404).json({
        success: false,
        message: "Er is geen gekoppeld account om los te koppelen.",
      });
      return;
    }

    await linksCollection.deleteOne({ _id: parseInt(existingLink._id) });

    const familyStatus = await buildFamilyStatus({
      user,
      usersCollection,
      linksCollection,
    });

    response.json({
      success: true,
      message:
        user.role === "parent"
          ? "Het kindaccount is losgekoppeld."
          : "Het ouderaccount is losgekoppeld.",
      ...familyStatus,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLinkedChildPots(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const parent = await findUserById(db, userId);

    if (!parent || parent.role !== "parent") {
      response.status(403).json({
        success: false,
        message:
          "Alleen een ouderaccount kan de gekoppelde kindpotjes bekijken.",
      });
      return;
    }

    const linkedChild = await getLinkedChildForParent(db, userId);

    if (!linkedChild) {
      response.status(404).json({
        success: false,
        message: "Er is nog geen kindaccount gekoppeld.",
      });
      return;
    }

    const pots = await db
      .collection("pots")
      .find({ userId: String(linkedChild.child._id) })
      .sort({ createdAt: -1 })
      .toArray();

    response.json({
      success: true,
      child: mapPublicUser(linkedChild.child),
      pots: pots.map(mapPot),
    });
  } catch (error) {
    next(error);
  }
}

export async function getLinkedChildTransactions(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const potId = request.query.potId?.trim() || "";
    const type = request.query.type?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const parent = await findUserById(db, userId);

    if (!parent || parent.role !== "parent") {
      response.status(403).json({
        success: false,
        message:
          "Alleen een ouderaccount kan de gekoppelde kindtransacties bekijken.",
      });
      return;
    }

    const linkedChild = await getLinkedChildForParent(db, userId);

    if (!linkedChild) {
      response.status(404).json({
        success: false,
        message: "Er is nog geen kindaccount gekoppeld.",
      });
      return;
    }

    const filter = { userId: String(linkedChild.child._id) };

    if (potId) {
      filter.potId = potId;
    }

    if (type && ["deposit", "expense"].includes(type)) {
      filter.type = type;
    }

    const transactions = await db
      .collection("transactions")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const potIds = [...new Set(transactions.map((item) => item.potId))].filter(
      (value) => value && !isNaN(value),
    );
    const pots = potIds.length
      ? await db
          .collection("pots")
          .find({ _id: { $in: potIds.map((id) => parseInt(id)) } })
          .toArray()
      : [];
    const potMap = new Map(pots.map((pot) => [String(pot._id), pot]));

    response.json({
      success: true,
      child: mapPublicUser(linkedChild.child),
      transactions: transactions.map((transaction) =>
        mapTransaction(transaction, {
          pot: potMap.get(transaction.potId),
        }),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingApprovals(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const parent = await findUserById(db, userId);

    if (!parent || parent.role !== "parent") {
      response.status(403).json({
        success: false,
        message: "Alleen een ouderaccount kan goedkeuringen bekijken.",
      });
      return;
    }

    const pendingTransactions = await db
      .collection("transactions")
      .find({
        reviewParentId: userId,
        type: "expense",
        status: "pending",
      })
      .sort({ createdAt: -1 })
      .toArray();

    const childIds = [
      ...new Set(pendingTransactions.map((item) => item.userId)),
    ];
    const potIds = [
      ...new Set(pendingTransactions.map((item) => item.potId)),
    ].filter((value) => value && !isNaN(value));

    const [children, pots] = await Promise.all([
      childIds.length
        ? db
            .collection("users")
            .find({ _id: { $in: childIds.map((id) => parseInt(id)) } })
            .toArray()
        : [],
      potIds.length
        ? db
            .collection("pots")
            .find({ _id: { $in: potIds.map((id) => parseInt(id)) } })
            .toArray()
        : [],
    ]);

    const childMap = new Map(
      children.map((child) => [String(child._id), child]),
    );
    const potMap = new Map(pots.map((pot) => [String(pot._id), pot]));

    response.json({
      success: true,
      approvals: pendingTransactions.map((transaction) =>
        mapApproval(transaction, {
          child: childMap.get(transaction.userId),
          pot: potMap.get(transaction.potId),
        }),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function reviewApproval(request, response, next) {
  try {
    const approvalId = request.params.id;
    const userId = request.body.userId?.trim() || "";
    const action = request.body.action?.trim() || "";

    validateUserId(userId);

    if (isNaN(approvalId)) {
      response.status(422).json({
        success: false,
        message: "Ongeldige goedkeuring.",
      });
      return;
    }

    if (!["approve", "reject"].includes(action)) {
      response.status(422).json({
        success: false,
        message: "Gebruik een geldige actie: approve of reject.",
      });
      return;
    }

    const db = await getDatabase();
    const parent = await findUserById(db, userId);

    if (!parent || parent.role !== "parent") {
      response.status(403).json({
        success: false,
        message: "Alleen een ouderaccount kan goedkeuringen verwerken.",
      });
      return;
    }

    const transactionsCollection = db.collection("transactions");
    const potsCollection = db.collection("pots");
    const transaction = await transactionsCollection.findOne({
      _id: parseInt(approvalId),
      status: "pending",
      type: "expense",
      reviewParentId: userId,
    });

    if (!transaction) {
      response.status(404).json({
        success: false,
        message: "Dit opnameverzoek kon niet gevonden worden.",
      });
      return;
    }

    const now = new Date();

    if (action === "reject") {
      await transactionsCollection.updateOne(
        { _id: parseInt(approvalId) },
        {
          $set: {
            status: "rejected",
            reviewedAt: now,
            updatedAt: now,
          },
        },
      );

      response.json({
        success: true,
        message: "Het opnameverzoek is afgewezen.",
      });
      return;
    }

    const pot = await potsCollection.findOne({
      _id: parseInt(transaction.potId),
      userId: transaction.userId,
    });

    if (!pot) {
      response.status(404).json({
        success: false,
        message: "Het potje van dit opnameverzoek kon niet gevonden worden.",
      });
      return;
    }

    const currentBalance = Number(pot.currentBalance || 0);
    const nextBalance = currentBalance - Number(transaction.amount || 0);

    if (nextBalance < 0) {
      response.status(422).json({
        success: false,
        message:
          "Er staat niet genoeg saldo in het potje om deze opname goed te keuren.",
      });
      return;
    }

    await Promise.all([
      transactionsCollection.updateOne(
        { _id: parseInt(approvalId) },
        {
          $set: {
            status: "approved",
            reviewedAt: now,
            updatedAt: now,
          },
        },
      ),
      potsCollection.updateOne(
        { _id: parseInt(transaction.potId) },
        {
          $set: {
            currentBalance: nextBalance,
            updatedAt: now,
          },
        },
      ),
    ]);

    response.json({
      success: true,
      message: "Het opnameverzoek is goedgekeurd.",
    });
  } catch (error) {
    next(error);
  }
}

async function buildFamilyStatus({ user, usersCollection, linksCollection }) {
  if (user.role === "parent") {
    const link = await linksCollection.findOne({ parentId: String(user._id) });
    const child =
      link && link.childId && !isNaN(link.childId)
        ? await usersCollection.findOne({ _id: parseInt(link.childId) })
        : null;

    return {
      user: mapPublicUser(user),
      linkedParent: null,
      linkedChild: child ? mapPublicUser(child) : null,
    };
  }

  if (user.role === "child") {
    const link = await linksCollection.findOne({ childId: String(user._id) });
    const parent =
      link && link.parentId && !isNaN(link.parentId)
        ? await usersCollection.findOne({ _id: parseInt(link.parentId) })
        : null;

    return {
      user: mapPublicUser(user),
      linkedParent: parent ? mapPublicUser(parent) : null,
      linkedChild: null,
    };
  }

  return {
    user: mapPublicUser(user),
    linkedParent: null,
    linkedChild: null,
  };
}

function validateUserId(userId) {
  if (!userId || isNaN(userId)) {
    const error = new Error("Ongeldige gebruiker.");
    error.statusCode = 422;
    throw error;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapPot(pot) {
  return {
    id: String(pot._id),
    userId: pot.userId,
    name: pot.name,
    icon: pot.icon,
    targetAmount: Number(pot.targetAmount || 0),
    currentBalance: Number(pot.currentBalance || 0),
    createdAt: pot.createdAt,
    updatedAt: pot.updatedAt,
  };
}

function mapTransaction(transaction, options = {}) {
  const pot = options.pot || null;

  return {
    id: String(transaction._id),
    userId: transaction.userId,
    potId: transaction.potId,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    description: transaction.description,
    category: transaction.category || "overig",
    status: transaction.status || "approved",
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt || transaction.createdAt,
    potName: pot?.name || "",
    potIcon: pot?.icon || "",
  };
}

function mapApproval(transaction, { child, pot }) {
  return {
    ...mapTransaction(transaction),
    childName: child?.fullName || "Kindaccount",
    childEmail: child?.email || "",
    potName: pot?.name || "Onbekend potje",
    potIcon: pot?.icon || "PiggyBank",
  };
}
