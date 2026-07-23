/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding textile factory database...");

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // ── Users ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@textilefactory.com" },
    update: {},
    create: {
      name: "Imran Sheikh",
      email: "admin@textilefactory.com",
      password: passwordHash,
      role: "ADMIN",
      department: "Management",
      phone: "+92-300-1234567",
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: "technician@textilefactory.com" },
    update: {},
    create: {
      name: "Bilal Ahmed",
      email: "technician@textilefactory.com",
      password: passwordHash,
      role: "TECHNICIAN",
      department: "Maintenance",
      phone: "+92-301-2345678",
    },
  });

  const workerNames = [
    ["Hassan Raza", "Weaving"],
    ["Ayesha Malik", "Spinning"],
    ["Usman Tariq", "Dyeing"],
    ["Sana Yousaf", "Stitching"],
    ["Fahad Iqbal", "Weaving"],
    ["Maria Khalid", "Spinning"],
  ];

  const workers = [];
  for (let i = 0; i < workerNames.length; i++) {
    const [name, department] = workerNames[i];
    const email = `${name.split(" ")[0].toLowerCase()}@textilefactory.com`;
    const worker = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        password: passwordHash,
        role: "WORKER",
        department,
        phone: `+92-30${i}-${1000000 + i * 11111}`,
        shiftStart: "08:00",
        shiftEnd: "17:00",
      },
    });
    workers.push(worker);
  }

  // ── Machines ───────────────────────────────────────────
  const machineDefs = [
    { code: "WV-101", name: "Sulzer Weaving Loom A1", type: "Loom", line: "L1", dept: "Weaving", status: "RUNNING" },
    { code: "WV-102", name: "Sulzer Weaving Loom A2", type: "Loom", line: "L1", dept: "Weaving", status: "RUNNING" },
    { code: "SP-201", name: "Rieter Ring Spinning Frame", type: "Spinning Frame", line: "L2", dept: "Spinning", status: "RUNNING" },
    { code: "SP-202", name: "Rieter Ring Spinning Frame B", type: "Spinning Frame", line: "L2", dept: "Spinning", status: "IDLE" },
    { code: "DY-301", name: "Jet Dyeing Machine", type: "Dyeing Unit", line: "L3", dept: "Dyeing", status: "FAULTY" },
    { code: "DY-302", name: "Continuous Dyeing Range", type: "Dyeing Unit", line: "L3", dept: "Dyeing", status: "MAINTENANCE" },
    { code: "ST-401", name: "Juki Industrial Stitching Unit", type: "Stitching Machine", line: "L4", dept: "Stitching", status: "RUNNING" },
    { code: "ST-402", name: "Brother Overlock Machine", type: "Stitching Machine", line: "L4", dept: "Stitching", status: "OFFLINE" },
  ];

  const machines = [];
  for (let i = 0; i < machineDefs.length; i++) {
    const m = machineDefs[i];
    const machine = await prisma.machine.upsert({
      where: { machineCode: m.code },
      update: {},
      create: {
        machineCode: m.code,
        machineName: m.name,
        machineType: m.type,
        lineNumber: m.line,
        department: m.dept,
        status: m.status,
        temperature: 60 + Math.random() * 30,
        rpm: 800 + Math.floor(Math.random() * 1200),
        efficiency: 70 + Math.random() * 25,
        operatorId: workers[i % workers.length].id,
        lastMaintenance: new Date(Date.now() - (10 + i) * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + (20 - i) * 24 * 60 * 60 * 1000),
        installedAt: new Date(2022, i % 12, 1),
      },
    });
    machines.push(machine);
  }

  // ── Production records (last 7 days) ──────────────────
  for (let day = 6; day >= 0; day--) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    for (const machine of machines) {
      await prisma.production.create({
        data: {
          lineNumber: machine.lineNumber,
          machineId: machine.id,
          dailyOutput: 500 + Math.random() * 300,
          targetOutput: 700,
          efficiency: 70 + Math.random() * 25,
          defectCount: Math.floor(Math.random() * 15),
          productionDate: date,
        },
      });
    }
  }

  // ── Maintenance tickets ────────────────────────────────
  await prisma.maintenance.createMany({
    data: [
      {
        machineId: machines[4].id, // DY-301 faulty
        technicianId: technician.id,
        reportedById: admin.id,
        issue: "Temperature sensor malfunction causing inconsistent dye batches",
        description: "Sensor readings fluctuate by ±15°C during cycle, suspect wiring fault.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        downtimeMins: 180,
      },
      {
        machineId: machines[5].id, // DY-302 in maintenance
        technicianId: technician.id,
        reportedById: admin.id,
        issue: "Scheduled preventive maintenance — belt replacement",
        description: "Routine quarterly belt and roller inspection.",
        priority: "MEDIUM",
        status: "ASSIGNED",
        repairDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        machineId: machines[7].id, // ST-402 offline
        reportedById: admin.id,
        issue: "Motor not powering on",
        description: "No response from main drive motor, possible electrical fault.",
        priority: "CRITICAL",
        status: "OPEN",
        downtimeMins: 600,
      },
    ],
    skipDuplicates: true,
  });

  // ── Inventory ───────────────────────────────────────────
  await prisma.inventory.createMany({
    data: [
      { itemName: "Spindle Motor 2HP", itemCode: "MTR-001", category: "MOTOR", quantity: 4, minimumStock: 5, unit: "pcs", supplier: "PakMotors Ltd", unitPrice: 18500 },
      { itemName: "Sewing Needles (Size 14)", itemCode: "NDL-014", category: "NEEDLE", quantity: 250, minimumStock: 100, unit: "pcs", supplier: "Schmetz Pakistan", unitPrice: 12 },
      { itemName: "Lubricating Oil (Industrial)", itemCode: "OIL-101", category: "OIL", quantity: 18, minimumStock: 20, unit: "l", supplier: "ShellTex Supplies", unitPrice: 850 },
      { itemName: "Reactive Dye Black", itemCode: "CHM-220", category: "CHEMICAL", quantity: 60, minimumStock: 25, unit: "kg", supplier: "ColorChem Industries", unitPrice: 1200 },
      { itemName: "Drive Belt V-Type", itemCode: "SPR-330", category: "SPARE_PART", quantity: 8, minimumStock: 10, unit: "pcs", supplier: "Gates Pakistan", unitPrice: 2400 },
      { itemName: "Cotton Yarn 30s", itemCode: "YRN-030", category: "YARN", quantity: 1200, minimumStock: 500, unit: "kg", supplier: "Lucky Textile Mills", unitPrice: 480 },
    ],
    skipDuplicates: true,
  });

  // ── Notifications ───────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { title: "Machine Fault Detected", message: "DY-301 reported a temperature sensor fault. Technician assigned.", type: "ALERT", userId: null },
      { title: "Low Stock Alert", message: "Lubricating Oil (Industrial) is below minimum stock threshold.", type: "WARNING", userId: null },
      { title: "Maintenance Scheduled", message: "DY-302 is scheduled for preventive maintenance in 2 days.", type: "INFO", userId: admin.id },
      { title: "Welcome to Textile Monitor", message: "Your account has been set up. Please check in for your shift.", type: "SUCCESS", userId: workers[0].id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding complete!");
  console.log("─────────────────────────────────────");
  console.log("Login credentials (password for all: Password@123)");
  console.log(`  Admin:      ${admin.email}`);
  console.log(`  Technician: ${technician.email}`);
  console.log(`  Worker:     ${workers[0].email}`);
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
