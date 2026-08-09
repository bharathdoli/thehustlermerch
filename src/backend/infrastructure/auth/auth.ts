import dotenv from "dotenv"
dotenv.config();
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "../../../lib/db/prisma";
import { JWT } from "next-auth/jwt";
import { UserRole } from "@/src/generated/prisma/enums";
import { AppError } from "../../shared/errors/api/AppError";
import bcrypt from "bcryptjs";

 
export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {}
            },

            async authorize(credentials) {

                if(!credentials){
                    throw new AppError("Credentials not Found!",404)
                }

                console.log("Credentials : " + credentials)

                const email = credentials?.email as string;
                const password = credentials?.password as string;

                const user = await prisma.user.findUnique({
                where: {
                    email,
                },
                select: {
                    uid: true,
                    uname: true,
                    email: true,
                    password: true,
                    role: true,
                },
                });

                console.log("User:", user);

                if (!user)
                    return null;
                
                console.log("DB Password:", user.password);

                if(!user.password){
                    throw new AppError("Password is required",400);
                }

                const valid = await bcrypt.compare(
                     password,
                    user.password
                );

                if (!valid)
                    return null;

                return {
                id: user.uid,
                name: user.uname, 
                email: user.email,
                role: user.role
                };
            }
        })
    ],
    callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
    }

    return token;
  },

  async session({ session, token }) {
    const jwt = token as JWT & {
      role: UserRole;
    };

    if (session.user) {
      session.user.id = jwt.sub!;
      session.user.role = jwt.role;
    }

    return session;
  },
}
});