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
    const fileContents = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContents);
    const bathrooms: Bathroom[] = data.bathrooms || [];

    // Generate activity feed from bathroom data
    const activities: ActivityItem[] = [];

    bathrooms.forEach((bathroom) => {
      // Add creation activity
      if (bathroom.created_at) {
        activities.push({
          id: `add-${bathroom.id}`,
          type: "addition",
          bathroomId: bathroom.id,
          bathroomName: bathroom.name,
          timestamp: bathroom.created_at,
          message: "New bathroom added to the map",
        });
      }

      // Add verification activity
      if (bathroom.last_verified_at && bathroom.number_of_confirmations > 0) {
        activities.push({
          id: `verify-${bathroom.id}`,
          type: "verification",
          bathroomId: bathroom.id,
          bathroomName: bathroom.name,
          timestamp: bathroom.last_verified_at,
          message: "Location verified by community member",
          confirmations: bathroom.number_of_confirmations,
        });
      }

      // Add status change activity
      if (bathroom.status === "pending_review" && bathroom.created_at) {
        activities.push({
          id: `pending-${bathroom.id}`,
          type: "addition",
          bathroomId: bathroom.id,
          bathroomName: bathroom.name,
          timestamp: bathroom.created_at,
          message: "New location pending community review",
        });
      }
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to 50 most recent activities
    const recentActivities = activities.slice(0, 50);

    return NextResponse.json({ activities: recentActivities });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}