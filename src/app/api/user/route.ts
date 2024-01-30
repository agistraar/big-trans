import prisma from '../db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password, role } = body;

    //check if exist
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    const { password: newUserPassword, ...res } = newUser;

    return NextResponse.json(
      { user: res, message: 'berhasil menambahkan user' },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
