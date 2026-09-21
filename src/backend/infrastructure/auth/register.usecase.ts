import { prisma } from "@/src/lib/db/prisma";
import { RegisterInput, RegisterSchema } from "@/src/schema/auth.schema";
import bcrypt from "bcryptjs";
import { AppError } from "../../shared/errors/api/AppError";


export async function registerUser(input:RegisterInput){


   const data = RegisterSchema.parse(input);

   console.log(data);

   const existingUser = await prisma.user.findFirst({
    where:{
        email:data.email
    }
   })

   console.log(existingUser);

    if (existingUser) {
       throw new AppError("Email already exists.", 409);
}

    const existingPhone = await prisma.user.findUnique({
    where: {
      phoneNo: data.phoneNo,
    },
  });

  if (existingPhone) {
    throw new AppError("Phone number already exists.",409);
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
      role: data.role,
    },
  });
  
  console.log("User " + user);
   return {
    id: user.uid,
    name: user.uname,
    email: user.email,
    role: user.role,
  };
}