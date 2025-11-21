import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, WikiArticle } from '../lib/supabase';

type WikiPageProps = {
  articleId?: string;
};

export const WikiPage = ({ articleId }: WikiPageProps) => {
  const { language } = useAuth();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [tableOfContents, setTableOfContents] = useState<string[]>([]);

  const t = {
    ar: {
      title: 'موسوعة الألعاب',
      contents: 'المحتويات',
      relatedPages: 'صفحات ذات صلة',
      noData: 'لا توجد مقالات',
    },
    en: {
      title: 'Game Encyclopedia',
      contents: 'Table of Contents',
      relatedPages: 'Related Pages',
      noData: 'No articles available',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadArticles();
    if (articleId) {
      loadArticle(articleId);
    }
  }, [articleId]);

  const loadArticles = async () => {
    const { data } = await supabase
      .from('wiki_articles')
      .select('*, author:profiles(*), game:games(*)')
      .order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const loadArticle = async (id: string) => {
    const { data } = await supabase
      .from('wiki_articles')
      .select('*, author:profiles(*), game:games(*)')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setArticle(data);
      const content = language === 'ar' ? data.content_ar : data.content_en;
      const headings = content.split('\n').filter((line: string) => line.startsWith('#'));
      setTableOfContents(headings);
    }
  };

  if (articleId && article) {
    return (
      <div className={`max-w-7xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <h1 className="text-4xl font-bold text-white mb-6">
                {language === 'ar' ? article.title_ar : article.title_en}
              </h1>

              {article.game && (
                <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <span className="text-cyan-400">
                    {language === 'ar' ? article.game.title_ar : article.game.title_en}
                  </span>
                </div>
              )}

              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                {(language === 'ar' ? article.content_ar : article.content_en)
                  .split('\n')
                  .map((para, i) => (
                    <p key={i} className="mb-4">
                      {para}
                    </p>
                  ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
                <div>
                  {language === 'ar' ? 'كاتب المقال' : 'Author'}: {article.author?.username || 'Unknown'}
                </div>
                <div>
                  {language === 'ar' ? 'آخر تحديث' : 'Last updated'}:{' '}
                  {new Date(article.updated_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {tableOfContents.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">{text.contents}</h3>
                <div className="space-y-2">
                  {tableOfContents.map((heading, i) => (
                    <div key={i} className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-sm">
                      {heading.replace(/^#+\s*/, '')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">{text.relatedPages}</h3>
              <div className="space-y-2">
                {articles.slice(0, 5).map((relatedArticle) => (
                  <div
                    key={relatedArticle.id}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-sm flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {language === 'ar' ? relatedArticle.title_ar : relatedArticle.title_en}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-cyan-400" />
        <h1 className="text-4xl font-bold text-white">{text.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((wikiArticle) => (
            <div
              key={wikiArticle.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              {wikiArticle.game && (
                <div className="text-xs text-cyan-400 mb-3">
                  {language === 'ar' ? wikiArticle.game.title_ar : wikiArticle.game.title_en}
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                {language === 'ar' ? wikiArticle.title_ar : wikiArticle.title_en}
              </h3>

              <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                {(language === 'ar' ? wikiArticle.content_ar : wikiArticle.content_en).substring(0, 150)}...
              </p>

              <div className="text-xs text-gray-500">
                {language === 'ar' ? 'بواسطة' : 'By'} {wikiArticle.author?.username || 'Unknown'}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-400">{text.noData}</div>
        )}
      </div>
    </div>
  );
};