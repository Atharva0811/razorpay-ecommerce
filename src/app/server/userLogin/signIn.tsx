"use server";

import { loginSchema, registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt, encrypt } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type LoginState = {
  errors?: {
    username?: string[];
    password?: string[];
    general?: string[];
  };
  success?: boolean;
};

export type RegisterState = {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    general?: string[];
  };
  success?: boolean;
};

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const validatedFields = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { username, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    if (!user) {
      return {
        errors: {
          general: ["Invalid username or password"],
        },
      };
    }

    const isValidPassword = password == user.password ? true : false;

    if (!isValidPassword) {
      return {
        errors: {
          general: ["Invalid username or password"],
        },
      };
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionData = {
      user: {
        id: user.id,
        username: user.username,
      },
      expires,
    };

    const session = await encrypt(sessionData);

    (await cookies()).set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: {
        general: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  try {
    const validatedFields = registerSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { username, email, password } = validatedFields.data;

    const existingUser = await prisma.user.findFirst({
      where: { username: username },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return {
          errors: {
            username: ["Username is already taken"],
          },
        };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email
      },
      select: {
        id: true,
        username: true,
      },
    });

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionData = {
      user: {
        id: user.id,
        username: user.username,
      },
      expires,
    };

    const session = await encrypt(sessionData);

    (await cookies()).set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      errors: {
        general: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}

export async function logoutAction() {
  (await cookies()).set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const session = await decrypt(sessionCookie);

    if (!session || new Date() > new Date(session.expires)) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
