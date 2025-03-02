"use client" // Bu ifade, bileşenin yalnızca istemci tarafında çalışacağını belirtir.

import * as z from "zod" // zod kütüphanesini z olarak içe aktarıyoruz. Bu kütüphane, veri doğrulama ve şema tanımlama için kullanılır.

import { useState, useTransition } from "react" // React'ten useState ve useTransition hook'larını içe aktarıyoruz.
import { useForm } from "react-hook-form" // Form yönetimi için react-hook-form kütüphanesinden useForm hook'unu içe aktarıyoruz.
import { useSearchParams } from "next/navigation" // URL'deki query parametrelerini almak için useSearchParams hook'unu içe aktarıyoruz.
import { zodResolver } from "@hookform/resolvers/zod" // zod kütüphanesini react-hook-form ile entegre eden resolver'ı içe aktarıyoruz.
import Link from "next/link" // Link oluşturmak için Next.js'ten Link bileşenini içe aktarıyoruz.

import { LoginSchema } from "@/schemas" // Giriş formu için kullanılan zod şemasını içe aktarıyoruz.
import { Input } from "../ui/input" // Input bileşenini içe aktarıyoruz.

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form" // Form yapısını oluşturan bileşenleri içe aktarıyoruz.

import { CardWrapper } from "@/components/auth/card-wrapper" // Formu saran kart bileşenini içe aktarıyoruz.
import { Button } from "../ui/button" // Button bileşenini içe aktarıyoruz.

import { FormError } from "@/components/form-error" // Form hatalarını göstermek için kullanılan bileşeni içe aktarıyoruz.
import { FormSuccess } from "@/components/form-success" // Başarı mesajlarını göstermek için kullanılan bileşeni içe aktarıyoruz.
import { login } from "@/actions/login" // Giriş işlemini gerçekleştiren login fonksiyonunu içe aktarıyoruz.
import { Social } from "./social"

const LoginForm = () => {
  // URL'den query parametrelerini almak için useSearchParams hook'unu kullanıyoruz.
  const searchParams = useSearchParams();
  // Eğer URL'deki "error" parametresi "OAuthAccountNotLinked" ise bir hata mesajı ayarlıyoruz.
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked" 
  ? "Email already in use with different provider!" // Eğer email başka bir sağlayıcı ile ilişkilendirilmişse, bu hata mesajını gösteriyoruz.
  : "";

  // Durum (state) yönetimi için useState hook'unu kullanıyoruz.
  const [showTwoFactor, setShowTwoFactor] = useState(false); // İki faktörlü doğrulama kodunun gösterilip gösterilmeyeceğini kontrol eden durum.
  const [error, setError] = useState<string | undefined>(""); // Hata mesajlarını tutan durum.
  const [success, setSuccess] = useState<string | undefined>(""); // Başarı mesajlarını tutan durum.
  const [isPending, startTransition] = useTransition(); // Geçiş sırasında yüklenme durumunu yönetmek için useTransition hook'unu kullanıyoruz.

  // Form yönetimi için useForm hook'unu kullanıyoruz. Zod şemasını kullanarak form doğrulamasını ayarlıyoruz.
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema), // Zod şemasını react-hook-form ile entegre ediyoruz.
    defaultValues: {
      email: "", // Varsayılan email değeri boş.
      password: "", // Varsayılan parola değeri boş.
    }
  });

  // Form gönderildiğinde çalışacak olan fonksiyon.
  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError(""); // Hata durumunu sıfırlıyoruz.
    setSuccess(""); // Başarı durumunu sıfırlıyoruz.

    // Yüklenme durumunu yönetmek için startTransition kullanıyoruz.
    startTransition(() => {
      // Login işlemi yapılıyor.
      login(values)
        .then((data) => {
          if (data?.error) { // Eğer bir hata oluşmuşsa,
            form.reset(); // Formu sıfırlıyoruz.
            setError(data.error); // Hata mesajını ayarlıyoruz.
          }

          if (data?.success) { // Eğer giriş başarılı olmuşsa,
            form.reset(); // Formu sıfırlıyoruz.
            setSuccess(data.success); // Başarı mesajını ayarlıyoruz.
          }

          if (data?.twoFactor) { // Eğer iki faktörlü doğrulama gerekiyorsa,
            setShowTwoFactor(true); // İki faktörlü doğrulama kodunu gösteriyoruz.
          }
        })
        .catch(() => setError("Something went wrong!")); // Bir hata olursa genel bir hata mesajı gösteriyoruz.
    });
  };

  // Formun JSX yapısı.
  return (
    <div className="w-full space-y-6 sm:max-w-[400px] p-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <Social />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            OR
          </span>
        </div>
      </div>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} // Form gönderildiğinde onSubmit fonksiyonunu çalıştırır.
          className="space-y-4"
        >
          {showTwoFactor ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Two Factor Code*
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="123456"
                      className="rounded-full h-11 px-4 border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField 
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Email*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        disabled={isPending}
                        placeholder="Enter your email"
                        type="email"
                        className="rounded-full h-11 px-4 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Password*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        disabled={isPending}
                        placeholder="Enter your password"
                        type="password"
                        className="rounded-full h-11 px-4 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Button
            size="sm"
            variant="link"
            asChild
            className="px-0 font-normal"
          >
            <a href="/auth/reset" className="text-xs text-muted-foreground hover:text-primary">
              Forgot password?
            </a>
          </Button>
          <FormError message={error || urlError} /> 
          <FormSuccess message={success} /> 
          <Button
            disabled={isPending}
            type="submit"
            className="w-full rounded-full bg-black hover:bg-gray-900 text-white h-11"
          >
            {showTwoFactor ? "Confirm" : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-2 text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/register" className="underline hover:text-primary">
            Sign up
          </a>
        </p>
        <a href="/" className="text-sm text-muted-foreground hover:text-primary underline">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default LoginForm; // LoginForm bileşenini dışa aktarıyoruz.
