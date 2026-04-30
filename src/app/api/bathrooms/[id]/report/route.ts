import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/init";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bathroomId = params.id;
    const body = await request.json();

    // Get current bathroom data
    const bathroom = db.prepare("SELECT * FROM bathrooms WHERE id = ?").get(bathroomId) as any;

    if (!bathroom) {
      return NextResponse.json(
        { error: "Bathroom not found" },
        { status: 404 }
      );
    }

    // Save the individual report
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const insertReport = db.prepare(`
      INSERT INTO reports (id, bathroom_id, reason, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    insertReport.run(reportId, bathroomId, body.reason, body.notes || null);

    // Increment report count
    const newReportCount = bathroom.report_count + 1;
    
    // Mark as uncertain after 2 reports, closed after 5 reports
    let newStatus = bathroom.status;
    if (newReportCount >= 5) {
      newStatus = "closed";
    } else if (newReportCount >= 2 && bathroom.status === "open") {
      newStatus = "uncertain";
    }

    // Update the bathroom
    const updateStmt = db.prepare(`
      UPDATE bathrooms 
      SET 
        report_count = ?,
        status = ?,
        trust_score = ?
      WHERE id = ?
    `);

    // Decrease trust score with each report
    const newTrustScore = Math.max(0, bathroom.trust_score - 15);

    updateStmt.run(newReportCount, newStatus, newTrustScore, bathroomId);

    return NextResponse.json({
      success: true,
      reportCount: newReportCount,
      status: newStatus,
      trustScore: newTrustScore,
      message: newStatus === "closed" 
        ? "This bathroom has been marked as closed due to multiple reports."
        : newStatus === "uncertain"
        ? "This bathroom has been flagged as uncertain. More reports may close it."
        : "Thank you for reporting. We'll review this location."
    });
  } catch (error) {
    console.error("Error reporting bathroom:", error);
    return NextResponse.json(
      { error: "Failed to report bathroom" },
      { status: 500 }
    );
  }
}