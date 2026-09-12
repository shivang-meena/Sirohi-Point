SELECT u.name, u.email, u.role, u.active, cp."approvalStatus" FROM "ContractorProfile" cp JOIN "User" u ON u.id = cp."userId" ORDER BY cp."approvalStatus";
SELECT u.name, u.email, u.role, u.active, bp."approvalStatus" FROM "BusinessProfile" bp JOIN "User" u ON u.id = bp."userId" ORDER BY bp."approvalStatus";
