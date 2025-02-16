export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على الراوي</h2>
        <p className="text-gray-600">
          الراوي الذي تبحث عنه غير موجود في قاعدة البيانات
        </p>
      </div>
    </div>
  );
}
