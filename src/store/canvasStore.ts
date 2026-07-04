import { create } from 'zustand';

export interface Shape {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'image' | 'star' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  shadowColor?: string;
  shadowBlur?: number;
  glowColor?: string;
  glowBlur?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  locked?: boolean;
}

export interface Page {
  id: string;
  name: string;
  width: number;
  height: number;
  shapes: Shape[];
  past: Shape[][];
  future: Shape[][];
}

interface CanvasState {
  pages: Page[];
  activePageId: string;
  shapes: Shape[];
  selectedId: string | null;
  past: Shape[][];
  future: Shape[][];
  a4Mode: boolean;
  language: 'hy' | 'en' | 'ru';
  setLanguage: (lang: 'hy' | 'en' | 'ru') => void;

  // Page actions
  addPage: (width?: number, height?: number) => void;
  deletePage: (id: string) => void;
  setActivePageId: (id: string) => void;
  reorderPages: (startIndex: number, endIndex: number) => void;
  updatePageDimensions: (id: string, width: number, height: number) => void;
  updatePageName: (id: string, name: string) => void;
  duplicatePage: (id: string) => void;
  setA4Mode: (enabled: boolean) => void;
  loadProject: (pages: Page[], activePageId: string) => void;

  // Shapes actions (operate on active page)
  setSelectedId: (id: string | null) => void;
  saveToHistory: () => void;
  addShape: (shape: Omit<Shape, 'id'>) => void;
  updateShape: (id: string, newProps: Partial<Shape>, skipHistory?: boolean) => void;
  deleteShape: (id: string) => void;
  clearCanvas: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  undo: () => void;
  redo: () => void;
  loadTemplate: (shapes: Omit<Shape, 'id'>[]) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}


const cloneShapes = (shapes: Shape[]): Shape[] => {
  return JSON.parse(JSON.stringify(shapes));
};

