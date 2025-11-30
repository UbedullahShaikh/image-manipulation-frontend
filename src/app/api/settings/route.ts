import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "src/config/settings.json");

// Helper to read config
function readConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            return { apiUrl: "" };
        }
        const fileContents = fs.readFileSync(configPath, "utf8");
        return JSON.parse(fileContents);
    } catch (error) {
        return { apiUrl: "" };
    }
}

// GET: Retrieve the saved API URL
export async function GET() {
    const config = readConfig();
    return NextResponse.json(config);
}

// POST: Save the API URL
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { apiUrl } = body;

        // Ensure directory exists
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write to file
        fs.writeFileSync(configPath, JSON.stringify({ apiUrl }, null, 2));

        return NextResponse.json({ success: true, apiUrl });
    } catch (error) {
        console.error("Failed to save settings:", error);
        return NextResponse.json(
            { error: "Failed to save settings to file system" },
            { status: 500 }
        );
    }
}
