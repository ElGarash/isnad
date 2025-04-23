export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">لم يتم العثور علي الفصل</h2>
        <p className="text-gray-600">
          الفصلٍ الذي تبحث عنه غير موجود في قاعدة البيانات
        </p>
      </div>
    </div>
  );
}