const saveStateToLocalStorage = (pages: Page[], activePageId: string) => {
  try {
    localStorage.setItem('cyber_editor_pages', JSON.stringify(pages));
    localStorage.setItem('cyber_editor_active_page_id', activePageId);
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
};

export const getNewspaperShapes = (): Shape[] => {
  const baseImg = '/5344053332416339591.jpg';
  return [
    // Images (cropped parts of the flyer)
    {
      id: 'img_main',
      type: 'image',
      src: baseImg,
      x: 20,
      y: 120,
      width: 491,
      height: 320,
      fill: '',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      glowColor: '#00f2fe',
      glowBlur: 0,
      cropX: 20,
      cropY: 120,
      cropWidth: 491,
      cropHeight: 320,
    },
    {
      id: 'img_church',
      type: 'image',
      src: baseImg,
      x: 546,
      y: 400,
      width: 228,
      height: 320,
      fill: '',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      glowColor: '#00f2fe',
      glowBlur: 0,
      cropX: 490,
      cropY: 565,
      cropWidth: 228,
      cropHeight: 320,
    },
    {
      id: 'img_street',
      type: 'image',
      src: baseImg,
      x: 20,
      y: 830,
      width: 180,
      height: 160,
      fill: '',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      glowColor: '#00f2fe',
      glowBlur: 0,
      cropX: 20,
      cropY: 830,
      cropWidth: 180
      cropHeight: 160,
    },

    // Background rectangles for the headers (gray boxes)
    {
      id: 'bg_header_kumayri',
      type: 'rect',
      x: 546,
      y: 120,
      width: 228,
      height: 30,
      fill: '#b0b0b0',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.9,
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'bg_header_vardanants',
      type: 'rect',
      x: 20,
      y: 560,
      width: 178,
      height: 30,
      fill: '#b0b0b0',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.9,
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'bg_header_marmashen',
      type: 'rect',
      x: 210,
      y: 560,
      width: 240,
      height: 30,
      fill: '#b0b0b0',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.9,
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'bg_header_mher',
      type: 'rect',
      x: 210,
      y: 830,
      width: 240,
      height: 30,
      fill: '#b0b0b0',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.9,
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'bg_header_aslamazyan',
      type: 'rect',
      x: 546,
      y: 560,
      width: 228,
      height: 30,
      fill: '#b0b0b0',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.9,
      glowColor: '',
      glowBlur: 0,
      locked: true
    },

    // Title Texts
    {
      id: 'text_title',
      type: 'text',
      x: 120,
      y: 20,
      width: 491,
      height: 40,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'THE LIVING MEMORY',
      fontSize: 34,
      fontFamily: 'Orbitron',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_subtitle',
      type: 'text',
      x: 160,
      y: 70,
      width: 491,
      height: 25,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'Կենդանի Հիշողությունը',
      fontSize: 22,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_header_right',
      type: 'text',
      x: 546,
      y: 25,
      width: 228,
      height: 60,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: "ՀԱՏՈՒԿ ԻՐԱԴԱՐՁՈՒԹՅՈՒՆ\nԳՅՈՒՄՐԻՈՒՄ ԲԱՑԱՀԱՅՏԵԼ Է\nTHE LIVING MEMORY",
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },

    // Column Headers & Body Texts
    {
      id: 'text_header_kumayri',
      type: 'text',
      x: 546,
      y: 125,
      width: 228,
      height: 25,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'ԿՈՒՄԱՅՐԻԻ ՊԱՏՄԱԿԱՆ ԹԱՂԱՄԱՍ',
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_body_kumayri',
      type: 'text',
      x: 546,
      y: 160,
      width: 228,
      height: 300,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: "Կումայրիի պատմական թաղամասը համարվում է Գյումրիի իրական ոսկեզօծիկը։ Այն յուրատեսակ բացօթյա թանգարան է, որտեղ մինչև այսօր պահպանվել են ավելի քան հազար պատմական շինություններ՝ կառուցված հիմնականում 18-19-րդ դարերում։ Թաղամասի յուրաքանչյուր փողոց շնչում է հին Ալեքսանդրապոլի պատմությամբ։ Այս տարածքում կարելի է տեսնել տարբեր ճարտարապետական գլուխգործոցներ, շքեղ առանձնատներ, հասարակական կառույցներ և եկեղեցիներ, որոնք կառուցված են կարմիր ու սև տուֆի համադրությամբ։ Այս նյութերն ու ոճային առանձնահատկությունները Գյումրիին տալիս են անզուգական գեղարվեստական տեսք։",
      fontSize: 12,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_welcome_title',
      type: 'text',
      x: 50,
      y: 490,
      width: 491,
      height: 50,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'ԲԱՐԻ ԳԱԼՈՒՍՏ ԳՅՈՒՄՐԻ՝ \n ԱՐՎԵՍՏԻ ԵՎ ՄՇԱԿՈՒՅԹԻ ՄԱՅՐԱՔԱՂԱՔ',
      fontSize: 17,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_header_vardanants',
      type: 'text',
      x: 20,
      y: 565,
      width: 180,
      height: 25,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'ՎԱՐԴԱՆԱՆՑ ՀՐԱՊԱՐԱԿ',
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true,
    },
    {
      id: 'text_body_vardanants',
      type: 'text',
      x: 20,
      y: 595,
      width: 180,
      height: 270,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: "Վարդանանց հրապարակը Գյումրիի կենտրոնական հրապարակն է, որը հանդիսանում է քաղաքի այցեքարտերից մեկը: Այն անվանվել է ի պատիվ հայոց զորավար Վարդան Մամիկոնյանի, որի արձանախումբը տեղադրված է հրապարակի կենտրոնում: Հրապարակը շրջապատված է պատմական կարևոր շինություններով, այդ թվում՝ քաղաքապետարանի շենքով, ինչպես նաև երկու մեծ ու գեղեցիկ եկեղեցիներով՝ Սուրբ Ամենափրկիչ և Սուրբ Յոթ Վերք: Այն սիրված վայր է թե՛ տեղացիների, թե՛ զբոսաշրջիկների համար, որտեղ կարելի է վայելել քաղաքի շունչը:",
      fontSize: 12,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: false ,
    },
    {
      id: 'text_header_marmashen',
      type: 'text',
      x: 210,
      y: 565,
      width: 240,
      height: 25,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'ՄԱՐՄԱՇԵՆԻ ՎԱՆԱԿԱՆ ՀԱՄԱԼԻՐ',
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_body_marmashen',
      type: 'text',
      x: 210,
      y: 595,
      width: 240,
      height: 270,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: "Մարմաշենի վանքը համարվում է միջնադարյան Հայաստանի ճարտարապետության իսկական գոհարը: Այն գտնվում է Գյումրիից մի քանի կիլոմետր հեռավորության վրա՝ Ախուրյան գետի ափին: Վանքը կառուցվել է 10-րդ դարում Բագրատունիների իշխանության օրոք և մինչև այսօր պահպանել է իր բնորոշ ճարտարապետական ոճն ու հմայքը: Համալիրը ներառում է մի քանի եկեղեցիներ, որոնցից կենտրոնականը Սուրբ Ստեփանոսն է, և հանդիսանում է հատկապես ուշագրավ իր հարդարանքներով ու որմնանկարներով:",
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_header_mher',
      type: 'text',
      x: 210,
      y: 830,
      width: 240,
      height: 25,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'ՄՀԵՐ ՄԿՐՏՉՅԱՆԻ ՏՈՒՆ ԹԱՆԳԱՐԱՆ',
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_body_mher',
      type: 'text',
      x: 210,
      y: 860,
      width: 240,
      height: 270,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: "Մհեր Մկրտչյանը, հայտնի որպես Մհեր, հայ թատրոնի ու կինոյի ամենավառ ու սիրելի ներկայացուցիչներից մեկն է, որը թողել է անջնջելի հետք հայ մշակույթի պատմության մեջ: Նրա դերերը և ստեղծագործական գործունեությունը այսօր էլ մեծ ազդեցություն ունեն նոր սերունդների վրա, և նրա կերպարը սիրված է ինչպես Հայաստանում, այնպես էլ արտասահմանում: Նրա տուն-թանգարանը գտնվում է Գյումրիում՝ այն բնակարանում, որտեղ Մհերը մեծացել է, կազմել իր առաջին հիշողություններն ու ոգեշնչումները: Թանգարանում ներկայացված են դերասանի անձնական իրերը՝ թատերական և կինոդերերի զգեստներ, կոստյումները:",
      fontSize: 12,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_header_aslamazyan',
      type: 'text',
      x: 546,
      y: 565,
      width: 228,
      height: 25,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'ԱՍԼԱՄԱԶՅԱՆ ՔՈՒՅՐԵՐԻ ՊԱՏԿԵՐԱՍՐԱՀ',
      fontSize: 13,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    },
    {
      id: 'text_body_aslamazyan',
      type: 'text',
      x: 546,
      y: 595,
      width: 228,
      height: 280,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: "Ասլամազյան քույրերի պատկերասրահը նվիրված է հայ նշանավոր նկարչուհիներ՝ Մարիամ և Երանուհի Ասլամազյաններին, որոնք համարվում են 20-րդ դարի հայկական նկարչության ամենահայտնի ներկայացուցիչները։ Պատկերասրահը գտնվում է Գյումրիի պատմական կենտրոնում և հատուկ հարմարեցված է իրենց աշխատանքները ցուցադրելու համար։ Այստեղ այցելուները կարող են ծանոթանալ նրանց ստեղծագործության ամբողջական տեսականուն՝ նկարների, լուսանկարների և այլ ստեղծագործական նյութերի միջոցով, որոնք բացահայտում են նրանց յուրահատուկ ոճն ու գեղարվեստական աշխարհը:",
      fontSize: 12,
      fontFamily: 'Inter',
      glowColor: '',
      glowBlur: 0,
      locked: true
    }
  ];
};

const getInitialState = () => {
  try {
    const savedPages = localStorage.getItem('cyber_editor_pages');
    const savedActivePageId = localStorage.getItem('cyber_editor_active_page_id');
    const savedLanguage = localStorage.getItem('cyber_editor_language') as 'hy' | 'en' | 'ru' || 'hy';
    
    if (savedPages && savedActivePageId) {
      const pages: Page[] = JSON.parse(savedPages);
      if (pages.length > 0) {
        const activePage = pages.find(p => p.id === savedActivePageId) || pages[0]!;
        return {
          pages,
          activePageId: activePage.id,
          shapes: activePage.shapes || [],
          past: activePage.past || [],
          future: activePage.future || [],
          a4Mode: true,
          language: savedLanguage
        };
      }
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  
  // Default to single A4 page with default layout
  const defaultPageId = `page_${Date.now()}`;
  const defaultPage: Page = {
    id: defaultPageId,
    name: 'Էջ 1',
    width: 794,
    height: 1123,
    shapes: getNewspaperShapes(),
    past: [],
    future: [],
  };
  return {
    pages: [defaultPage],
    activePageId: defaultPageId,
    shapes: defaultPage.shapes,
    past: [],
    future: [],
    a4Mode: true,
    language: 'hy' as const
  };
};

const initialState = getInitialState();

export const useCanvasStore = create<CanvasState>((set, get) => {
  // Helper to sync local shapes changes into the pages list and localStorage
  const syncPagesAndSave = (shapesUpdate: Partial<CanvasState>) => {
    set(shapesUpdate);
    const state = get();
    const updatedPages = state.pages.map((p) => 
      p.id === state.activePageId 
        ? { ...p, shapes: state.shapes, past: state.past, future: state.future } 
        : p
    );
    set({ pages: updatedPages });
    saveStateToLocalStorage(updatedPages, state.activePageId);
  };

  return {
    pages: initialState.pages,
    activePageId: initialState.activePageId,
    shapes: initialState.shapes,
    selectedId: null,
    past: initialState.past,
    future: initialState.future,
    a4Mode: initialState.a4Mode,
    language: initialState.language,
    sidebarOpen: true,

    setLanguage: (lang) => {
      set({ language: lang });
      localStorage.setItem('cyber_editor_language', lang);
    },
    setA4Mode: (enabled) => set({ a4Mode: enabled }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),


    // Pages management
    addPage: (width = 794, height = 1123) => {
      const { pages } = get();
      const newPageId = `page_${Date.now()}`;
      const newPage: Page = {
        id: newPageId,
        name: `Էջ ${pages.length + 1}`,
        width,
        height,
        shapes: [],
        past: [],
        future: [],
      };
      const updatedPages = [...pages, newPage];
      set({
        pages: updatedPages,
        activePageId: newPageId,
        shapes: [],
        past: [],
        future: [],
        selectedId: null,
      });
      saveStateToLocalStorage(updatedPages, newPageId);
    },

    deletePage: (id) => {
      const { pages, activePageId } = get();
      if (pages.length <= 1) return; // Keep at least one page
      
      const updatedPages = pages.filter(p => p.id !== id);
      let newActiveId = activePageId;
      if (activePageId === id) {
        const index = pages.findIndex(p => p.id === id);
        const neighbor = pages[index - 1] || pages[index + 1];
        newActiveId = neighbor!.id;
      }
      
      const activePage = updatedPages.find(p => p.id === newActiveId)!;
      set({
        pages: updatedPages,
        activePageId: newActiveId,
        shapes: activePage.shapes || [],
        past: activePage.past || [],
        future: activePage.future || [],
        selectedId: null,
      });
      saveStateToLocalStorage(updatedPages, newActiveId);
    },

    setActivePageId: (id) => {
      const { pages, activePageId } = get();
      if (activePageId === id) return;

      // Sync active page state before moving
      const syncedPages = pages.map((p) => 
        p.id === activePageId 
          ? { ...p, shapes: get().shapes, past: get().past, future: get().future } 
          : p
      );

      const targetPage = syncedPages.find(p => p.id === id)!;
      set({
        pages: syncedPages,
        activePageId: id,
        shapes: targetPage.shapes || [],
        past: targetPage.past || [],
        future: targetPage.future || [],
        selectedId: null,
      });
      saveStateToLocalStorage(syncedPages, id);
    },

    reorderPages: (startIndex, endIndex) => {
      const { pages, activePageId } = get();
      const updatedPages = [...pages];
      const [removed] = updatedPages.splice(startIndex, 1);
      if (removed) {
        updatedPages.splice(endIndex, 0, removed);
      }
      set({ pages: updatedPages });
      saveStateToLocalStorage(updatedPages, activePageId);
    },

    updatePageDimensions: (id, width, height) => {
      const { pages, activePageId } = get();
      const updatedPages = pages.map(p => 
        p.id === id ? { ...p, width, height } : p
      );
      set({ pages: updatedPages });
      if (activePageId === id) {
        set({ shapes: [...get().shapes] });
      }
      saveStateToLocalStorage(updatedPages, activePageId);
    },

    updatePageName: (id, name) => {
      const { pages, activePageId } = get();
      const updatedPages = pages.map(p => 
        p.id === id ? { ...p, name } : p
      );
      set({ pages: updatedPages });
      saveStateToLocalStorage(updatedPages, activePageId);
    },

    duplicatePage: (id) => {
      const { pages, activePageId } = get();
      const syncedPages = pages.map((p) => 
        p.id === activePageId 
          ? { ...p, shapes: get().shapes, past: get().past, future: get().future } 
          : p
      );

      const pageToDuplicate = syncedPages.find(p => p.id === id)!;
      const newPageId = `page_${Date.now()}`;
      const newPage: Page = {
        ...pageToDuplicate,
        id: newPageId,
        name: `${pageToDuplicate.name} (Copy)`,
        shapes: cloneShapes(pageToDuplicate.shapes),
        past: [],
        future: [],
      };

      const index = syncedPages.findIndex(p => p.id === id);
      const updatedPages = [...syncedPages];
      updatedPages.splice(index + 1, 0, newPage);

      set({
        pages: updatedPages,
        activePageId: newPageId,
        shapes: newPage.shapes,
        past: [],
        future: [],
        selectedId: null,
      });
      saveStateToLocalStorage(updatedPages, newPageId);
    },

    loadProject: (loadedPages, loadedActivePageId) => {
      if (loadedPages.length === 0) return;
      const activeId = loadedActivePageId && loadedPages.some(p => p.id === loadedActivePageId)
        ? loadedActivePageId
        : loadedPages[0]!.id;
      const activePage = loadedPages.find(p => p.id === activeId)!;

      set({
        pages: loadedPages,
        activePageId: activeId,
        shapes: activePage.shapes || [],
        past: activePage.past || [],
        future: activePage.future || [],
        selectedId: null,
      });
      saveStateToLocalStorage(loadedPages, activeId);
    },

    // Shapes actions
    setSelectedId: (id) => set({ selectedId: id }),

    saveToHistory: () => {
      const { shapes, past } = get();
      syncPagesAndSave({
        past: [...past, cloneShapes(shapes)],
        future: [],
      });
    },

    addShape: (shapeProps) => {
      const { saveToHistory, shapes } = get();
      saveToHistory();

      const newShape: Shape = {
        ...shapeProps,
        id: `${shapeProps.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      syncPagesAndSave({
        shapes: [...shapes, newShape],
        selectedId: newShape.id,
      });
    },

    updateShape: (id, newProps, skipHistory = false) => {
      const { saveToHistory, shapes } = get();
      if (!skipHistory) saveToHistory();

      syncPagesAndSave({
        shapes: shapes.map((s) => (s.id === id ? { ...s, ...newProps } : s)),
      });
    },

    deleteShape: (id) => {
      const { saveToHistory, shapes, selectedId } = get();
      saveToHistory();

      syncPagesAndSave({
        shapes: shapes.filter((s) => s.id !== id),
        selectedId: selectedId === id ? null : selectedId,
      });
    },

    clearCanvas: () => {
      const { saveToHistory } = get();
      saveToHistory();

      syncPagesAndSave({
        shapes: [],
        selectedId: null,
      });
    },

    bringToFront: (id) => {
      const { saveToHistory, shapes } = get();
      const index = shapes.findIndex((s) => s.id === id);
      if (index === -1 || index === shapes.length - 1) return;

      saveToHistory();
      const newShapes = cloneShapes(shapes);
      const [element] = newShapes.splice(index, 1);
      if (element) newShapes.push(element);

      syncPagesAndSave({ shapes: newShapes });
    },

    sendToBack: (id) => {
      const { saveToHistory, shapes } = get();
      const index = shapes.findIndex((s) => s.id === id);
      if (index === -1 || index === 0) return;

      saveToHistory();
      const newShapes = cloneShapes(shapes);
      const [element] = newShapes.splice(index, 1);
      if (element) newShapes.unshift(element);

      syncPagesAndSave({ shapes: newShapes });
    },

    moveUp: (id) => {
      const { saveToHistory, shapes } = get();
      const index = shapes.findIndex((s) => s.id === id);
      if (index === -1 || index === shapes.length - 1) return;

      saveToHistory();
      const newShapes = cloneShapes(shapes);
      const temp = newShapes[index];
      newShapes[index] = newShapes[index + 1]!;
      newShapes[index + 1] = temp!;

      syncPagesAndSave({ shapes: newShapes });
    },

    moveDown: (id) => {
      const { saveToHistory, shapes } = get();
      const index = shapes.findIndex((s) => s.id === id);
      if (index === -1 || index === 0) return;

      saveToHistory();
      const newShapes = cloneShapes(shapes);
      const temp = newShapes[index];
      newShapes[index] = newShapes[index - 1]!;
      newShapes[index - 1] = temp!;

      syncPagesAndSave({ shapes: newShapes });
    },

    undo: () => {
      const { past, shapes } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1]!;
      const newPast = past.slice(0, -1);

      syncPagesAndSave({
        past: newPast,
        shapes: previous,
        future: [cloneShapes(shapes), ...get().future],
      });
    },

    redo: () => {
      const { future, shapes, past } = get();
      if (future.length === 0) return;

      const next = future[0]!;
      const newFuture = future.slice(1);

      syncPagesAndSave({
        past: [...past, cloneShapes(shapes)],
        shapes: next,
        future: newFuture,
      });
    },

    loadTemplate: (newShapes) => {
      const { saveToHistory } = get();
      saveToHistory();
      const shapesWithIds = newShapes.map((s, index) => ({
        ...s,
        id: `${s.type}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`
      }));
      syncPagesAndSave({
        shapes: shapesWithIds,
        selectedId: null,
        future: []
      });
    },
  };
});