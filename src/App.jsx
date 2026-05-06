import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Baby, CalendarHeart, Gift, Stethoscope, 
  ChevronDown, ChevronUp, BookHeart, ListTodo, Send, Trash2, 
  Heart, Download, Info, ShoppingBag, Coins, MessageSquareText, 
  CalendarDays, Star, Plus, X, Timer, Scale, ClipboardList, Play, Square, Activity, LogOut, Coffee, ShieldCheck, AlertCircle, HandHeart, Sparkles, Lightbulb
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// --- [Firebase 설정] ---
const firebaseConfig = {
  apiKey: "AIzaSyAkzmoK1dQrxfXFiPVnhhfUvRITM3nM3g4",
  authDomain: "readybaby-bd5bb.firebaseapp.com",
  projectId: "readybaby-bd5bb",
  storageBucket: "readybaby-bd5bb.firebasestorage.app",
  messagingSenderId: "630742601183",
  appId: "1:630742601183:web:559618f9647db8beac086a",
  measurementId: "G-11K09F8QFY"
};


const environmentAppId = typeof __app_id !== 'undefined' ? __app_id : 'readybaby-app';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 임신 가이드 데이터 ---
const GUIDE_DATA = [
  {
    id: 'g_early',
    title: '임신 초기 (1주~12주)',
    subtitle: '조심 또 조심! 가장 중요한 시기',
    color: 'bg-rose-50 border-rose-100 text-rose-700',
    icon: <Sparkles className="w-5 h-5" />,
    tips: [
      { title: '🤢 입덧/먹덧 대처법', content: '공복일 때 심해지니 비스킷 등을 머리맡에 두고 일어나자마자 드세요. 조금씩 자주 먹는 것이 핵심! 찬 음식이나 새콤한 과일이 도움이 되기도 합니다.' },
      { title: '💊 필수 영양제', content: '엽산은 아기 신경관 결손 예방을 위해 필수입니다. 최소 12주까지는 꼭 챙겨 드세요.' },
      { title: '⚠️ 주의 사항', content: '뜨거운 대중탕, 사우나는 태아 뇌세포 발달에 영향을 줄 수 있으니 피하세요. 무거운 짐 들기나 무리한 운동도 금물입니다.' }
    ]
  },
  {
    id: 'g_mid',
    title: '임신 중기 (13주~27주)',
    subtitle: '안정기 진입, 컨디션이 좋아져요',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    icon: <Heart className="w-5 h-5" />,
    tips: [
      { title: '🩸 철분제 복용 시작', content: '16주부터는 아기에게 혈액이 많이 공급되어 빈혈이 생기기 쉽습니다. 변비 예방을 위해 유산균과 함께 드시는 것을 추천해요.' },
      { title: '🦓 튼살 관리', content: '배가 나오기 시작하는 시기입니다. 아침저녁으로 보습 크림과 오일을 듬뿍 발라주세요.' },
      { title: '🦶 태동의 시작', content: '보통 18~20주 사이에 "뽀글보글"하는 느낌으로 첫 태동을 느낍니다. 아기와의 첫 교감을 즐겨보세요!' }
    ]
  },
  {
    id: 'g_late',
    title: '임신 후기 (28주~출산)',
    subtitle: '만날 준비 완료! 몸이 무거워져요',
    color: 'bg-blue-50 border-blue-100 text-blue-700',
    icon: <CalendarDays className="w-5 h-5" />,
    tips: [
      { title: '🎈 부종 관리', content: '발이 많이 부으니 압박 스타킹을 신거나 잘 때 발 아래 베개를 두세요. 싱겁게 먹는 습관이 중요합니다.' },
      { title: '📢 가진통 vs 진진통', content: '불규칙하게 배가 뭉치면 가진통, 간격이 일정해지고 통증이 세지면 진진통입니다. 앱의 진통 타이머를 활용해 간격을 체크하세요.' },
      { title: '🎒 출산 가방 싸기', content: '언제든 병원에 갈 수 있게 34주 전후로 미리 가방을 싸두는 것이 마음 편합니다.' }
    ]
  }
];

