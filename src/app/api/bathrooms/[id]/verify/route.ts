import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/init";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bathroomId = params.id;

    // Get current bathroom data
    const bathroom = db.prepare("SELECT * FROM bathrooms WHERE id = ?").get(bathroomId) as any;

    if (!bathroom) {
      return NextResponse.json(
        { error: "Bathroom not found" },
        { status: 404 }
      );
    }

    // Increment confirmations
    const newConfirmations = bathroom.number_of_confirmations + 1;
    
    // Auto-approve after 3 confirmations
    const newStatus = newConfirmations >= 3 ? "open" : bathroom.status;

    // Update the bathroom
    const updateStmt = db.prepare(`
      UPDATE bathrooms 
      SET 
        number_of_confirmations = ?,
        status = ?,
        last_verified_at = CURRENT_TIMESTAMP,
        trust_score = ?
      WHERE id = ?
    `);

    // Increase trust score with each confirmation
    const newTrustScore = Math.min(100, bathroom.trust_score + 10);

    updateStmt.run(newConfirmations, newStatus, newTrustScore, bathroomId);

    return NextResponse.json({
      success: true,
      confirmations: newConfirmations,
      status: newStatus,
      trustScore: newTrustScore,
      message: newStatus === "open" 
        ? "Thank you! This bathroom is now verified by the community."
        : `Thank you for confirming! ${3 - newConfirmations} more confirmation${3 - newConfirmations === 1 ? '' : 's'} needed.`
    });
  } catch (error) {
    console.error("Error verifying bathroom:", error);
    return NextResponse.json(
      { error: "Failed to verify bathroom" },
      { status: 500 }
    );
  }
}