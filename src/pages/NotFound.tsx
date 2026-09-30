import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🚦</div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Страница не найдена</h1>
      <p className="text-slate-600 text-sm mb-8">Возможно, адрес изменился или страница была удалена.</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
      >
        На главную →
      </Link>
    </main>
  );
}
