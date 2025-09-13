import { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

// Check if Cognito is configured
const cognitoConfigured =
  process.env.COGNITO_CLIENT_ID &&
  process.env.COGNITO_CLIENT_ID !== "your-cognito-client-id" &&
  process.env.COGNITO_CLIENT_SECRET &&
  process.env.COGNITO_CLIENT_SECRET !== "your-cognito-client-secret" &&
  process.env.COGNITO_ISSUER &&
  process.env.COGNITO_ISSUER !== "https://cognito-idp.us-east-1.amazonaws.com/your-user-pool-id";

export const authOptions: NextAuthOptions = {
  providers: cognitoConfigured ? [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ] : [],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
        },
        accessToken: token.accessToken as string,
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};