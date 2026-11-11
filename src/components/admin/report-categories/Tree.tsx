import { useContext, useMemo, useState } from "react";
import Row from "./Row";
import SubRow from "./SubRow";
import { TreeContext } from "./Workspace";
import { useLanguage } from "@/context/LanguageContext";

export default function Tree() {
  const ctx = useContext(TreeContext);
  const { t, language } = useLanguage();
  const treeData = ctx?.treeData || [];
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const translateCategoryName = (name: string) => {
    if (language === 'id') return name;
    const translations: Array<[string, string]> = [
      ['Failed Sinkronisasi Pembayaran', 'Failed Payment Synchronization'],
      ['Error Sinkronisasi KRS', 'KRS Synchronization Error'],
      ['Indikasi Malware / Script Ilegal', 'Malware / Illegal Script Indication'],
      ['Akses Tidak Dikenal', 'Unknown Access'],
      ['Akses Not Dikenal', 'Unknown Access'],
      ['Access Not Dikenal', 'Unknown Access'],
      ['Serangan DDoS', 'DDoS Attack'],
      ['Kebocoran Data (Data Breach)', 'Data Breach'],
      ['Server Not Bisa Diremote (RDP/SSH)', 'Cannot Remotely Access Server (RDP/SSH)'],
      ['Failed Login VPN', 'VPN Login Failed'],
      ['Application Internal Not Bisa DiAccess', 'Cannot Access Internal Application'],
      ['Not Bisa Connect (Auth Error)', 'Cannot Connect (Auth Error)'],
      ['Sering Putus / Disconnect', 'Frequent Disconnections'],
      ['Inbox Penuh / Bouncing', 'Full Inbox / Bouncing'],
      ['Terkena Spam / Phishing', 'Spam / Phishing'],
      ['Request Lisensi Zoom / Office 365', 'Zoom / Office 365 License Request'],
      ['Halaman Website Error / Blank', 'Website Error / Blank Page'],
      ['Permintaan Pembuatan Subdomain', 'Subdomain Creation Request'],
      ['Sinkronisasi Pembayaran', 'Payment Synchronization'],
      ['Tidak Bisa Diremote', 'Cannot Be Remotely Accessed'],
      ['Tidak Bisa DiAccess', 'Cannot Access'],
      ['Tidak Bisa Connect', 'Cannot Connect'],
      ['Sering Putus', 'Frequent Disconnections'],
      ['Pembuatan Subdomain', 'Subdomain Creation'],
      ['Lisensi', 'Licensing'],
      ['Wifi', 'Wi-Fi'],
      ['Layanan Website & Email', 'Website & Email Services'],
      ['Layanan Sistem Informasi', 'Information Systems Services'],
      ['Layanan Jaringan & Infrastruktur', 'Network & Infrastructure Services'],
      ['Gagal TTE (Tanda Tangan Elektronik)', 'Failed E-Signature'],
      ['Tanda Tangan Elektronik', 'Electronic Signature'],
      ['Pembuatan Akun', 'Account Creation'],
      ['Koneksi Internet', 'Internet Connection'],
      ['Perangkat Keras', 'Hardware'],
      ['Perangkat Lunak', 'Software'],
      ['Akses Sistem', 'System Access'],
      ['Bantuan Teknis', 'Technical Support'],
      ['Panduan Pengguna', 'User Guide'],
      ['Informasi Kampus', 'Campus Information'],
      ['Tidak Kompatibel di Browser', 'Browser Incompatibility'],
      ['Data Tidak Sinkron', 'Data Synchronization Issue'],
      ['Aplikasi Down', 'Application Down'],
      ['Ubah Email Recovery', 'Change Recovery Email'],
      ['Lupa kata sandi', 'Forgot Password'],
      ['Lupa Password', 'Forgot Password'],
      ['Reset Akun', 'Reset Account'],
      ['Buat Tiket', 'Create Ticket'],
      ['Cek Status Tiket', 'Check Ticket Status'],
      ['Aplikasi', 'Application'],
      ['Layanan', 'Services'],
      ['Jaringan', 'Network'],
      ['Infrastruktur', 'Infrastructure'],
      ['Sistem Informasi', 'Information Systems'],
      ['Sistem', 'System'],
      ['Keamanan', 'Security'],
      ['Informasi', 'Information'],
      ['Koneksi', 'Connection'],
      ['Perangkat', 'Device'],
      ['Akses', 'Access'],
      ['Bantuan', 'Support'],
      ['Panduan', 'Guide'],
      ['Pengguna', 'User'],
      ['Pelapor', 'Reporter'],
      ['Teknisi', 'Technician'],
      ['Petugas', 'Officer'],
      ['Kampus', 'Campus'],
      ['Kendala', 'Issue'],
      ['Lainnya', 'Others'],
      ['Gagal', 'Failed'],
      ['Tidak', 'Not'],
      ['Ubah', 'Change'],
      ['Akun', 'Account'],
      ['Kata Sandi', 'Password'],
      ['Kategori', 'Category'],
    ];

    return translations.reduce((translated, [source, target]) => (
      translated.replace(new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), target)
    ), name);
  };

  const handleDragStart = (id: string, e: React.DragEvent) => {
    if (ctx?.searchQuery) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === targetId) return;

    let draggedNode: any = null;
    let draggedParent: any = null;
    let draggedIndex = -1;

    let targetNode: any = null;
    let targetParent: any = null;
    let targetIndex = -1;

    const findNode = (nodes: any[], parent: any = null) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === draggedId) {
          draggedNode = nodes[i];
          draggedParent = parent;
          draggedIndex = i;
        }
        if (nodes[i].id === targetId) {
          targetNode = nodes[i];
          targetParent = parent;
          targetIndex = i;
        }
        if (nodes[i].children) findNode(nodes[i].children, nodes[i]);
      }
    };

    findNode(treeData);

    if (!draggedNode || !targetNode) {
      setDraggedId(null);
      return;
    }

    // Do not allow Root to become Sub
    if (draggedParent === null && targetParent !== null) {
      setDraggedId(null);
      return;
    }

    const newTree = JSON.parse(JSON.stringify(treeData)); // Deep clone
    
    // Find arrays in newTree
    const sourceArray = draggedParent === null 
      ? newTree 
      : newTree.find((p: any) => p.id === draggedParent.id).children;
      
    // Remove dragged node
    const [movedItem] = sourceArray.splice(draggedIndex, 1);

    // If dragged is SUB and target is ROOT -> Add as child of ROOT
    if (draggedParent !== null && targetParent === null) {
      const targetRoot = newTree.find((p: any) => p.id === targetNode.id);
      if (!targetRoot.children) targetRoot.children = [];
      targetRoot.children.push(movedItem);
      // update type visually
      movedItem.type = "leaf-bordered";
      movedItem.realId = draggedNode.realId; 
    } 
    // If dragged is SUB and target is SUB -> Insert into target's parent array
    else if (draggedParent !== null && targetParent !== null) {
      const targetArray = newTree.find((p: any) => p.id === targetParent.id).children;
      const tIndex = targetArray.findIndex((c: any) => c.id === targetId);
      targetArray.splice(tIndex, 0, movedItem);
    }
    // If dragged is ROOT and target is ROOT -> Reorder
    else if (draggedParent === null && targetParent === null) {
      const tIndex = newTree.findIndex((c: any) => c.id === targetId);
      newTree.splice(tIndex, 0, movedItem);
    }

    if (ctx?.handleReorder) {
      ctx.handleReorder(newTree);
    }
    setDraggedId(null);
  };

  const filteredData = useMemo(() => {
    if (!ctx?.searchQuery) return treeData;
    const lowerQuery = ctx.searchQuery.toLowerCase();
    
    const filterNodes = (nodes: any[]) => {
      return nodes.reduce((acc: any[], node: any) => {
        const isMatch = node.title.toLowerCase().includes(lowerQuery);
        let filteredChildren = [];
        if (node.children) {
          filteredChildren = filterNodes(node.children);
        }

        if (isMatch) {
          acc.push({ ...node, children: node.children });
        } else if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    };

    return filterNodes(treeData);
  }, [ctx?.searchQuery, treeData]);

  const renderNode = (node: any, index: number, isRoot: boolean = false) => {
    if (isRoot) {
      return (
        <div
          key={node.id}
          draggable={!ctx?.searchQuery}
          onDragStart={(e) => handleDragStart(node.id, e)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(node.id, e)}
          onDragEnd={() => setDraggedId(null)}
          className={`w-full transition-colors ${
            draggedId === node.id ? "opacity-40 bg-[var(--canvas)]" : ""
          }`}
        >
          <Row
            nodeId={node.id}
            outerWrapperClassName="flex flex-col items-end w-full"
            iconBgClassName={node.iconBgClassName}
            icon={node.icon}
            title={translateCategoryName(node.title)}
            originalTitle={node.title}
            count={node.count}
            status={node.status}
            childrenWrapperClassName={node.childrenWrapperClassName}
          >
            {node.children?.map((child: any, cIndex: number) => renderNode(child, cIndex, false))}
          </Row>
        </div>
      );
    }

    return (
      <div
        key={node.id}
        draggable={!ctx?.searchQuery}
        onDragStart={(e) => handleDragStart(node.id, e)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(node.id, e)}
        onDragEnd={() => setDraggedId(null)}
        className={`w-full ${draggedId === node.id ? "opacity-40 bg-[var(--canvas)]" : ""}`}
      >
        {node.type === "branch" ? (
          <SubRow
            variant="branch"
            nodeId={node.id}
            headerClassName="w-full relative"
            title={translateCategoryName(node.title)}
            originalTitle={node.title}
            count={node.count}
            status={node.status}
            childrenWrapperClassName={node.childrenWrapperClassName}
            onMoveUp={index > 0 && !ctx?.searchQuery ? () => {
              const updatedData = [...treeData];
              const temp = updatedData[index];
              updatedData[index] = updatedData[index - 1];
              updatedData[index - 1] = temp;
              ctx?.handleReorder?.(updatedData);
            } : undefined}
            onMoveDown={index < treeData.length - 1 && !ctx?.searchQuery ? () => {
              const updatedData = [...treeData];
              const temp = updatedData[index];
              updatedData[index] = updatedData[index + 1];
              updatedData[index + 1] = temp;
              ctx?.handleReorder?.(updatedData);
            } : undefined}
          >
            {node.children?.map((subChild: any, scIndex: number) => renderNode(subChild, scIndex, false))}
          </SubRow>
        ) : (
          <SubRow
            variant={node.type as any}
            title={translateCategoryName(node.title)}
            originalTitle={node.title}
            nodeId={node.id}
            hasDivider={node.type === "leaf-bordered" ? true : undefined}
            onMoveUp={index > 0 && !ctx?.searchQuery ? () => {
              const updatedData = [...treeData];
              const parentIndex = updatedData.findIndex(p => p.children?.some((c: any) => c.id === node.id));
              if (parentIndex !== -1) {
                const parent = { ...updatedData[parentIndex] };
                const children = [...parent.children];
                const temp = children[index];
                children[index] = children[index - 1];
                children[index - 1] = temp;
                parent.children = children;
                updatedData[parentIndex] = parent;
                ctx?.handleReorder?.(updatedData);
              }
            } : undefined}
            onMoveDown={index < (treeData.find((p: any) => p.children?.some((c: any) => c.id === node.id))?.children?.length || 0) - 1 && !ctx?.searchQuery ? () => {
              const updatedData = [...treeData];
              const parentIndex = updatedData.findIndex(p => p.children?.some((c: any) => c.id === node.id));
              if (parentIndex !== -1) {
                const parent = { ...updatedData[parentIndex] };
                const children = [...parent.children];
                const temp = children[index];
                children[index] = children[index + 1];
                children[index + 1] = temp;
                parent.children = children;
                updatedData[parentIndex] = parent;
                ctx?.handleReorder?.(updatedData);
              }
            } : undefined}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      
      {/* DAFTAR KATEGORI DENGAN FITUR DRAG AND DROP */}
      <div className="w-full flex flex-col">
        {filteredData.map((row, index) => renderNode(row, index, true))}

        {filteredData.length === 0 && (
          <div className="p-8 w-full flex justify-center text-center text-[12.5px] text-[var(--fg-dim)]">
            {t('categories.empty_search').replace('{query}', ctx?.searchQuery || '')}
          </div>
        )}
      </div>
    </div>
  );
}