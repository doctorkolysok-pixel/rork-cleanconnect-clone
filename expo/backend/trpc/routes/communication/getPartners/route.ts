import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { users, partnerProfiles } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const getPartnersProcedure = publicProcedure.query(async () => {
  console.log("[getPartners] Fetching all partners");

  const partners = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
      rating: users.rating,
      businessName: partnerProfiles.businessName,
      address: partnerProfiles.address,
      city: partnerProfiles.city,
      description: partnerProfiles.description,
      services: partnerProfiles.services,
      isVerified: partnerProfiles.isVerified,
      isActive: partnerProfiles.isActive,
    })
    .from(users)
    .innerJoin(partnerProfiles, eq(users.id, partnerProfiles.userId))
    .where(eq(users.role, "partner"));

  console.log("[getPartners] Found partners:", partners.length);

  return partners;
});
