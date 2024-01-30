import { NextResponse } from 'next/server';
import prisma from '../db';

export async function GET() {
  try {
    const regions = await prisma.region.findMany();

    return NextResponse.json({ regions }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
