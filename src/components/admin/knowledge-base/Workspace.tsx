'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import Modal, { ModalCancelButton } from '@/components/ui/Modal';
import Toast, { useToast } from '@/components/ui/Toast';

/** Satu baris artikel (dipakai di dalam kategori maupun daftar tanpa kategori). */
interface KbArticle {
  id: string;
  title: string;
  slug: string;
}

function ArticleRow({
  article,
  level,
  onEdit,
  onDelete,
}: {
  article: KbArticle;
  level: number;
  onEdit: (article: KbArticle) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-50 hover:bg-gray-50/50 group" style={{ paddingLeft: `${((level + 1) * 32) + 16}px` }}>
      <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span className="font-medium text-gray-800">{article.title}</span>
        <span className="font-mono text-xs text-gray-400 hidden md:inline-block ml-2">{article.slug}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
        <a href={`/knowledgebase/article/${article.slug}`} target="_blank" rel="noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title={t('kb.view_article')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </a>
        <button onClick={(e) => { e.stopPropagation(); onEdit(article); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title={t('kb.edit_article')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(article.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t('kb.delete_article')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function KnowledgeBaseWorkspace() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [flattenedCategories, setFlattenedCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // State for expanded tree nodes
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    content: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch articles
    const { data: kbData } = await supabase
      .from('knowledge_base')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    
    if (kbData) setArticles(kbData);

    // Fetch categories
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .eq('is_active', true)
      .order('name');
      
    if (catData) {
      // Build tree
      const map = new Map();
      const tree: any[] = [];
      
      // First pass: map nodes
      catData.forEach(cat => {
        map.set(cat.id, { ...cat, children: [] });
      });
      
      // Second pass: link parent to children
      catData.forEach(cat => {
        if (cat.parent_id && map.has(cat.parent_id)) {
          map.get(cat.parent_id).children.push(map.get(cat.id));
        } else {
          tree.push(map.get(cat.id));
        }
      });
      setCategoryTree(tree);

      // Flatten for dropdown
      const flatten = (nodes: any[], parentName = '') => {
        let res: any[] = [];
        nodes.forEach(node => {
          const name = parentName ? `${parentName} > ${node.name}` : node.name;
          res.push({ id: node.id, name });
          if (node.children && node.children.length > 0) {
            res = res.concat(flatten(node.children, name));
          }
        });
        return res;
      };
      setFlattenedCategories(flatten(tree));
    }
    setLoading(false);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenModal = (article: any = null) => {
    if (article) {
      setEditingId(article.id);
      setFormData({
        title: article.title,
        slug: article.slug,
        category_id: article.category_id?.toString() || '',
        content: article.content || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        slug: '',
        category_id: '',
        content: ''
      });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title) // Auto generate slug if empty
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        content: formData.content
      };

      if (editingId) {
        await supabase.from('knowledge_base').update(payload).eq('id', editingId);
      } else {
        await supabase.from('knowledge_base').insert([payload]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(t('kb.save_failed'), 'error');
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await supabase.from('knowledge_base').delete().eq('id', deleteId);
      showToast(t('kb.delete_success'), 'success');
      setDeleteId(null);
      fetchData();
    }
  };

  // Komponen Node Pohon Kategori
  const CategoryNode = ({ category, level = 0 }: { category: any, level?: number }) => {
    const isExpanded = expandedCategories[category.id];
    const categoryArticles = articles.filter(a => a.category_id === category.id);
    const totalItems = categoryArticles.length + (category.children?.length || 0);
    
    return (
      <div className="w-full border-b border-gray-100 last:border-0">
         <div 
           className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors`}
           style={{ paddingLeft: `${(level * 32) + 16}px` }}
           onClick={() => toggleCategory(category.id)}
         >
           <div className="flex items-center gap-3">
             <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
             <svg className="w-5 h-5 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
             <span className="font-semibold text-gray-700">{category.name}</span>
             <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium">{totalItems} {t('kb.item')}</span>
           </div>
         </div>
         
         {isExpanded && (
           <div className="w-full bg-white">
             {categoryArticles.map(article => (
               <ArticleRow
                 key={article.id}
                 article={article}
                 level={level}
                 onEdit={handleOpenModal}
                 onDelete={confirmDelete}
               />
             ))}
             
             {/* Render Subcategories */}
             {category.children?.map((child: any) => (
               <CategoryNode key={child.id} category={child} level={level + 1} />
             ))}
             
             {categoryArticles.length === 0 && (!category.children || category.children.length === 0) && (
               <div className="p-4 text-sm text-gray-400 italic" style={{ paddingLeft: `${((level + 1) * 32) + 16}px` }}>
                 {t('kb.empty_category')}
               </div>
             )}
           </div>
         )}
      </div>
    )
  }

  // Cari artikel yang tidak memiliki kategori untuk ditampilkan di bagian "Umum" atau "Lainnya"
  const uncategorizedArticles = articles.filter(a => !a.category_id);

  return (
    <div className="flex flex-col items-start gap-6 w-full relative">
      <Toast toast={toast} />

      {/* Delete Confirm Modal */}
      {deleteId && (
        <Modal
          title={t('kb.confirm_delete')}
          onClose={() => setDeleteId(null)}
          maxWidth="max-w-[400px]"
          footer={
            <>
              <ModalCancelButton onClick={() => setDeleteId(null)}>{t('common.cancel')}</ModalCancelButton>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors">{t('kb.delete_article')}</button>
            </>
          }
        >
          <p className="text-gray-600 mb-6">{t('kb.confirm_delete_msg')}</p>
        </Modal>
      )}

      <div className="flex justify-between items-end w-full">
        <div className="flex flex-col items-start gap-1 w-fit">
          <div className="flex items-start gap-2 w-full">
            <div className="flex flex-col items-start w-fit h-full">
              <p className="text-[#43474F] font-iBMPlexSans text-xs font-semibold leading-4 w-fit tracking-[0.05em]">
                {t('topbar.dashboard_admin')} / {t('kb.title')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start w-full">
            <p className="text-[#001E40] font-iBMPlexSans text-[32px] font-semibold leading-10 w-fit tracking-[-0.02em]">
              {t('kb.title')}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex w-full justify-end items-center mb-4">
        <button 
          onClick={() => {
            setFormData({ title: '', slug: '', category_id: '', content: '' });
            setIsModalOpen(true);
          }}
          className="flex h-9 px-4 items-center gap-2 rounded bg-[#001E40] text-white shadow-sm hover:bg-[#00142d] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="white"/></svg>
          <span className="text-white font-iBMPlexSans text-sm font-medium">{t('kb.add_article')}</span>
        </button>
      </div>

      <div className="flex flex-col items-start rounded-lg border border-[#C3C6D1] bg-[#FFF] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden relative">
        <div className="flex flex-col w-full bg-white relative">
          <div className="border-b border-b-[#C3C6D1] bg-[#F3F3F6] px-6 py-4">
            <span className="text-[#43474F] font-iBMPlexSans text-[11px] font-bold tracking-[0.05em]">
              {t('kb.structure_title')}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--gold)] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="w-full flex flex-col divide-y divide-gray-100">
              {categoryTree.map(category => (
                <CategoryNode key={category.id} category={category} />
              ))}

              {/* Tampilkan kategori "Lainnya" jika ada artikel tanpa kategori */}
              {uncategorizedArticles.length > 0 && (
                <div className="w-full border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-transparent" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                      <span className="font-semibold text-gray-700">{t('kb.uncategorized')}</span>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">{uncategorizedArticles.length} {t('kb.article')}</span>
                    </div>
                  </div>
                  <div className="w-full bg-white">
                    {uncategorizedArticles.map(article => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        level={0}
                        onEdit={handleOpenModal}
                        onDelete={confirmDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {categoryTree.length === 0 && uncategorizedArticles.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  {t('kb.empty_all')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <Modal
          title={editingId ? t('kb.edit_article') : t('kb.add_article')}
          onClose={() => setIsModalOpen(false)}
          maxWidth="max-w-2xl"
          footer={
            <>
              <ModalCancelButton onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</ModalCancelButton>
              <button
                type="submit"
                form="kbForm"
                className="px-5 py-2.5 rounded-xl font-medium text-white hover:bg-[var(--gold-dim)] bg-[var(--gold)] transition-colors shadow-sm"
              >
                {editingId ? t('common.save') : t('kb.add_article')}
              </button>
            </>
          }
        >
          <form id="kbForm" onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('kb.form_title_label')}</label>
              <input 
                type="text" 
                required 
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--gold)] outline-none bg-gray-50/50"
                placeholder={t('kb.form_title_placeholder')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('kb.form_category_label')}</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--gold)] outline-none bg-gray-50/50"
                >
                  <option value="">{t('kb.form_category_select')}</option>
                  {flattenedCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">{t('kb.form_category_help')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('kb.form_slug_label')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--gold)] outline-none bg-gray-50/50 font-mono text-sm"
                  placeholder={t('kb.form_slug_placeholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('kb.form_content_label')}</label>
              <textarea 
                required 
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--gold)] outline-none bg-gray-50/50"
                placeholder={t('kb.form_content_placeholder')}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
