import { NextResponse } from "next/server";

/**
 * Mock API route for KYC document uploads
 * This just returns a success response without actually storing any files
 */
export async function POST() {
  console.log("Mock KYC upload endpoint called");
  
  // Simulate a short delay like a real upload would have
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a success response with a mock document ID
  return NextResponse.json({
    success: true,
    documentId: `mock-doc-${Date.now()}`,
    message: "Mock document upload successful"
  });
}

// Also handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
} 