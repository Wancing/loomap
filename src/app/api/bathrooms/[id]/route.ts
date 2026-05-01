import { NextRequest, NextResponse } from "next/server";
import { getBathroomById } from "@/lib/db/bathrooms";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bathroom = getBathroomById(id);

    if (!bathroom) {
      return NextResponse.json(
        { error: "Bathroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bathroom);
  } catch (error) {
    console.error("Error fetching bathroom:", error);
    return NextResponse.json(
      { error: "Failed to fetch bathroom" },
      { status: 500 }
    );
  }
}