import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { LoginSchema } from "./schemas";
import { getUserByEmail } from "@/data/user";

export default { 
  providers: [
    // Google ile kimlik doğrulama sağlayıcısı
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Github ile kimlik doğrulama sağlayıcısı
    Github({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    // Kimlik bilgileriyle kimlik doğrulama sağlayıcısı
    Credentials({
      async authorize(credentials) {
        // Gelen kimlik bilgilerini doğrula
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          // Veritabanından kullanıcıyı e-posta ile bul
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          // Parola eşleşmesini kontrol et
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user; // Eşleşirse kullanıcıyı döndür
        }

        // Kimlik doğrulama başarısız ise null döndür
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

