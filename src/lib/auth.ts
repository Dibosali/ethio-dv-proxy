import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Proxy Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "e.g. bole_star_dv or superadmin",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter both username and password");
        }

        const normalizedUsername = credentials.username.toLowerCase().trim();

        // 1. Query user from Neon database by unique username
        const user = await prisma.user.findUnique({
          where: { username: normalizedUsername },
          include: { profile: true },
        });

        if (!user) {
          throw new Error("Invalid username or password");
        }

        // 2. Check if agent account is active
        if (user.role === Role.PROXY_AGENT && user.profile && !user.profile.isActive) {
          throw new Error("This proxy agent account has been disabled. Please contact the Super Admin.");
        }

        // 3. Verify password hash using bcrypt.compare
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid username or password");
        }

        // 4. Return authenticated user payload
        return {
          id: user.id,
          username: user.username,
          name: user.profile?.stationaryName || user.username,
          role: user.role,
          stationaryName: user.profile?.stationaryName,
        };
      },
    }),
  ],
  callbacks: {
    // Inject user id, username, and role into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.stationaryName = user.stationaryName;
      }
      return token;
    },

    // Inject user id, username, and role from JWT token into the client/server session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
        session.user.stationaryName = token.stationaryName as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;

export async function getServerAuthSession() {
  try {
    const { getServerSession } = await import("next-auth/next");
    return await getServerSession(authOptions);
  } catch (error: any) {
    // Gracefully handle calls outside request scope (e.g. CLI, tests, build)
    if (
      error?.message?.includes("outside a request scope") ||
      error?.message?.includes("headers")
    ) {
      return null;
    }
    throw error;
  }
}
