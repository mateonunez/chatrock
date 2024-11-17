'use server';

import { createUser, getUser } from '@/lib/db/queries';
import { z } from 'zod';
import { signIn } from './auth.handler';
import type { LoginActionState, RegisterActionState } from '@/types/auth.types';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const DEFAULT_AUTH_ACTIONS_PROVIDER = 'credentials';

function validateData(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  return authFormSchema.parse({ email, password });
}

export async function login(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  try {
    const validatedData = validateData(formData);

    await Promise.resolve(validatedData);

    await signIn(DEFAULT_AUTH_ACTIONS_PROVIDER, {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}

export async function register(_: RegisterActionState, formData: FormData): Promise<RegisterActionState> {
  try {
    const validatedData = validateData(formData);

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' };
    }

    await createUser(validatedData.email, validatedData.password);

    await signIn(DEFAULT_AUTH_ACTIONS_PROVIDER, {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}
