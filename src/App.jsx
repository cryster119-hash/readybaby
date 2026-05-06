import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Baby, CalendarHeart, Gift, Stethoscope, 
  ChevronDown, ChevronUp, BookHeart, ListTodo, Send, Trash2, 
  Heart, Download, Info, ShoppingBag, Coins, MessageSquareText, 
  CalendarDays, Star, Plus, X, Timer, Scale, ClipboardList, Play, Square, Activity, LogOut, Coffee, ShieldCheck, AlertCircle, HandHeart
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// --- [환경 자동 감지 Firebase 설정] ---
const firebaseConfig = {
  apiKey: "AIzaSyAkzmoK1dQrxfXFiPVnhhfUvRITM3nM3g4",
  authDomain: "readybaby-bd5bb.firebaseapp.com",
  projectId: "readybaby-bd5bb",
  storageBucket: "readybaby-bd5bb.firebasestorage.app",
  messagingSenderId: "630742601183",
  appId: "1:630742601183:web:559618f9647db8beac086a",
  measurementId: "G-11K09F8QFY"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : localFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const environmentAppId = typeof __app_id !== 'undefined' ? __app_id : 'readybaby-app';

// --- 초기 데이터셋 (체크리스트) ---
const INITIAL_CHECKLIST = [
  { id: 'first_trimester', title: '임신 초기 (확인 ~ 12주)', icon: <CalendarHeart className="w-5 h-5" />, color: 'bg-rose-50 border-rose-200 text-rose-800', tasks: [{ id: 't1', title: '산부인과 검진 및 임신확인서 발급', desc: '아기집 확인 후 바우처 신청을 위한 확인서 수령.', isCustom: false }, { id: 't2', title: '국민행복카드 신청', desc: '정부 지원금을 위한 카드 발급.', isCustom: false }, { id: 't3', title: '보건소 임산부 등록 및 엽산 수령', desc: '엽산제 수령, 뱃지, 주차증 발급.', isCustom: false }, { id: 't_new1', title: '입덧약 처방 (필요시)', desc: '심할 경우 병원에서 약을 처방받으세요.', isCustom: false }, { id: 't4', title: '태아보험 가입 상담', desc: '1차 기형아 검사 전(11-12주) 가입 권장.', isCustom: false }, { id: 't5', title: '산후조리원 예약', desc: '인기 있는 곳은 마감이 빠릅니다.', isCustom: false }, { id: 't6', title: '임신기 근로시간 단축 신청', desc: '12주 이내 직장인 2시간 단축 권리 행사.', isCustom: false }] },
  { id: 'second_trimester', title: '임신 중기 (13주 ~ 27주)', icon: <Stethoscope className="w-5 h-5" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', tasks: [{ id: 't7', title: '철분제 복용 시작', desc: '16주부터 철분제 필수 복용.', isCustom: false }, { id: 't_new2', title: '튼살크림/오일 마사지 시작', desc: '아침저녁으로 보습을 충분히 해주세요.', isCustom: false }, { id: 't8', title: '정밀 초음파 및 1/2차 기형아 검사', desc: '목투명대 검사 및 태아 장기 형성 확인.', isCustom: false }, { id: 't9', title: '임신성 당뇨(임당) 검사', desc: '24~28주 사이 진행.', isCustom: false }, { id: 't_new3', title: '의료용 압박스타킹 처방', desc: '병원에서 보험 적용받아 구입하세요.', isCustom: false }, { id: 't10', title: '치과 검진 (스케일링)', desc: '안정기일 때 예방 치료 권장.', isCustom: false }, { id: 't11', title: '태교 여행 및 만삭사진', desc: '무리 없는 선에서 추억 남기기.', isCustom: false }] },
  { id: 'third_trimester', title: '임신 후기 (28주 ~ 출산)', icon: <Baby className="w-5 h-5" />, color: 'bg-blue-50 border-blue-200 text-blue-800', tasks: [{ id: 't12', title: '백일해 백신 접종', desc: '27~36주 사이 부부 필수 접종.', isCustom: false }, { id: 't13', title: '아기 용품 세탁 및 소독', desc: '미리 세탁하여 지퍼백 보관.', isCustom: false }, { id: 't_new4', title: '산모 출산 가방(캐리어) 싸기', desc: '34주부터 병원/조리원 짐 싸기.', isCustom: false }, { id: 't15', title: '산후도우미 정부지원 신청', desc: '출산 예정일 40일 전부터 보건소/복지로 신청.', isCustom: false }, { id: 't_new5', title: '신생아 심폐소생술/교육', desc: '응급처치법을 익혀두세요.', isCustom: false }, { id: 't16', title: '막달 검사 및 호흡법 연습', desc: '심전도, 피검사 및 라마즈 연습.', isCustom: false }] }
];

// --- 초기 데이터셋 (육아템 + 산모용품 통합) ---
const INITIAL_GEAR = [
  { id: 'must_have', title: '1순위. 수유 & 위생 (절대 필수)', icon: <Star className="w-5 h-5" fill="currentColor" />, color: 'bg-amber-50 border-amber-200 text-amber-800', tasks: [{ id: 'g_br', title: '브라운 귀적외선 체온계', desc: '6520 모델 추천. 발열은 응급상황입니다.', isCustom: false }, { id: 'g_f1', title: '분유 제조기 / 자동 분유포트', desc: '새벽 수유 피로도를 줄여주는 1등 공신.', isCustom: false }, { id: 'g_f2', title: '젖병 소독기 & 젖병', desc: 'UV소독기 및 배앓이 방지 젖병 혼합.', isCustom: false }, { id: 'g_h1', title: '기저귀 갈이대', desc: '엄마 아빠의 허리를 지켜줍니다.', isCustom: false }, { id: 'g_h2', title: '아기 욕조 2개', desc: '씻기용과 헹굼용.', isCustom: false }, { id: 'g_c1', title: '밤부 가제손수건 40장', desc: '먼지가 적은 밤부 소재 엠보/거즈 혼합.', isCustom: false }] },
  { id: 'quality_of_life', title: '2순위. 수면 & 진정 (삶의 질 상승)', icon: <Heart className="w-5 h-5" fill="currentColor" />, color: 'bg-rose-50 border-rose-200 text-rose-800', tasks: [{ id: 'g_s1', title: '스와들업 (모로반사 방지)', desc: '놀라 깨는 것을 막아주는 수면 조끼.', isCustom: false }, { id: 'g_s2', title: '역류방지쿠션 (역방쿠)', desc: '수유 후 게워냄을 방지합니다.', isCustom: false }, { id: 'g_s3', title: '아기 침대 / 범퍼 침대', desc: '100일까지는 가드형 높은 침대를 추천합니다.', isCustom: false }, { id: 'g_h3', title: '자동 콧물 흡입기 (노시부 등)', desc: '감기 걸렸을 때 최고의 육아템.', isCustom: false }] },
  { id: 'outdoor', title: '3순위. 외출 & 이동 장비', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', tasks: [{ id: 'g_o1', title: '신생아 카시트 (바구니형 등)', desc: '조리원 퇴원 시 법적으로 필수입니다.', isCustom: false }, { id: 'g_o2', title: '아기띠 / 슬링', desc: '초기엔 슬링, 목 가눈 후엔 힙시트 아기띠.', isCustom: false }, { id: 'g_o3', title: '유모차 (디럭스 / 절충형)', desc: '라이프스타일에 맞게 절충형과 비교하세요.', isCustom: false }] },
  { id: 'clothing', title: '4순위. 기본 의류 & 스킨케어', icon: <Baby className="w-5 h-5" />, color: 'bg-cyan-50 border-cyan-200 text-cyan-800', tasks: [{ id: 'g_c2', title: '배냇저고리 & 우주복', desc: '선물로 많이 들어오니 처음부터 너무 많이 사지 마세요.', isCustom: false }, { id: 'g_c3', title: '신생아 기저귀', desc: '1단계는 금방 작아지니 1~2팩만 미리 준비.', isCustom: false }, { id: 'g_c4', title: '아기 로션/수딩젤 & 워시', desc: '태열 관리를 위한 수딩젤과 고보습 로션.', isCustom: false }] },
  { id: 'maternity', title: '5순위. 산모 용품 (출산 가방)', icon: <Gift className="w-5 h-5" />, color: 'bg-purple-50 border-purple-200 text-purple-800', tasks: [{ id: 'g_m1', title: '맘스팬티 / 산모패드', desc: '출산 후 오로 배출 대비 필수품. (넉넉히 준비)', isCustom: false }, { id: 'g_m2', title: '수유브라 / 수유나시', desc: '수유하기 편하고 압박 없는 사이즈로 3~4벌.', isCustom: false }, { id: 'g_m3', title: '손목/발목 보호대', desc: '육아와 모유수유로 약해진 관절 보호 필수.', isCustom: false }, { id: 'g_m4', title: '산모용 물티슈 (마이비데)', desc: '화장실 처리용으로 매우 유용합니다.', isCustom: false }, { id: 'g_m5', title: '텀블러 & 구부러지는 빨대', desc: '누워서 물 마실 때 없어서는 안 될 병원 필수템.', isCustom: false }, { id: 'g_m6', title: '철분제 & 영양제', desc: '출산 후에도 빈혈 예방을 위해 꾸준히 복용해야 합니다.', isCustom: false }] }
];

const BENEFITS_DATA = [
  { title: '임신·출산 진료비 바우처', content: '산부인과, 약국 결제용 바우처. 단태아 100만원, 다태아 140만원 지원', apply: '임신확인서 발급 후, [정부24] 또는 이용할 카드사 앱에서 "국민행복카드"를 발급받으며 동시 신청.' },
  { title: '보건소 임산부 혜택', content: '엽산제/철분제, 임산부 뱃지, 주차 스티커 제공 및 보건소 산전 검사 무료 지원.', apply: '신분증과 임신확인서를 지참하여 관할 보건소 방문 또는 [정부24] "맘편한 임신 원스톱 서비스"로 온라인 신청(택배수령).' },
  { title: '첫만남 이용권', content: '초기 양육비 부담 완화를 위한 바우처 (첫째 200만원, 둘째 이상 300만원).', apply: '출생신고 시 주민센터에서 한 번에 신청(행복출산 원스톱 서비스)하거나, [복지로]에서 온라인 신청.' },
  { title: '부모급여 및 아동수당', content: '부모급여(0세 월 100만원, 1세 월 50만원) 및 아동수당(만 8세 미만 월 10만원) 지급.', apply: '출생신고 후 주민센터 통합 신청 또는 [복지로] 사이트에서 계좌번호 등록 신청.' },
  { title: '산후도우미 (건강관리 지원)', content: '산모 회복과 신생아 돌봄을 위한 건강관리사 파견 바우처.', apply: '출산 예정일 40일 전~출산 후 30일 이내 관할 보건소 방문 또는 [복지로] 신청.' },
  { title: '한전 전기요금 할인', content: '출생일로부터 3년간 매월 전기요금 30% 할인 (월 최대 16,000원 한도)', apply: '출생신고 후 [📞123] 한국전력에 전화 신청 또는 [한전ON] 앱에서 신청.' }
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
  const [newTaskInput, setNewTaskInput] = useState({ categoryId: null, title: '', desc: '', type: 'checklist' });

  // 건강 수첩
  const [weightRecords, setWeightRecords] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [hospitalQuestions, setHospitalQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  // 진통 타이머
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [contractions, setContractions] = useState([]);
  const [currentContraction, setCurrentContraction] = useState(null);
  const [now, setNow] = useState(Date.now());

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // --- 데이터 병합 유틸 ---
  const mergeData = (initialData, savedData) => {
    if (!savedData) return initialData;
    return initialData.map(initCat => {
      const savedCat = savedData.find(c => c.id === initCat.id);
      if (!savedCat) return initCat;
      const mergedTasks = [...savedCat.tasks];
      initCat.tasks.forEach(initTask => {
        if (!mergedTasks.find(t => t.id === initTask.id)) mergedTasks.push(initTask);
      });
      return { ...savedCat, tasks: mergedTasks };
    });
  };

  // --- 구글 로그인 ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined') {
        if (__initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    if(window.confirm('로그아웃 하시겠습니까?')) {
      try { await signOut(auth); } catch (error) { console.error(error); }
    }
  };

  useEffect(() => {
    let interval;
    if (currentContraction) interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [currentContraction]);

  // --- 데이터 동기화 (Firestore) ---
  useEffect(() => {
    if (!user) return;
    const stateDocRef = doc(db, 'artifacts', environmentAppId, 'users', user.uid, 'appData', 'state');
    const unsubState = onSnapshot(stateDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedTasks(data.tasks || {}); setTaskNotes(data.notes || {});
        setCompletedGear(data.completedGear || {}); setGearNotes(data.gearNotes || {});
        if(data.dueDate !== undefined) setDueDate(data.dueDate);
        setChecklistData(mergeData(INITIAL_CHECKLIST, data.checklistData));
        setGearData(mergeData(INITIAL_GEAR, data.gearData));
        if(data.weightRecords) setWeightRecords(data.weightRecords);
        if(data.hospitalQuestions) setHospitalQuestions(data.hospitalQuestions);
        if(data.contractions) setContractions(data.contractions);
        if(data.currentContraction !== undefined) setCurrentContraction(data.currentContraction);
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
    if (!user) return;
    try { await setDoc(doc(db, 'artifacts', environmentAppId, 'users', user.uid, 'appData', 'state'), updates, { merge: true }); } 
    catch (error) { console.error(error); }
  };

  // --- 각종 기능 핸들러 ---
  const handleAddCustomTask = () => {
    if(!newTaskInput.title.trim()) return;
    const newTask = { id: `custom_${Date.now()}`, title: newTaskInput.title.trim(), desc: newTaskInput.desc.trim(), isCustom: true };
    if (newTaskInput.type === 'checklist') {
      const updatedData = checklistData.map(cat => cat.id === newTaskInput.categoryId ? { ...cat, tasks: [...cat.tasks, newTask] } : cat);
      setChecklistData(updatedData); saveStateToCloud({ checklistData: updatedData });
    } else {
      const updatedData = gearData.map(cat => cat.id === newTaskInput.categoryId ? { ...cat, tasks: [...cat.tasks, newTask] } : cat);
      setGearData(updatedData); saveStateToCloud({ gearData: updatedData });
    }
    setNewTaskInput({ categoryId: null, title: '', desc: '', type: 'checklist' }); 
  };

  const handleDeleteCustomTask = (type, categoryId, taskId) => {
    setModalContent({
      title: '항목 삭제', text: <p>직접 추가한 이 항목을 삭제하시겠습니까?</p>,
      action: () => {
        if (type === 'checklist') {
          const updatedData = checklistData.map(cat => cat.id === categoryId ? { ...cat, tasks: cat.tasks.filter(t => t.id !== taskId) } : cat);
          setChecklistData(updatedData);
          const newCompleted = {...completedTasks}; delete newCompleted[taskId];
          const newNotes = {...taskNotes}; delete newNotes[taskId];
          setCompletedTasks(newCompleted); setTaskNotes(newNotes);
          saveStateToCloud({ checklistData: updatedData, tasks: newCompleted, notes: newNotes });
        } else {
          const updatedData = gearData.map(cat => cat.id === categoryId ? { ...cat, tasks: cat.tasks.filter(t => t.id !== taskId) } : cat);
          setGearData(updatedData);
          const newCompleted = {...completedGear}; delete newCompleted[taskId];
          const newNotes = {...gearNotes}; delete newNotes[taskId];
          setCompletedGear(newCompleted); setGearNotes(newNotes);
          saveStateToCloud({ gearData: updatedData, completedGear: newCompleted, gearNotes: newNotes });
        }
        setModalContent(null);
      }
    });
  };

  const toggleTask = (taskId) => { const newTasks = { ...completedTasks, [taskId]: !completedTasks[taskId] }; setCompletedTasks(newTasks); saveStateToCloud({ tasks: newTasks }); };
  const handleNoteBlur = (taskId, noteValue) => { const newNotes = { ...taskNotes, [taskId]: noteValue }; setTaskNotes(newNotes); saveStateToCloud({ notes: newNotes }); };
  const toggleGear = (taskId) => { const newGear = { ...completedGear, [taskId]: !completedGear[taskId] }; setCompletedGear(newGear); saveStateToCloud({ completedGear: newGear }); };
  const handleGearNoteBlur = (taskId, noteValue) => { const newNotes = { ...gearNotes, [taskId]: noteValue }; setGearNotes(newNotes); saveStateToCloud({ gearNotes: newNotes }); };
  const saveDueDate = (dateStr) => { setDueDate(dateStr); setIsEditingDueDate(false); saveStateToCloud({ dueDate: dateStr }); };
  const handleAddDiary = async (e) => {
    e.preventDefault(); if (!user || !newDiaryText.trim()) return;
    await addDoc(collection(db, 'artifacts', environmentAppId, 'users', user.uid, 'diary_entries'), { text: newDiaryText.trim(), createdAt: Date.now(), authorId: user.uid, authorName: user.displayName || '부모님' });
    setNewDiaryText('');
  };
  const addWeight = (e) => {
    e.preventDefault(); if(!newWeight || isNaN(newWeight)) return;
    const newRecords = [...weightRecords, { id: Date.now(), weight: parseFloat(newWeight), date: Date.now() }];
    setWeightRecords(newRecords); saveStateToCloud({ weightRecords: newRecords }); setNewWeight('');
  };
  const deleteWeight = (id) => { const newRecords = weightRecords.filter(r => r.id !== id); setWeightRecords(newRecords); saveStateToCloud({ weightRecords: newRecords }); };
  const addQuestion = (e) => {
    e.preventDefault(); if(!newQuestion.trim()) return;
    const newQs = [...hospitalQuestions, { id: Date.now(), text: newQuestion, isDone: false }];
    setHospitalQuestions(newQs); saveStateToCloud({ hospitalQuestions: newQs }); setNewQuestion('');
  };
  const toggleQuestion = (id) => { const newQs = hospitalQuestions.map(q => q.id === id ? { ...q, isDone: !q.isDone } : q); setHospitalQuestions(newQs); saveStateToCloud({ hospitalQuestions: newQs }); };
  const deleteQuestion = (id) => { const newQs = hospitalQuestions.filter(q => q.id !== id); setHospitalQuestions(newQs); saveStateToCloud({ hospitalQuestions: newQs }); };

  const handleTimerAction = () => {
    if (currentContraction) {
      const endTime = Date.now();
      const newRecord = { start: currentContraction, end: endTime, duration: endTime - currentContraction };
      const newContractions = [newRecord, ...contractions];
      setContractions(newContractions); setCurrentContraction(null); saveStateToCloud({ contractions: newContractions, currentContraction: null });
    } else {
      const startTime = Date.now();
      setCurrentContraction(startTime); saveStateToCloud({ currentContraction: startTime });
    }
  };
  const clearContractions = () => {
    setModalContent({
      title: '기록 초기화', text: <p>모든 진통 기록을 지우시겠습니까?</p>,
      action: () => { setContractions([]); setCurrentContraction(null); saveStateToCloud({ contractions: [], currentContraction: null }); setModalContent(null); }
    });
  };
  const formatTimer = (ms) => {
    if(!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getPregnancyInfo = () => {
    if (!dueDate) return { text: '예정일 설정', fruit: '', icon: '' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    const conceptionDate = new Date(due); conceptionDate.setDate(due.getDate() - 280);
    const pregnantDays = Math.floor((today - conceptionDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(pregnantDays / 7);
    let fruit = ''; let icon = '';
    if (weeks < 12) { fruit = '딸기'; icon = '🍓'; }
    else if (weeks < 16) { fruit = '레몬'; icon = '🍋'; }
    else if (weeks < 24) { fruit = '바나나'; icon = '🍌'; }
    else if (weeks < 32) { fruit = '파인애플'; icon = '🍍'; }
    else { fruit = '수박'; icon = '🍉'; }
    return { text: diffDays === 0 ? '🎉 출산 예정일!' : `D-${diffDays} (${weeks}주차)`, fruit, icon };
  };

  const handleBackup = () => {
    let backupText = `=== 👶 ReadyBaby 기록 백업 ===\n다운로드: ${new Date().toLocaleString('ko-KR')}\n\n[📝 임신 체크리스트]\n`;
    checklistData.forEach(cat => {
      backupText += `\n* ${cat.title}\n`;
      cat.tasks.forEach(t => { backupText += `  [${completedTasks[t.id] ? '✓' : ' '}] ${t.title}${taskNotes[t.id] ? ` (메모: ${taskNotes[t.id]})` : ''}\n`; });
    });
    backupText += `\n=======================================\n\n[🛒 필수 육아템]\n`;
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

  const Modal = ({ title, content, action, onClose }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto text-[15px] text-slate-600 leading-relaxed break-keep">{content}</div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          {action ? (
            <><button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl">취소</button><button onClick={action} className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl">확인</button></>
          ) : <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl">확인</button>}
        </div>
      </div>
    </div>
  );

  const TERMS_TEXT = ( <div className="space-y-4 text-sm"><p>1. <b>ReadyBaby</b>는 예비 부모를 위한 개인 프로젝트입니다.</p><p>2. 모든 데이터는 클라우드 데이터베이스에 저장됩니다.</p><p>3. 개인 개발 운영이므로 중요 기록은 주기적으로 백업해주세요.</p></div> );
  const DISCLAIMER_TEXT = ( <div className="space-y-4 text-sm"><p>1. 제공되는 임신 정보 및 혜택은 일반적 가이드이며 의학적 판단을 대신하지 않습니다.</p><p>2. 건강 관련 이슈는 반드시 전문의와 상담하세요.</p></div> );

  const pregInfo = getPregnancyInfo();
  const progressPercentage = Math.round((Object.values(completedTasks).filter(Boolean).length / checklistData.reduce((acc, cat) => acc + cat.tasks.length, 0)) * 100) || 0;
  const gearProgressPercentage = Math.round((Object.values(completedGear).filter(Boolean).length / gearData.reduce((acc, cat) => acc + cat.tasks.length, 0)) * 100) || 0;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">앱을 준비하는 중입니다...</div>;

  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl text-center border border-slate-100">
          <Baby className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-slate-800 mb-2">ReadyBaby</h1>
          <p className="text-slate-500 text-[15px] mb-10 leading-relaxed break-keep">부부가 함께 구글 계정을 공유하며<br/>꼼꼼하게 채워나가는 출산 준비</p>
          <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 break-keep relative">
      {toastMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm animate-in slide-in-from-top-4 fade-in">{toastMsg}</div>}
      {modalContent && <Modal title={modalContent.title} content={modalContent.text} action={modalContent.action} onClose={() => setModalContent(null)} />}

      {isTimerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in">
          <button onClick={() => setIsTimerOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white"><X className="w-8 h-8" /></button>
          <h2 className="text-3xl font-black text-white mb-2">진통 측정기</h2>
          <p className="text-slate-400 mb-10 text-center text-sm">초산은 진통 간격 5~10분,<br/>경산은 10~15분일 때 병원으로 가세요.</p>
          <button onClick={handleTimerAction} className={`w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${currentContraction ? 'bg-rose-500 hover:bg-rose-600 animate-pulse scale-105' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
            {currentContraction ? (
              <><Square className="w-12 h-12 text-white mb-2" fill="currentColor"/><span className="text-white font-black text-2xl">진통 멈춤</span><span className="text-rose-100 font-mono text-xl mt-2">{formatTimer(now - currentContraction)}</span></>
            ) : <><Play className="w-12 h-12 text-white mb-2" fill="currentColor"/><span className="text-white font-black text-2xl">진통 시작</span></>}
          </button>
          <div className="w-full max-w-md mt-12 bg-slate-800 rounded-3xl p-5 max-h-[30vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4"><span className="text-white font-bold">진통 기록</span>{contractions.length > 0 && <button onClick={clearContractions} className="text-xs text-slate-400 hover:text-red-400">초기화</button>}</div>
            {contractions.length === 0 ? <p className="text-slate-500 text-center py-4 text-sm">아직 기록이 없습니다.</p> : (
              <div className="space-y-3">
                {contractions.map((c, i) => {
                  const prevC = contractions[i+1]; const interval = prevC ? formatTimer(c.start - prevC.start) : '-';
                  return (
                    <div key={i} className="flex justify-between items-center bg-slate-700 p-3 rounded-xl">
                      <div className="flex flex-col"><span className="text-slate-300 text-xs">{new Date(c.start).toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'})}</span><span className="text-white font-bold mt-0.5">간격: {interval}</span></div>
                      <span className="text-rose-400 font-mono font-bold bg-slate-800 px-3 py-1.5 rounded-lg">진통 {formatTimer(c.duration)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white sticky top-0 z-20 shadow-md rounded-b-[2rem] px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              {user.photoURL ? <img src={user.photoURL} className="w-5 h-5 rounded-full"/> : <span className="text-sm">👤</span>}
              <span className="text-[13px] font-bold text-slate-700 truncate">{user.displayName || '가족'} 님의 기록장</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-bold bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-colors"><LogOut className="w-3.5 h-3.5" /> 로그아웃</button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col min-w-0 pr-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-1.5 truncate"><Baby className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 shrink-0" /> ReadyBaby</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 shrink-0">
                  <CalendarDays className="w-4 h-4 text-rose-500" />
                  {isEditingDueDate ? (
                    <input type="date" value={dueDate} onChange={(e) => saveDueDate(e.target.value)} onBlur={() => setIsEditingDueDate(false)} autoFocus className="bg-transparent text-sm font-bold text-rose-600 outline-none w-28"/>
                  ) : <span onClick={() => setIsEditingDueDate(true)} className="text-sm font-bold text-rose-600 cursor-pointer hover:opacity-70">{pregInfo.text}</span>}
                </div>
                {dueDate && pregInfo.fruit && <span className="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 text-[13px] font-bold text-amber-700 animate-in fade-in zoom-in shrink-0">{pregInfo.icon} {pregInfo.fruit}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setIsTimerOpen(true)} className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors group">
                <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 group-hover:scale-110 transition-transform" /><span className="text-[10px] font-black text-rose-600 mt-0.5">진통</span>
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            {[ { id: 'checklist', label: '임신 체크', icon: <ListTodo className="w-4 h-4" /> }, { id: 'baby_gear', label: '출산/육아템', icon: <ShoppingBag className="w-4 h-4" /> }, { id: 'health', label: '건강 수첩', icon: <Activity className="w-4 h-4" /> }, { id: 'diary', label: '임신 일기', icon: <BookHeart className="w-4 h-4" /> }, { id: 'info', label: '정보/설정', icon: <Info className="w-4 h-4" /> }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-none px-4 py-2.5 rounded-full text-[13px] sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-md scale-[1.02]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{tab.icon} {tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {activeTab === 'checklist' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-rose-500 to-purple-500 p-6 rounded-[2rem] text-white shadow-lg">
              <div className="flex justify-between items-end mb-3"><span className="text-sm font-medium opacity-90">산전 준비 완료도</span><span className="text-3xl font-black">{progressPercentage}%</span></div>
              <div className="bg-white/20 rounded-full h-3 overflow-hidden"><div className="bg-white h-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div></div>
            </div>
            {checklistData.map((category) => (
              <div key={category.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer ${category.color}`} onClick={() => setExpandedCategories(prev => ({...prev, [category.id]: !prev[category.id]}))}>
                  <div className="flex items-center gap-3"><div className="bg-white/90 p-2.5 rounded-2xl shrink-0 shadow-sm">{category.icon}</div><h2 className="font-bold text-[1.05rem] sm:text-lg pr-2 break-keep">{category.title}</h2></div>
                  <ChevronDown className={`w-5 h-5 shrink-0 opacity-70 transition-transform ${expandedCategories[category.id] ? 'rotate-180' : ''}`}/>
                </div>
                {expandedCategories[category.id] && (
                  <div className="p-3 sm:p-4 space-y-3">
                    {category.tasks.map((task) => {
                      const isChecked = completedTasks[task.id];
                      return (
                        <div key={task.id} className={`p-4 rounded-2xl border transition-all relative ${isChecked ? 'bg-slate-50 border-transparent opacity-70' : 'border-slate-100'}`}>
                          {task.isCustom && <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomTask('checklist', category.id, task.id); }} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-400 rounded-full hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>}
                          <div className="flex gap-3 sm:gap-4 items-start">
                            <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0"><CheckCircle2 className={`w-6 h-6 sm:w-7 sm:h-7 ${isChecked ? 'text-emerald-500 drop-shadow-sm' : 'text-slate-200'}`} /></button>
                            <div className="flex-1 pr-4">
                              <h3 className={`font-bold text-[15px] sm:text-base break-keep ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title} {task.isCustom && <span className="ml-2 text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full align-middle font-medium">직접 추가</span>}</h3>
                              {task.desc && <p className="text-[13px] sm:text-xs text-slate-500 mt-1.5 break-keep">{task.desc}</p>}
                               <div className="mt-3.5 flex items-center gap-2.5 bg-white rounded-xl p-2.5 border border-slate-200 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-50 transition-all shadow-sm">
                                <MessageSquareText className="w-4 h-4 text-slate-300 shrink-0" />
                                <input type="text" defaultValue={taskNotes[task.id] || ''} onBlur={(e) => handleNoteBlur(task.id, e.target.value)} placeholder="메모를 남겨보세요." className="w-full text-sm sm:text-xs text-slate-600 focus:outline-none placeholder:text-slate-300 bg-transparent truncate"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {newTaskInput.categoryId === category.id && newTaskInput.type === 'checklist' ? (
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200">
                        <input type="text" placeholder="할 일 제목" value={newTaskInput.title} onChange={(e) => setNewTaskInput({...newTaskInput, title: e.target.value})} className="w-full mb-2 p-2.5 rounded-xl border-none focus:ring-2 focus:ring-rose-300 text-sm font-bold text-slate-700" autoFocus/>
                        <div className="flex gap-2 justify-end mt-2"><button onClick={() => setNewTaskInput({categoryId: null, title: '', desc: '', type: 'checklist'})} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-rose-100 rounded-lg transition-colors">취소</button><button onClick={handleAddCustomTask} disabled={!newTaskInput.title.trim()} className="px-3 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors">저장</button></div>
                      </div>
                    ) : <button onClick={() => setNewTaskInput({categoryId: category.id, title: '', desc: '', type: 'checklist'})} className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-rose-200 transition-all"><Plus className="w-4 h-4" /> 항목 추가</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === 출산/육아템 === */}
        {activeTab === 'baby_gear' && (
           <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2rem] text-white shadow-lg">
              <div className="flex justify-between items-end mb-3"><span className="text-sm font-medium opacity-90">필수 육아템 구비율</span><span className="text-3xl font-black">{gearProgressPercentage}%</span></div>
              <div className="bg-white/20 rounded-full h-3 overflow-hidden"><div className="bg-white h-full transition-all duration-1000" style={{ width: `${gearProgressPercentage}%` }}></div></div>
            </div>
             {gearData.map((category) => (
              <div key={category.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className={`p-4 flex items-center justify-between cursor-pointer ${category.color}`} onClick={() => setExpandedGearCats(prev => ({...prev, [category.id]: !prev[category.id]}))}>
                  <div className="flex items-center gap-3"><div className="bg-white/90 p-2.5 rounded-2xl shrink-0 shadow-sm">{category.icon}</div><h2 className="font-bold text-[1.05rem]">{category.title}</h2></div>
                  <ChevronDown className={`w-5 h-5 shrink-0 opacity-70 transition-transform ${expandedGearCats[category.id] ? 'rotate-180' : ''}`}/>
                </div>
                {expandedGearCats[category.id] && (
                  <div className="p-3 sm:p-4 space-y-3">
                    {category.tasks.map((task) => {
                      const isChecked = completedGear[task.id];
                      return (
                      <div key={task.id} className={`p-4 rounded-2xl border transition-all relative ${isChecked ? 'bg-slate-50 border-transparent opacity-70' : 'border-slate-100'}`}>
                         {task.isCustom && <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomTask('gear', category.id, task.id); }} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-400 rounded-full hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>}
                         <div className="flex gap-3 sm:gap-4 items-start">
                           <button onClick={() => toggleGear(task.id)} className="mt-0.5 shrink-0"><CheckCircle2 className={`w-6 h-6 sm:w-7 sm:h-7 ${isChecked ? 'text-emerald-500 drop-shadow-sm' : 'text-slate-200'}`} /></button>
                           <div className="flex-1 pr-4">
                              <h3 className={`font-bold text-[15px] sm:text-base break-keep ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title} {task.isCustom && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full align-middle font-medium">직접 추가</span>}</h3>
                              {task.desc && <p className="text-[13px] sm:text-xs text-slate-500 mt-1.5 break-keep">{task.desc}</p>}
                              <div className="mt-3.5 flex items-center gap-2.5 bg-white rounded-xl p-2.5 border border-slate-200 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-50 transition-all shadow-sm">
                                  <MessageSquareText className="w-4 h-4 text-slate-300 shrink-0" />
                                  <input type="text" defaultValue={gearNotes[task.id] || ''} onBlur={(e) => handleGearNoteBlur(task.id, e.target.value)} placeholder="브랜드명, 당근 구매 등 메모" className="w-full text-sm sm:text-xs text-slate-600 focus:outline-none placeholder:text-slate-300 bg-transparent truncate"/>
                              </div>
                           </div>
                         </div>
                      </div>
                    )})}
                     {newTaskInput.categoryId === category.id && newTaskInput.type === 'gear' ? (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
                        <input type="text" placeholder="용품명" value={newTaskInput.title} onChange={(e) => setNewTaskInput({...newTaskInput, title: e.target.value})} className="w-full mb-2 p-2.5 rounded-xl border-none focus:ring-2 focus:ring-emerald-300 text-sm font-bold text-slate-700" autoFocus/>
                        <div className="flex gap-2 justify-end mt-2"><button onClick={() => setNewTaskInput({categoryId: null, title: '', desc: '', type: 'gear'})} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-emerald-100 rounded-lg transition-colors">취소</button><button onClick={handleAddCustomTask} disabled={!newTaskInput.title.trim()} className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors">저장</button></div>
                      </div>
                    ) : <button onClick={() => setNewTaskInput({categoryId: category.id, title: '', desc: '', type: 'gear'})} className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-200 transition-all"><Plus className="w-4 h-4" /> 항목 추가</button>}
                  </div>
                )}
              </div>
            ))}
           </div>
        )}

        {/* === 건강 수첩 === */}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4"><div className="bg-purple-100 p-2 rounded-xl"><Scale className="w-5 h-5 text-purple-600" /></div><h2 className="text-lg font-black text-slate-800">산모 체중 기록</h2></div>
              <form onSubmit={addWeight} className="flex gap-2 mb-4">
                <input type="number" step="0.1" placeholder="현재 체중 (kg)" value={newWeight} onChange={(e)=>setNewWeight(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-purple-200 outline-none" />
                <button type="submit" className="bg-purple-500 text-white font-bold px-4 rounded-xl hover:bg-purple-600 shrink-0">기록</button>
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {weightRecords.length === 0 && <p className="text-center text-slate-400 text-sm py-4">첫 체중을 기록해보세요.</p>}
                {[...weightRecords].sort((a,b)=>b.date-a.date).map((rec, i, arr) => {
                  const initialWeight = arr[arr.length-1].weight;
                  const diff = (rec.weight - initialWeight).toFixed(1);
                  return (
                    <div key={rec.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3"><span className="text-[13px] sm:text-sm text-slate-400">{new Date(rec.date).toLocaleDateString('ko-KR', {month:'short', day:'numeric'})}</span><span className="font-bold text-slate-700 text-sm sm:text-base">{rec.weight} kg</span></div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {i !== arr.length - 1 && <span className={`text-[11px] sm:text-xs font-bold px-2 py-1 rounded-lg ${diff > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{diff > 0 ? '+' : ''}{diff}kg</span>}
                        <button onClick={() => deleteWeight(rec.id)} className="text-slate-300 hover:text-red-400 p-1"><X className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
            <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3"><div className="bg-blue-100 p-2 rounded-xl"><ClipboardList className="w-5 h-5 text-blue-600" /></div><h2 className="text-lg font-black text-slate-800">병원 진료 Q&A 리스트</h2></div>
              <form onSubmit={addQuestion} className="flex gap-2 mb-4">
                <input type="text" placeholder="질문 입력" value={newQuestion} onChange={(e)=>setNewQuestion(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-200 outline-none" />
                <button type="submit" disabled={!newQuestion.trim()} className="bg-blue-500 disabled:bg-slate-300 text-white font-bold px-4 rounded-xl hover:bg-blue-600 shrink-0 transition-colors"><Plus className="w-5 h-5"/></button>
              </form>
              <div className="space-y-2">
                {hospitalQuestions.length === 0 && <p className="text-center text-slate-400 text-sm py-4">등록된 질문이 없습니다.</p>}
                {hospitalQuestions.map(q => (
                  <div key={q.id} className="flex gap-3 items-start p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl group">
                    <button onClick={() => toggleQuestion(q.id)} className="mt-0.5 shrink-0"><CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 ${q.isDone ? 'text-blue-500 drop-shadow-sm' : 'text-slate-300'}`}/></button>
                    <span className={`flex-1 text-[14px] sm:text-[15px] break-keep leading-relaxed ${q.isDone ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>{q.text}</span>
                    <button onClick={() => deleteQuestion(q.id)} className="text-slate-300 hover:text-red-400 sm:opacity-0 group-hover:opacity-100 p-1 transition-opacity"><X className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* === 임신 일기 === */}
        {activeTab === 'diary' && (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleAddDiary} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
              <textarea rows="4" value={newDiaryText} onChange={(e) => setNewDiaryText(e.target.value)} placeholder="오늘 하루 우리 아기는 어땠나요?" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-slate-200 resize-none text-[15px] leading-relaxed" />
              <button disabled={!newDiaryText.trim()} className="w-full mt-3 bg-slate-800 text-white font-bold py-3.5 rounded-2xl hover:bg-slate-700 disabled:bg-slate-200 transition-all">일기 저장</button>
            </form>
            <div className="space-y-4">
              {diaryEntries.map((entry) => (
                <div key={entry.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{new Date(entry.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span className="text-xs text-slate-400 font-medium bg-white border border-slate-200 px-2 py-1 rounded-lg">작성: {entry.authorName || '가족'}</span>
                  </div>
                  <button onClick={() => window.confirm('삭제할까요?') && deleteDoc(doc(db, 'artifacts', environmentAppId, 'users', user.uid, 'diary_entries', entry.id))} className="absolute top-5 right-5 text-slate-300 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 p-2"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                  <p className="text-[15px] sm:text-base text-slate-700 leading-loose whitespace-pre-wrap break-keep">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === 정보/설정 및 법적/후원 탭 === */}
        {activeTab === 'info' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-4">
              <div className="flex items-center gap-2.5 mb-2 px-1"><Coins className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 bg-amber-50 p-1.5 rounded-full" /><h2 className="text-xl sm:text-2xl font-black text-slate-800 break-keep">정부 지원 및 혜택</h2></div>
              <div className="grid gap-4 sm:gap-5">
                {BENEFITS_DATA.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-[16px] sm:text-[17px] text-slate-800 mb-2 flex items-center gap-2 break-keep"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span>{item.title}</h3>
                    <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed break-keep pl-3.5 mb-4">{item.content}</p>
                    <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 mt-2">
                      <div className="flex items-start gap-2"><HandHeart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /><div><span className="block text-sm font-bold text-amber-800 mb-1">어떻게 신청하나요?</span><span className="block text-[13px] sm:text-sm text-amber-700/90 leading-relaxed break-keep">{item.apply}</span></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-10 pt-10 border-t border-slate-200 space-y-6">
              <div className="flex gap-2">
                <button onClick={handleBackup} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-700 transition-all shadow-md"><Download className="w-5 h-5" /> 내 데이터 백업하기</button>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4"><Coffee className="w-6 h-6 text-amber-400" /><h3 className="text-lg font-black">개발자 응원하기</h3></div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 break-keep">ReadyBaby는 광고 없이 깨끗하게 운영되는 개인 프로젝트입니다. <br/>앱이 마음에 드셨다면 개발자에게 따뜻한 커피 한 잔을 선물해주세요! ☕️</p>
                <button onClick={() => window.open('https://toss.me/yourid', '_blank')} className="w-full py-4 bg-amber-400 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-300 transition-all active:scale-95">커피 한 잔 후원하기</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setModalContent({title: '이용약관', text: TERMS_TEXT})} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-2 transition-active active:bg-slate-50"><ShieldCheck className="w-5 h-5 text-slate-400" /><span className="text-xs font-bold text-slate-600">이용약관</span></button>
                <button onClick={() => setModalContent({title: '책임 제한 안내', text: DISCLAIMER_TEXT})} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-2 transition-active active:bg-slate-50"><AlertCircle className="w-5 h-5 text-slate-400" /><span className="text-xs font-bold text-slate-600">디클레이머</span></button>
              </div>
              <div className="text-center pb-10"><p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">© 2026 ReadyBaby. Developed by Park Geunhong</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}