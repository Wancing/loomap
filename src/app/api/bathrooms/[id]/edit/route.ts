import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/init";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bathroomId = params.id;
    const body = await request.json();

    // Check if bathroom exists
    const existing = db.prepare("SELECT * FROM bathrooms WHERE id = ?").get(bathroomId);

    if (!existing) {
      return NextResponse.json(
        { error: "Bathroom not found" },
        { status: 404 }
      );
    }

    // Update the bathroom
    const updateStmt = db.prepare(`
      UPDATE bathrooms 
      SET 
        name = ?,
        address = ?,
        place_description = ?,
        free_or_paid = ?,
        price_if_known = ?,
        opening_hours = ?,
        wheelchair_accessible = ?,
        step_free_access = ?,
        baby_changing = ?,
        gender_neutral = ?,
        family_friendly = ?,
        requires_code = ?,
        code_hint = ?
      WHERE id = ?
    `);

    updateStmt.run(
      body.name,
      body.address || null,
      body.place_description || null,
      body.free_or_paid,
      body.price_if_known || null,
      body.opening_hours || null,
      body.wheelchair_accessible ? 1 : 0,
      body.step_free_access ? 1 : 0,
      body.baby_changing ? 1 : 0,
      body.gender_neutral ? 1 : 0,
      body.family_friendly ? 1 : 0,
      body.requires_code ? 1 : 0,
      body.code_hint || null,
      bathroomId
    );

    return NextResponse.json({
      success: true,
      message: "Bathroom updated successfully"
    });
  } catch (error) {
    console.error("Error updating bathroom:", error);
    return NextResponse.json(
      { error: "Failed to update bathroom" },
      { status: 500 }
    );
  }
}