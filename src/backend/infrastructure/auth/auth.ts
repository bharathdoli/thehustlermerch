import dotenv from "dotenv"
dotenv.config();
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "../../../lib/db/prisma";
import { JWT } from "next-auth/jwt";
import { UserRole } from "@/src/generated/prisma/enums";

 
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
                    throw new Error("Credentials not Found!")
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
                    employee: {
                    select: {
                        employeeId: true,
                    },
                    },
                },
                });

                console.log("User:", user);

                if (!user)
                    return null;
                
                console.log("DB Password:", user.password);

                if(!user.password){
                    throw new Error("Password is required");
                }

                // const valid = await bcrypt.compare(
                //      password,
                //     user.password
                // );

                // if (!valid)
                //     return null;

                return {
                id: user.uid,
                name: user.uname, 
                email: user.email,
                role: user.role,
                employeeId: user.employee?.employeeId ?? null,
                };
            }
        })
    ],
    callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
      token.employeeId = user.employeeId;
    }

    return token;
  },

  async session({ session, token }) {
    const jwt = token as JWT & {
      role: UserRole;
      employeeId?: string | null;
    };

    if (session.user) {
      session.user.id = jwt.sub!;
      session.user.role = jwt.role;
      session.user.employeeId = jwt.employeeId;
    }

    return session;
  },
}
});