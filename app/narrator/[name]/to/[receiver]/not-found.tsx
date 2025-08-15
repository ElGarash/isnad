import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="mb-4 text-right text-3xl font-bold">
        لم يتم العثور على أحاديث
      </h2>
      <p className="mb-6 text-right text-gray-600">
        لا توجد أحاديث مروية بين هذين الراويين في قاعدة البيانات الحالية.
      </p>
      <div className="space-x-4 rtl:space-x-reverse">
        <Link
          href="/"
          className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          الصفحة الرئيسية
        </Link>
        <Link
          href="/narrator"
          className="inline-block rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          قائمة الرواة
        </Link>
      </div>
    </div>
  );
}
