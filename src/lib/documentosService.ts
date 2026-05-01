export type TipoDocumento = 'Entrada' | 'Saida' | 'Revisao';
export type StatusRevisao = 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface DocumentoProcesso {
  id: string;
  processoId: string;
  tipo: TipoDocumento;
  nomeArquivo: string;
  tamanho: number;
  dataUpload: string;
  conteudoBase64: string;
  statusRevisao?: StatusRevisao;
}

const DB_NAME = 'SPD_DocumentosDB';
const STORE_NAME = 'documentos';
const DB_VERSION = 2; // Bumped to rebuild index on existing browsers

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on server side'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Delete old store if it exists to rebuild with correct schema
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('processoId', 'processoId', { unique: false });
    };
  });
}

export const documentosService = {

  async salvarDocumento(doc: DocumentoProcesso): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(doc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Lista documentos filtrando explicitamente por processoId em client-side
   * (evita bugs de index corrupto em navegadores com dados antigos)
   */
  async listarDocumentos(processoId: string): Promise<DocumentoProcesso[]> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll(); // Busca todos e filtra client-side

        request.onsuccess = () => {
          const todos: DocumentoProcesso[] = request.result || [];
          // Filtragem explícita — garante isolamento por processo
          const filtrados = todos.filter(doc => doc.processoId === processoId);
          resolve(filtrados);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB indisponível, retornando lista vazia.', error);
      return [];
    }
  },

  async excluirDocumento(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async atualizarStatusRevisao(id: string, novoStatus: StatusRevisao): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const doc = request.result as DocumentoProcesso;
        if (doc) {
          doc.statusRevisao = novoStatus;
          const updateReq = store.put(doc);
          updateReq.onsuccess = () => resolve();
          updateReq.onerror = () => reject(updateReq.error);
        } else {
          reject(new Error('Documento não encontrado'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  },
};
