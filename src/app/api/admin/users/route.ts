import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllUsers } from "@/lib/data/users";
import { getContent } from "@/lib/data/store";
import { withNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Admin-only account directory. Authentication secrets are deliberately never serialized. */
export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, withNoStore({ status: 401 }));
  }

  try {
    const [users, content] = await Promise.all([
      getAllUsers({ strict: true }),
      getContent(),
    ]);
    const directory = users.map((user) => {
      const artist = content.artists.find((entry) =>
        entry.userId === user.id || (Boolean(user.artistId) && entry.id === user.artistId),
      );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        ...(artist ? {
          signupDetails: {
            phone: artist.signupPhone,
            city: artist.signupCity,
            specialty: artist.signupSpecialty,
            instagram: artist.social?.instagram,
            portfolioUrl: artist.signupPortfolioUrl,
            studio: artist.signupStudio,
            experience: artist.signupExperience,
            bio: artist.bio?.fa,
            formats: artist.signupFormats,
            families: artist.signupFamilies,
            termsAcceptedAt: artist.signupTermsAt,
            artistStatus: artist.status,
          },
        } : {}),
      };
    }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return NextResponse.json({ ok: true, users: directory }, withNoStore());
  } catch (error) {
    console.error("[admin/users] failed to load directory:", error);
    return NextResponse.json({ ok: false, error: "users_unavailable" }, withNoStore({ status: 503 }));
  }
}
