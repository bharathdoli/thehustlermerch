import { EmployeeDepartment, MaterialUnit, UserRole } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/lib/db/prisma";


async function main() {
  console.log("Seeding...");

  // ── Admin ────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@printingpress.com" },
    update: {},
    create: {
      uname: "Admin",
      email: "admin@printingpress.com",
      password:"Password@123",
      phoneNo: "9999999999",
      role: UserRole.Admin,
    },
  });

  // ── Employees — one per department ─────────────────────────────────
  const employees: {
    dept: EmployeeDepartment;
    name: string;
    email: string;
    phone: string;
    designation: string;
  }[] = [
    { dept: EmployeeDepartment.Design, name: "Ravi Kumar", email: "ravi.design@printingpress.com", phone: "9000000001", designation: "Graphic Designer" },
    { dept: EmployeeDepartment.Prepress, name: "Sunita Rao", email: "sunita.prepress@printingpress.com", phone: "9000000002", designation: "Prepress Technician" },
    { dept: EmployeeDepartment.Printing, name: "Manoj Singh", email: "manoj.press@printingpress.com", phone: "9000000003", designation: "Press Operator" },
    { dept: EmployeeDepartment.QualityCheck, name: "Divya Nair", email: "divya.qc@printingpress.com", phone: "9000000004", designation: "QC Inspector" },
    { dept: EmployeeDepartment.Dispatch, name: "Ahmed Sheikh", email: "ahmed.dispatch@printingpress.com", phone: "9000000005", designation: "Dispatch Coordinator" },
    { dept: EmployeeDepartment.Inventory, name: "Priya Menon", email: "priya.inventory@printingpress.com", phone: "9000000006", designation: "Inventory Manager" },
    { dept: EmployeeDepartment.General, name: "Karan Mehta", email: "karan.general@printingpress.com", phone: "9000000007", designation: "Floor Supervisor" },
  ];

  for (const e of employees) {
    await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: {
        uname: e.name,
        email: e.email,
        phoneNo: e.phone,
        role: UserRole.Employee,
        employee: {
          create: {
            department: e.dept,
            designation: e.designation,
          },
        },
      },
    });
  }

  // ── Sample customer, with a default address ────────────────────────
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      uname: "Test Customer",
      email: "customer@example.com",
      password:"Password@123",
      phoneNo: "8888888888",
      role: UserRole.Customer,
      addresses: {
        create: {
          addressLine1: "12 MG Road",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500001",
          isDefault: true,
        },
      },
    },
  });

  // ── Categories -> Products -> Variants ──────────────────────────────
  const catalog = [
    {
      categoryName: "Business Cards",
      description: "Premium and standard business card printing",
      products: [
        {
          productName: "Classic Business Card",
          description: "350gsm, matte or gloss finish",
          variants: [
            { colour: "Matte", size: "Standard (3.5x2 in)", price: 499 },
            { colour: "Glossy", size: "Standard (3.5x2 in)", price: 549 },
          ],
        },
      ],
    },
    {
      categoryName: "Flyers & Brochures",
      description: "Marketing collateral printing",
      products: [
        {
          productName: "Tri-fold Brochure",
          description: "Full colour, double-sided",
          variants: [
            { colour: "Full Colour", size: "A4", price: 1299 },
            { colour: "Full Colour", size: "A5", price: 899 },
          ],
        },
      ],
    },
    {
      categoryName: "Banners & Signage",
      description: "Large-format printing",
      products: [
        {
          productName: "Vinyl Banner",
          description: "Weatherproof, outdoor grade",
          variants: [
            { colour: "Full Colour", size: "3x6 ft", price: 1899 },
            { colour: "Full Colour", size: "4x8 ft", price: 2999 },
          ],
        },
      ],
    },
  ];

  for (const cat of catalog) {
    // Skip if this category was already seeded on a previous run
    const existing = await prisma.category.findFirst({
      where: { categoryName: cat.categoryName },
    });
    if (existing) continue;

    await prisma.category.create({
      data: {
        categoryName: cat.categoryName,
        description: cat.description,
        products: {
          create: cat.products.map((p) => ({
            productName: p.productName,
            description: p.description,
            variants: {
              create: p.variants.map((v) => ({
                colour: v.colour,
                size: v.size,
                price: v.price,
              })),
            },
          })),
        },
      },
    });
  }

  // ── Materials ──────────────────────────────────────────────────────
  const materials = [
    { name: "Art Paper 300gsm", unit: MaterialUnit.sheet, currentStock: 5000, reorderThreshold: 500, unitCost: 3.5 },
    { name: "CMYK Ink Set", unit: MaterialUnit.litre, currentStock: 40, reorderThreshold: 5, unitCost: 850 },
    { name: "Offset Printing Plates", unit: MaterialUnit.piece, currentStock: 200, reorderThreshold: 20, unitCost: 120 },
    { name: "Vinyl Banner Roll", unit: MaterialUnit.roll, currentStock: 15, reorderThreshold: 3, unitCost: 2200 },
  ];

  for (const m of materials) {
    await prisma.material.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });