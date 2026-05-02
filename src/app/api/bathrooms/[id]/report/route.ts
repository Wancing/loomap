import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("data/loomap.db");

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const issueType = String(body.issueType || "").trim();
    const details = String(body.details || "").trim();

    if (!issueType) {
      return NextResponse.json(
        { error: "Issue type is required" },
        { status: 400 }
      );
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS bathroom_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bathroom_id TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.prepare(
      `
        INSERT INTO bathroom_reports (bathroom_id, issue_type, details)
        VALUES (?, ?, ?)
      `
    ).run(id, issueType, details);

    db.prepare(
      `
        UPDATE bathrooms
        SET report_count = COALESCE(report_count, 0) + 1
        WHERE id = ?
      `
    ).run(id);

    const updatedBathroom = db
      .prepare(
        `
          SELECT id, report_count
          FROM bathrooms
          WHERE id = ?
        `
      )
      .get(id);

    return NextResponse.json({
      success: true,
      report: {
        bathroom_id: id,
        issue_type: issueType,
        details,
      },
      bathroom: updatedBathroom ?? null,
    });
  } catch (error) {
    console.error("Error submitting bathroom report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}