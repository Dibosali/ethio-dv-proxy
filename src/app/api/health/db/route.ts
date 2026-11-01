import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startTime = Date.now();

    // Masked connection string check
    const rawUrl = process.env.DATABASE_URL || "";
    const maskedUrl = rawUrl.replace(/:[^:@]+@/, ":***@");

    // 1. Live raw query to remote Neon PostgreSQL
    const rawResult: any[] =
      await prisma.$queryRaw`SELECT version(), current_database(), current_user, now()`;

    // 2. Query model counts from Prisma
    const [userCount, applicationCount] = await Promise.all([
      prisma.user.count(),
      prisma.application.count(),
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "HEALTHY",
      service: "Neon Serverless PostgreSQL (Lakebase)",
      database: rawResult[0]?.current_database || "neondb",
      user: rawResult[0]?.current_user,
      serverVersion: rawResult[0]?.version?.split(" on ")?.[0] || "PostgreSQL",
      serverTimestamp: rawResult[0]?.now,
      latencyMs: `${latencyMs}ms`,
      connectedTo: maskedUrl,
      counts: {
        users: userCount,
        applications: applicationCount,
      },
    });
  } catch (error: any) {
    console.error("Neon DB health check error:", error);
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: error.message || "Database connection failed",
        connectedTo: (process.env.DATABASE_URL || "").replace(/:[^:@]+@/, ":***@"),
      },
      { status: 500 }
    );
  }
}
