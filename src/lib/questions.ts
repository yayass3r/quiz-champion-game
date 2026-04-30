// ===== Question Bank - بنك الأسئلة الشامل =====

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: QuestionCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  hint: string;
  funFact: string;
  points: number;
  timeLimit: number;
  isUserSubmitted?: boolean;
  qualityScore?: number;
}

export type QuestionCategory =
  | 'science'
  | 'history'
  | 'sports'
  | 'geography'
  | 'art'
  | 'technology'
  | 'religion'
  | 'general'
  | 'literature'
  | 'math'
  | 'islamicHistory'
  | 'propheticBiography'
  | 'prophetStories'
  | 'quran'
  | 'arabicLanguage'
  | 'medicine'
  | 'space';

export const categoryInfo: Record<QuestionCategory, { name: string; icon: string; color: string; gradient: string }> = {
  science: { name: 'العلوم', icon: '🔬', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
  history: { name: 'التاريخ', icon: '📜', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  sports: { name: 'الرياضة', icon: '⚽', color: '#ef4444', gradient: 'from-red-500 to-rose-600' },
  geography: { name: 'الجغرافيا', icon: '🌍', color: '#3b82f6', gradient: 'from-blue-500 to-cyan-600' },
  art: { name: 'الفنون', icon: '🎨', color: '#a855f7', gradient: 'from-purple-500 to-violet-600' },
  technology: { name: 'التكنولوجيا', icon: '💻', color: '#6366f1', gradient: 'from-indigo-500 to-blue-600' },
  religion: { name: 'الدين', icon: '🕌', color: '#14b8a6', gradient: 'from-teal-500 to-emerald-600' },
  general: { name: 'ثقافة عامة', icon: '🧠', color: '#f97316', gradient: 'from-orange-500 to-amber-600' },
  literature: { name: 'الأدب', icon: '📚', color: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
  math: { name: 'الرياضيات', icon: '🔢', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
  islamicHistory: { name: 'تاريخ إسلامي', icon: '🏛️', color: '#059669', gradient: 'from-green-600 to-emerald-700' },
  propheticBiography: { name: 'السيرة النبوية', icon: '🌙', color: '#0d9488', gradient: 'from-teal-600 to-cyan-700' },
  prophetStories: { name: 'قصص الأنبياء', icon: '📖', color: '#0891b2', gradient: 'from-cyan-600 to-blue-700' },
  quran: { name: 'القرآن الكريم', icon: '📿', color: '#0e7490', gradient: 'from-sky-700 to-indigo-800' },
  arabicLanguage: { name: 'اللغة العربية', icon: '✒️', color: '#b45309', gradient: 'from-amber-600 to-yellow-700' },
  medicine: { name: 'الطب والصحة', icon: '🏥', color: '#dc2626', gradient: 'from-rose-600 to-red-700' },
  space: { name: 'الفضاء والفلك', icon: '🚀', color: '#4f46e5', gradient: 'from-indigo-600 to-purple-700' },
};

export const questions: Question[] = [
  // ===== العلوم =====
  { id: 'sci1', text: 'ما هو العنصر الكيميائي الأكثر وفرة في الكون؟', options: ['الأكسجين', 'الهيدروجين', 'الهيليوم', 'الكربون'], correctIndex: 1, category: 'science', difficulty: 'easy', hint: 'هو أخف العناصر وأبسطها', funFact: 'يشكل الهيدروجين حوالي 75% من المادة العادية في الكون!', points: 100, timeLimit: 20 },
  { id: 'sci2', text: 'كم عدد كروموسومات الإنسان؟', options: ['23', '44', '46', '48'], correctIndex: 2, category: 'science', difficulty: 'easy', hint: 'عدد زوجي أكبر من 40', funFact: 'الشمبانزي لديه 48 كروموسوم، أي أكثر من الإنسان بـ 2!', points: 100, timeLimit: 15 },
  { id: 'sci3', text: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['زحل', 'المشتري', 'أورانوس', 'نبتون'], correctIndex: 1, category: 'science', difficulty: 'easy', hint: 'سُمي على اسم ملك الآلهة الروماني', funFact: 'المشتري أكبر من أن يتسع لأكثر من 1300 كرة أرضية بداخله!', points: 100, timeLimit: 15 },
  { id: 'sci4', text: 'ما هي الوحدة الأساسية للحياة؟', options: ['الذرة', 'الجزيء', 'الخلية', 'النسيج'], correctIndex: 2, category: 'science', difficulty: 'easy', hint: 'كل الكائنات الحية تتكون منها', funFact: 'جسم الإنسان يحتوي على حوالي 37 تريليون خلية!', points: 100, timeLimit: 15 },
  { id: 'sci5', text: 'ما هو الغاز الذي تمتصه النباتات من الجو؟', options: ['الأكسجين', 'النيتروجين', 'ثاني أكسيد الكربون', 'الهيدروجين'], correctIndex: 2, category: 'science', difficulty: 'easy', hint: 'تستخدمه النباتات في عملية البناء الضوئي', funFact: 'شجرة واحدة يمكنها امتصاص حوالي 22 كجم من CO2 سنوياً!', points: 100, timeLimit: 15 },
  { id: 'sci6', text: 'ما هي سرعة الضوء التقريبية؟', options: ['300,000 كم/ث', '150,000 كم/ث', '500,000 كم/ث', '1,000,000 كم/ث'], correctIndex: 0, category: 'science', difficulty: 'medium', hint: 'تقريباً 300 ألف كيلومتر في الثانية', funFact: 'الضوء من الشمس يستغرق حوالي 8 دقائق و20 ثانية للوصول للأرض!', points: 150, timeLimit: 20 },
  { id: 'sci7', text: 'ما هو المعدن السائل في درجة حرارة الغرفة؟', options: ['الرصاص', 'الزئبق', 'الألمنيوم', 'النحاس'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'كان يُستخدم في ميزان الحرارة القديم', funFact: 'الزئبق هو المعدن الوحيد السائل في درجة حرارة الغرفة!', points: 150, timeLimit: 20 },
  { id: 'sci8', text: 'ما هو الحمض النووي الذي يحمل المعلومات الوراثية؟', options: ['RNA', 'DNA', 'ATP', 'ADP'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'له شكل حلزوني مزدوج', funFact: 'لو تم فرد الحمض النووي لشخص واحد، سيصل إلى الشمس والعودة 600 مرة!', points: 150, timeLimit: 20 },
  { id: 'sci9', text: 'ما هي أصغر جسيمات المادة التي تحتفظ بخصائص العنصر؟', options: ['الجزيء', 'الذرة', 'الإلكترون', 'البروتون'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'هي اللبنة الأساسية للمادة', funFact: 'ذرة واحدة أكبر من نواتها بمليون مرة!', points: 150, timeLimit: 20 },
  { id: 'sci10', text: 'ما هو القانون: لكل فعل رد فعل مساوٍ ومعاكس؟', options: ['قانون نيوتن الأول', 'قانون نيوتن الثاني', 'قانون نيوتن الثالث', 'قانون الجاذبية'], correctIndex: 2, category: 'science', difficulty: 'medium', hint: 'القانون الثالث لنيوتن', funFact: 'نيوتن اكتشف الجاذبية عندما سقطت تفاحة على رأسه حسب الأسطورة!', points: 150, timeLimit: 20 },
  { id: 'sci11', text: 'ما هو العضو الأكبر في جسم الإنسان؟', options: ['الكبد', 'الجلد', 'الرئة', 'القلب'], correctIndex: 1, category: 'science', difficulty: 'easy', hint: 'يغطي كامل الجسم', funFact: 'مساحة الجلد في الشخص البالغ حوالي 2 متر مربع!', points: 100, timeLimit: 15 },
  { id: 'sci12', text: 'ما هي عملية تحويل الطعام إلى طاقة في الخلايا؟', options: ['البناء الضوئي', 'التنفس الخلوي', 'الأكسدة', 'التخمر'], correctIndex: 1, category: 'science', difficulty: 'medium', hint: 'تحدث في الميتوكوندريا', funFact: 'الميتوكوندريا تُسمى محطة الطاقة في الخلية!', points: 150, timeLimit: 20 },
  { id: 'sci13', text: 'ما هو أصلب معدن طبيعي؟', options: ['الحديد', 'الألماس', 'التيتانيوم', 'التنجستن'], correctIndex: 1, category: 'science', difficulty: 'easy', hint: 'حجر كريم ثمين جداً', funFact: 'الألماس مصنوع من الكربون المضغوط تحت حرارة وضغط هائلين!', points: 100, timeLimit: 15 },

  // ===== التاريخ =====
  { id: 'his1', text: 'في أي عام فُتحت القسطنطينية على يد محمد الفاتح؟', options: ['1453', '1492', '1517', '1421'], correctIndex: 0, category: 'history', difficulty: 'medium', hint: 'في القرن الخامس عشر الميلادي', funFact: 'محمد الفاتح كان عمره 21 عاماً فقط عند فتح القسطنطينية!', points: 150, timeLimit: 20 },
  { id: 'his2', text: 'من هو مؤسس الدولة الأموية؟', options: ['عمر بن عبد العزيز', 'معاوية بن أبي سفيان', 'عبد الملك بن مروان', 'يزيد بن معاوية'], correctIndex: 1, category: 'history', difficulty: 'medium', hint: 'كان والياً على الشام قبل الخلافة', funFact: 'الدولة الأموية امتدت من الأندلس غرباً إلى حدود الصين شرقاً!', points: 150, timeLimit: 20 },
  { id: 'his3', text: 'في أي عام وقعت غزوة بدر؟', options: ['1 هـ', '2 هـ', '3 هـ', '4 هـ'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'في السنة الثانية للهجرة', funFact: 'كان عدد المسلمين في بدر 313 مقابل 1000 من المشركين!', points: 100, timeLimit: 15 },
  { id: 'his4', text: 'من بنى الأهرامات في مصر؟', options: ['الرومان', 'الفراعنة', 'الإغريق', 'الفينيقيون'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'حضارة نشأت على ضفاف النيل', funFact: 'الهرم الأكبر استغرق بناؤه حوالي 20 عاماً!', points: 100, timeLimit: 15 },
  { id: 'his5', text: 'ما هو أطول جدار بناه الإنسان؟', options: ['جدار برلين', 'سور الصين العظيم', 'جدار هادريان', 'سور بابل'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'يقع في آسيا', funFact: 'سور الصين العظيم يمتد لأكثر من 21,000 كيلومتر!', points: 100, timeLimit: 15 },
  { id: 'his6', text: 'في أي عام بدأت الحرب العالمية الأولى؟', options: ['1912', '1914', '1916', '1918'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'في العقد الثاني من القرن العشرين', funFact: 'الحرب العالمية الأولى أودت بحياة أكثر من 17 مليون شخص!', points: 100, timeLimit: 15 },
  { id: 'his7', text: 'من هو القائد المسلم الذي فتح بلاد السند؟', options: ['طارق بن زياد', 'محمد بن القاسم الثقفي', 'قتيبة بن مسلم', 'موسى بن نصير'], correctIndex: 1, category: 'history', difficulty: 'hard', hint: 'كان عمره 17 عاماً فقط', funFact: 'محمد بن القاسم فتح السند وعمره 17 عاماً فقط!', points: 200, timeLimit: 25 },
  { id: 'his8', text: 'ما هي أقدم حضارة معروفة في التاريخ؟', options: ['الحضارة المصرية', 'حضارة السند', 'الحضارة السومرية', 'الحضارة الصينية'], correctIndex: 2, category: 'history', difficulty: 'hard', hint: 'نشأت في بلاد الرافدين', funFact: 'السومريون اخترعوا الكتابة قبل أكثر من 5000 عام!', points: 200, timeLimit: 25 },
  { id: 'his9', text: 'من هو القائد الذي فتح الأندلس؟', options: ['موسى بن نصير', 'طارق بن زياد', 'عقبة بن نافع', 'خالد بن الوليد'], correctIndex: 1, category: 'history', difficulty: 'easy', hint: 'عبر المضيق الذي يحمل اسمه', funFact: 'طارق بن زياد أحرق سفوره وقال: البحر من أمامكم والعدو من خلفكم!', points: 100, timeLimit: 15 },
  { id: 'his10', text: 'ما هي الحضارة التي اخترعت الورق؟', options: ['الحضارة المصرية', 'الحضارة الصينية', 'الحضارة اليونانية', 'الحضارة الإسلامية'], correctIndex: 1, category: 'history', difficulty: 'medium', hint: 'حضارة شرق آسيوية عريقة', funFact: 'الصينيون اخترعوا الورق حوالي عام 105 ميلادي!', points: 150, timeLimit: 20 },

  // ===== تاريخ إسلامي =====
  { id: 'ih1', text: 'في أي عام وقعت معركة القادسية؟', options: ['14 هـ', '16 هـ', '18 هـ', '20 هـ'], correctIndex: 1, category: 'islamicHistory', difficulty: 'medium', hint: 'في عهد عمر بن الخطاب', funFact: 'معركة القادسية كانت بين المسلمين والفرس واستمرت 3 أيام!', points: 150, timeLimit: 20 },
  { id: 'ih2', text: 'من هو القائد المسلم في معركة اليرموك؟', options: ['خالد بن الوليد', 'أبو عبيدة بن الجراح', 'عمرو بن العاص', 'سعد بن أبي وقاص'], correctIndex: 0, category: 'islamicHistory', difficulty: 'medium', hint: 'سيف الله المسلول', funFact: 'معركة اليرموك انتصر فيها 40 ألف مسلم على 200 ألف من الروم!', points: 150, timeLimit: 20 },
  { id: 'ih3', text: 'من هو مؤسس الدولة العباسية؟', options: ['أبو العباس السفاح', 'أبو جعفر المنصور', 'هارون الرشيد', 'المأمون'], correctIndex: 0, category: 'islamicHistory', difficulty: 'medium', hint: 'أول خلفاء بني العباس', funFact: 'الدولة العباسية استمرت أكثر من 500 عام!', points: 150, timeLimit: 20 },
  { id: 'ih4', text: 'في أي عام فُتح مكة؟', options: ['6 هـ', '8 هـ', '10 هـ', '12 هـ'], correctIndex: 1, category: 'islamicHistory', difficulty: 'easy', hint: 'في السنة الثامنة للهجرة', funFact: 'فتح مكة كان سلمياً ودخلها النبي ﷺ متواضعاً!', points: 100, timeLimit: 15 },
  { id: 'ih5', text: 'من هو الخليفة الذي لُقب بالفاروق؟', options: ['أبو بكر الصديق', 'عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب'], correctIndex: 1, category: 'islamicHistory', difficulty: 'easy', hint: 'ثاني الخلفاء الراشدين', funFact: 'عمر بن الخطاب أول من دعي بأمير المؤمنين!', points: 100, timeLimit: 15 },
  { id: 'ih6', text: 'ما هي أول دار إسلامية في المدينة المنورة؟', options: ['دار الأرقم', 'دار أبي أيوب الأنصاري', 'المسجد النبوي', 'دار عثمان'], correctIndex: 1, category: 'islamicHistory', difficulty: 'medium', hint: 'نزل فيها النبي ﷺ عند هجرته', funFact: 'أبو أيوب الأنصاري كان غلاماً فنزل النبي ﷺ في الطابق الأسفل إكراماً له!', points: 150, timeLimit: 20 },
  { id: 'ih7', text: 'من هو القائد الذي فتح مصر؟', options: ['خالد بن الوليد', 'عمرو بن العاص', 'عقبة بن نافع', 'موسى بن نصير'], correctIndex: 1, category: 'islamicHistory', difficulty: 'easy', hint: 'قائد عربي فذ وسياسي محنك', funFact: 'عمرو بن العاص فتح مصر عام 20 هجرياً!', points: 100, timeLimit: 15 },
  { id: 'ih8', text: 'في أي معركة استشهد حمزة بن عبد المطلب؟', options: ['بدر', 'أحد', 'الخندق', 'حنين'], correctIndex: 1, category: 'islamicHistory', difficulty: 'medium', hint: 'سيد الشهداء', funFact: 'حمزة بن عبد المطلب عم النبي ﷺ وسيد الشهداء!', points: 150, timeLimit: 20 },
  { id: 'ih9', text: 'من بنى المسجد الأقصى؟', options: ['داود عليه السلام', 'سليمان عليه السلام', 'عمر بن الخطاب', 'عبد الملك بن مروان'], correctIndex: 1, category: 'islamicHistory', difficulty: 'hard', hint: 'نبي من بني إسرائيل', funFact: 'المسجد الأقصى ثاني مسجد بُني على الأرض بعد المسجد الحرام!', points: 200, timeLimit: 25 },
  { id: 'ih10', text: 'ما هو صلح الحديبية؟', options: ['صلح بين المسلمين والروم', 'صلح بين المسلمين وقريش', 'صلح بين المسلمين والفرس', 'صلح بين الأوس والخزرج'], correctIndex: 1, category: 'islamicHistory', difficulty: 'medium', hint: 'في السنة السادسة للهجرة', funFact: 'صلح الحديبية سماه القرآن فتحاً مبيناً!', points: 150, timeLimit: 20 },

  // ===== السيرة النبوية =====
  { id: 'pb1', text: 'في أي عام وُلد النبي محمد ﷺ؟', options: ['عام الفيل', 'عام الحزن', 'عام الفتح', 'عام الوفود'], correctIndex: 0, category: 'propheticBiography', difficulty: 'easy', hint: 'عام غزو أبرهة الحبشي للكعبة', funFact: 'ولد النبي ﷺ يوم الاثنين 12 ربيع الأول!', points: 100, timeLimit: 15 },
  { id: 'pb2', text: 'من هي مرضعة النبي ﷺ؟', options: ['أم أيمن', 'حليمة السعدية', 'فاطمة بنت أسد', 'ثويبة'], correctIndex: 1, category: 'propheticBiography', difficulty: 'easy', hint: 'من بني سعد', funFact: 'حليمة السعدية رأت بركة في ماشيتها ومحلبها منذ أن أخذت النبي ﷺ!', points: 100, timeLimit: 15 },
  { id: 'pb3', text: 'كم كان عمر النبي ﷺ عند البعثة؟', options: ['25 سنة', '30 سنة', '35 سنة', '40 سنة'], correctIndex: 3, category: 'propheticBiography', difficulty: 'easy', hint: 'العمر الذي يُبلغ فيه الرجال عادة', funFact: 'نزل الوحي على النبي ﷺ في غار حراء يوم الاثنين!', points: 100, timeLimit: 15 },
  { id: 'pb4', text: 'ما هو الاسم الذي دُعي به النبي ﷺ قبل البعثة؟', options: ['الصادق', 'الأمين', 'الحكيم', 'الشفيق'], correctIndex: 1, category: 'propheticBiography', difficulty: 'easy', hint: 'لُقب به لصدقه وأمانته', funFact: 'كانت قريش تُودع أماناتها عند النبي ﷺ حتى قبل الإسلام!', points: 100, timeLimit: 15 },
  { id: 'pb5', text: 'في أي غار نزل الوحي لأول مرة؟', options: ['غار ثور', 'غار حراء', 'غار أحد', 'غار سلع'], correctIndex: 1, category: 'propheticBiography', difficulty: 'easy', hint: 'في جبل النور', funFact: 'كان النبي ﷺ يتعبد في غار حراء قبل البعثة!', points: 100, timeLimit: 15 },
  { id: 'pb6', text: 'من هو أول من أسلم من الرجال؟', options: ['عمر بن الخطاب', 'أبو بكر الصديق', 'علي بن أبي طالب', 'عثمان بن عفان'], correctIndex: 1, category: 'propheticBiography', difficulty: 'easy', hint: 'صاحب النبي ﷺ في الغار', funFact: 'أبو بكر الصديق أسلم دون تردد وآمن فوراً!', points: 100, timeLimit: 15 },
  { id: 'pb7', text: 'كم سنة استمرت الدعوة السرية؟', options: ['سنة واحدة', 'سنتان', 'ثلاث سنوات', 'خمس سنوات'], correctIndex: 2, category: 'propheticBiography', difficulty: 'medium', hint: 'أقل من خمس سنوات', funFact: 'بعد الدعوة السرية نزل الأمر بالجهر: فاصدع بما تؤمر!', points: 150, timeLimit: 20 },
  { id: 'pb8', text: 'ما هو عام الحزن؟', options: ['عام وفاة أبي طالب وخديجة', 'عام وفاة النبي ﷺ', 'عام غزوة أحد', 'عام الهجرة'], correctIndex: 0, category: 'propheticBiography', difficulty: 'medium', hint: 'فقد فيه النبي ﷺ سندين مهمين', funFact: 'تزامن وفاة أبي طالب وخديجة في عام واحد فسماه عام الحزن!', points: 150, timeLimit: 20 },
  { id: 'pb9', text: 'ما هي رحلة الإسراء والمعراج؟', options: ['من مكة للمدينة', 'من مكة للقدس ثم السماوات', 'من مكة للطائف', 'من المدينة لمكة'], correctIndex: 1, category: 'propheticBiography', difficulty: 'easy', hint: 'رحلة ليلية عجيبة', funFact: 'في رحلة المعراج فُرضت الصلوات الخمس!', points: 100, timeLimit: 15 },
  { id: 'pb10', text: 'من هي زوجة النبي ﷺ التي لُقبت بأم المساكين؟', options: ['خديجة', 'عائشة', 'زينب بنت خزيمة', 'ميمونة'], correctIndex: 2, category: 'propheticBiography', difficulty: 'hard', hint: 'تزوجها النبي ﷺ وتوفيت بعد 8 أشهر', funFact: 'زينب بنت خزيمة كانت تُطعم المساكين وتُحسن إليهم!', points: 200, timeLimit: 25 },

  // ===== قصص الأنبياء =====
  { id: 'ps1', text: 'من هو أول الأنبياء؟', options: ['نوح', 'آدم', 'إدريس', 'شيث'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'أبو البشر', funFact: 'آدم عليه السلام نبي مرسل وهو أول البشر!', points: 100, timeLimit: 15 },
  { id: 'ps2', text: 'ما هي معجزة نوح عليه السلام؟', options: ['شق البحر', 'السفينة', 'العصا', 'النار الباردة'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'نجا فيها من الطوفان', funFact: 'سفينة نوح استقرت على الجودي بعد الطوفان!', points: 100, timeLimit: 15 },
  { id: 'ps3', text: 'من هو النبي الذي ابتلعه الحوت؟', options: ['يونس', 'أيوب', 'إلياس', 'ذو الكفل'], correctIndex: 0, category: 'prophetStories', difficulty: 'easy', hint: 'ذو النون', funFact: 'بقي يونس عليه السلام في بطن الحوت ثلاث ليال!', points: 100, timeLimit: 15 },
  { id: 'ps4', text: 'ما هي معجزة موسى عليه السلام؟', options: ['إحياء الموتى', 'العصا التي تتحول لثعبان', 'الطوفان', 'المن والسلوى'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'ابتلعت ما صنع السحرة', funFact: 'عصا موسى تحولت إلى ثعبان عظيم ابتلع حبال السحرة!', points: 100, timeLimit: 15 },
  { id: 'ps5', text: 'من هو النبي الذي بنى الكعبة؟', options: ['محمد ﷺ', 'إبراهيم', 'إسماعيل', 'آدم'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'خليل الرحمن', funFact: 'إبراهيم عليه السلام رفع القواعد من البيت مع ابنه إسماعيل!', points: 100, timeLimit: 15 },
  { id: 'ps6', text: 'من هو النبي الذي كلمه الله بدون وسيط؟', options: ['محمد ﷺ', 'موسى', 'عيسى', 'إبراهيم'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'كليم الله', funFact: 'موسى هو النبي الوحيد الذي كلمه الله مباشرة دون وسيط!', points: 100, timeLimit: 15 },
  { id: 'ps7', text: 'من هو النبي الذي ولد بدون أب؟', options: ['يحيى', 'عيسى', 'إسماعيل', 'يوسف'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'روح الله وكلمته', funFact: 'عيسى عليه السلام وُلد من مريم البتول بمعجزة إلهية!', points: 100, timeLimit: 15 },
  { id: 'ps8', text: 'من هو النبي الذي أُلقي في النار فلم تحرقه؟', options: ['موسى', 'إبراهيم', 'نوح', 'محمد ﷺ'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'حطم الأصنام', funFact: 'قال إبراهيم: يا نار كوني برداً وسلاماً على إبراهيم!', points: 100, timeLimit: 15 },
  { id: 'ps9', text: 'من هو النبي الذي افتدى ابنه بذبح عظيم؟', options: ['يعقوب', 'إبراهيم', 'آدم', 'داود'], correctIndex: 1, category: 'prophetStories', difficulty: 'medium', hint: 'رأى في المنام أنه يذبح ابنه', funFact: 'فدى الله إسماعيل بذبح عظيم وهذه سنة الأضحية!', points: 150, timeLimit: 20 },
  { id: 'ps10', text: 'من هو النبي الذي صبر على البلاء سنوات طويلة؟', options: ['يونس', 'أيوب', 'يعقوب', 'يوسف'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'نبي الصبر', funFact: 'أيوب عليه السلام صبر 18 عاماً على المرض والبلاء!', points: 100, timeLimit: 15 },
  { id: 'ps11', text: 'من هو النبي الذي فسر الأحلام؟', options: ['يعقوب', 'يوسف', 'إبراهيم', 'محمد ﷺ'], correctIndex: 1, category: 'prophetStories', difficulty: 'easy', hint: 'صدّيق وابن صدّيق', funFact: 'يوسف عليه السلام أعطي نصف الحسن!', points: 100, timeLimit: 15 },
  { id: 'ps12', text: 'من هو النبي الذي صنع الدرع؟', options: ['سليمان', 'داود', 'نوح', 'إدريس'], correctIndex: 1, category: 'prophetStories', difficulty: 'medium', hint: 'كان يصنع الدروع من الحديد', funFact: 'داود عليه السلام ألان الله له الحديد فكان يصنع منه الدروع!', points: 150, timeLimit: 20 },

  // ===== القرآن الكريم =====
  { id: 'qr1', text: 'ما هي أطول سورة في القرآن الكريم؟', options: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], correctIndex: 2, category: 'quran', difficulty: 'easy', hint: 'السورة الثانية في القرآن', funFact: 'سورة البقرة تحتوي على 286 آية!', points: 100, timeLimit: 15 },
  { id: 'qr2', text: 'ما هي السورة التي تسمى قلب القرآن؟', options: ['الفاتحة', 'يس', 'الرحمن', 'الملك'], correctIndex: 1, category: 'quran', difficulty: 'easy', hint: 'تبدأ بحروف مقطعة', funFact: 'سورة يس تسمى قلب القرآن!', points: 100, timeLimit: 15 },
  { id: 'qr3', text: 'كم عدد سور القرآن الكريم؟', options: ['110', '112', '114', '116'], correctIndex: 2, category: 'quran', difficulty: 'easy', hint: 'عدد زوجي أكبر من 110', funFact: 'القرآن الكريم يحتوي على 114 سورة و6236 آية!', points: 100, timeLimit: 15 },
  { id: 'qr4', text: 'ما هي السورة التي لا تبدأ بالبسملة؟', options: ['البقرة', 'التوبة', 'الإخلاص', 'الناس'], correctIndex: 1, category: 'quran', difficulty: 'medium', hint: 'سورة تتضمن براءة من المشركين', funFact: 'سورة التوبة هي السورة الوحيدة التي لا تبدأ بالبسملة!', points: 150, timeLimit: 20 },
  { id: 'qr5', text: 'ما هي أقصر سورة في القرآن الكريم؟', options: ['الإخلاص', 'الكوثر', 'النصر', 'العصر'], correctIndex: 1, category: 'quran', difficulty: 'easy', hint: 'ثلاث آيات فقط', funFact: 'سورة الكوثر هي أقصر سورة في القرآن بثلاث آيات!', points: 100, timeLimit: 15 },
  { id: 'qr6', text: 'ما هي السورة التي تسمى عروس القرآن؟', options: ['الرحمن', 'يس', 'الملك', 'الكهف'], correctIndex: 0, category: 'quran', difficulty: 'medium', hint: 'تبدأ باسم الله الرحمن', funFact: 'سورة الرحمن سُميت عروس القرآن لجمالها وبيانها!', points: 150, timeLimit: 20 },
  { id: 'qr7', text: 'كم مرة ذُكرت كلمة "الجنة" في القرآن؟', options: ['50', '66', '70', '80'], correctIndex: 1, category: 'quran', difficulty: 'hard', hint: 'نفس عدد ذكر "النار"', funFact: 'ذكرت الجنة 66 مرة والنار 66 مرة في القرآن!', points: 200, timeLimit: 25 },
  { id: 'qr8', text: 'ما هي السورة التي فيها سجدة تلاوة في كل ركعة من ركعاتها؟', options: ['الحج', 'الأعراف', 'الملك', 'فصلت'], correctIndex: 2, category: 'quran', difficulty: 'hard', hint: 'سورة تمنع عذاب القبر', funFact: 'سورة الملك هي المانعة من عذاب القبر!', points: 200, timeLimit: 25 },
  { id: 'qr9', text: 'ما هي أول آية نزلت من القرآن؟', options: ['بسم الله الرحمن الرحيم', 'اقرأ باسم ربك الذي خلق', 'الحمد لله رب العالمين', 'يا أيها المدثر'], correctIndex: 1, category: 'quran', difficulty: 'easy', hint: 'في غار حراء', funFact: 'أول كلمة نزلت من القرآن هي "اقرأ"!', points: 100, timeLimit: 15 },
  { id: 'qr10', text: 'ما هي السورة التي ذُكر فيها اسم "الله" في كل آية؟', options: ['البقرة', 'المجادلة', 'الرحمن', 'الحشر'], correctIndex: 2, category: 'quran', difficulty: 'medium', hint: 'عروس القرآن', funFact: 'سورة الرحمن ذُكر فيها اسم الله في كل آية!', points: 150, timeLimit: 20 },

  // ===== اللغة العربية =====
  { id: 'al1', text: 'ما هو جمع كلمة "كتاب"؟', options: ['كتابات', 'كتب', 'كتائب', 'مكاتب'], correctIndex: 1, category: 'arabicLanguage', difficulty: 'easy', hint: 'جمع تكسير', funFact: 'اللغة العربية أغنى لغة في المفردات بأكثر من 12 مليون كلمة!', points: 100, timeLimit: 15 },
  { id: 'al2', text: 'ما هو المفرد من "علماء"؟', options: ['عالم', 'معلم', 'علمي', 'متعلم'], correctIndex: 0, category: 'arabicLanguage', difficulty: 'easy', hint: 'صيغة مفرد', funFact: 'اللغة العربية هي اللغة السادسة الأكثر تحدثاً في العالم!', points: 100, timeLimit: 15 },
  { id: 'al3', text: 'ما معنى كلمة "الفصاحة"؟', options: ['البلاغة والبيان', 'القوة', 'السرعة', 'الجمال'], correctIndex: 0, category: 'arabicLanguage', difficulty: 'medium', hint: 'تتعلق بالبيان والوضوح', funFact: 'اللغة العربية تُسمى لغة الضاد لأنها اللغة الوحيدة التي تحتوي على حرف الضاد!', points: 150, timeLimit: 20 },
  { id: 'al4', text: 'من هو صاحب "المعلقات"؟', options: ['امرؤ القيس', 'عنترة بن شداد', 'جميع الشعراء المذكورين', 'طرفة بن العبد'], correctIndex: 2, category: 'arabicLanguage', difficulty: 'medium', hint: 'ليس شاعراً واحداً', funFact: 'المعلقات هي سبع أو عشر قصائد من أجمل الشعر العربي الجاهلي!', points: 150, timeLimit: 20 },
  { id: 'al5', text: 'ما هو نوع "كان" في الجملة: كان الطالب مجتهداً؟', options: ['فعل ماض ناقص', 'فعل ماض تام', 'حرف ناسخ', 'اسم فعل'], correctIndex: 0, category: 'arabicLanguage', difficulty: 'medium', hint: 'أفعال الناسخة', funFact: 'كان وأخواتها تسمى الأفعال الناسخة لأنها تنسخ المبتدأ والخبر!', points: 150, timeLimit: 20 },
  { id: 'al6', text: 'ما هو الضمير في "كتبتُ الدرس"؟', options: ['تاء الفاعل المتحركة', 'ألف الاثنين', 'واو الجماعة', 'نون النسوة'], correctIndex: 0, category: 'arabicLanguage', difficulty: 'easy', hint: 'ضمير متصل', funFact: 'اللغة العربية تحتوي على 28 حرفاً أساسياً!', points: 100, timeLimit: 15 },

  // ===== الطب والصحة =====
  { id: 'med1', text: 'ما هو أكبر عضو داخلي في جسم الإنسان؟', options: ['القلب', 'الكبد', 'الرئة', 'الكلى'], correctIndex: 1, category: 'medicine', difficulty: 'easy', hint: 'يُسمى المختبر الكيميائي للجسم', funFact: 'الكبد يقوم بأكثر من 500 وظيفة حيوية في الجسم!', points: 100, timeLimit: 15 },
  { id: 'med2', text: 'كم عدد العظام في جسم الإنسان البالغ؟', options: ['186', '206', '226', '256'], correctIndex: 1, category: 'medicine', difficulty: 'medium', hint: 'أكثر من 200', funFact: 'الأطفال يولدون بحوالي 270 عظمة تلتحم بعضها مع النمو!', points: 150, timeLimit: 20 },
  { id: 'med3', text: 'ما هو فيتامين الشمس؟', options: ['فيتامين A', 'فيتامين C', 'فيتامين D', 'فيتامين E'], correctIndex: 2, category: 'medicine', difficulty: 'easy', hint: 'يُنتجه الجسم عند التعرض للشمس', funFact: '15 دقيقة من أشعة الشمس تكفي لإنتاج فيتامين D!', points: 100, timeLimit: 15 },
  { id: 'med4', text: 'ما هي أصغر عظمة في جسم الإنسان؟', options: ['عظمة الإصبع', 'عظمة الركاب في الأذن', 'عظمة الأنف', 'عظمة الرسغ'], correctIndex: 1, category: 'medicine', difficulty: 'medium', hint: 'توجد في الأذن الوسطى', funFact: 'عظمة الركاب حجمها 3 مم فقط!', points: 150, timeLimit: 20 },
  { id: 'med5', text: 'كم لتر دم يوجد في جسم الإنسان البالغ تقريباً؟', options: ['3 لتر', '5 لتر', '7 لتر', '10 لتر'], correctIndex: 1, category: 'medicine', difficulty: 'medium', hint: 'حوالي 7% من وزن الجسم', funFact: 'القلب يضخ حوالي 7500 لتر من الدم يومياً!', points: 150, timeLimit: 20 },
  { id: 'med6', text: 'ما هو المعدل الطبيعي لضربات القلب في الدقيقة؟', options: ['40-50', '60-100', '120-140', '150-180'], correctIndex: 1, category: 'medicine', difficulty: 'easy', hint: 'بين 60 و100', funFact: 'القلب ينبض حوالي 100,000 مرة يومياً!', points: 100, timeLimit: 15 },

  // ===== الفضاء والفلك =====
  { id: 'sp1', text: 'ما هي أقرب كوكب إلى الشمس؟', options: ['الزهرة', 'عطارد', 'الأرض', 'المريخ'], correctIndex: 1, category: 'space', difficulty: 'easy', hint: 'أصغر كواكب المجموعة الشمسية', funFact: 'عطارد يدور حول الشمس في 88 يوماً فقط!', points: 100, timeLimit: 15 },
  { id: 'sp2', text: 'ما هو الكوكب الأحمر؟', options: ['المشتري', 'زحل', 'المريخ', 'الزهرة'], correctIndex: 2, category: 'space', difficulty: 'easy', hint: 'سُمي بذلك بسبب لونه', funFact: 'المريخ يحتوي على أعلى جبل في المجموعة الشمسية: أوليمبوس مونس!', points: 100, timeLimit: 15 },
  { id: 'sp3', text: 'كم عدد كواكب المجموعة الشمسية؟', options: ['7', '8', '9', '10'], correctIndex: 1, category: 'space', difficulty: 'easy', hint: 'بعد استبعاد بلوتو', funFact: 'بلوتو أُعيد تصنيفه ككوكب قزم عام 2006!', points: 100, timeLimit: 15 },
  { id: 'sp4', text: 'ما هو أقرب نجم إلى الأرض بعد الشمس؟', options: ['سيريوس', 'بروكسيما سنتوري', 'ألفا سنتوري', 'بارنارد'], correctIndex: 1, category: 'space', difficulty: 'medium', hint: 'يبعد 4.24 سنة ضوئية', funFact: 'ضوء بروكسيما سنتوري يستغرق 4.24 سنة للوصول إلينا!', points: 150, timeLimit: 20 },
  { id: 'sp5', text: 'ما هو الثقب الأسود؟', options: ['نجم ميت صغير', 'منطقة ذات جاذبية فائقة', 'كوكب مظلم', 'نيزك محترق'], correctIndex: 1, category: 'space', difficulty: 'medium', hint: 'حتى الضوء لا يستطيع الهروب منه', funFact: 'أقرب ثقب أسود للأرض يبعد حوالي 1500 سنة ضوئية!', points: 150, timeLimit: 20 },
  { id: 'sp6', text: 'ما هي المجرة التي نعيش فيها؟', options: ['مجرة أندروميدا', 'درب التبانة', 'مجرة المثلث', 'مجرة سومبريرو'], correctIndex: 1, category: 'space', difficulty: 'easy', hint: 'المجرة الحلزونية التي تحتوي شمسنا', funFact: 'درب التبانة تحتوي على أكثر من 200 مليار نجم!', points: 100, timeLimit: 15 },

  // ===== الرياضة =====
  { id: 'spo1', text: 'كم عدد لاعبي فريق كرة القدم؟', options: ['9', '10', '11', '12'], correctIndex: 2, category: 'sports', difficulty: 'easy', hint: 'أكثر من 10 وأقل من 12', funFact: 'كرة القدم هي الرياضة الأكثر شعبية في العالم!', points: 100, timeLimit: 10 },
  { id: 'spo2', text: 'في أي دولة أقيمت كأس العالم 2022؟', options: ['البرازيل', 'روسيا', 'قطر', 'الأرجنتين'], correctIndex: 2, category: 'sports', difficulty: 'easy', hint: 'أول دولة عربية تستضيف كأس العالم', funFact: 'قطر هي أصغر دولة تستضيف كأس العالم على الإطلاق!', points: 100, timeLimit: 15 },
  { id: 'spo3', text: 'من هو هداف كأس العالم 2022؟', options: ['ليونيل ميسي', 'كيليان مبابي', 'أوليفيه جيرو', 'جوليان ألفاريز'], correctIndex: 1, category: 'sports', difficulty: 'medium', hint: 'لاعب فرنسي', funFact: 'مبابي سجل هاتريك في نهائي كأس العالم!', points: 150, timeLimit: 20 },
  { id: 'spo4', text: 'كم مرة فازت البرازيل بكأس العالم؟', options: ['3', '4', '5', '6'], correctIndex: 2, category: 'sports', difficulty: 'medium', hint: 'أكثر منتخب تحقيقاً للقب', funFact: 'البرازيل هي الدولة الوحيدة التي شاركت في كل نسخ كأس العالم!', points: 150, timeLimit: 20 },
  { id: 'spo5', text: 'ما هي رياضة محمد علي كلاي؟', options: ['المصارعة', 'الكاراتيه', 'الملاكمة', 'التايكوندو'], correctIndex: 2, category: 'sports', difficulty: 'easy', hint: 'رياضة تعتمد على اللكمات', funFact: 'محمد علي كلاي فاز بذهبية أولمبية عام 1960!', points: 100, timeLimit: 15 },

  // ===== الجغرافيا =====
  { id: 'geo1', text: 'ما هي أكبر قارة في العالم من حيث المساحة؟', options: ['أفريقيا', 'أمريكا الشمالية', 'آسيا', 'أوروبا'], correctIndex: 2, category: 'geography', difficulty: 'easy', hint: 'تضم أكبر عدد من السكان أيضاً', funFact: 'آسيا تبلغ مساحتها حوالي 44.5 مليون كم مربع!', points: 100, timeLimit: 15 },
  { id: 'geo2', text: 'ما هو أطول نهر في العالم؟', options: ['الأمازون', 'النيل', 'المسيسيبي', 'اليانغتسي'], correctIndex: 1, category: 'geography', difficulty: 'easy', hint: 'يمر بعدة دول أفريقية', funFact: 'نهر النيل يمتد لمسافة 6,650 كم!', points: 100, timeLimit: 15 },
  { id: 'geo3', text: 'ما هي عاصمة اليابان؟', options: ['أوساكا', 'كيوتو', 'طوكيو', 'هيروشيما'], correctIndex: 2, category: 'geography', difficulty: 'easy', hint: 'أكبر مدينة في اليابان', funFact: 'طوكيو هي أكبر منطقة حضرية في العالم!', points: 100, timeLimit: 15 },
  { id: 'geo4', text: 'ما هو أعلى جبل في العالم؟', options: ['كي 2', 'إفرست', 'كلمنجارو', 'مون بلان'], correctIndex: 1, category: 'geography', difficulty: 'easy', hint: 'يقع على حدود نيبال والتبت', funFact: 'ارتفاع إفرست 8,849 متر!', points: 100, timeLimit: 15 },

  // ===== الفنون =====
  { id: 'art1', text: 'من رسم لوحة الموناليزا؟', options: ['مايكل أنجلو', 'ليوناردو دا فينشي', 'رافائيل', 'بيكاسو'], correctIndex: 1, category: 'art', difficulty: 'easy', hint: 'فنان وعالم إيطالي شهير', funFact: 'الموناليزا ليس لها حاجبان!', points: 100, timeLimit: 15 },
  { id: 'art2', text: 'ما هي أداة العزف التي تحتوي على 88 مفتاحاً؟', options: ['الأورغ', 'البيانو', 'الأكورديون', 'السنثسيزر'], correctIndex: 1, category: 'art', difficulty: 'easy', hint: 'آلة موسيقية كلاسيكية كبيرة', funFact: 'البيانو يحتوي على حوالي 230 وتراً!', points: 100, timeLimit: 15 },

  // ===== التكنولوجيا =====
  { id: 'tec1', text: 'من أسس شركة مايكروسوفت؟', options: ['ستيف جوبز', 'بيل غيتس', 'مارك زوكربيرغ', 'جيف بيزوس'], correctIndex: 1, category: 'technology', difficulty: 'easy', hint: 'أغنى رجل في العالم لسنوات طويلة', funFact: 'بيل غيتس كتب أول برنامج له في الثالثة عشرة!', points: 100, timeLimit: 15 },
  { id: 'tec2', text: 'ما هي لغة البرمجة الأكثر استخداماً في الويب؟', options: ['Python', 'Java', 'JavaScript', 'C++'], correctIndex: 2, category: 'technology', difficulty: 'easy', hint: 'تعمل في المتصفح والخادم', funFact: 'JavaScript أُنشئت في 10 أيام فقط!', points: 100, timeLimit: 15 },

  // ===== ثقافة عامة =====
  { id: 'gen1', text: 'ما هي اللغة الأكثر تحدثاً في العالم؟', options: ['الإنجليزية', 'الماندرين', 'الإسبانية', 'العربية'], correctIndex: 1, category: 'general', difficulty: 'medium', hint: 'لغة الدولة الأكثر سكاناً', funFact: 'الماندرين يتحدثها أكثر من مليار شخص!', points: 150, timeLimit: 20 },
  { id: 'gen2', text: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], correctIndex: 2, category: 'general', difficulty: 'easy', hint: 'أحمر، برتقالي، أصفر...', funFact: 'قوس قزح يحتوي فعلياً على ألوان لا نهائية!', points: 100, timeLimit: 15 },

  // ===== الأدب =====
  { id: 'lit1', text: 'من هو مؤلف رواية "ألف ليلة وليلة"؟', options: ['شخص واحد مجهول', 'مجموعة من المؤلفين عبر العصور', 'ابن خلدون', 'الجاحظ'], correctIndex: 1, category: 'literature', difficulty: 'medium', hint: 'ليس لمؤلف واحد', funFact: 'ألف ليلة وليلة جُمعت عبر قرون من حضارات مختلفة!', points: 150, timeLimit: 20 },

  // ===== الرياضيات =====
  { id: 'mat1', text: 'ما هو قيمة باي (π) التقريبية؟', options: ['3.14', '2.71', '1.61', '4.13'], correctIndex: 0, category: 'math', difficulty: 'easy', hint: 'نسبة محيط الدائرة إلى قطرها', funFact: 'باي عدد لا نهائي حُسب لأكثر من 100 تريليون رقم!', points: 100, timeLimit: 15 },
  { id: 'mat2', text: 'ما هو العدد الأولي الأصغر؟', options: ['0', '1', '2', '3'], correctIndex: 2, category: 'math', difficulty: 'medium', hint: 'العدد الأولي الوحيد الزوجي', funFact: '2 هو العدد الأولي الوحيد الزوجي!', points: 150, timeLimit: 20 },
  { id: 'mat3', text: 'ما ناتج 15 × 15؟', options: ['200', '215', '225', '250'], correctIndex: 2, category: 'math', difficulty: 'easy', hint: 'أكثر من 220', funFact: 'خدعة: الأرقام المنتهية بـ 5 مربعها سهل الحساب!', points: 100, timeLimit: 15 },

  // ===== الدين (عام) =====
  { id: 'rel1', text: 'كم عدد أركان الإسلام؟', options: ['3', '4', '5', '6'], correctIndex: 2, category: 'religion', difficulty: 'easy', hint: 'عدد أصابع يد واحدة', funFact: 'أركان الإسلام: الشهادتان، الصلاة، الزكاة، الصوم، والحج!', points: 100, timeLimit: 15 },
  { id: 'rel2', text: 'من هو النبي الذي بنى الكعبة مع ابنه؟', options: ['نوح', 'إبراهيم', 'محمد', 'إسماعيل'], correctIndex: 1, category: 'religion', difficulty: 'easy', hint: 'أبو الأنبياء', funFact: 'إبراهيم بنى الكعبة مع ابنه إسماعيل!', points: 100, timeLimit: 15 },

  // ===== Expert =====
  { id: 'exp1', text: 'ما هو النظير المشع المستخدم في تحديد عمر الآثار؟', options: ['كربون-12', 'كربون-14', 'يورانيوم-235', 'رادون-222'], correctIndex: 1, category: 'science', difficulty: 'expert', hint: 'نظير للكربون', funFact: 'كربون-14 يمكنه تحديد عمر الآثار بدقة حتى 50,000 عام!', points: 300, timeLimit: 30 },
  { id: 'exp2', text: 'من هو العالم الذي صاغ نظرية النسبية العامة؟', options: ['نيوتن', 'أينشتاين', 'هايزنبرغ', 'بور'], correctIndex: 1, category: 'science', difficulty: 'expert', hint: 'حائز على جائزة نوبل', funFact: 'أينشتاين لم يحصل على نوبل لنسبية بل للتأثير الكهروضوئي!', points: 300, timeLimit: 30 },
];

export function getQuestions(category?: QuestionCategory, difficulty?: string, count: number = 10): Question[] {
  let filtered = [...questions];
  if (category) filtered = filtered.filter(q => q.category === category);
  if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

export function getRandomQuestions(count: number = 10): Question[] {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, count);
}

export function getSurvivalQuestions(count: number = 20): Question[] {
  const easy = questions.filter(q => q.difficulty === 'easy').sort(() => Math.random() - 0.5);
  const medium = questions.filter(q => q.difficulty === 'medium').sort(() => Math.random() - 0.5);
  const hard = questions.filter(q => q.difficulty === 'hard').sort(() => Math.random() - 0.5);
  const expert = questions.filter(q => q.difficulty === 'expert').sort(() => Math.random() - 0.5);
  return [...easy, ...medium, ...hard, ...expert].slice(0, count);
}
