import { prisma } from "@/src/lib/db/prisma";


export async function healthCheckUsecase(){
       const res =  await prisma.$queryRaw`SELECT 1`;
       return res;
}