// --- 초기 데이터셋 ---
const INITIAL_CHECKLIST = [
  { id: 'first_trimester', title: '임신 초기 (확인 ~ 12주)', icon: <CalendarHeart className="w-5 h-5" />, color: 'bg-rose-50 border-rose-200 text-rose-800', tasks: [{ id: 't1', title: '산부인과 검진 및 임신확인서 발급', desc: '아기집 확인 후 바우처 신청을 위한 확인서 수령.', isCustom: false }, { id: 't2', title: '국민행복카드 신청', desc: '정부 지원금을 위한 카드 발급.', isCustom: false }, { id: 't3', title: '보건소 임산부 등록 및 엽산 수령', desc: '엽산제 수령, 뱃지, 주차증 발급.', isCustom: false }, { id: 't_new1', title: '입덧약 처방 (필요시)', desc: '심할 경우 병원에서 약을 처방받으세요.', isCustom: false }, { id: 't4', title: '태아보험 가입 상담', desc: '1차 기형아 검사 전(11-12주) 가입 권장.', isCustom: false }, { id: 't5', title: '산후조리원 예약', desc: '인기 있는 곳은 마감이 빠릅니다.', isCustom: false }, { id: 't6', title: '임신기 근로시간 단축 신청', desc: '12주 이내 직장인 2시간 단축 권리 행사.', isCustom: false }] },
  { id: 'second_trimester', title: '임신 중기 (13주 ~ 27주)', icon: <Stethoscope className="w-5 h-5" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', tasks: [{ id: 't7', title: '철분제 복용 시작', desc: '16주부터 철분제 필수 복용.', isCustom: false }, { id: 't_new2', title: '튼살크림/오일 마사지 시작', desc: '아침저녁으로 보습을 충분히 해주세요.', isCustom: false }, { id: 't8', title: '정밀 초음파 및 1/2차 기형아 검사', desc: '목투명대 검사 및 태아 장기 형성 확인.', isCustom: false }, { id: 't9', title: '임신성 당뇨(임당) 검사', desc: '24~28주 사이 진행.', isCustom: false }, { id: 't_new3', title: '의료용 압박스타킹 처방', desc: '병원에서 보험 적용받아 구입하세요.', isCustom: false }, { id: 't10', title: '치과 검진 (스케일링)', desc: '안정기일 때 예방 치료 권장.', isCustom: false }, { id: 't11', title: '태교 여행 및 만삭사진', desc: '무리 없는 선에서 추억 남기기.', isCustom: false }] },
  { id: 'third_trimester', title: '임신 후기 (28주 ~ 출산)', icon: <Baby className="w-5 h-5" />, color: 'bg-blue-50 border-blue-200 text-blue-800', tasks: [{ id: 't12', title: '백일해 백신 접종', desc: '27~36주 사이 부부 필수 접종.', isCustom: false }, { id: 't13', title: '아기 용품 세탁 및 소독', desc: '미리 세탁하여 지퍼백 보관.', isCustom: false }, { id: 't_new4', title: '산모 출산 가방(캐리어) 싸기', desc: '34주부터 병원/조리원 짐 싸기.', isCustom: false }, { id: 't15', title: '산후도우미 정부지원 신청', desc: '출산 예정일 40일 전부터 보건소/복지로 신청.', isCustom: false }, { id: 't_new5', title: '신생아 심폐소생술/교육', desc: '응급처치법을 익혀두세요.', isCustom: false }, { id: 't16', title: '막달 검사 및 호흡법 연습', desc: '심전도, 피검사 및 라마즈 연습.', isCustom: false }] }
];

const INITIAL_GEAR = [
  { id: 'must_have', title: '1순위. 수유 & 위생 (필수)', icon: <Star className="w-5 h-5" fill="currentColor" />, color: 'bg-amber-50 border-amber-200 text-amber-800', tasks: [{ id: 'g_br', title: '브라운 귀적외선 체온계', desc: '6520 모델 추천.', isCustom: false }, { id: 'g_f1', title: '분유 제조기 / 자동 분유포트', desc: '새벽 수유 피로도를 줄여줍니다.', isCustom: false }, { id: 'g_f2', title: '젖병 소독기 & 젖병', desc: 'UV소독기 및 배앓이 방지 젖병.', isCustom: false }, { id: 'g_h1', title: '기저귀 갈이대', desc: '엄마 아빠의 허리를 보호합니다.', isCustom: false }, { id: 'g_c1', title: '밤부 가제손수건 40장', desc: '엠보/거즈 혼합 준비.', isCustom: false }] },
  { id: 'maternity', title: '산모 용품 (출산 가방)', icon: <Gift className="w-5 h-5" />, color: 'bg-purple-50 border-purple-200 text-purple-800', tasks: [{ id: 'g_m1', title: '맘스팬티 / 산모패드', desc: '오로 배출 대비 필수.', isCustom: false }, { id: 'g_m2', title: '수유브라 / 수유나시', desc: '압박 없는 사이즈로 준비.', isCustom: false }, { id: 'g_m3', title: '손목/발목 보호대', desc: '관절 보호 필수.', isCustom: false }, { id: 'g_m5', title: '텀블러 & 구부러지는 빨대', desc: '병원 필수템.', isCustom: false }] },
  { id: 'quality_of_life', title: '육아 삶의 질 상승템', icon: <Heart className="w-5 h-5" fill="currentColor" />, color: 'bg-rose-50 border-rose-200 text-rose-800', tasks: [{ id: 'g_s1', title: '스와들업', desc: '모로반사 방지.', isCustom: false }, { id: 'g_s2', title: '역류방지쿠션', desc: '수유 후 게워냄 방지.', isCustom: false }, { id: 'g_h3', title: '자동 콧물 흡입기', desc: '육아 필수템.', isCustom: false }] }
];

const BENEFITS_DATA = [
  { title: '임신·출산 진료비 바우처', content: '단태아 100만원, 다태아 140만원 지원', apply: '임신확인서 발급 후 국민행복카드 신청.' },
  { title: '부모급여 및 아동수당', content: '부모급여(0세 100만, 1세 50만) + 아동수당 10만', apply: '출생신고 시 행복출산 원스톱 서비스 신청.' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checklist'); 
  const [toastMsg, setToastMsg] = useState(''); 
  const [modalContent, setModalContent] = useState(null); 

  // 상태 관리
  const [checklistData, setChecklistData] = useState(INITIAL_CHECKLIST);
  const [gearData, setGearData] = useState(INITIAL_GEAR);
  const [completedTasks, setCompletedTasks] = useState({});
  const [taskNotes, setTaskNotes] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({ first_trimester: true });
  const [completedGear, setCompletedGear] = useState({});
  const [gearNotes, setGearNotes] = useState({});
  const [expandedGearCats, setExpandedGearCats] = useState({ must_have: true });
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [newDiaryText, setNewDiaryText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState({ g_early: true });

  const [weightRecords, setWeightRecords] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [hospitalQuestions, setHospitalQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [contractions, setContractions] = useState([]);
  const [currentContraction, setCurrentContraction] = useState(null);
  const [now, setNow] = useState(Date.now());

  const mergeData = (initial, saved) => {
    if (!saved) return initial;
    return initial.map(initCat => {
      const savedCat = saved.find(c => c.id === initCat.id);
      if (!savedCat) return initCat;
      const mergedTasks = [...savedCat.tasks];
      initCat.tasks.forEach(initTask => { if (!mergedTasks.find(t => t.id === initTask.id)) mergedTasks.push(initTask); });
      return { ...savedCat, tasks: mergedTasks };
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else if (typeof __firebase_config !== 'undefined') await signInAnonymously(auth);
      } catch (e) { console.error(e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setAuthLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.isAnonymous) return;
    const stateDocRef = doc(db, 'artifacts', environmentAppId, 'users', user.uid, 'appData', 'state');
    const unsubState = onSnapshot(stateDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedTasks(data.tasks || {}); setTaskNotes(data.notes || {});
        setCompletedGear(data.completedGear || {}); setGearNotes(data.gearNotes || {});
        if(data.dueDate !== undefined) setDueDate(data.dueDate);
        setChecklistData(mergeData(INITIAL_CHECKLIST, data.checklistData));
        setGearData(mergeData(INITIAL_GEAR, data.gearData));
        setWeightRecords(data.weightRecords || []);
        setHospitalQuestions(data.hospitalQuestions || []);
        setContractions(data.contractions || []);
        setCurrentContraction(data.currentContraction || null);
      }
    });
    const diaryColRef = collection(db, 'artifacts', environmentAppId, 'users', user.uid, 'diary_entries');
    const unsubDiary = onSnapshot(diaryColRef, (snapshot) => {
      const entries = []; snapshot.forEach(doc => entries.push({ id: doc.id, ...doc.data() }));
      entries.sort((a, b) => b.createdAt - a.createdAt); setDiaryEntries(entries);
    });
    return () => { unsubState(); unsubDiary(); };
  }, [user]);

  const saveStateToCloud = async (updates) => {
    if (!user || user.isAnonymous) return;
    try { await setDoc(doc(db, 'artifacts', environmentAppId, 'users', user.uid, 'appData', 'state'), updates, { merge: true }); } catch (e) { console.error(e); }
  };

  const handleGoogleLogin = async () => {
    if (typeof __firebase_config === 'undefined' && (firebaseConfig.apiKey.includes("본인의"))) {
      setModalContent({ title: "설정 안내", text: <p>VS Code의 <b>firebaseConfig</b> 영역에 본인의 정보를 입력해주세요!</p> });
      return;
    }
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { console.error(e); }
  };

  const toggleTask = (taskId) => { const newTasks = { ...completedTasks, [taskId]: !completedTasks[taskId] }; setCompletedTasks(newTasks); saveStateToCloud({ tasks: newTasks }); };
  const toggleGear = (taskId) => { const newGear = { ...completedGear, [taskId]: !completedGear[taskId] }; setCompletedGear(newGear); saveStateToCloud({ completedGear: newGear }); };
  const handleNoteBlur = (taskId, val, type='checklist') => {
    if (type === 'checklist') { const n = { ...taskNotes, [taskId]: val }; setTaskNotes(n); saveStateToCloud({ notes: n }); }
    else { const n = { ...gearNotes, [taskId]: val }; setGearNotes(n); saveStateToCloud({ gearNotes: n }); }
  };
  const saveDueDate = (dateStr) => { setDueDate(dateStr); setIsEditingDueDate(false); saveStateToCloud({ dueDate: dateStr }); };
  const addWeight = (e) => {
    e.preventDefault(); if(!newWeight) return;
    const r = [...weightRecords, { id: Date.now(), weight: parseFloat(newWeight), date: Date.now() }];
    setWeightRecords(r); saveStateToCloud({ weightRecords: r }); setNewWeight('');
  };
  const handleAddDiary = async (e) => {
    e.preventDefault(); if (!newDiaryText.trim()) return;
    await addDoc(collection(db, 'artifacts', environmentAppId, 'users', user.uid, 'diary_entries'), { text: newDiaryText.trim(), createdAt: Date.now(), authorName: user.displayName || '부모님' });
    setNewDiaryText('');
  };

  // --- 데이터 백업 로직 복구 ---
  const handleBackup = () => {
    let backupText = `=== 👶 ReadyBaby 기록 백업 ===\n다운로드: ${new Date().toLocaleString('ko-KR')}\n\n[📝 임신 체크리스트]\n`;
    checklistData.forEach(cat => {
      backupText += `\n* ${cat.title}\n`;
      cat.tasks.forEach(t => { backupText += `  [${completedTasks[t.id] ? '✓' : ' '}] ${t.title}${taskNotes[t.id] ? ` (메모: ${taskNotes[t.id]})` : ''}\n`; });
    });
    backupText += `\n=======================================\n\n[🛒 필수 육아/산모템]\n`;
    gearData.forEach(cat => {
      backupText += `\n* ${cat.title}\n`;
      cat.tasks.forEach(t => { backupText += `  [${completedGear[t.id] ? '✓' : ' '}] ${t.title}${gearNotes[t.id] ? ` (메모: ${gearNotes[t.id]})` : ''}\n`; });
    });
    backupText += `\n=======================================\n\n[📖 임신 일기장]\n\n`;
    [...diaryEntries].sort((a,b) => a.createdAt - b.createdAt).forEach(entry => {
      backupText += `[${new Date(entry.createdAt).toLocaleString()} | 작성: ${entry.authorName || '가족'}]\n${entry.text}\n\n`;
    });
    const blob = new Blob([backupText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `ReadyBaby_백업.txt`; link.click();
  };

  const getPregnancyInfo = () => {
    if (!dueDate) return { text: '예정일 설정' };
    const diff = Math.ceil((new Date(dueDate) - new Date().setHours(0,0,0,0)) / (1000*60*60*24));
    const weeks = Math.floor((280 - diff) / 7);
    const fruit = weeks < 12 ? '🍓' : weeks < 16 ? '🍋' : weeks < 24 ? '🍌' : weeks < 32 ? '🍍' : '🍉';
    return { text: diff === 0 ? '출산 예정일!' : `D-${diff} (${weeks}주차)`, fruit };
  };

  const Modal = ({ title, content, action, onClose }) => (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-slate-600 leading-relaxed">{content}</div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          {action ? (
            <><button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl">취소</button>
            <button onClick={action} className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl">확인</button></>
          ) : <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl">확인</button>}
        </div>
      </div>
    </div>
  );

  const formatTimer = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  };

  const handleTimerAction = () => {
    if (currentContraction) {
      const end = Date.now();
      const r = [{ start: currentContraction, end, duration: end - currentContraction }, ...contractions];
      setContractions(r); setCurrentContraction(null); saveStateToCloud({ contractions: r, currentContraction: null });
    } else {
      const start = Date.now(); setCurrentContraction(start); saveStateToCloud({ currentContraction: start });
    }
  };

  const TERMS_TEXT = ( <div className="space-y-4 text-sm"><p>1. <b>ReadyBaby</b>는 예비 부모를 위한 개인 프로젝트입니다.</p><p>2. 모든 데이터는 클라우드 데이터베이스에 저장됩니다.</p><p>3. 개인 개발 운영이므로 중요 기록은 주기적으로 백업해주세요.</p></div> );
  const DISCLAIMER_TEXT = ( <div className="space-y-4 text-sm"><p>1. 제공되는 임신 정보 및 혜택은 일반적 가이드이며 의학적 판단을 대신하지 않습니다.</p><p>2. 건강 관련 이슈는 반드시 전문의와 상담하세요.</p></div> );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">ReadyBaby 준비 중...</div>;

  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        {modalContent && <Modal title={modalContent.title} content={modalContent.text} onClose={() => setModalContent(null)} />}
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center border border-slate-100">
          <Baby className="w-16 h-16 text-rose-500 mx-auto mb-5" />
          <h1 className="text-3xl font-black text-slate-800 mb-2">ReadyBaby</h1>
          <p className="text-slate-500 text-sm mb-10">부부가 함께 공유하는 실시간 출산 준비장</p>
          <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm">
            <svg style={{width:'24px',height:'24px'}} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  const p = getPregnancyInfo();
  const prog = Math.round((Object.values(completedTasks).filter(Boolean).length / INITIAL_CHECKLIST.reduce((a,c)=>a+c.tasks.length,0)) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {modalContent && <Modal title={modalContent.title} content={modalContent.text} action={modalContent.action} onClose={() => setModalContent(null)} />}
      
      {isTimerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in">
          <button onClick={()=>setIsTimerOpen(false)} className="absolute top-6 right-6 text-slate-400"><X className="w-8 h-8"/></button>
          <h2 className="text-2xl font-black text-white mb-10">진통 측정기</h2>
          <button onClick={handleTimerAction} className={`w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all ${currentContraction ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}>
            <span className="text-white font-black text-2xl">{currentContraction ? '진통 멈춤' : '진통 시작'}</span>
            {currentContraction && <span className="text-rose-100 font-mono text-xl mt-2">{formatTimer(now-currentContraction)}</span>}
          </button>
          <div className="mt-10 w-full max-w-sm max-h-[30vh] overflow-y-auto space-y-2">
            {contractions.map((c, i) => <div key={i} className="bg-slate-800 p-3 rounded-xl flex justify-between text-white text-sm"><span>진통 시작: {new Date(c.start).toLocaleTimeString()}</span><span className="font-bold text-rose-400">{formatTimer(c.duration)} 지속</span></div>)}
          </div>
        </div>
      )}

      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100 px-5 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2"><Baby className="w-6 h-6 text-rose-500" /> ReadyBaby</h1>
            <div className="flex items-center gap-2 mt-1">
              <span onClick={()=>setIsEditingDueDate(true)} className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg cursor-pointer">📅 {p.text}</span>
              {p.fruit && <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">{p.fruit} 아기 성장 중</span>}
            </div>
            {isEditingDueDate && <input type="date" className="mt-2 text-xs border rounded-lg p-1" onChange={(e)=>saveDueDate(e.target.value)} onBlur={()=>setIsEditingDueDate(false)} autoFocus />}
          </div>
          <button onClick={()=>setIsTimerOpen(true)} className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Timer className="w-6 h-6 text-rose-500"/></button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        {activeTab === 'checklist' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-gradient-to-br from-rose-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-rose-100">
              <div className="flex justify-between items-end mb-2"><span className="text-sm font-medium">체크리스트 완료도</span><span className="text-4xl font-black">{prog}%</span></div>
              <div className="bg-white/20 h-2 rounded-full overflow-hidden"><div className="bg-white h-full transition-all duration-1000" style={{width:`${prog}%`}}></div></div>
            </div>
            {checklistData.map(cat => (
              <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className={`p-4 flex items-center justify-between cursor-pointer ${cat.color}`} onClick={()=>setExpandedCategories(v=>({...v,[cat.id]:!v[cat.id]}))}>
                  <div className="flex items-center gap-3"><div className="bg-white/80 p-2 rounded-xl">{cat.icon}</div><span className="font-bold">{cat.title}</span></div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategories[cat.id]?'rotate-180':''}`}/>
                </div>
                {expandedCategories[cat.id] && <div className="p-3 space-y-2">
                  {cat.tasks.map(t => (
                    <div key={t.id} className={`p-4 rounded-2xl border transition-all ${completedTasks[t.id]?'bg-slate-50 border-transparent opacity-60':'bg-white border-slate-100'}`}>
                      <div className="flex gap-3">
                        <button onClick={()=>toggleTask(t.id)}><CheckCircle2 className={`w-7 h-7 ${completedTasks[t.id]?'text-emerald-500':'text-slate-200'}`}/></button>
                        <div className="flex-1">
                          <p className={`font-bold text-[15px] ${completedTasks[t.id]?'line-through text-slate-400':''}`}>{t.title}</p>
                          <input type="text" className="w-full mt-2 text-xs text-slate-500 outline-none bg-transparent" placeholder="메모 남기기..." defaultValue={taskNotes[t.id]||''} onBlur={(e)=>handleNoteBlur(t.id, e.target.value)}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'baby_gear' && (
          <div className="space-y-4 animate-in fade-in">
            {gearData.map(cat => (
              <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className={`p-4 flex items-center justify-between cursor-pointer ${cat.color}`} onClick={()=>setExpandedGearCats(v=>({...v,[cat.id]:!v[cat.id]}))}>
                  <div className="flex items-center gap-3"><div className="bg-white/80 p-2 rounded-xl">{cat.icon}</div><span className="font-bold">{cat.title}</span></div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedGearCats[cat.id]?'rotate-180':''}`}/>
                </div>
                {expandedGearCats[cat.id] && <div className="p-3 space-y-2">
                  {cat.tasks.map(t => (
                    <div key={t.id} className={`p-4 rounded-2xl border transition-all ${completedGear[t.id]?'bg-slate-50 border-transparent opacity-60':'bg-white border-slate-100'}`}>
                      <div className="flex gap-3">
                        <button onClick={()=>toggleGear(t.id)}><CheckCircle2 className={`w-7 h-7 ${completedGear[t.id]?'text-emerald-500':'text-slate-200'}`}/></button>
                        <div className="flex-1">
                          <p className={`font-bold text-[15px] ${completedGear[t.id]?'line-through text-slate-400':''}`}>{t.title}</p>
                          <input type="text" className="w-full mt-2 text-xs text-slate-500 outline-none bg-transparent" placeholder="브랜드 등 메모..." defaultValue={gearNotes[t.id]||''} onBlur={(e)=>handleNoteBlur(t.id, e.target.value, 'gear')}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 px-1 mb-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-black text-slate-800">임신 시기별 가이드</h2>
            </div>
            {GUIDE_DATA.map(section => (
              <div key={section.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className={`p-5 flex items-center justify-between cursor-pointer ${section.color}`} onClick={()=>setExpandedGuide(v=>({...v,[section.id]:!v[section.id]}))}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/90 p-2.5 rounded-2xl shadow-sm text-slate-700">{section.icon}</div>
                    <div>
                      <p className="font-black text-lg">{section.title}</p>
                      <p className="text-xs opacity-80">{section.subtitle}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 opacity-50 transition-transform ${expandedGuide[section.id]?'rotate-180':''}`}/>
                </div>
                {expandedGuide[section.id] && (
                  <div className="p-5 space-y-5 divide-y divide-slate-50">
                    {section.tips.map((tip, idx) => (
                      <div key={idx} className={idx !== 0 ? "pt-4" : ""}>
                        <h4 className="font-bold text-[15px] text-slate-800 mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {tip.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed break-keep ml-5">{tip.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4 animate-in fade-in">
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5 font-black text-slate-800"><Scale className="w-5 h-5 text-purple-600" /> 산모 체중 기록</div>
              <form onSubmit={addWeight} className="flex gap-2 mb-5">
                <input type="number" step="0.1" value={newWeight} onChange={(e)=>setNewWeight(e.target.value)} placeholder="00.0" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none" />
                <button type="submit" className="bg-purple-500 text-white font-bold px-5 rounded-2xl active:scale-95 transition-all">기록</button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {weightRecords.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">{r.weight}kg</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* --- 일기 & 설정 탭 (기능 복구 완료) --- */}
        {activeTab === 'more' && (
          <div className="space-y-6 animate-in fade-in">
             <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 font-black text-slate-800"><BookHeart className="w-5 h-5 text-rose-500" /> 임신 일기</div>
              <textarea value={newDiaryText} onChange={(e)=>setNewDiaryText(e.target.value)} placeholder="아기에게 하고 싶은 말..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-rose-200" rows="3" />
              <button onClick={handleAddDiary} className="w-full mt-2 bg-slate-800 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all">일기 저장</button>
              <div className="mt-6 space-y-3">
                {diaryEntries.map(e => (
                  <div key={e.id} className="bg-slate-50 p-4 rounded-2xl relative group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-1 rounded-lg">{new Date(e.createdAt).toLocaleDateString()}</span>
                       <button onClick={() => window.confirm('삭제할까요?') && deleteDoc(doc(db, 'artifacts', environmentAppId, 'users', user.uid, 'diary_entries', e.id))} className="text-slate-300 hover:text-red-500 transition-opacity"><Trash2 size={14}/></button>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{e.text}</p>
                  </div>
                ))}
              </div>
             </section>

             <div className="space-y-3">
                <button onClick={() => {
                  setModalContent({ title: '지원 혜택 안내', text: <div className="space-y-4">{BENEFITS_DATA.map((b,i)=>(<div key={i}><p className="font-bold text-slate-800">· {b.title}</p><p className="text-xs text-slate-500 mb-1">{b.content}</p><p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg">{b.apply}</p></div>))}</div> });
                }} className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-600 active:bg-slate-50"><Coins className="w-5 h-5 text-amber-500" /> 정부 지원 혜택 확인</button>
                
                <button onClick={handleBackup} className="w-full py-4 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-md"><Download className="w-5 h-5" /> 내 데이터 백업하기 (TXT)</button>

                {/* --- 개발자 후원 섹션 복구 --- */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4"><Coffee className="w-6 h-6 text-amber-400" /><h3 className="text-lg font-black tracking-tight">개발자 응원하기</h3></div>
                  <p className="text-[13px] text-slate-300 leading-relaxed mb-6 break-keep">ReadyBaby는 광고 없이 운영되는 무료 개인 프로젝트입니다. 유용하게 사용하하셨다면 개발자에게 따뜻한 커피 한 잔을 선물해주세요! ☕️</p>
                  <button onClick={() => window.open('https://qr.kakaopay.com/Ej80O3SQW', '_blank')} className="w-full py-4 bg-amber-400 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-lg shadow-amber-400/20">커피 한 잔 후원하기</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setModalContent({title: '이용약관', text: TERMS_TEXT})} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-2 active:bg-slate-50 transition-all"><ShieldCheck className="w-5 h-5 text-slate-400" /><span className="text-[11px] font-bold text-slate-600">이용약관</span></button>
                  <button onClick={() => setModalContent({title: '책임 제한 안내', text: DISCLAIMER_TEXT})} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-2 active:bg-slate-50 transition-all"><AlertCircle className="w-5 h-5 text-slate-400" /><span className="text-[11px] font-bold text-slate-600">디클레이머</span></button>
                </div>
                
                <button onClick={() => {
                    setModalContent({ title: '로그아웃', text: <p>정말 로그아웃 하시겠습니까?</p>, action: () => signOut(auth).then(()=>setModalContent(null)) });
                }} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold active:bg-slate-200 text-xs">로그아웃</button>

                <div className="text-center pb-8 pt-2"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 ReadyBaby. Developed by Park Geunhong</p></div>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 pb-safe shadow-2xl">
        <div className="max-w-md mx-auto flex justify-around items-center py-2 px-1">
          {[
            { id: 'checklist', label: '체크리스트', icon: <ListTodo className="w-6 h-6" /> },
            { id: 'baby_gear', label: '육아템', icon: <ShoppingBag className="w-6 h-6" /> },
            { id: 'guide', label: '가이드', icon: <Lightbulb className="w-6 h-6" /> },
            { id: 'health', label: '건강수첩', icon: <Activity className="w-6 h-6" /> },
            { id: 'more', label: '일기/설정', icon: <BookHeart className="w-6 h-6" /> }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex flex-col items-center justify-center w-full py-1 gap-1 active:scale-90 transition-all ${activeTab === tab.id ? 'text-rose-500' : 'text-slate-300'}`}
            >
              <div className={`${activeTab === tab.id ? 'bg-rose-50 p-2 rounded-2xl' : 'p-2'}`}>{tab.icon}</div>
              <span className={`text-[9px] font-black ${activeTab === tab.id ? 'text-rose-600' : 'text-slate-400'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}