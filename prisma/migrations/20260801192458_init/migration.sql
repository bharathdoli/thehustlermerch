-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('Customer', 'Admin', 'Employee');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('initiated', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "production_stage" AS ENUM ('DesignReview', 'Prepress', 'Printing', 'QualityCheck', 'Dispatch', 'Completed', 'OnHold');

-- CreateEnum
CREATE TYPE "employee_department" AS ENUM ('Design', 'Prepress', 'Printing', 'QualityCheck', 'Dispatch', 'Inventory', 'General');

-- CreateEnum
CREATE TYPE "material_unit" AS ENUM ('sheet', 'kg', 'litre', 'roll', 'piece');

-- CreateTable
CREATE TABLE "User" (
    "uid" UUID NOT NULL,
    "uname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'Customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryId" UUID NOT NULL,
    "categoryName" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "Product" (
    "productId" UUID NOT NULL,
    "categoryId" UUID,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "productImage" TEXT,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "variantId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "colour" TEXT,
    "size" TEXT,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("variantId")
);

-- CreateTable
CREATE TABLE "Item" (
    "itemId" UUID NOT NULL,
    "userId" UUID,
    "variantId" UUID NOT NULL,
    "customizationLogoFront" TEXT,
    "customizationLogoBack" TEXT,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "Cart" (
    "cartId" UUID NOT NULL,
    "userId" UUID,
    "sessionId" TEXT,
    "itemIds" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("cartId")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "totalAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "paymentMode" TEXT,
    "gatewayTxnId" TEXT,
    "status" "payment_status" NOT NULL DEFAULT 'initiated',
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "rid" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID,
    "orderId" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("rid")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employeeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "department" "employee_department" NOT NULL DEFAULT 'General',
    "designation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employeeId")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "jobId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "assignedEmployeeId" UUID,
    "stage" "production_stage" NOT NULL DEFAULT 'DesignReview',
    "priority" TEXT NOT NULL DEFAULT 'Standard',
    "notes" TEXT,
    "estimatedCompletionAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "JobStageHistory" (
    "historyId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "fromStage" "production_stage",
    "toStage" "production_stage" NOT NULL,
    "changedByEmployeeId" UUID,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobStageHistory_pkey" PRIMARY KEY ("historyId")
);

-- CreateTable
CREATE TABLE "Material" (
    "materialId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "material_unit" NOT NULL,
    "currentStock" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reorderThreshold" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("materialId")
);

-- CreateTable
CREATE TABLE "MaterialUsage" (
    "usageId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "quantityUsed" DECIMAL(12,2) NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialUsage_pkey" PRIMARY KEY ("usageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNo_key" ON "User"("phoneNo");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_variantId_idx" ON "Item"("variantId");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "Order_cartId_idx" ON "Order"("cartId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Reviews_productId_idx" ON "Reviews"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE UNIQUE INDEX "PrintJob_orderId_key" ON "PrintJob"("orderId");

-- CreateIndex
CREATE INDEX "PrintJob_assignedEmployeeId_idx" ON "PrintJob"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "PrintJob_stage_idx" ON "PrintJob"("stage");

-- CreateIndex
CREATE INDEX "JobStageHistory_jobId_idx" ON "JobStageHistory"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");

-- CreateIndex
CREATE INDEX "MaterialUsage_jobId_idx" ON "MaterialUsage"("jobId");

-- CreateIndex
CREATE INDEX "MaterialUsage_materialId_idx" ON "MaterialUsage"("materialId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("variantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("cartId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStageHistory" ADD CONSTRAINT "JobStageHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PrintJob"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStageHistory" ADD CONSTRAINT "JobStageHistory_changedByEmployeeId_fkey" FOREIGN KEY ("changedByEmployeeId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUsage" ADD CONSTRAINT "MaterialUsage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PrintJob"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUsage" ADD CONSTRAINT "MaterialUsage_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("materialId") ON DELETE RESTRICT ON UPDATE CASCADE;
