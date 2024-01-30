import prisma from '../db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    //check if exist
    const userGet = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!userGet) {
      return NextResponse.json(
        { user: null, message: 'Email Tidak ditemukan' },
        { status: 404 }
      );
    }

    const match = await bcrypt.compare(password, userGet.password);

    if (!match) {
      return NextResponse.json(
        { user: null, message: 'Password Salah' },
        { status: 401 }
      );
    }

    const { password: newUserPassword, ...res } = userGet;

    return NextResponse.json(
      { user: res, message: 'Login Berhasil' },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
