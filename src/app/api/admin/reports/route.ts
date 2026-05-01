import { NextResponse } from "next/server";
import db from "@/lib/db/init";

export async function GET() {
  try {
    const reports = db.prepare(`
      SELECT 
        r.id,
        r.bathroom_id,
        r.reason,
        r.notes,
        r.created_at,
        b.name as bathroom_name,
        b.status as bathroom_status,
        b.report_count
      FROM reports r
      JOIN bathrooms b ON r.bathroom_id = b.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `).all();

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}