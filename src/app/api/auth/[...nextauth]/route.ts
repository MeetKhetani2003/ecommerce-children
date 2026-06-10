import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "bypass-login",
      name: "Bypass Login",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        await dbConnect();
        let dbUser = await User.findOne({ email: credentials.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: credentials.name || "Test User",
            email: credentials.email,
            image: "",
            role: credentials.role || "user",
            addresses: [],
            defaultAddress: "",
          });
        }
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name || "User",
            email: user.email,
            image: user.image || "",
            role: "user",
            addresses: [],
            defaultAddress: "",
          });
        }
        return true;
      } catch (err) {
        console.error("Error during NextAuth sign-in:", err);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            (session.user as any).role = dbUser.role;
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).addresses = dbUser.addresses || [];
            (session.user as any).defaultAddress = dbUser.defaultAddress || "";
          }
        } catch (err) {
          console.error("Error during session callback:", err);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
