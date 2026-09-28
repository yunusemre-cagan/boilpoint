import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest, { params }: { params: any }) => {
    const resolvedParams = await params;
    return NextAuth(req, { params: resolvedParams }, authOptions);
};

export { handler as GET, handler as POST };
