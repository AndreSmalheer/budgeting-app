import bcrypt from "bcryptjs";
import { getDatabase } from "../config/database.js";

export async function registerUser(request, response, next) {
  try {
    const fullName = request.body.fullName?.trim() || "";
    const email = request.body.email?.trim().toLowerCase() || "";
    const password = request.body.password || "";
    const role = request.body.role?.trim() || "";

    validateRegisterInput(fullName, email, password, role);

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      response.status(409).json({
        success: false,
        message: "Er bestaat al een account met dit e-mailadres.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      fullName,
      email,
      passwordHash,
      role,
      createdAt: new Date(),
    });

    response.status(201).json({
      success: true,
      message: "Registratie gelukt.",
      user: {
        id: String(result.insertedId),
        fullName,
        email,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function loginUser(request, response, next) {
  try {
    const email = request.body.email?.trim().toLowerCase() || "";
    const password = request.body.password || "";

    if (!isValidEmail(email)) {
      response.status(422).json({
        success: false,
        message: "Vul een geldig e-mailadres in.",
      });
      return;
    }

    if (!password) {
      response.status(422).json({
        success: false,
        message: "Vul je wachtwoord in.",
      });
      return;
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      response.status(401).json({
        success: false,
        message: "De inloggegevens kloppen niet.",
      });
      return;
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      response.status(401).json({
        success: false,
        message: "De inloggegevens kloppen niet.",
      });
      return;
    }

    response.json({
      success: true,
      message: "Inloggen gelukt.",
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

function validateRegisterInput(fullName, email, password, role) {
  if (fullName.length < 2) {
    const error = new Error("Vul een geldige naam in van minimaal 2 tekens.");
    error.statusCode = 422;
    throw error;
  }

  if (!isValidEmail(email)) {
    const error = new Error("Vul een geldig e-mailadres in.");
    error.statusCode = 422;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Je wachtwoord moet minimaal 6 tekens lang zijn.");
    error.statusCode = 422;
    throw error;
  }

  if (!["parent", "child"].includes(role)) {
    const error = new Error("Kies een geldige rol: ouder of kind.");
    error.statusCode = 422;
    throw error;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
