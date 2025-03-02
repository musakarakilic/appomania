"use client" // Bu ifade, bileşenin sadece istemci tarafında çalışacağını belirtir. 
            // Next.js'te genellikle sunucu tarafı bileşenler de olur, bu ifade istemci tarafı kullanımı zorunlu kılar.

import { useRouter } from "next/navigation" // Next.js'in yönlendirme (navigasyon) için kullanılan hook'u olan useRouter'ı içeri aktarıyoruz.

interface LoginButtonProps {
    children: React.ReactNode, // Bileşenin içinde yer alacak alt bileşenler veya içerikler (React bileşenleri veya HTML öğeleri).
    mode?: "modal" | "redirect", // Kullanıcının tıklaması durumunda "modal" açılabilir veya "redirect" (yönlendirme) gerçekleşebilir. Varsayılan değer "redirect"tir.
    asChild?: boolean // Bu prop, bileşeni bir wrapper olarak kullanıp kullanmayacağımızı belirler. Opsiyonel olarak geçilebilir.
}

// LoginButton bileşeni tanımlanıyor
export const LoginButton = ({
    children,
    mode = "redirect", // mode prop'u belirtilmezse varsayılan olarak "redirect" kullanılır.
    asChild
}: LoginButtonProps) => {
    const router = useRouter() // useRouter hook'u ile yönlendirme işlevselliğine erişiyoruz.

    // onClick fonksiyonu, kullanıcı tıkladığında "/auth/login" sayfasına yönlendirme yapar.
    const onClick = () => {
        router.push("/auth/login")
    }

    // Eğer "mode" prop'u "modal" olarak ayarlanmışsa, henüz implemente edilmemiş bir modal döndürülür.
    if (mode === "modal") {
        return (
            <span>
                TODO: Implement Modal {/* Modal implementasyonu buraya eklenmeli */}
            </span>
        )
    }

    // "redirect" modu için, onClick olayını işleyen bir <span> döndürülür. 
    // Bu span, içindeki children'ı (genellikle düğme veya metin) tıklanabilir yapar.
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children} {/* İçerik (örneğin, bir düğme) buraya yerleştirilir */}
        </span>
    )
}
