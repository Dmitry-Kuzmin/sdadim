import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Home = lazy(() => import("@/pages/Home"));
const Blog = lazy(() => import("@/pages/Blog"));
const Article = lazy(() => import("@/pages/Article"));
const Legal = lazy(() => import("@/pages/Legal"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ArticleKitDemo = lazy(() => import("@/pages/ArticleKitDemo"));
const ArticleEkoDrive = lazy(() => import("@/pages/ArticleEkoDrive"));
const ArticleFakeLicense = lazy(() => import("@/pages/ArticleFakeLicense"));
const ArticlePractical = lazy(() => import("@/pages/ArticlePractical"));
const ArticleDictionary = lazy(() => import("@/pages/ArticleDictionary"));
const ArticleCosts = lazy(() => import("@/pages/ArticleCosts"));
const ArticleExamErrors = lazy(() => import("@/pages/ArticleExamErrors"));
const ArticleStoryMalaga = lazy(() => import("@/pages/ArticleStoryMalaga"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Якорь (/#pricing): ждём, пока lazy-страница отрисуется
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el || ++tries > 20) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash]);

  return null;
}

// Yandex Metrika SPA: fire a hit on every route change
function YandexMetrikaTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const url = pathname + search;
    try {
      if (typeof window !== "undefined" && typeof (window as any).ym === "function") {
        (window as any).ym(108379913, "hit", window.location.href, {
          title: document.title,
          referer: document.referrer,
        });
      }
    } catch {
      // Metrika not loaded yet — ignore silently
    }
  }, [pathname, search]);

  return null;
}

function LayoutContent() {
  return (
    <>
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/legal" element={<Navigate to="/legal/terms" replace />} />
          <Route path="/legal/:tab" element={<Legal />} />
          <Route path="/blog/kit" element={<ArticleKitDemo />} />
          <Route path="/blog/ekonomichnoe-vozhdenie" element={<ArticleEkoDrive />} />
          <Route path="/blog/poddelnyye-prava-ispaniya" element={<ArticleFakeLicense />} />
          <Route path="/blog/prakticheskiy-ekzamen" element={<ArticlePractical />} />
          <Route path="/blog/slovar-dgt" element={<ArticleDictionary />} />
          <Route path="/blog/tseny-na-prava" element={<ArticleCosts />} />
          <Route path="/blog/oshibki-ekzamen-vozhdeniya" element={<ArticleExamErrors />} />
          <Route path="/blog/istoriya-sdachi-prav-malaga" element={<ArticleStoryMalaga />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <YandexMetrikaTracker />
      <LayoutContent />
    </BrowserRouter>
  );
}
