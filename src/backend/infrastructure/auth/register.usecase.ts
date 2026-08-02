import { UserRole } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/lib/db/prisma";
import { RegisterInput, RegisterSchema } from "@/src/schema/auth.schema";
import bcrypt from "bcryptjs";


export async function registerUser(input:RegisterInput){


   const data = RegisterSchema.parse(input);

   const existingUser = await prisma.user.findFirst({
    where:{
        email:data.email
    }
   })

    if (existingUser) {
    throw new Error("Email already exists.");
  }

    const existingPhone = await prisma.user.findUnique({
    where: {
      phoneNo: data.phoneNo,
    },
  });

  if (existingPhone) {
    throw new Error("Phone number already exists.");
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    12
  );


   const user = await prisma.user.create({
    data: {
      uname: data.name,
      email: data.email,
      password: hashedPassword,
      phoneNo: data.phoneNo,
      role: UserRole.Customer,
    },
  });
  
   return {
    id: user.uid,
    name: user.uname,
    email: user.email,
    role: user.role,
  };


}