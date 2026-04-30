import { NextRequest, NextResponse } from "next/server";
import { getAllBathrooms, saveBathroom } from "@/lib/db/bathrooms";

export async function GET() {
  try {
    const bathrooms = getAllBathrooms();
    return NextResponse.json({ bathrooms });
  } catch (error) {
    console.error("Error fetching bathrooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch bathrooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: "name, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const id = saveBathroom({
      name: body.name,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      address: body.address || "",
      place_description: body.place_description || "",
      free_or_paid: body.free_or_paid || "unknown",
      price_if_known: body.price_if_known || "",
      opening_hours: body.opening_hours || "",
      wheelchair_accessible: Boolean(body.wheelchair_accessible),
      step_free_access: Boolean(body.step_free_access),
      baby_changing: Boolean(body.baby_changing),
      gender_neutral: Boolean(body.gender_neutral),
      family_friendly: Boolean(body.family_friendly),
      requires_code: Boolean(body.requires_code),
      code_hint: body.code_hint || "",
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating bathroom:", error);
    return NextResponse.json(
      { error: "Failed to create bathroom" },
      { status: 500 }
    );
  }
}