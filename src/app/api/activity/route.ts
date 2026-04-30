import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Bathroom {
  id: string;
  name: string;
  status: string;
  number_of_confirmations: number;
  created_at?: string;
  last_verified_at?: string;
}

interface ActivityItem {
  id: string;
  type: "verification" | "addition" | "edit" | "report";
  bathroomId: string;
  bathroomName: string;
  userName?: string;
  timestamp: string;
  message: string;
  confirmations?: number;
}

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "bathrooms.json");
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ activities: [] });
    }

    const fileContents = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContents);
    const bathrooms: Bathroom[] = data.bathrooms || [];

    // Generate activity feed from bathroom data
    const activities: ActivityItem[] = [];
    const now = new Date().toISOString();

    bathrooms.forEach((bathroom) => {
      const createdAt = bathroom.created_at || now;
      const verifiedAt = bathroom.last_verified_at || createdAt;

      // Add creation activity
      activities.push({
        id: `add-${bathroom.id}`,
        type: "addition",
        bathroomId: bathroom.id,
        bathroomName: bathroom.name,
        timestamp: createdAt,
        message: "New bathroom added to the map",
      });

      // Add verification activity if confirmed
      if (bathroom.number_of_confirmations > 0) {
        activities.push({
          id: `verify-${bathroom.id}`,
          type: "verification",
          bathroomId: bathroom.id,
          bathroomName: bathroom.name,
          timestamp: verifiedAt,
          message: "Location verified by community member",
          confirmations: bathroom.number_of_confirmations,
        });
      }

      // Add pending review activity
      if (bathroom.status === "pending_review") {
        activities.push({
          id: `pending-${bathroom.id}`,
          type: "addition",
          bathroomId: bathroom.id,
          bathroomName: bathroom.name,
          timestamp: createdAt,
          message: "New location pending community review",
        });
      }
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Remove duplicates and limit to 50 most recent
    const uniqueActivities = Array.from(
      new Map(activities.map(item => [item.id, item])).values()
    ).slice(0, 50);

    return NextResponse.json({ activities: uniqueActivities });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}