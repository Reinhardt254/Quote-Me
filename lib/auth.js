import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@lib/db";
import * as schema from "@lib/schema";

function env(name) {
  const value = process.env[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function usernameFromName(name, email) {
  const source = (name || email?.split("@")[0] || "user")
    .replace(/\s+/g, "")
    .toLowerCase();

  return source || "user";
}

const secret = env("BETTER_AUTH_SECRET") || env("NEXTAUTH_SECRET");
const baseURL =
  env("BETTER_AUTH_URL") || env("NEXTAUTH_URL") || "http://localhost:3000";

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    google: {
      clientId: env("GOOGLE_CLIENT_ID") || env("GOOGLE_ID"),
      clientSecret: env("GOOGLE_CLIENT_SECRET"),
      mapProfileToUser: (profile) => ({
        username: usernameFromName(profile.name, profile.email),
      }),
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            username: user.username || usernameFromName(user.name, user.email),
          },
        }),
      },
    },
  },
  plugins: [nextCookies()],
});
