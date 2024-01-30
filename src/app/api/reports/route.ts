import { NextRequest } from "next/server";
import prisma from "../db";

export async function GET(req: NextRequest){
    const month = Number(req.nextUrl.searchParams.get('month') as string);
    const year = Number(req.nextUrl.searchParams.get('year') as string);

    const monthData = await prisma.invoice
}