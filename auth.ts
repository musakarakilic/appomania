import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, UserRole } from "@prisma/client";
import authConfig from "./auth.config";

import { db } from "./lib/db";
import { getUserById } from "./data/user";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";

// `PrismaClient` sınıfından yeni bir Prisma istemcisi oluşturmak yerine, mevcut `db` nesnesini kullanıyoruz.
// Eğer bu dosyada bağımsız bir Prisma istemcisi oluşturulmuş olsaydı, o zaman `const prisma = new PrismaClient()` kullanabilirdik.
// Ancak burada, zaten tanımlı olan `db` nesnesi üzerinden işlemleri gerçekleştiriyoruz.

export const { auth, handlers, signIn, signOut } = NextAuth({
  // Kullanıcıların oturum açma ve hata sayfaları için özel sayfalar tanımlanıyor.
  pages: {
    signIn: "/auth/login",  // Oturum açma sayfası
    error: "/auth/error",   // Hata sayfası
  },
  
  // NextAuth olaylarına (events) tepki veren işlevler tanımlanıyor.
  events: {
    async linkAccount({ user }) {
      // Yeni bir hesap bağlandığında, kullanıcının e-posta doğrulama tarihini günceller.
      await db.user.update({
        where: { id: user.id },  // Kullanıcıyı ID'sine göre bulur
        data: { emailVerified: new Date() },  // E-posta doğrulama tarihini günceller
      });
    },
  },

  // Giriş işlemi sırasında belirli kontrolleri gerçekleştiren işlevler tanımlanıyor.
  callbacks: {
    async signIn({ user, account }) {
      // OAuth sağlayıcıları kullanılıyorsa, e-posta doğrulaması yapılmamış olsa bile girişe izin verilir.
      if (account?.provider !== "credentials") return true;

      // Kullanıcının mevcut olup olmadığını kontrol eder.
      const existingUser = await getUserById(user.id as string);

      // Eğer kullanıcı e-posta doğrulaması yapmamışsa, girişe izin verilmez.
      if (!existingUser?.emailVerified) return false;

      // Eğer kullanıcı iki faktörlü kimlik doğrulama (2FA) etkinleştirmişse, 2FA doğrulamasını kontrol eder.
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        // Eğer 2FA doğrulaması yapılmamışsa, girişe izin verilmez.
        if (!twoFactorConfirmation) return false;

        // 2FA doğrulaması tamamlandıktan sonra, bu doğrulama kaydını veritabanından siler.
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      // Yukarıdaki tüm kontroller geçilirse, kullanıcı girişine izin verilir.
      return true;
    },

    async session({ token, session }) {
      // Kullanıcının ID'si oturumda (session) mevcutsa, oturuma kullanıcı ID'si eklenir.
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // Kullanıcının rolü oturumda mevcutsa, oturuma kullanıcı rolü eklenir.
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }
      return session;  // Oturum bilgilerini döndürür.
    },

    async jwt({ token }) {
      // Eğer token'da kullanıcı ID'si yoksa, token olduğu gibi döndürülür.
      if (!token.sub) return token;

      // Token'daki kullanıcı ID'si ile veritabanında kullanıcıyı arar.
      const existingUser = await getUserById(token.sub);

      // Eğer kullanıcı bulunamazsa, token olduğu gibi döndürülür.
      if (!existingUser) return token;

      // Kullanıcının rolü token'a eklenir.
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

      return token;  // Güncellenmiş token'ı döndürür.
    },
  },

  // Veritabanı işlemleri için Prisma adapter'ını kullanır.
  adapter: PrismaAdapter(db),

  // JWT (JSON Web Token) tabanlı oturum stratejisini kullanır.
  session: { 
    strategy: "jwt",
    maxAge: 60 * 60, // 1 saat (saniye cinsinden)
  },

  // Ek yapılandırmalar authConfig içinde sağlanır.
  ...authConfig,
});
