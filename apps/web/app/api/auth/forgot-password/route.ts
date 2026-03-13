import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // For security, return success even if user doesn't exist
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Generate reset token (in production, use crypto.randomBytes and store hashed token)
    const resetToken = Buffer.from(
      `${user.email}:${Date.now()}:${Math.random()}`
    ).toString("base64");

    // Store reset token in database (you'd typically create a separate PasswordReset model)
    // For simplicity, we'll simulate this by updating the user with a reset token
    // In production, create a separate table with expiration

    // TODO: In production implementation:
    // 1. Create password_resets table with fields: id, userId, token, expiresAt, createdAt
    // 2. Store hashed token
    // 3. Send email with reset link containing token

    // Simulate email sending
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    console.log(`Password reset URL for ${user.email}: ${resetUrl}`);

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
