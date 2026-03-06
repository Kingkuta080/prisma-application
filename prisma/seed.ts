import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Reset: delete in dependency order (child tables first)
  await prisma.payment.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.previousSchool.deleteMany();
  await prisma.application.deleteMany();
  await prisma.applicationSession.deleteMany();
  await prisma.oneTimeLoginToken.deleteMany();

  const currentYear = new Date().getFullYear();
  const defaultClasses = [
    "Secondary Conventional / Islamiyya",
    "JSS",
    "SSS",
    "A Levels",
    "TOEFL",
    "SAT",
    "IGCSE",
    "AMIB",
    "WAEC",
    "NECO",
    "Adult Islamiyya",
    "Pre-Basic",
    "Basic",
    "Muttawasita",
    "Sanawiyya",
    "Advanced Diploma",
  ];

  const sessions = [
    {
      year: currentYear - 1,
      openAt: new Date(currentYear - 1, 0, 1),
      closeAt: new Date(currentYear - 1, 5, 30),
      amount: 15000,
      availableClasses: defaultClasses,
      status: "CONCLUDED" as const,
    },
    {
      year: currentYear,
      openAt: new Date(currentYear, 0, 1),
      closeAt: new Date(currentYear, 5, 30),
      amount: 16000,
      availableClasses: defaultClasses,
      status: "ACTIVE" as const,
    },
    {
      year: currentYear + 1,
      openAt: new Date(currentYear + 1, 0, 1),
      closeAt: new Date(currentYear + 1, 5, 30),
      amount: 17000,
      availableClasses: defaultClasses,
      status: "INACTIVE" as const,
    },
  ];

  for (const session of sessions) {
    await prisma.applicationSession.create({
      data: {
        year: session.year,
        openAt: session.openAt,
        closeAt: session.closeAt,
        amount: session.amount,
        availableClasses: session.availableClasses,
        status: session.status,
      } as Parameters<typeof prisma.applicationSession.create>[0]["data"],
    });
  }

  console.log(`Seeded ${sessions.length} application session(s).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
