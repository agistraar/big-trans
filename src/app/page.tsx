import { getServerSession } from 'next-auth';
import Login from './Login/page';
import { options } from './api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';

const page = async () => {
  const session = await getServerSession(options);

  if (session) {
    redirect('Home');
  }

  return <Login />;
};

export default page;
