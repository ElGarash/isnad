export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">لم يتم العثور على الراوي</h2>
        <p className="text-gray-600">
          الراوي الذي تبحث عنه غير موجود في قاعدة البيانات
        </p>
      </div>
    </div>
  );
}
